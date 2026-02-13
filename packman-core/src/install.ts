import path from "node:path";
import { promises as fs } from "node:fs";
import fg from "fast-glob";
import JSZip from "jszip";
import { readJson, writeJson, readText, exists } from "./fs-utils.js";
import { detectPack } from "./detect.js";
import { resolvePackSource } from "./source-resolver.js";
import { mergeSettings } from "./settings-merge.js";
import { validatePack } from "./validate.js";
import type {
  InstallCollision,
  InstallOptions,
  InstallPlan,
  InstallResult,
  Issue,
} from "./types.js";

const COPY_PATTERNS = [
  ".github/agents/**/*.agent.md",
  ".github/prompts/**/*.prompt.md",
  ".github/instructions/**/*.instructions.md",
  ".github/skills/**/SKILL.md",
  ".github/copilot-instructions.md",
  ".vscode/settings.json",
  "PACK_MANIFEST.json",
  "README.md",
];

async function ensureParent(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function backupFiles(
  targetRoot: string,
  files: string[],
): Promise<string | undefined> {
  if (files.length === 0) {
    return undefined;
  }

  const zip = new JSZip();
  for (const relativePath of files) {
    const absolutePath = path.join(targetRoot, relativePath);
    if (!(await exists(absolutePath))) {
      continue;
    }

    const data = await fs.readFile(absolutePath);
    zip.file(relativePath, data);
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });
  const backupPath = path.join(targetRoot, `.packman-backup-${Date.now()}.zip`);
  await fs.writeFile(backupPath, content);
  return backupPath;
}

async function copyFile(sourcePath: string, targetPath: string): Promise<void> {
  await ensureParent(targetPath);
  await fs.copyFile(sourcePath, targetPath);
}

function renameCandidate(relativePath: string, attempt: number): string {
  const dir = path.posix.dirname(relativePath);
  const fileName = path.posix.basename(relativePath);
  const suffixes = [".prompt.md", ".agent.md", ".instructions.md"];
  const matchedSuffix = suffixes.find((suffix) => fileName.endsWith(suffix));
  const indexSuffix = attempt > 1 ? `-${attempt}` : "";

  if (matchedSuffix) {
    const stem = fileName.slice(0, -matchedSuffix.length);
    const nextName = `${stem}-incoming${indexSuffix}${matchedSuffix}`;
    return dir === "." ? nextName : path.posix.join(dir, nextName);
  }

  const ext = path.posix.extname(fileName);
  const stem = ext ? fileName.slice(0, -ext.length) : fileName;
  const nextName = `${stem}-incoming${indexSuffix}${ext}`;
  return dir === "." ? nextName : path.posix.join(dir, nextName);
}

async function resolveRenamePath(
  relativePath: string,
  targetRoot: string,
): Promise<string> {
  let attempt = 1;

  while (true) {
    const candidate = renameCandidate(relativePath, attempt);
    const candidatePath = path.join(targetRoot, candidate);
    if (!(await exists(candidatePath))) {
      return candidate;
    }
    attempt += 1;
  }
}

function previewContent(content: string): string {
  const trimmed = content.trim();
  if (trimmed.length <= 400) {
    return trimmed;
  }

  return `${trimmed.slice(0, 400)}...`;
}

async function buildInstallPlan(
  sourcePath: string,
  targetPath: string,
): Promise<InstallPlan> {
  const matches = await fg(COPY_PATTERNS, {
    cwd: sourcePath,
    onlyFiles: true,
    dot: true,
  });
  const unique = [...new Set(matches)];
  const operations: InstallPlan["operations"] = [];
  const collisions: InstallCollision[] = [];

  for (const relativePath of unique) {
    const sourceFile = path.join(sourcePath, relativePath);
    const targetFile = path.join(targetPath, relativePath);

    if (relativePath === ".vscode/settings.json") {
      operations.push({
        action: "merge",
        relativePath,
        reason: "Union merge for chat.*Locations, preserve unrelated keys",
      });
      continue;
    }

    if (!(await exists(targetFile))) {
      operations.push({ action: "create", relativePath });
      continue;
    }

    const current = await readText(targetFile);
    const incoming = await readText(sourceFile);
    if (current === incoming) {
      operations.push({
        action: "skip",
        relativePath,
        reason: "Identical content already present",
      });
      continue;
    }

    operations.push({
      action: "update",
      relativePath,
      reason: "Target content differs from source content",
    });
    collisions.push({
      relativePath,
      sourcePath: sourceFile,
      targetPath: targetFile,
      sourcePreview: previewContent(incoming),
      targetPreview: previewContent(current),
      availableActions: ["skip", "overwrite", "rename"],
    });
  }

  return {
    sourceRoot: sourcePath,
    targetRoot: targetPath,
    operations,
    collisions,
  };
}

export async function installPack(
  sourcePath: string,
  options: InstallOptions,
): Promise<InstallResult> {
  const started = Date.now();
  const issues: Issue[] = [];
  const collisionStrategy = options.collisionStrategy ?? "fail";
  const collisionDecisions = options.collisionDecisions ?? {};
  const plan = await buildInstallPlan(sourcePath, options.targetPath);

  const validation = await validatePack(sourcePath, {
    targetPathForCollisionScan: options.targetPath,
    suiteMode: options.suite,
  });

  if (!validation.ok) {
    return {
      ok: false,
      issues: validation.issues,
      filesTouched: [],
      elapsedMs: Date.now() - started,
    };
  }

  const matches = await fg(COPY_PATTERNS, {
    cwd: sourcePath,
    onlyFiles: true,
    dot: true,
  });
  const filesToTouch = [...new Set(matches)];
  const touched: string[] = [];

  const backupZipPath = await backupFiles(options.targetPath, filesToTouch);

  if (options.dryRun) {
    return {
      ok: true,
      issues,
      filesTouched: filesToTouch,
      backupZipPath,
      plans: [plan],
      elapsedMs: Date.now() - started,
    };
  }

  for (const relativePath of filesToTouch) {
    const sourceFile = path.join(sourcePath, relativePath);
    let effectiveRelativePath = relativePath;
    let targetFile = path.join(options.targetPath, effectiveRelativePath);

    if (relativePath === ".vscode/settings.json") {
      const existing =
        (await readJson<Record<string, unknown>>(targetFile)) ?? {};
      const incoming =
        (await readJson<Record<string, unknown>>(sourceFile)) ?? {};
      const merged = mergeSettings(existing, incoming);
      await writeJson(targetFile, merged);
      touched.push(effectiveRelativePath);
      continue;
    }

    if (
      (relativePath === ".github/copilot-instructions.md" ||
        relativePath === ".vscode/settings.json") &&
      !options.suite
    ) {
      issues.push({
        severity: "error",
        code: "SUITE_ONLY_FILE",
        message: `Refusing to write ${relativePath} outside suite mode`,
        path: relativePath,
      });
      continue;
    }

    if (await exists(targetFile)) {
      const current = await readText(targetFile);
      const incoming = await readText(sourceFile);
      if (current !== incoming) {
        const perFileDecision = collisionDecisions[relativePath];
        const strategy = perFileDecision ?? collisionStrategy;

        if (!["fail", "skip", "overwrite", "rename"].includes(strategy)) {
          issues.push({
            severity: "error",
            code: "INVALID_COLLISION_DECISION",
            message: `Invalid collision decision '${String(strategy)}' for ${relativePath}`,
            path: relativePath,
          });
          continue;
        }

        if (strategy === "fail") {
          issues.push({
            severity: "error",
            code: "COLLISION_FAILSAFE",
            message: `Collision detected on ${relativePath}; refusing implicit overwrite`,
            path: relativePath,
          });
          continue;
        }

        if (strategy === "skip") {
          issues.push({
            severity: "warning",
            code: "COLLISION_SKIPPED",
            message: `Collision detected on ${relativePath}; skipped incoming file`,
            path: relativePath,
          });
          continue;
        }

        if (strategy === "overwrite") {
          issues.push({
            severity: "warning",
            code: "COLLISION_OVERWRITTEN",
            message: `Collision detected on ${relativePath}; overwrote target file`,
            path: relativePath,
          });
        }

        if (strategy === "rename") {
          const renamed = await resolveRenamePath(
            relativePath,
            options.targetPath,
          );
          issues.push({
            severity: "warning",
            code: "COLLISION_RENAMED",
            message: `Collision detected on ${relativePath}; installed as ${renamed}`,
            path: relativePath,
          });
          effectiveRelativePath = renamed;
          targetFile = path.join(options.targetPath, effectiveRelativePath);
        }
      }
    }

    await copyFile(sourceFile, targetFile);
    touched.push(effectiveRelativePath);
  }

  const ok = issues.every((issue) => issue.severity !== "error");

  return {
    ok,
    issues,
    filesTouched: touched,
    backupZipPath,
    plans: [plan],
    elapsedMs: Date.now() - started,
  };
}

export async function installPacks(
  sourcePath: string,
  options: InstallOptions,
): Promise<InstallResult> {
  const started = Date.now();
  const issues: Issue[] = [];
  const filesTouched: string[] = [];
  const plans: InstallPlan[] = [];
  let backupZipPath: string | undefined;

  const resolved = await resolvePackSource(sourcePath, {
    autoCleanMacOSJunk: options.autoCleanMacOSJunk,
  });
  const packRoots = resolved.roots;

  if (packRoots.length === 0) {
    await resolved.cleanup();
  }

  if (packRoots.length === 0) {
    return {
      ok: false,
      issues: [
        {
          severity: "error",
          code: "NO_PACKS_FOUND",
          message: "No pack roots found in provided source path",
          path: sourcePath,
        },
      ],
      filesTouched: [],
      elapsedMs: Date.now() - started,
    };
  }

  const suiteOwners: string[] = [];
  const promptNames = new Map<string, string>();

  for (const packRoot of packRoots) {
    const detection = await detectPack(packRoot);
    const ownsSuiteFile = detection.artifacts.some(
      (artifact) =>
        artifact.type === "copilotInstructions" || artifact.type === "settings",
    );
    if (ownsSuiteFile) {
      suiteOwners.push(packRoot);
    }

    const validation = await validatePack(packRoot, {
      strict: true,
      targetPathForCollisionScan: options.targetPath,
      suiteMode: options.suite,
    });

    issues.push(...validation.issues);

    for (const artifact of validation.parsedArtifacts) {
      if (artifact.type !== "prompt") {
        continue;
      }

      const name = artifact.frontmatter?.name;
      if (typeof name !== "string") {
        continue;
      }

      const previousOwner = promptNames.get(name);
      if (previousOwner && previousOwner !== packRoot) {
        issues.push({
          severity: "error",
          code: "PROMPT_NAME_DUPLICATE_SOURCE_SET",
          message: `Duplicate prompt name across source packs: ${name}`,
          details: { previousOwner, currentOwner: packRoot },
        });
      } else {
        promptNames.set(name, packRoot);
      }
    }
  }

  if (suiteOwners.length > 1) {
    const hasHarmoniser = packRoots.some((packRoot) =>
      path.basename(packRoot).includes("suite-harmoniser"),
    );
    if (!options.suite || !hasHarmoniser) {
      issues.push({
        severity: "error",
        code: "SUITE_OWNER_COLLISION",
        message:
          "Multiple packs contain suite-owned files. Enable --suite and include suite harmoniser pack before install.",
        details: { suiteOwners },
      });
    }
  }

  if (issues.some((issue) => issue.severity === "error")) {
    return {
      ok: false,
      issues,
      filesTouched,
      elapsedMs: Date.now() - started,
    };
  }

  try {
    for (const packRoot of packRoots) {
      const result = await installPack(packRoot, options);
      issues.push(...result.issues);
      filesTouched.push(
        ...result.filesTouched.map(
          (filePath) => `${path.basename(packRoot)}:${filePath}`,
        ),
      );
      if (result.plans) {
        plans.push(...result.plans);
      }
      if (!backupZipPath && result.backupZipPath) {
        backupZipPath = result.backupZipPath;
      }
    }
  } finally {
    await resolved.cleanup();
  }

  return {
    ok: !issues.some((issue) => issue.severity === "error"),
    issues,
    filesTouched,
    backupZipPath,
    plans,
    elapsedMs: Date.now() - started,
  };
}

export async function rollbackInstall(
  targetPath: string,
  backupZipPath: string,
): Promise<InstallResult> {
  const started = Date.now();
  const issues: Issue[] = [];

  const zipBytes = await fs.readFile(backupZipPath);
  const zip = await JSZip.loadAsync(zipBytes);
  const filesTouched: string[] = [];

  for (const [entryPath, entry] of Object.entries(zip.files)) {
    if (entry.dir) {
      continue;
    }

    const content = await entry.async("nodebuffer");
    const destination = path.join(targetPath, entryPath);
    await ensureParent(destination);
    await fs.writeFile(destination, content);
    filesTouched.push(entryPath);
  }

  return {
    ok: issues.length === 0,
    issues,
    filesTouched,
    backupZipPath,
    elapsedMs: Date.now() - started,
  };
}
