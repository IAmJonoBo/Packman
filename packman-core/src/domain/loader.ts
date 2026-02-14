import path from "node:path";
import { promises as fs } from "node:fs";
import fg from "fast-glob";
import { parseFrontmatter } from "../frontmatter.js";
import { exists, readText, toPosixPath } from "../fs-utils.js";
import type {
  Collection,
  CollectionSchemaValidation,
  Issue,
  Item,
  ItemType,
  RegistryGraph,
  RegistryGraphOptions,
  Skill,
} from "../types.js";
import { normalizeGraph } from "./types.js";

const DEFAULT_COLLECTION_MATURITY = "stable";
const DEFAULT_COLLECTION_TAGS = ["curated", "plugin"];
const DEFAULT_COLLECTION_STACKS = ["github-copilot", "vscode"];

interface LayoutPaths {
  agentsPattern: string;
  promptsPattern: string;
  instructionsPattern: string;
  copilotInstructionsPath: string;
  skillsPattern: string;
}

function getLayoutPaths(layout: "canonical" | "workspace"): LayoutPaths {
  if (layout === "workspace") {
    return {
      agentsPattern: ".github/agents/**/*.agent.md",
      promptsPattern: ".github/prompts/**/*.prompt.md",
      instructionsPattern: ".github/instructions/**/*.instructions.md",
      copilotInstructionsPath: ".github/copilot-instructions.md",
      skillsPattern: ".github/skills/*/SKILL.md",
    };
  }

  return {
    agentsPattern: "agents/**/*.agent.md",
    promptsPattern: "prompts/**/*.prompt.md",
    instructionsPattern: "instructions/**/*.instructions.md",
    copilotInstructionsPath: "instructions/copilot-instructions.md",
    skillsPattern: "skills/*/SKILL.md",
  };
}

function toDisplayNameFromId(id: string): string {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function issue(
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

function parseName(raw: string, fallback: string): string {
  const parsed = parseFrontmatter(raw);
  if (typeof parsed.frontmatter.name === "string" && parsed.frontmatter.name.trim()) {
    return parsed.frontmatter.name.trim();
  }
  return fallback;
}

async function readCollectionJson(
  filePath: string,
): Promise<Record<string, unknown> | undefined> {
  try {
    const content = await readText(filePath);
    return JSON.parse(content) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const next = value.filter((entry): entry is string => typeof entry === "string");
  return next.length === value.length ? next : undefined;
}

function asCollectionObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

export function validateCollectionSchema(
  value: unknown,
  sourcePath: string,
): CollectionSchemaValidation {
  const issues: Issue[] = [];
  const data = asCollectionObject(value);

  if (!data) {
    return {
      ok: false,
      issues: [
        issue(
          "error",
          "COLLECTION_SCHEMA_INVALID",
          "Collection descriptor must be a JSON object",
          sourcePath,
        ),
      ],
    };
  }

  const id = typeof data.id === "string" ? data.id.trim() : "";
  if (!id) {
    issues.push(
      issue(
        "error",
        "COLLECTION_ID_REQUIRED",
        "Collection descriptor requires a non-empty 'id' string",
        sourcePath,
      ),
    );
  }

  const packRoots = asStringArray(data.packRoots);
  if (!packRoots || packRoots.length === 0) {
    issues.push(
      issue(
        "error",
        "COLLECTION_PACKROOTS_REQUIRED",
        "Collection descriptor requires a non-empty string array 'packRoots'",
        sourcePath,
      ),
    );
  }

  const tags = asStringArray(data.tags);
  if (data.tags !== undefined && !tags) {
    issues.push(
      issue(
        "error",
        "COLLECTION_TAGS_INVALID",
        "Collection field 'tags' must be a string array when provided",
        sourcePath,
      ),
    );
  }

  const intendedStacks = asStringArray(data.intendedStacks);
  if (data.intendedStacks !== undefined && !intendedStacks) {
    issues.push(
      issue(
        "error",
        "COLLECTION_STACKS_INVALID",
        "Collection field 'intendedStacks' must be a string array when provided",
        sourcePath,
      ),
    );
  }

  const collections = asStringArray(data.collections);
  if (data.collections !== undefined && !collections) {
    issues.push(
      issue(
        "error",
        "COLLECTION_REFS_INVALID",
        "Collection field 'collections' must be a string array when provided",
        sourcePath,
      ),
    );
  }

  if (issues.some((entry) => entry.severity === "error")) {
    return {
      ok: false,
      issues,
    };
  }

  const collection: Collection = {
    id,
    name:
      typeof data.name === "string" && data.name.trim()
        ? data.name.trim()
        : toDisplayNameFromId(id),
    maturity:
      typeof data.maturity === "string" && data.maturity.trim()
        ? data.maturity.trim()
        : DEFAULT_COLLECTION_MATURITY,
    tags: tags ?? [...DEFAULT_COLLECTION_TAGS],
    intendedStacks: intendedStacks ?? [...DEFAULT_COLLECTION_STACKS],
    packRoots: [...(packRoots ?? [])].sort((left, right) =>
      left.localeCompare(right),
    ),
    collections: [...(collections ?? [])].sort((left, right) =>
      left.localeCompare(right),
    ),
    sourcePath,
  };

  return {
    ok: true,
    collection,
    issues,
  };
}

async function loadCollections(
  rootPath: string,
  strictCollections: boolean,
): Promise<{ collections: Collection[]; issues: Issue[] }> {
  const issues: Issue[] = [];
  const collectionsRoot = path.join(rootPath, "collections");
  if (!(await exists(collectionsRoot))) {
    return { collections: [], issues };
  }

  const entries = await fs.readdir(collectionsRoot, { withFileTypes: true });
  const collections: Collection[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const collectionDir = path.join(collectionsRoot, entry.name);
    const descriptorPath = path.join(collectionDir, "collection.json");
    const descriptorRelPath = toPosixPath(path.relative(rootPath, descriptorPath));

    let validation: CollectionSchemaValidation;
    if (await exists(descriptorPath)) {
      const descriptor = await readCollectionJson(descriptorPath);
      if (!descriptor) {
        validation = {
          ok: false,
          issues: [
            issue(
              "error",
              "COLLECTION_JSON_PARSE_FAILED",
              "Failed to parse collection.json",
              descriptorRelPath,
            ),
          ],
        };
      } else {
        validation = validateCollectionSchema(descriptor, descriptorRelPath);
      }
    } else {
      validation = {
        ok: false,
        issues: [
          issue(
            "error",
            "COLLECTION_DESCRIPTOR_MISSING",
            "Collection must provide collection.json",
            toPosixPath(path.relative(rootPath, collectionDir)),
          ),
        ],
      };
    }

    issues.push(...validation.issues);

    if (!validation.ok || !validation.collection) {
      continue;
    }

    collections.push({
      ...validation.collection,
      sourcePath: validation.collection.sourcePath
        ? toPosixPath(validation.collection.sourcePath)
        : descriptorRelPath,
    });
  }

  const byId = new Map<string, Collection>();
  for (const collection of collections) {
    if (byId.has(collection.id)) {
      issues.push(
        issue(
          "error",
          "COLLECTION_ID_DUPLICATE",
          `Duplicate collection id '${collection.id}'`,
          collection.sourcePath,
        ),
      );
      continue;
    }
    byId.set(collection.id, collection);
  }

  for (const collection of byId.values()) {
    for (const ref of collection.collections) {
      if (!byId.has(ref)) {
        issues.push(
          issue(
            strictCollections ? "error" : "warning",
            "COLLECTION_REFERENCE_MISSING",
            `Collection '${collection.id}' references missing collection '${ref}'`,
            collection.sourcePath,
          ),
        );
      }
    }
  }

  return {
    collections: [...byId.values()].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    issues,
  };
}

export function buildPluginsCollection(collections: Collection[]): Collection {
  const contributors = collections.filter((collection) => collection.id !== "plugins");

  const packRoots = [...new Set(contributors.flatMap((item) => item.packRoots))].sort(
    (left, right) => left.localeCompare(right),
  );
  const refs = contributors
    .map((collection) => collection.id)
    .sort((left, right) => left.localeCompare(right));

  return {
    id: "plugins",
    name: "Plugins",
    maturity: DEFAULT_COLLECTION_MATURITY,
    tags: ["meta", "plugin", "default"],
    intendedStacks: [...DEFAULT_COLLECTION_STACKS],
    packRoots,
    collections: refs,
    sourcePath: "generated:plugins",
  };
}

async function loadItems(rootPath: string, layout: "canonical" | "workspace") {
  const layoutPaths = getLayoutPaths(layout);

  const items: Item[] = [];
  const issues: Issue[] = [];

  const fileTypes: Array<[string, ItemType]> = [
    [layoutPaths.agentsPattern, "agent"],
    [layoutPaths.promptsPattern, "prompt"],
    [layoutPaths.instructionsPattern, "instruction"],
  ];

  for (const [pattern, type] of fileTypes) {
    const files = await fg(pattern, {
      cwd: rootPath,
      absolute: true,
      dot: true,
    });

    for (const filePath of files.sort((left, right) => left.localeCompare(right))) {
      const relativePath = toPosixPath(path.relative(rootPath, filePath));
      const fallbackName = path.basename(filePath);

      try {
        const raw = await readText(filePath);
        const name = parseName(raw, fallbackName);
        const frontmatter = parseFrontmatter(raw).frontmatter;
        items.push({
          type,
          sourcePath: relativePath,
          name,
          frontmatter,
        });
      } catch {
        issues.push(
          issue(
            "warning",
            "ITEM_READ_FAILED",
            `Unable to parse '${relativePath}' while loading registry graph`,
            relativePath,
          ),
        );
      }
    }
  }

  const copilotInstructionsPath = path.join(rootPath, layoutPaths.copilotInstructionsPath);
  if (await exists(copilotInstructionsPath)) {
    items.push({
      type: "copilotInstructions",
      sourcePath: layoutPaths.copilotInstructionsPath,
      name: "copilot-instructions",
    });
  }

  return { items, issues, layoutPaths };
}

async function loadSkills(
  rootPath: string,
  skillsPattern: string,
): Promise<{ skills: Skill[]; issues: Issue[] }> {
  const issues: Issue[] = [];
  const files = await fg(skillsPattern, {
    cwd: rootPath,
    absolute: true,
    dot: true,
  });

  const skills: Skill[] = [];
  for (const filePath of files.sort((left, right) => left.localeCompare(right))) {
    const skillRoot = path.dirname(filePath);
    const relativeSkillPath = toPosixPath(path.relative(rootPath, filePath));
    const relativeRootPath = toPosixPath(path.relative(rootPath, skillRoot));
    const name = path.basename(skillRoot);

    const assets = await fg("**/*", {
      cwd: skillRoot,
      onlyFiles: true,
      absolute: true,
      dot: true,
    });

    const assetPaths = assets
      .map((item) => toPosixPath(path.relative(rootPath, item)))
      .filter((item) => item !== relativeSkillPath)
      .sort((left, right) => left.localeCompare(right));

    skills.push({
      name,
      rootPath: relativeRootPath,
      skillPath: relativeSkillPath,
      assetPaths,
    });
  }

  return { skills, issues };
}

export async function loadRegistryGraph(
  rootPath: string,
  options: RegistryGraphOptions = {},
): Promise<RegistryGraph> {
  const layout = options.layout ?? "canonical";
  const includePluginsCollection = options.includePluginsCollection ?? true;
  const strictCollections = options.strictCollections ?? false;

  const itemResult = await loadItems(rootPath, layout);
  const skillResult = await loadSkills(rootPath, itemResult.layoutPaths.skillsPattern);

  const issues: Issue[] = [...itemResult.issues, ...skillResult.issues];
  let collections: Collection[] = [];

  if (layout === "canonical") {
    const collectionResult = await loadCollections(rootPath, strictCollections);
    collections = collectionResult.collections;
    issues.push(...collectionResult.issues);
  }

  const existingPlugins = collections.find((entry) => entry.id === "plugins");
  if (existingPlugins) {
    issues.push(
      issue(
        "info",
        "COLLECTION_PLUGINS_OVERRIDDEN",
        "Plugins collection is generated from curated collections",
        existingPlugins.sourcePath,
      ),
    );
  }

  const curatedCollections = collections.filter((entry) => entry.id !== "plugins");
  const plugins = includePluginsCollection
    ? buildPluginsCollection(curatedCollections)
    : {
      id: "plugins",
      name: "Plugins",
      maturity: DEFAULT_COLLECTION_MATURITY,
      tags: ["meta", "plugin", "default"],
      intendedStacks: [...DEFAULT_COLLECTION_STACKS],
      packRoots: [],
      collections: [],
      sourcePath: "generated:plugins",
    };

  return normalizeGraph({
    rootPath: toPosixPath(rootPath),
    items: itemResult.items,
    skills: skillResult.skills,
    collections: curatedCollections,
    plugins,
    issues,
  });
}
