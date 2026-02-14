import { promises as fs } from "node:fs";
import path from "node:path";
import { buildCleanZip } from "../packman-core/dist/build.js";

const root = process.cwd();
const packsRoot = path.join(root, "Packs");
const collectionsRoot = path.join(packsRoot, "collections");
const buildRoot = path.join(root, "build");
const buildCollectionsRoot = path.join(buildRoot, "collections");
const buildDocsRoot = path.join(buildRoot, "docs");
const stagingRoot = path.join(buildRoot, "staging");

const mirrorRoots = new Set(["INSTRUCTIONS AND RULES", "PROMPT FILES"]);

const AGENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.agent\.md$/;
const PROMPT_RE = /^[a-z0-9]+(?:(?:-|:)[a-z0-9]+)*\.prompt\.md$/;
const INSTRUCTION_RE =
  /^(?:[0-9]{2}-)?[a-z0-9]+(?:-[a-z0-9]+)*\.instructions\.md$/;

function rel(inputPath) {
  return inputPath.split(path.sep).join("/");
}

async function exists(targetPath) {
  return fs
    .stat(targetPath)
    .then(() => true)
    .catch(() => false);
}

async function readFileSafe(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

async function walkFiles(startPath) {
  const out = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      const absolutePath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (entry.isFile()) {
        if (entry.name === ".DS_Store") continue;
        out.push(absolutePath);
      }
    }
  }

  await walk(startPath);
  return out;
}

function classifyType(relativePath) {
  if (relativePath.endsWith(".agent.md")) return "agent";
  if (relativePath.endsWith(".prompt.md")) return "prompt";
  if (relativePath.endsWith(".instructions.md")) return "instruction";
  if (relativePath.endsWith("/SKILL.md")) return "skill";
  if (relativePath === ".github/copilot-instructions.md") return "instruction";
  if (relativePath.startsWith(".github/hooks/") && relativePath.endsWith(".json")) {
    return "hook";
  }
  if (relativePath === ".vscode/settings.json") return "settings";
  if (relativePath === "AGENTS.md" || relativePath === "CLAUDE.md") {
    return "instruction";
  }
  return "other";
}

function hasFrontmatter(content) {
  return /^---\n[\s\S]*?\n---(\n|$)/.test(content);
}

function inferProblems(artifact) {
  const problems = [];
  const fileName = path.posix.basename(artifact.relativePath);

  if (artifact.type === "agent") {
    if (!artifact.relativePath.startsWith(".github/agents/")) {
      problems.push("wrong-location");
    }
    if (!AGENT_RE.test(fileName)) {
      problems.push("inconsistent-naming");
    }
  }

  if (artifact.type === "prompt") {
    if (!artifact.relativePath.startsWith(".github/prompts/")) {
      problems.push("wrong-location");
    }
    if (!PROMPT_RE.test(fileName)) {
      problems.push("inconsistent-naming");
    }
  }

  if (artifact.type === "instruction") {
    const isScopedInstruction = artifact.relativePath.endsWith(".instructions.md");
    if (
      isScopedInstruction &&
      !artifact.relativePath.startsWith(".github/instructions/")
    ) {
      problems.push("wrong-location");
    }
    if (isScopedInstruction && !INSTRUCTION_RE.test(fileName)) {
      problems.push("inconsistent-naming");
    }
  }

  if (artifact.type === "skill") {
    if (!artifact.relativePath.startsWith(".github/skills/")) {
      problems.push("wrong-location");
    }
  }

  if (
    ["agent", "prompt", "instruction"].includes(artifact.type) &&
    !artifact.hasFrontmatter
  ) {
    problems.push("missing-frontmatter");
  }

  if (artifact.packRoot.includes("/PROMPT FILES/") || artifact.packRoot.includes("/INSTRUCTIONS AND RULES/")) {
    problems.push("mirror-duplicate-root");
  }

  return problems;
}

async function getCanonicalPackRoots() {
  const entries = await fs.readdir(packsRoot, { withFileTypes: true });
  const roots = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (mirrorRoots.has(entry.name)) continue;
    if (entry.name === "collections" || entry.name === "docs") continue;
    if (!entry.name.endsWith("-pack")) continue;
    roots.push(rel(path.join("Packs", entry.name)));
  }

  return roots.sort((left, right) => left.localeCompare(right));
}

async function getMirrorPackRoots() {
  const roots = [];
  for (const mirrorName of mirrorRoots) {
    const mirrorPath = path.join(packsRoot, mirrorName);
    if (!(await exists(mirrorPath))) continue;
    const entries = await fs.readdir(mirrorPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      roots.push(rel(path.join("Packs", mirrorName, entry.name)));
    }
  }
  return roots.sort((left, right) => left.localeCompare(right));
}

function toWorkspaceTarget(relativePath) {
  if (relativePath.startsWith(".github/")) return relativePath;
  return null;
}

function toProfileTarget(relativePath) {
  if (relativePath.startsWith(".github/agents/")) {
    return `agents/${relativePath.slice(".github/agents/".length)}`;
  }
  if (relativePath.startsWith(".github/prompts/")) {
    return `prompts/${relativePath.slice(".github/prompts/".length)}`;
  }
  if (relativePath.startsWith(".github/instructions/")) {
    return `instructions/${relativePath.slice(".github/instructions/".length)}`;
  }
  if (relativePath === ".github/copilot-instructions.md") {
    return "instructions/copilot-instructions.md";
  }
  if (relativePath.startsWith(".github/skills/")) {
    return `skills/${relativePath.slice(".github/skills/".length)}`;
  }
  if (relativePath.startsWith(".github/hooks/") && relativePath.endsWith(".json")) {
    return `hooks/${path.posix.basename(relativePath)}`;
  }
  return null;
}

function preferredSource(existingSource, incomingSource, targetPath) {
  const existingBase = path.posix.basename(existingSource.packRoot);
  const incomingBase = path.posix.basename(incomingSource.packRoot);

  if (targetPath.endsWith("suite/suite:route.prompt.md")) {
    const existingScore = existingBase.includes("suite-harmoniser") ? 1 : 0;
    const incomingScore = incomingBase.includes("suite-harmoniser") ? 1 : 0;
    if (incomingScore > existingScore) return incomingSource;
    if (existingScore > incomingScore) return existingSource;
  }

  if (incomingSource.packRoot.localeCompare(existingSource.packRoot) < 0) {
    return incomingSource;
  }

  return existingSource;
}

async function stageExport({
  exportId,
  mode,
  sources,
  includeSettingsSnippet,
  installBody,
  settingsSnippetContent,
}) {
  const stageDir = path.join(stagingRoot, exportId);
  await fs.rm(stageDir, { recursive: true, force: true });
  await fs.mkdir(stageDir, { recursive: true });

  const selectedByTarget = new Map();
  const collisions = [];

  for (const source of sources) {
    const target = mode === "workspace"
      ? toWorkspaceTarget(source.relativePath)
      : toProfileTarget(source.relativePath);
    if (!target) continue;

    const existing = selectedByTarget.get(target);
    if (!existing) {
      selectedByTarget.set(target, source);
      continue;
    }

    const preferred = preferredSource(existing, source, target);
    const rejected = preferred === existing ? source : existing;
    selectedByTarget.set(target, preferred);
    collisions.push({
      target,
      keptFrom: preferred.packRoot,
      droppedFrom: rejected.packRoot,
    });
  }

  for (const [targetPath, source] of selectedByTarget.entries()) {
    const destination = path.join(stageDir, targetPath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(path.join(root, source.path), destination);
  }

  await fs.writeFile(path.join(stageDir, "INSTALL.md"), installBody.trim() + "\n", "utf8");
  if (includeSettingsSnippet) {
    await fs.writeFile(
      path.join(stageDir, "settings.snippet.json"),
      settingsSnippetContent,
      "utf8",
    );
  }

  return {
    stageDir,
    selectedCount: selectedByTarget.size,
    collisions,
    targetPaths: [...selectedByTarget.keys()].sort((left, right) =>
      left.localeCompare(right),
    ),
  };
}

function renderWorkspaceInstallDoc(exportLabel) {
  return `# INSTALL\n\n## ${exportLabel} (workspace)\n\n1. Unzip this archive into your repository root.\n2. Merge the included .github/ content into your repository .github/.\n3. Validate with:\n   - pnpm --filter packman-cli exec node dist/index.js validate ./Packs --strict\n\nThis export targets VS Code default discovery paths under .github/.`;
}

function renderProfileInstallDoc(exportLabel) {
  return `# INSTALL\n\n## ${exportLabel} (profile/global)\n\n1. Unzip this archive into a reusable profile folder (for example <path-to-your-copilot-assets>).\n2. Point VS Code settings to these folders using settings.snippet.json.\n3. Required keys:\n   - chat.agentFilesLocations\n   - chat.promptFilesLocations\n   - chat.instructionsFilesLocations\n\nThis export is OS-agnostic and uses placeholder paths only.`;
}

function renderSettingsSnippet() {
  return `${JSON.stringify(
    {
      "chat.agentFilesLocations": ["<path-to-your-copilot-assets>/agents"],
      "chat.promptFilesLocations": ["<path-to-your-copilot-assets>/prompts"],
      "chat.instructionsFilesLocations": [
        "<path-to-your-copilot-assets>/instructions",
      ],
    },
    null,
    2,
  )}\n`;
}

function collectionDisplayName(collectionId) {
  return collectionId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function readCollectionPackList(collectionDir) {
  const packsFile = path.join(collectionDir, "packs.txt");
  const content = await readFileSafe(packsFile);
  return content
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

async function loadCollectionDefinitions(canonicalPacks) {
  const out = [];
  const entries = await fs.readdir(collectionsRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "plugins") continue;
    const collectionDir = path.join(collectionsRoot, entry.name);
    const packs = await readCollectionPackList(collectionDir);
    if (packs.length === 0) continue;
    out.push({
      id: entry.name,
      name: collectionDisplayName(entry.name),
      maturity: "stable",
      tags: ["curated", "plugin"],
      intendedStacks: ["github-copilot", "vscode"],
      packRoots: packs,
      source: rel(path.relative(root, collectionDir)),
    });
  }

  const curatedCollectionIds = out.map((item) => item.id).sort((a, b) =>
    a.localeCompare(b),
  );
  const pluginsPacks = [
    ...new Set(
      out
        .flatMap((item) => item.packRoots)
        .filter((packRoot) => canonicalPacks.includes(packRoot)),
    ),
  ].sort((left, right) => left.localeCompare(right));

  out.push({
    id: "plugins",
    name: "Plugins",
    maturity: "stable",
    tags: ["meta", "plugin", "default"],
    intendedStacks: ["github-copilot", "vscode"],
    packRoots: pluginsPacks,
    collectionRefs: curatedCollectionIds,
    source: "generated",
  });

  return out.sort((left, right) => left.id.localeCompare(right.id));
}

function referencesForCollection(allSources, packRoots) {
  const packSet = new Set(packRoots);
  const refs = allSources.filter((source) => packSet.has(source.packRoot));
  const byType = {
    agents: refs
      .filter((item) => item.type === "agent")
      .map((item) => item.path)
      .sort((left, right) => left.localeCompare(right)),
    prompts: refs
      .filter((item) => item.type === "prompt")
      .map((item) => item.path)
      .sort((left, right) => left.localeCompare(right)),
    instructions: refs
      .filter((item) => item.type === "instruction")
      .map((item) => item.path)
      .sort((left, right) => left.localeCompare(right)),
    skills: refs
      .filter((item) => item.type === "skill")
      .map((item) => item.path)
      .sort((left, right) => left.localeCompare(right)),
  };
  return byType;
}

async function writeCollectionDescriptors(collections, sources) {
  for (const collection of collections) {
    const references = referencesForCollection(sources, collection.packRoots);
    const descriptor = {
      id: collection.id,
      name: collection.name,
      maturity: collection.maturity,
      tags: collection.tags,
      intendedStacks: collection.intendedStacks,
      packRoots: collection.packRoots,
      references,
    };
    if (collection.collectionRefs) {
      descriptor.collections = collection.collectionRefs;
    }

    const collectionDir = path.join(collectionsRoot, collection.id);
    await fs.mkdir(collectionDir, { recursive: true });
    const descriptorPath = path.join(collectionDir, "collection.json");
    await fs.writeFile(descriptorPath, `${JSON.stringify(descriptor, null, 2)}\n`, "utf8");
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes("\n") || text.includes('"')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

async function main() {
  if (!(await exists(packsRoot))) {
    throw new Error("Packs/ directory not found");
  }

  await fs.mkdir(buildRoot, { recursive: true });
  await fs.mkdir(buildCollectionsRoot, { recursive: true });
  await fs.mkdir(buildDocsRoot, { recursive: true });
  await fs.mkdir(stagingRoot, { recursive: true });

  const canonicalPackRoots = await getCanonicalPackRoots();
  const mirrorPackRoots = await getMirrorPackRoots();
  const allPackRoots = [...canonicalPackRoots, ...mirrorPackRoots];

  const artifacts = [];
  for (const packRoot of allPackRoots) {
    const absolutePackRoot = path.join(root, packRoot);
    if (!(await exists(absolutePackRoot))) continue;
    const files = await walkFiles(absolutePackRoot);
    for (const filePath of files) {
      const relativePath = rel(path.relative(absolutePackRoot, filePath));
      const type = classifyType(relativePath);
      if (type === "other") {
        artifacts.push({
          packRoot,
          path: rel(path.relative(root, filePath)),
          relativePath,
          type,
          hasFrontmatter: false,
          problems: [],
        });
        continue;
      }

      const content = await readFileSafe(filePath);
      const artifact = {
        packRoot,
        path: rel(path.relative(root, filePath)),
        relativePath,
        type,
        hasFrontmatter: hasFrontmatter(content),
      };
      artifacts.push({
        ...artifact,
        problems: inferProblems(artifact),
      });
    }
  }

  const canonicalArtifacts = artifacts.filter((item) =>
    canonicalPackRoots.includes(item.packRoot),
  );

  const duplicatesByWorkspaceTarget = new Map();
  for (const artifact of canonicalArtifacts) {
    const target = toWorkspaceTarget(artifact.relativePath);
    if (!target) continue;
    const existing = duplicatesByWorkspaceTarget.get(target) ?? [];
    existing.push(artifact.path);
    duplicatesByWorkspaceTarget.set(target, existing);
  }

  for (const [target, sources] of duplicatesByWorkspaceTarget.entries()) {
    if (sources.length <= 1) continue;
    for (const artifact of artifacts) {
      if (sources.includes(artifact.path)) {
        artifact.problems = [...new Set([...artifact.problems, "duplicate-target-path"])];
      }
    }
  }

  const inventoryRows = artifacts
    .map((item) => ({
      path: item.path,
      detectedType: item.type,
      problems: item.problems,
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  const migrationRows = [];
  for (const row of inventoryRows) {
    if (row.path.includes("/PROMPT FILES/") || row.path.includes("/INSTRUCTIONS AND RULES/")) {
      const canonicalCandidate = row.path
        .replace("Packs/PROMPT FILES/", "Packs/")
        .replace("Packs/INSTRUCTIONS AND RULES/", "Packs/");
      migrationRows.push({
        oldPath: row.path,
        newPath: canonicalCandidate,
        action: "deprecate-reference",
        notes: "Mirror root content is non-canonical; keep canonical source under Packs/*-pack",
      });
      continue;
    }

    const hasIssue = row.problems.length > 0;
    migrationRows.push({
      oldPath: row.path,
      newPath: row.path,
      action: hasIssue ? "review" : "keep",
      notes: hasIssue ? row.problems.join(";") : "canonical-no-change",
    });
  }

  const collections = await loadCollectionDefinitions(canonicalPackRoots);
  await writeCollectionDescriptors(collections, canonicalArtifacts);

  const settingsSnippet = renderSettingsSnippet();
  const settingsSnippetPath = path.join(buildDocsRoot, "settings.snippet.json");
  await fs.writeFile(settingsSnippetPath, settingsSnippet, "utf8");

  const canonicalExportSources = canonicalArtifacts.filter((item) =>
    ["agent", "prompt", "instruction", "skill", "hook"].includes(item.type),
  );

  const exportBuildResults = [];

  const workspacePack = await stageExport({
    exportId: "workspace-pack",
    mode: "workspace",
    sources: canonicalExportSources,
    includeSettingsSnippet: false,
    installBody: renderWorkspaceInstallDoc("Workspace Pack"),
    settingsSnippetContent: settingsSnippet,
  });
  const workspacePackZip = path.join(buildRoot, "workspace-pack.zip");
  await buildCleanZip(workspacePack.stageDir, workspacePackZip);
  exportBuildResults.push({
    id: "workspace-pack",
    mode: "workspace",
    zipPath: rel(path.relative(root, workspacePackZip)),
    ...workspacePack,
  });

  const profilePack = await stageExport({
    exportId: "profile-pack",
    mode: "profile",
    sources: canonicalExportSources,
    includeSettingsSnippet: true,
    installBody: renderProfileInstallDoc("Profile Pack"),
    settingsSnippetContent: settingsSnippet,
  });
  const profilePackZip = path.join(buildRoot, "profile-pack.zip");
  await buildCleanZip(profilePack.stageDir, profilePackZip);
  exportBuildResults.push({
    id: "profile-pack",
    mode: "profile",
    zipPath: rel(path.relative(root, profilePackZip)),
    ...profilePack,
  });

  for (const collection of collections) {
    const packSet = new Set(collection.packRoots);
    const collectionSources = canonicalExportSources.filter((item) =>
      packSet.has(item.packRoot),
    );

    const workspaceExportId = `collection-${collection.id}-workspace`;
    const profileExportId = `collection-${collection.id}-profile`;

    const collectionWorkspace = await stageExport({
      exportId: workspaceExportId,
      mode: "workspace",
      sources: collectionSources,
      includeSettingsSnippet: false,
      installBody: renderWorkspaceInstallDoc(`Collection ${collection.name}`),
      settingsSnippetContent: settingsSnippet,
    });
    const collectionWorkspaceZip = path.join(
      buildCollectionsRoot,
      `${workspaceExportId}.zip`,
    );
    await buildCleanZip(collectionWorkspace.stageDir, collectionWorkspaceZip);
    exportBuildResults.push({
      id: workspaceExportId,
      mode: "workspace",
      zipPath: rel(path.relative(root, collectionWorkspaceZip)),
      ...collectionWorkspace,
    });

    const collectionProfile = await stageExport({
      exportId: profileExportId,
      mode: "profile",
      sources: collectionSources,
      includeSettingsSnippet: true,
      installBody: renderProfileInstallDoc(`Collection ${collection.name}`),
      settingsSnippetContent: settingsSnippet,
    });
    const collectionProfileZip = path.join(
      buildCollectionsRoot,
      `${profileExportId}.zip`,
    );
    await buildCleanZip(collectionProfile.stageDir, collectionProfileZip);
    exportBuildResults.push({
      id: profileExportId,
      mode: "profile",
      zipPath: rel(path.relative(root, collectionProfileZip)),
      ...collectionProfile,
    });
  }

  const gate1BrokenRefs = [];
  for (const collection of collections) {
    for (const packRoot of collection.packRoots) {
      if (!(await exists(path.join(root, packRoot)))) {
        gate1BrokenRefs.push(`missing pack root: ${collection.id} -> ${packRoot}`);
      }
    }

    if (collection.collectionRefs) {
      for (const collectionId of collection.collectionRefs) {
        if (!collections.some((item) => item.id === collectionId)) {
          gate1BrokenRefs.push(
            `missing collection reference: ${collection.id} -> ${collectionId}`,
          );
        }
      }
    }
  }

  const gate2Collisions = [];
  for (const exportInfo of exportBuildResults) {
    const dupes = new Map();
    for (const targetPath of exportInfo.targetPaths) {
      const seen = dupes.get(targetPath) ?? 0;
      dupes.set(targetPath, seen + 1);
    }
    for (const [targetPath, count] of dupes.entries()) {
      if (count > 1) {
        gate2Collisions.push(`${exportInfo.id}: duplicate target path ${targetPath}`);
      }
    }
  }

  const gate3SkillMissing = [];
  for (const packRoot of canonicalPackRoots) {
    const absolutePackRoot = path.join(root, packRoot);
    const skillsRoot = path.join(absolutePackRoot, ".github", "skills");
    if (!(await exists(skillsRoot))) continue;
    const skillEntries = await fs.readdir(skillsRoot, { withFileTypes: true });
    for (const entry of skillEntries) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(skillsRoot, entry.name, "SKILL.md");
      if (!(await exists(skillPath))) {
        gate3SkillMissing.push(rel(path.relative(root, skillPath)));
      }
    }
  }

  const gate4WorkspaceMisalignments = [];
  for (const exportInfo of exportBuildResults.filter((item) => item.mode === "workspace")) {
    for (const targetPath of exportInfo.targetPaths) {
      if (
        !targetPath.startsWith(".github/agents/") &&
        !targetPath.startsWith(".github/prompts/") &&
        !targetPath.startsWith(".github/instructions/") &&
        !targetPath.startsWith(".github/skills/") &&
        !targetPath.startsWith(".github/hooks/") &&
        targetPath !== ".github/copilot-instructions.md"
      ) {
        gate4WorkspaceMisalignments.push(
          `${exportInfo.id}: non-default workspace discovery path ${targetPath}`,
        );
      }
    }
  }

  const gate5InstallDocs = [];
  for (const exportInfo of exportBuildResults) {
    const installPath = path.join(exportInfo.stageDir, "INSTALL.md");
    if (!(await exists(installPath))) {
      gate5InstallDocs.push(`${exportInfo.id}: missing INSTALL.md`);
    }
    if (exportInfo.mode === "profile") {
      const snippetPath = path.join(exportInfo.stageDir, "settings.snippet.json");
      if (!(await exists(snippetPath))) {
        gate5InstallDocs.push(`${exportInfo.id}: missing settings.snippet.json`);
      }
    }
  }

  const validation = {
    gate1: {
      name: "All referenced items exist; no broken collection links",
      pass: gate1BrokenRefs.length === 0,
      details: gate1BrokenRefs,
    },
    gate2: {
      name: "No duplicate target paths within an export",
      pass: gate2Collisions.length === 0,
      details: gate2Collisions,
    },
    gate3: {
      name: "Each skill has SKILL.md",
      pass: gate3SkillMissing.length === 0,
      details: gate3SkillMissing,
    },
    gate4: {
      name: "Workspace export aligns with VS Code defaults under .github",
      pass: gate4WorkspaceMisalignments.length === 0,
      details: gate4WorkspaceMisalignments,
    },
    gate5: {
      name: "Each export has INSTALL.md and profile exports include settings snippet",
      pass: gate5InstallDocs.length === 0,
      details: gate5InstallDocs,
    },
  };

  const reorgPlanLines = [];
  reorgPlanLines.push("# REORG_PLAN");
  reorgPlanLines.push("");
  reorgPlanLines.push(`Generated: ${new Date().toISOString()}`);
  reorgPlanLines.push("");
  reorgPlanLines.push("## Canonical taxonomy");
  reorgPlanLines.push("");
  reorgPlanLines.push("- Canonical roots: `Packs/*-pack`");
  reorgPlanLines.push("- Mirror roots treated as non-canonical references: `Packs/PROMPT FILES`, `Packs/INSTRUCTIONS AND RULES`");
  reorgPlanLines.push("- Naming normalization: keep lowercase slug conventions for compatibility");
  reorgPlanLines.push("- Collections are curation descriptors (references only), including minimal `plugins` meta-collection");
  reorgPlanLines.push("");
  reorgPlanLines.push("## Redistribution policy");
  reorgPlanLines.push("");
  reorgPlanLines.push("- Agent files contain persona, protocol, and handoff behavior");
  reorgPlanLines.push("- Prompt files contain repeatable procedural runbooks");
  reorgPlanLines.push("- Instructions contain stable standards and constraints");
  reorgPlanLines.push("- Skills contain deep reusable checklists, rubrics, and how-to capability");
  reorgPlanLines.push("");
  reorgPlanLines.push("## Step 0 inventory");
  reorgPlanLines.push("");
  reorgPlanLines.push("| path | detected type | problems |");
  reorgPlanLines.push("|---|---|---|");
  for (const row of inventoryRows) {
    const problems = row.problems.length > 0 ? row.problems.join(", ") : "-";
    reorgPlanLines.push(`| ${row.path} | ${row.detectedType} | ${problems} |`);
  }
  reorgPlanLines.push("");
  reorgPlanLines.push("## Planned moves and normalisation");
  reorgPlanLines.push("");
  reorgPlanLines.push("- Keep canonical files in-place under `Packs/*-pack`");
  reorgPlanLines.push("- Mark mirror-root files as deprecated references in migration map");
  reorgPlanLines.push("- Resolve duplicate suite route prompt by deterministic export precedence (`suite-harmoniser` wins)");
  reorgPlanLines.push("- Generate collection descriptors (`collection.json`) and export artifacts under `build/`");

  await fs.writeFile(
    path.join(root, "REORG_PLAN.md"),
    `${reorgPlanLines.join("\n")}\n`,
    "utf8",
  );

  const migrationCsv = [
    "old_path,new_path,action,notes",
    ...migrationRows.map((row) =>
      [
        csvEscape(row.oldPath),
        csvEscape(row.newPath),
        csvEscape(row.action),
        csvEscape(row.notes),
      ].join(","),
    ),
  ].join("\n");
  await fs.writeFile(path.join(root, "MIGRATION_MAP.csv"), `${migrationCsv}\n`, "utf8");

  const validationLines = [];
  validationLines.push("# VALIDATION_REPORT");
  validationLines.push("");
  validationLines.push(`Generated: ${new Date().toISOString()}`);
  validationLines.push("");
  for (const [gateId, gate] of Object.entries(validation)) {
    validationLines.push(`## ${gateId.toUpperCase()} — ${gate.name}`);
    validationLines.push("");
    validationLines.push(`- status: ${gate.pass ? "PASS" : "FAIL"}`);
    if (gate.details.length === 0) {
      validationLines.push("- details: none");
    } else {
      validationLines.push("- details:");
      for (const item of gate.details) {
        validationLines.push(`  - ${item}`);
      }
    }
    validationLines.push("");
  }
  const resolvedCollisions = exportBuildResults
    .filter((item) => item.collisions.length > 0)
    .flatMap((item) =>
      item.collisions.map(
        (collision) =>
          `${item.id}: ${collision.target} (kept ${collision.keptFrom}, dropped ${collision.droppedFrom})`,
      ),
    );

  validationLines.push("## Resolved collision decisions");
  validationLines.push("");
  if (resolvedCollisions.length === 0) {
    validationLines.push("- none");
  } else {
    for (const item of resolvedCollisions) {
      validationLines.push(`- ${item}`);
    }
  }
  validationLines.push("");

  validationLines.push("## Export outputs");
  validationLines.push("");
  for (const exportInfo of exportBuildResults) {
    validationLines.push(`- ${exportInfo.id}: ${exportInfo.zipPath}`);
  }

  await fs.writeFile(
    path.join(root, "VALIDATION_REPORT.md"),
    `${validationLines.join("\n")}\n`,
    "utf8",
  );

  await fs.rm(stagingRoot, { recursive: true, force: true });

  console.log("Reorg/export implementation complete:");
  console.log("- REORG_PLAN.md");
  console.log("- MIGRATION_MAP.csv");
  console.log("- VALIDATION_REPORT.md");
  console.log(`- exports: ${exportBuildResults.length}`);
  console.log(`- build/workspace-pack.zip`);
  console.log(`- build/profile-pack.zip`);
  console.log(`- build/collections/*.zip`);
  console.log(`- build/docs/settings.snippet.json`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
