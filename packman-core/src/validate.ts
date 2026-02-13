import path from 'node:path';
import { promises as fs } from 'node:fs';
import fg from 'fast-glob';
import { detectMacOsJunk, detectPack } from './detect.js';
import { isStringArray, parseFrontmatter } from './frontmatter.js';
import { parseArtifacts } from './parse.js';
import { hasErrors } from './report.js';
import type { Issue, ParsedArtifact, ValidationOptions, ValidationResult } from './types.js';

const REQUIRED_NAME_DESC = ['name', 'description'] as const;

function hasField(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function splitApplyTo(value: unknown): string[] {
  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(',')
    .map((glob) => glob.trim())
    .filter((glob) => glob.length > 0);
}

function validateNameDesc(frontmatter: Record<string, unknown>, filePath: string, issues: Issue[]): void {
  for (const field of REQUIRED_NAME_DESC) {
    if (!hasField(frontmatter[field])) {
      issues.push({
        severity: 'error',
        code: 'FRONTMATTER_REQUIRED',
        message: `Missing required frontmatter field: ${field}`,
        path: filePath,
      });
    }
  }
}

function findPromptNames(artifacts: ParsedArtifact[]): Map<string, ParsedArtifact[]> {
  const map = new Map<string, ParsedArtifact[]>();

  for (const artifact of artifacts) {
    if (artifact.type !== 'prompt') {
      continue;
    }

    const promptName = artifact.frontmatter?.name;
    if (typeof promptName !== 'string') {
      continue;
    }

    const list = map.get(promptName) ?? [];
    list.push(artifact);
    map.set(promptName, list);
  }

  return map;
}

async function findTargetPromptNameCollisions(
  targetPath: string,
  sourcePromptNames: Set<string>,
): Promise<Array<{ name: string; path: string }>> {
  const collisions: Array<{ name: string; path: string }> = [];
  const promptFiles = await fg('.github/prompts/**/*.prompt.md', {
    cwd: targetPath,
    absolute: true,
    dot: true,
  });

  for (const filePath of promptFiles) {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = parseFrontmatter(raw);
    if (typeof parsed.frontmatter.name === 'string' && sourcePromptNames.has(parsed.frontmatter.name)) {
      collisions.push({
        name: parsed.frontmatter.name,
        path: path.relative(targetPath, filePath),
      });
    }
  }

  return collisions;
}

export async function validatePack(rootPath: string, options: ValidationOptions = {}): Promise<ValidationResult> {
  const started = Date.now();
  const issues: Issue[] = [];

  const detection = await detectPack(rootPath);
  const parsedArtifacts = await parseArtifacts(detection.artifacts);

  const junk = await detectMacOsJunk(rootPath);
  if (junk.length > 0) {
    for (const entry of junk) {
      issues.push({
        severity: 'error',
        code: 'MACOS_JUNK',
        message: 'macOS junk file detected (must clean before install)',
        path: entry,
      });
    }
  }

  if (!detection.isPack) {
    issues.push({
      severity: 'error',
      code: 'PACK_NOT_DETECTED',
      message: 'No pack artifacts found under provided path',
      path: rootPath,
    });
  }

  let hasSuiteOwner = false;

  for (const artifact of parsedArtifacts) {
    const frontmatter = artifact.frontmatter ?? {};

    if (artifact.type === 'prompt') {
      validateNameDesc(frontmatter, artifact.relativePath, issues);
      if (frontmatter.tools !== undefined && !isStringArray(frontmatter.tools)) {
        issues.push({
          severity: 'error',
          code: 'PROMPT_TOOLS_TYPE',
          message: 'Prompt frontmatter tools must be a list of strings',
          path: artifact.relativePath,
        });
      }
    }

    if (artifact.type === 'instruction') {
      if (!hasField(frontmatter.applyTo)) {
        issues.push({
          severity: 'error',
          code: 'INSTRUCTION_APPLYTO_REQUIRED',
          message: 'Instruction file requires applyTo in frontmatter',
          path: artifact.relativePath,
        });
      } else if (splitApplyTo(frontmatter.applyTo).length === 0) {
        issues.push({
          severity: 'error',
          code: 'INSTRUCTION_APPLYTO_INVALID',
          message: 'Instruction applyTo must contain at least one glob',
          path: artifact.relativePath,
        });
      }

      if (!hasField(frontmatter.name)) {
        issues.push({
          severity: options.strict ? 'error' : 'warning',
          code: 'INSTRUCTION_NAME_RECOMMENDED',
          message: 'Instruction frontmatter should include name',
          path: artifact.relativePath,
        });
      }

      if (!hasField(frontmatter.description)) {
        issues.push({
          severity: options.strict ? 'error' : 'warning',
          code: 'INSTRUCTION_DESCRIPTION_RECOMMENDED',
          message: 'Instruction frontmatter should include description',
          path: artifact.relativePath,
        });
      }
    }

    if (artifact.type === 'agent') {
      validateNameDesc(frontmatter, artifact.relativePath, issues);
      if (frontmatter.tools !== undefined && !isStringArray(frontmatter.tools)) {
        issues.push({
          severity: 'error',
          code: 'AGENT_TOOLS_TYPE',
          message: 'Agent tools frontmatter field must be a list of strings',
          path: artifact.relativePath,
        });
      }
    }

    if (artifact.type === 'skill') {
      validateNameDesc(frontmatter, artifact.relativePath, issues);
    }

    if (artifact.type === 'copilotInstructions' || artifact.type === 'settings') {
      hasSuiteOwner = true;
    }
  }

  const promptNameMap = findPromptNames(parsedArtifacts);
  for (const [name, entries] of promptNameMap.entries()) {
    if (entries.length > 1) {
      for (const entry of entries) {
        issues.push({
          severity: 'error',
          code: 'PROMPT_NAME_DUPLICATE_IN_SOURCE',
          message: `Duplicate prompt name in source set: ${name}`,
          path: entry.relativePath,
        });
      }
    }
  }

  if (options.targetPathForCollisionScan) {
    const sourcePromptNames = new Set(promptNameMap.keys());
    const targetCollisions = await findTargetPromptNameCollisions(options.targetPathForCollisionScan, sourcePromptNames);
    for (const collision of targetCollisions) {
      issues.push({
        severity: 'error',
        code: 'PROMPT_NAME_DUPLICATE_TARGET',
        message: `Prompt name already exists in target: ${collision.name}`,
        path: collision.path,
      });
    }
  }

  if (hasSuiteOwner && !options.suiteMode) {
    issues.push({
      severity: 'error',
      code: 'SUITE_OWNED_PATHS_REQUIRE_SUITE_MODE',
      message:
        'Pack includes suite-owned paths (.github/copilot-instructions.md or .vscode/settings.json); install requires --suite',
      path: rootPath,
    });
  }

  return {
    ok: !hasErrors(issues),
    issues,
    parsedArtifacts,
    elapsedMs: Date.now() - started,
  };
}
