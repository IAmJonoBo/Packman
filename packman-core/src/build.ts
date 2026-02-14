import path from "node:path";
import { promises as fs } from "node:fs";
import fg from "fast-glob";
import JSZip from "jszip";
import type {
  ExportBuilderOptions,
  ExportManifest,
  ExportManifestEntry,
  ExportTarget,
  Issue,
  Item,
  RegistryGraph,
  Skill,
} from "./types.js";

function shouldExclude(relativePath: string): boolean {
  return (
    relativePath.includes("__MACOSX/") ||
    relativePath.endsWith(".DS_Store") ||
    relativePath.split("/").some((segment) => segment.startsWith("._"))
  );
}

export async function buildCleanZip(
  sourceDir: string,
  outZipPath: string,
): Promise<{ filesAdded: number; outZipPath: string }> {
  const zip = new JSZip();

  const files = await fg("**/*", {
    cwd: sourceDir,
    dot: true,
    onlyFiles: true,
  });

  let filesAdded = 0;

  for (const relativePath of files) {
    if (shouldExclude(relativePath)) {
      continue;
    }

    const absolutePath = path.join(sourceDir, relativePath);
    const content = await fs.readFile(absolutePath);
    zip.file(relativePath, content);
    filesAdded += 1;
  }

  const output = await zip.generateAsync({ type: "nodebuffer" });
  await fs.mkdir(path.dirname(outZipPath), { recursive: true });
  await fs.writeFile(outZipPath, output);

  return {
    filesAdded,
    outZipPath,
  };
}

function normalizeRelative(input: string): string {
  return input.split(path.sep).join("/").replace(/^\.\//, "");
}

function stripLeadingPrefix(input: string, prefix: string): string {
  if (input === prefix) return "";
  if (input.startsWith(`${prefix}/`)) {
    return input.slice(prefix.length + 1);
  }
  return input;
}

function toTargetPath(sourcePath: string, target: ExportTarget): string | undefined {
  const normalized = normalizeRelative(sourcePath);

  if (normalized === "instructions/copilot-instructions.md") {
    return target === "workspace"
      ? ".github/copilot-instructions.md"
      : "instructions/copilot-instructions.md";
  }

  const mappings: Array<[string, string]> = [
    ["agents", target === "workspace" ? ".github/agents" : "agents"],
    ["prompts", target === "workspace" ? ".github/prompts" : "prompts"],
    [
      "instructions",
      target === "workspace" ? ".github/instructions" : "instructions",
    ],
    ["skills", target === "workspace" ? ".github/skills" : "skills"],
  ];

  for (const [sourcePrefix, targetPrefix] of mappings) {
    if (normalized === sourcePrefix || normalized.startsWith(`${sourcePrefix}/`)) {
      const suffix = stripLeadingPrefix(normalized, sourcePrefix);
      return suffix ? `${targetPrefix}/${suffix}` : targetPrefix;
    }
  }

  return undefined;
}

function makeIssue(
  severity: Issue["severity"],
  code: string,
  message: string,
  targetPath?: string,
): Issue {
  return {
    severity,
    code,
    message,
    path: targetPath,
  };
}

function itemToManifestEntry(
  item: Item,
  target: ExportTarget,
  includeCopilotInstructions: boolean,
): ExportManifestEntry | undefined {
  if (item.type === "copilotInstructions" && !includeCopilotInstructions) {
    return undefined;
  }

  const targetPath = toTargetPath(item.sourcePath, target);
  if (!targetPath) return undefined;

  return {
    sourcePath: normalizeRelative(item.sourcePath),
    targetPath,
    itemType: item.type,
  };
}

function skillToManifestEntries(
  skill: Skill,
  target: ExportTarget,
): ExportManifestEntry[] {
  const entries: ExportManifestEntry[] = [];
  const skillDocTarget = toTargetPath(skill.skillPath, target);
  if (skillDocTarget) {
    entries.push({
      sourcePath: normalizeRelative(skill.skillPath),
      targetPath: skillDocTarget,
      itemType: "skill",
    });
  }

  for (const assetPath of [...skill.assetPaths].sort((left, right) =>
    left.localeCompare(right),
  )) {
    const targetPath = toTargetPath(assetPath, target);
    if (!targetPath) continue;
    entries.push({
      sourcePath: normalizeRelative(assetPath),
      targetPath,
      itemType: "skillAsset",
    });
  }

  return entries;
}

function applyCollisionPolicy(
  entries: ExportManifestEntry[],
  options: ExportBuilderOptions,
): { entries: ExportManifestEntry[]; collisions: Issue[] } {
  const policy = options.collisionPolicy ?? "error";
  const selectedByTarget = new Map<string, ExportManifestEntry>();
  const collisions: Issue[] = [];

  for (const entry of entries) {
    const existing = selectedByTarget.get(entry.targetPath);
    if (!existing) {
      selectedByTarget.set(entry.targetPath, entry);
      continue;
    }

    const message = `Collision for target '${entry.targetPath}' between '${existing.sourcePath}' and '${entry.sourcePath}'`;
    if (policy === "error") {
      collisions.push(
        makeIssue("error", "EXPORT_TARGET_COLLISION", message, entry.targetPath),
      );
      continue;
    }

    collisions.push(
      makeIssue("warning", "EXPORT_TARGET_COLLISION", message, entry.targetPath),
    );

    if (policy === "last") {
      selectedByTarget.set(entry.targetPath, entry);
    }
  }

  return {
    entries: [...selectedByTarget.values()].sort((left, right) =>
      left.targetPath.localeCompare(right.targetPath),
    ),
    collisions,
  };
}

function collectionFilter(
  registry: RegistryGraph,
  collectionName?: string,
): {
  include: (sourcePath: string) => boolean;
  collectionIssues: Issue[];
  resolvedCollection?: string;
} {
  if (!collectionName) {
    return {
      include: () => true,
      collectionIssues: [],
    };
  }

  const collection =
    registry.collections.find((entry) => entry.id === collectionName) ||
    (registry.plugins.id === collectionName ? registry.plugins : undefined);

  if (!collection) {
    return {
      include: () => false,
      collectionIssues: [
        makeIssue(
          "error",
          "COLLECTION_NOT_FOUND",
          `Collection '${collectionName}' does not exist in registry graph`,
          collectionName,
        ),
      ],
      resolvedCollection: collectionName,
    };
  }

  const roots = [...collection.packRoots].map((entry) => normalizeRelative(entry));
  if (roots.length === 0) {
    return {
      include: () => true,
      collectionIssues: [],
      resolvedCollection: collection.id,
    };
  }

  return {
    include: (sourcePath: string) => {
      const normalized = normalizeRelative(sourcePath);
      if (!normalized.startsWith("Packs/")) {
        return true;
      }
      return roots.some(
        (root) => normalized === root || normalized.startsWith(`${root}/`),
      );
    },
    collectionIssues: [],
    resolvedCollection: collection.id,
  };
}

function buildManifest(
  registry: RegistryGraph,
  target: ExportTarget,
  collectionName?: string,
  options: ExportBuilderOptions = {},
): ExportManifest {
  const includeCopilotInstructions = options.includeCopilotInstructions ?? true;
  const filterResult = collectionFilter(registry, collectionName);

  const itemEntries = [...registry.items]
    .sort((left, right) => left.sourcePath.localeCompare(right.sourcePath))
    .filter((item) => filterResult.include(item.sourcePath))
    .map((item) => itemToManifestEntry(item, target, includeCopilotInstructions))
    .filter((entry): entry is ExportManifestEntry => Boolean(entry));

  const skillEntries = [...registry.skills]
    .sort((left, right) => left.skillPath.localeCompare(right.skillPath))
    .filter((skill) => filterResult.include(skill.skillPath))
    .flatMap((skill) => skillToManifestEntries(skill, target));

  const collisionResult = applyCollisionPolicy(
    [...itemEntries, ...skillEntries],
    options,
  );

  return {
    target,
    collection: filterResult.resolvedCollection,
    entries: collisionResult.entries,
    collisions: [...filterResult.collectionIssues, ...collisionResult.collisions],
  };
}

export function buildWorkspace(
  registry: RegistryGraph,
  options: ExportBuilderOptions = {},
): ExportManifest {
  return buildManifest(registry, "workspace", undefined, options);
}

export function buildProfile(
  registry: RegistryGraph,
  options: ExportBuilderOptions = {},
): ExportManifest {
  return buildManifest(registry, "profile", undefined, options);
}

export function buildCollection(
  registry: RegistryGraph,
  collectionName: string,
  target: ExportTarget,
  options: ExportBuilderOptions = {},
): ExportManifest {
  return buildManifest(registry, target, collectionName, options);
}
