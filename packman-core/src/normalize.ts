import path from "node:path";
import { promises as fs } from "node:fs";
import matter from "gray-matter";
import { detectPack } from "./detect.js";
import {
  writeJson,
  writeText,
  readText,
  readJson,
  exists,
} from "./fs-utils.js";
import { parseFrontmatter } from "./frontmatter.js";
import type {
  Artifact,
  FileChange,
  Issue,
  NormalizeOptions,
  NormalizeResult,
} from "./types.js";

const PROMPT_NAMESPACES = [
  "brief:",
  "audit:",
  "ship:",
  "sec:",
  "qa:",
  "ops:",
  "ux:",
  "gh:",
  "gov:",
  "rel:",
  "scaffold:",
  "suite:",
  "ui:",
  "polish:",
  "obs:",
];

const SUFFIXES = [".prompt.md", ".agent.md", ".instructions.md"];

const SUITE_OWNED_PATH_PREFIXES = [
  ".github/copilot-instructions.md",
  ".vscode/settings.json",
  ".github/hooks",
  ".vscode/mcp.json",
  "AGENTS.md",
  "CLAUDE.md",
  "CLAUDE.local.md",
  ".claude/CLAUDE.md",
  ".claude/settings.json",
  ".claude/settings.local.json",
];

type IntendedInstall = "solo" | "suite";

interface PackManifestLike {
  intended_install?: unknown;
  owned_paths?: unknown;
  namespaces?: unknown;
  orchestrator_agent?: unknown;
  [key: string]: unknown;
}

function splitArtifactFileName(fileName: string): {
  stem: string;
  suffix: string;
} {
  const matched = SUFFIXES.find((suffix) => fileName.endsWith(suffix));
  if (matched) {
    return {
      stem: fileName.slice(0, -matched.length),
      suffix: matched,
    };
  }

  const ext = path.extname(fileName);
  return {
    stem: path.basename(fileName, ext),
    suffix: ext,
  };
}

function kebabCaseFileName(fileName: string): string {
  const { stem, suffix } = splitArtifactFileName(fileName);
  if (suffix === ".prompt.md" && stem.includes(":")) {
    const namespacedStem = stem
      .split(":")
      .map((segment) =>
        segment
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/-{2,}/g, "-")
          .replace(/^-+|-+$/g, "")
          .toLowerCase(),
      )
      .join(":");

    return `${namespacedStem}${suffix}`;
  }

  const kebab = stem
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${kebab}${suffix}`;
}

function hasNamespace(name: string): boolean {
  return PROMPT_NAMESPACES.some((prefix) => name.startsWith(prefix));
}

async function treeForDir(
  rootPath: string,
  maxDepth = 4,
  prefix = "",
): Promise<string[]> {
  const lines: string[] = [];

  const recurse = async (
    currentPath: string,
    depth: number,
    currentPrefix: string,
  ): Promise<void> => {
    if (depth > maxDepth) {
      return;
    }

    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    lines.push(currentPrefix + path.basename(currentPath) + "/");

    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of sorted) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }

      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await recurse(entryPath, depth + 1, `${currentPrefix}  `);
      } else {
        lines.push(`${currentPrefix}  ${entry.name}`);
      }
    }
  };

  await recurse(rootPath, 0, prefix);
  return lines;
}

function normalizeOwnedPath(input: string): string {
  return input
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .replace(/\/+$/, "");
}

function pathCoveredByOwnedPath(
  artifactPath: string,
  ownedPath: string,
): boolean {
  const normalizedArtifactPath = normalizeOwnedPath(artifactPath);
  const normalizedOwnedPath = normalizeOwnedPath(ownedPath);
  if (!normalizedOwnedPath) {
    return false;
  }

  return (
    normalizedArtifactPath === normalizedOwnedPath ||
    normalizedArtifactPath.startsWith(`${normalizedOwnedPath}/`)
  );
}

function isSuiteOwnedPath(relativePath: string): boolean {
  return SUITE_OWNED_PATH_PREFIXES.some((prefix) =>
    pathCoveredByOwnedPath(relativePath, prefix),
  );
}

function toOwnedPath(relativePath: string): string {
  const normalizedPath = normalizeOwnedPath(relativePath);

  if (normalizedPath.startsWith(".github/prompts/")) {
    return ".github/prompts";
  }

  if (normalizedPath.startsWith(".github/agents/")) {
    return ".github/agents";
  }

  if (normalizedPath.startsWith(".github/instructions/")) {
    return ".github/instructions";
  }

  if (normalizedPath.startsWith(".github/skills/")) {
    return ".github/skills";
  }

  if (normalizedPath.startsWith(".github/hooks/")) {
    return ".github/hooks";
  }

  if (normalizedPath.startsWith(".claude/rules/")) {
    return ".claude/rules";
  }

  if (normalizedPath.startsWith(".claude/agents/")) {
    return ".claude/agents";
  }

  if (normalizedPath.startsWith(".claude/skills/")) {
    return ".claude/skills";
  }

  if (normalizedPath.startsWith(".agents/skills/")) {
    return ".agents/skills";
  }

  return normalizedPath;
}

function inferOwnedPaths(artifacts: Artifact[]): string[] {
  const owned = new Set<string>();
  for (const artifact of artifacts) {
    if (artifact.type === "manifest") {
      continue;
    }

    owned.add(toOwnedPath(artifact.relativePath));
  }

  return [...owned].sort((a, b) => a.localeCompare(b));
}

function inferIntendedInstall(artifacts: Artifact[]): IntendedInstall {
  const hasSuiteOwnedArtifact = artifacts.some(
    (artifact) =>
      artifact.type !== "manifest" && isSuiteOwnedPath(artifact.relativePath),
  );

  return hasSuiteOwnedArtifact ? "suite" : "solo";
}

function needsManifestContractAssist(manifest: PackManifestLike): boolean {
  return (
    manifest.intended_install === undefined ||
    manifest.owned_paths === undefined ||
    manifest.namespaces === undefined ||
    manifest.orchestrator_agent === undefined
  );
}

function manifestTemplate(
  rootPath: string,
  artifacts: Artifact[],
): Record<string, unknown> {
  const packName = path.basename(rootPath);
  return {
    id: packName,
    name: packName,
    version: "0.1.0",
    intended_install: inferIntendedInstall(artifacts),
    owned_paths: inferOwnedPaths(artifacts),
    namespaces: [],
    commands: ["validate", "normalize", "install", "doctor"],
    orchestrator_agent: "",
  };
}

function readmeTemplate(rootPath: string, treeBlock: string): string {
  const packName = path.basename(rootPath);
  return `# ${packName}\n\n## Purpose\nDescribe the purpose of this pack.\n\n## Install mode\nsolo\n\n## Commands\n- packman validate ${packName}\n- packman normalize ${packName}\n- packman install ${packName} --target workspace --path <repo> --dry-run\n\n## Directory tree\n\n\`\`\`text\n${treeBlock}\n\`\`\`\n\n## Post-install checklist\n- Confirm VS Code discovery settings are present\n- Run packman doctor on target\n- Validate prompt/instruction collisions\n`;
}

async function renameToKebab(filePath: string): Promise<string | undefined> {
  const fileName = path.basename(filePath);
  const targetName = kebabCaseFileName(fileName);
  if (fileName === targetName) {
    return undefined;
  }

  const targetPath = path.join(path.dirname(filePath), targetName);
  await fs.rename(filePath, targetPath);
  return targetPath;
}

function defaultNamespaceForPath(relativePath: string): string {
  if (relativePath.includes("/security") || relativePath.includes("/sec/")) {
    return "sec:";
  }

  if (relativePath.includes("/quality") || relativePath.includes("/qa/")) {
    return "qa:";
  }

  return "brief:";
}

export async function normalizePack(
  rootPath: string,
  options: NormalizeOptions = {},
): Promise<NormalizeResult> {
  const started = Date.now();
  const issues: Issue[] = [];
  const changes: FileChange[] = [];
  const detection = await detectPack(rootPath);

  for (const artifact of detection.artifacts) {
    if (!["prompt", "instruction", "agent"].includes(artifact.type)) {
      continue;
    }

    let effectivePath = artifact.absolutePath;
    const nextName = kebabCaseFileName(path.basename(artifact.absolutePath));
    if (nextName !== path.basename(artifact.absolutePath)) {
      const toPath = path.join(path.dirname(artifact.absolutePath), nextName);
      changes.push({
        action: "rename",
        fromPath: artifact.absolutePath,
        toPath,
      });

      if (options.apply) {
        const result = await renameToKebab(artifact.absolutePath);
        if (!result) {
          issues.push({
            severity: "warning",
            code: "NORMALIZE_RENAME_SKIPPED",
            message: "Rename could not be applied",
            path: artifact.relativePath,
          });
        } else {
          effectivePath = result;
        }
      }
    }

    if (artifact.type === "prompt") {
      const content = await readText(effectivePath);
      const parsed = parseFrontmatter(content);
      const currentName =
        typeof parsed.frontmatter.name === "string"
          ? parsed.frontmatter.name.trim()
          : "";
      if (!currentName) {
        continue;
      }

      if (!hasNamespace(currentName)) {
        const prefix = defaultNamespaceForPath(artifact.relativePath);
        const nextName = `${prefix}${currentName}`;

        issues.push({
          severity: "warning",
          code: "PROMPT_NAMESPACE",
          message: `Prompt name lacks namespace. Expected one of ${PROMPT_NAMESPACES.join(", ")}`,
          path: artifact.relativePath,
        });

        if (options.autoPrefixNamespaces) {
          const updated = matter.stringify(parsed.body ?? "", {
            ...parsed.frontmatter,
            name: nextName,
          });

          changes.push({
            action: "update",
            toPath: effectivePath,
            before: content,
            after: updated,
          });

          if (options.apply) {
            await writeText(effectivePath, updated);
          }
        }
      }
    }
  }

  const readmePath = path.join(rootPath, "README.md");
  if (!(await exists(readmePath))) {
    const tree = (await treeForDir(rootPath)).join("\n");
    const readme = readmeTemplate(rootPath, tree);
    changes.push({ action: "create", toPath: readmePath, after: readme });
    if (options.apply) {
      await writeText(readmePath, readme);
    }
  }

  const manifestPath = path.join(rootPath, "PACK_MANIFEST.json");
  if (!(await exists(manifestPath))) {
    const manifest = manifestTemplate(rootPath, detection.artifacts);
    changes.push({
      action: "create",
      toPath: manifestPath,
      after: JSON.stringify(manifest, null, 2),
    });
    if (options.apply) {
      await writeJson(manifestPath, manifest);
    }
  } else {
    const manifest = (await readJson<PackManifestLike>(manifestPath)) ?? {};
    if (needsManifestContractAssist(manifest)) {
      const nextManifest: PackManifestLike = { ...manifest };

      if (nextManifest.intended_install === undefined) {
        nextManifest.intended_install = inferIntendedInstall(
          detection.artifacts,
        );
      }

      if (nextManifest.owned_paths === undefined) {
        nextManifest.owned_paths = inferOwnedPaths(detection.artifacts);
      }

      if (nextManifest.namespaces === undefined) {
        nextManifest.namespaces = [];
      }

      if (nextManifest.orchestrator_agent === undefined) {
        nextManifest.orchestrator_agent = "";
      }

      const before = await readText(manifestPath);
      const after = `${JSON.stringify(nextManifest, null, 2)}\n`;
      changes.push({
        action: "update",
        toPath: manifestPath,
        before,
        after,
      });

      if (options.apply) {
        await writeJson(manifestPath, nextManifest);
      }
    }
  }

  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    issues,
    changes,
    elapsedMs: Date.now() - started,
  };
}
