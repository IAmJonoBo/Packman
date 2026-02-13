import path from "node:path";
import { promises as fs } from "node:fs";
import fg from "fast-glob";
import { detectMacOsJunk, detectPack } from "./detect.js";
import { isStringArray, parseFrontmatter } from "./frontmatter.js";
import { readJson } from "./fs-utils.js";
import { parseArtifacts } from "./parse.js";
import { hasErrors } from "./report.js";
import type {
  Issue,
  FrontmatterData,
  ParsedArtifact,
  ValidationOptions,
  ValidationResult,
} from "./types.js";

const REQUIRED_NAME_DESC = ["name", "description"] as const;
const ALLOWED_PROMPT_FRONTMATTER_KEYS = new Set([
  "agent",
  "argument-hint",
  "description",
  "model",
  "name",
  "tools",
]);

export const DEFAULT_ALLOWED_SUBAGENTS = [
  "agent",
  "ask",
  "edit",
  "Ask",
  "Plan",
  "AIAgentExpert",
  "DataAnalysisExpert",
] as const;

interface PackManifest {
  commands?: unknown;
}

const BUILTIN_MANIFEST_COMMANDS = new Set([
  "build",
  "doctor",
  "install",
  "normalize",
  "readiness",
  "registry",
  "rollback",
  "validate",
]);

function hasField(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function splitApplyTo(value: unknown): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((glob) => glob.trim())
    .filter((glob) => glob.length > 0);
}

function validateNameDesc(
  frontmatter: Record<string, unknown>,
  filePath: string,
  issues: Issue[],
): void {
  for (const field of REQUIRED_NAME_DESC) {
    if (!hasField(frontmatter[field])) {
      issues.push({
        severity: "error",
        code: "FRONTMATTER_REQUIRED",
        message: `Missing required frontmatter field: ${field}`,
        path: filePath,
      });
    }
  }
}

function findPromptNames(
  artifacts: ParsedArtifact[],
): Map<string, ParsedArtifact[]> {
  const map = new Map<string, ParsedArtifact[]>();

  for (const artifact of artifacts) {
    if (artifact.type !== "prompt") {
      continue;
    }

    const promptName = artifact.frontmatter?.name;
    if (typeof promptName !== "string") {
      continue;
    }

    const list = map.get(promptName) ?? [];
    list.push(artifact);
    map.set(promptName, list);
  }

  return map;
}

function promptCommandAliases(promptName: string): string[] {
  const aliases = new Set<string>([promptName]);
  const colonIndex = promptName.indexOf(":");
  if (colonIndex > 0 && colonIndex < promptName.length - 1) {
    aliases.add(promptName.slice(colonIndex + 1));
  }
  return [...aliases];
}

function collectPromptCommandAliases(artifacts: ParsedArtifact[]): Set<string> {
  const aliases = new Set<string>();

  for (const artifact of artifacts) {
    if (artifact.type !== "prompt") {
      continue;
    }

    const promptName = artifact.frontmatter?.name;
    if (typeof promptName !== "string") {
      continue;
    }

    for (const alias of promptCommandAliases(promptName)) {
      aliases.add(alias);
    }
  }

  return aliases;
}

function extractHandoffAgents(frontmatter: Record<string, unknown>): string[] {
  const handoffs = frontmatter.handoffs;
  if (!Array.isArray(handoffs)) {
    return [];
  }

  const agents: string[] = [];
  for (const item of handoffs) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const entry = item as Record<string, unknown>;
    const candidate =
      typeof entry.agent === "string"
        ? entry.agent
        : typeof entry.target === "string"
          ? entry.target
          : undefined;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      agents.push(candidate.trim());
    }
  }

  return agents;
}

function normalizeAgentRef(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const noSpaces = trimmed.replace(/\s+/g, "");
  const canonical = trimmed.replace(/[^a-zA-Z0-9]+/g, "");
  return Array.from(
    new Set([
      trimmed,
      trimmed.toLowerCase(),
      noSpaces,
      noSpaces.toLowerCase(),
      canonical,
      canonical.toLowerCase(),
    ]),
  );
}

function collectPackLocalAgentRefs(
  parsedArtifacts: ParsedArtifact[],
): Set<string> {
  const refs = new Set<string>();

  for (const artifact of parsedArtifacts) {
    if (artifact.type !== "agent") {
      continue;
    }

    const frontmatterName = artifact.frontmatter?.name;
    if (typeof frontmatterName === "string") {
      for (const alias of normalizeAgentRef(frontmatterName)) {
        refs.add(alias);
      }
    }

    const fileName = path.basename(artifact.relativePath, ".agent.md");
    for (const alias of normalizeAgentRef(fileName)) {
      refs.add(alias);
    }
  }

  return refs;
}

function isToolListOrCsv(value: unknown): boolean {
  if (isStringArray(value)) {
    return true;
  }

  if (typeof value !== "string") {
    return false;
  }

  const tokens = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return tokens.length > 0;
}

function validatePromptFrontmatterKeys(
  frontmatter: FrontmatterData,
  filePath: string,
  issues: Issue[],
): void {
  for (const key of Object.keys(frontmatter)) {
    if (ALLOWED_PROMPT_FRONTMATTER_KEYS.has(key)) {
      continue;
    }

    issues.push({
      severity: "warning",
      code: "PROMPT_FRONTMATTER_UNKNOWN_KEY",
      message: `Prompt frontmatter key '${key}' is not in the supported set`,
      path: filePath,
    });
  }
}

async function findTargetPromptNameCollisions(
  targetPath: string,
  sourcePromptNames: Set<string>,
): Promise<Array<{ name: string; path: string }>> {
  const collisions: Array<{ name: string; path: string }> = [];
  const promptFiles = await fg(".github/prompts/**/*.prompt.md", {
    cwd: targetPath,
    absolute: true,
    dot: true,
  });

  for (const filePath of promptFiles) {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = parseFrontmatter(raw);
    if (
      typeof parsed.frontmatter.name === "string" &&
      sourcePromptNames.has(parsed.frontmatter.name)
    ) {
      collisions.push({
        name: parsed.frontmatter.name,
        path: path.relative(targetPath, filePath),
      });
    }
  }

  return collisions;
}

export async function validatePack(
  rootPath: string,
  options: ValidationOptions = {},
): Promise<ValidationResult> {
  const started = Date.now();
  const issues: Issue[] = [];

  const detection = await detectPack(rootPath);
  const parsedArtifacts = await parseArtifacts(detection.artifacts);
  const allowedHandoffAgents = new Set<string>();
  for (const item of options.allowedSubagents ?? DEFAULT_ALLOWED_SUBAGENTS) {
    for (const alias of normalizeAgentRef(item)) {
      allowedHandoffAgents.add(alias);
    }
  }
  for (const item of collectPackLocalAgentRefs(parsedArtifacts)) {
    allowedHandoffAgents.add(item);
  }

  const junk = await detectMacOsJunk(rootPath);
  if (junk.length > 0) {
    for (const entry of junk) {
      issues.push({
        severity: "error",
        code: "MACOS_JUNK",
        message: "macOS junk file detected (must clean before install)",
        path: entry,
      });
    }
  }

  if (!detection.isPack) {
    issues.push({
      severity: "error",
      code: "PACK_NOT_DETECTED",
      message: "No pack artifacts found under provided path",
      path: rootPath,
    });
  }

  let hasSuiteOwner = false;

  for (const artifact of parsedArtifacts) {
    if (artifact.parseError) {
      issues.push({
        severity: "error",
        code: "FRONTMATTER_PARSE",
        message: `Invalid frontmatter: ${artifact.parseError}`,
        path: artifact.relativePath,
      });
      continue;
    }

    const frontmatter = artifact.frontmatter ?? {};

    if (artifact.type === "prompt") {
      validateNameDesc(frontmatter, artifact.relativePath, issues);
      validatePromptFrontmatterKeys(frontmatter, artifact.relativePath, issues);
      if (
        frontmatter.tools !== undefined &&
        !isToolListOrCsv(frontmatter.tools)
      ) {
        issues.push({
          severity: "error",
          code: "PROMPT_TOOLS_TYPE",
          message:
            "Prompt frontmatter tools must be a list of strings or a comma-separated string",
          path: artifact.relativePath,
        });
      }
    }

    if (artifact.type === "instruction") {
      if (!hasField(frontmatter.applyTo)) {
        issues.push({
          severity: "error",
          code: "INSTRUCTION_APPLYTO_REQUIRED",
          message: "Instruction file requires applyTo in frontmatter",
          path: artifact.relativePath,
        });
      } else if (splitApplyTo(frontmatter.applyTo).length === 0) {
        issues.push({
          severity: "error",
          code: "INSTRUCTION_APPLYTO_INVALID",
          message: "Instruction applyTo must contain at least one glob",
          path: artifact.relativePath,
        });
      }

      if (!hasField(frontmatter.name)) {
        issues.push({
          severity: options.strict ? "error" : "warning",
          code: "INSTRUCTION_NAME_RECOMMENDED",
          message: "Instruction frontmatter should include name",
          path: artifact.relativePath,
        });
      }

      if (!hasField(frontmatter.description)) {
        issues.push({
          severity: options.strict ? "error" : "warning",
          code: "INSTRUCTION_DESCRIPTION_RECOMMENDED",
          message: "Instruction frontmatter should include description",
          path: artifact.relativePath,
        });
      }
    }

    if (artifact.type === "agent") {
      validateNameDesc(frontmatter, artifact.relativePath, issues);
      if (
        frontmatter.tools !== undefined &&
        !isToolListOrCsv(frontmatter.tools)
      ) {
        issues.push({
          severity: "error",
          code: "AGENT_TOOLS_TYPE",
          message:
            "Agent tools frontmatter field must be a list of strings or a comma-separated string",
          path: artifact.relativePath,
        });
      }

      if (options.strict) {
        for (const handoffAgent of extractHandoffAgents(frontmatter)) {
          const variants = normalizeAgentRef(handoffAgent);
          const isKnown = variants.some((variant) =>
            allowedHandoffAgents.has(variant),
          );
          if (!isKnown) {
            issues.push({
              severity: "error",
              code: "AGENT_HANDOFF_UNKNOWN",
              message: `Unknown handoff agent '${handoffAgent}'`,
              path: artifact.relativePath,
              details: {
                allowedSubagents: [...allowedHandoffAgents],
              },
            });
          }
        }
      }
    }

    if (artifact.type === "skill") {
      validateNameDesc(frontmatter, artifact.relativePath, issues);
    }

    if (
      artifact.type === "copilotInstructions" ||
      artifact.type === "settings"
    ) {
      hasSuiteOwner = true;
    }
  }

  const promptNameMap = findPromptNames(parsedArtifacts);
  for (const [name, entries] of promptNameMap.entries()) {
    if (entries.length > 1) {
      for (const entry of entries) {
        issues.push({
          severity: "error",
          code: "PROMPT_NAME_DUPLICATE_IN_SOURCE",
          message: `Duplicate prompt name in source set: ${name}`,
          path: entry.relativePath,
        });
      }
    }
  }

  if (options.targetPathForCollisionScan) {
    const sourcePromptNames = new Set(promptNameMap.keys());
    const targetCollisions = await findTargetPromptNameCollisions(
      options.targetPathForCollisionScan,
      sourcePromptNames,
    );
    for (const collision of targetCollisions) {
      issues.push({
        severity: "error",
        code: "PROMPT_NAME_DUPLICATE_TARGET",
        message: `Prompt name already exists in target: ${collision.name}`,
        path: collision.path,
      });
    }
  }

  if (hasSuiteOwner && !options.suiteMode) {
    issues.push({
      severity: "error",
      code: "SUITE_OWNED_PATHS_REQUIRE_SUITE_MODE",
      message:
        "Pack includes suite-owned paths (.github/copilot-instructions.md or .vscode/settings.json); install requires --suite",
      path: rootPath,
    });
  }

  if (detection.manifestPath) {
    const manifest = await readJson<PackManifest>(detection.manifestPath);
    if (manifest && manifest.commands !== undefined) {
      if (!Array.isArray(manifest.commands)) {
        issues.push({
          severity: "error",
          code: "MANIFEST_COMMANDS_TYPE",
          message: "PACK_MANIFEST.json commands must be an array of strings",
          path: path.relative(rootPath, detection.manifestPath),
        });
      } else {
        const manifestCommands = manifest.commands.filter(
          (value): value is string => typeof value === "string",
        );
        if (manifestCommands.length !== manifest.commands.length) {
          issues.push({
            severity: "error",
            code: "MANIFEST_COMMANDS_TYPE",
            message: "PACK_MANIFEST.json commands must contain only strings",
            path: path.relative(rootPath, detection.manifestPath),
          });
        }

        const promptAliases = collectPromptCommandAliases(parsedArtifacts);
        for (const command of manifestCommands) {
          if (BUILTIN_MANIFEST_COMMANDS.has(command)) {
            continue;
          }

          if (!promptAliases.has(command)) {
            issues.push({
              severity: options.strict ? "error" : "warning",
              code: "MANIFEST_COMMAND_MISSING_PROMPT",
              message: `Manifest command '${command}' has no matching prompt name`,
              path: path.relative(rootPath, detection.manifestPath),
            });
          }
        }
      }
    }
  }

  return {
    ok: !hasErrors(issues),
    issues,
    parsedArtifacts,
    elapsedMs: Date.now() - started,
  };
}
