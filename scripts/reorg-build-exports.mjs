import { promises as fs } from "node:fs";
import path from "node:path";
import {
  analyzeRepo,
  applyMigration,
  buildCleanZip,
  buildCollection,
  buildProfile,
  buildWorkspace,
  evaluateValidationGates,
  loadRegistryGraph,
  planMigration,
  renderValidationReport,
} from "../packman-core/dist/index.js";

function toPosix(inputPath) {
  return inputPath.split(path.sep).join("/");
}

function installDoc(targetLabel, mode) {
  if (mode === "workspace") {
    return `# INSTALL\n\n## ${targetLabel} (workspace)\n\n1. Unzip this archive into your repository root.\n2. Merge the included .github/ content into your repository .github/.\n3. Run validation: pnpm --filter packman-cli exec node dist/index.js validate . --strict\n`;
  }

  return `# INSTALL\n\n## ${targetLabel} (profile/global)\n\n1. Unzip this archive into a reusable profile folder.\n2. Point VS Code settings to the agents/prompts/instructions folders from this archive.\n`;
}

function settingsSnippet() {
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

function projectWorkspaceGraph(graph) {
  const sourcePathMap = new Map();

  const remapPath = (sourcePath) => {
    if (sourcePath === ".github/copilot-instructions.md") {
      sourcePathMap.set("instructions/copilot-instructions.md", sourcePath);
      return "instructions/copilot-instructions.md";
    }

    const mappings = [
      [".github/agents/", "agents/"],
      [".github/prompts/", "prompts/"],
      [".github/instructions/", "instructions/"],
      [".github/skills/", "skills/"],
    ];

    for (const [workspacePrefix, canonicalPrefix] of mappings) {
      if (sourcePath.startsWith(workspacePrefix)) {
        const projected = `${canonicalPrefix}${sourcePath.slice(workspacePrefix.length)}`;
        sourcePathMap.set(projected, sourcePath);
        return projected;
      }
    }

    sourcePathMap.set(sourcePath, sourcePath);
    return sourcePath;
  };

  const projected = {
    ...graph,
    items: graph.items.map((item) => ({
      ...item,
      sourcePath: remapPath(item.sourcePath),
    })),
    skills: graph.skills.map((skill) => ({
      ...skill,
      rootPath: remapPath(skill.rootPath),
      skillPath: remapPath(skill.skillPath),
      assetPaths: skill.assetPaths.map((assetPath) => remapPath(assetPath)),
    })),
  };

  return {
    graph: projected,
    resolveSourcePath(canonicalPath) {
      return sourcePathMap.get(canonicalPath) ?? canonicalPath;
    },
  };
}

async function materializeZip({
  sourceRoot,
  stageRoot,
  zipPath,
  manifest,
  label,
  includeSettings,
  resolveSourcePath,
}) {
  await fs.rm(stageRoot, { recursive: true, force: true });
  await fs.mkdir(stageRoot, { recursive: true });

  for (const entry of manifest.entries) {
    const mappedSourcePath = resolveSourcePath(entry.sourcePath);
    const sourcePath = path.join(sourceRoot, mappedSourcePath);
    const targetPath = path.join(stageRoot, entry.targetPath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.copyFile(sourcePath, targetPath);
  }

  await fs.writeFile(
    path.join(stageRoot, "INSTALL.md"),
    installDoc(label, manifest.target),
    "utf8",
  );

  if (includeSettings) {
    await fs.writeFile(
      path.join(stageRoot, "settings.snippet.json"),
      settingsSnippet(),
      "utf8",
    );
  }

  await buildCleanZip(stageRoot, zipPath);
}

async function main() {
  const root = process.cwd();
  const sourceArg = process.argv[2] ?? ".";
  const sourceRoot = path.resolve(root, sourceArg);

  const buildRoot = path.join(root, "build");
  const collectionsBuildRoot = path.join(buildRoot, "collections");
  const docsBuildRoot = path.join(buildRoot, "docs");
  const stagingRoot = path.join(buildRoot, "staging");

  await fs.mkdir(buildRoot, { recursive: true });
  await fs.mkdir(collectionsBuildRoot, { recursive: true });
  await fs.mkdir(docsBuildRoot, { recursive: true });
  await fs.mkdir(stagingRoot, { recursive: true });

  const findings = await analyzeRepo(sourceRoot);
  const migrationPlan = planMigration(findings);
  await applyMigration(migrationPlan, {
    rootPath: root,
    dryRun: false,
    backup: false,
  });

  const workspaceGraph = await loadRegistryGraph(sourceRoot, {
    layout: "workspace",
    strictCollections: false,
  });
  const projected = projectWorkspaceGraph(workspaceGraph);
  const graph = projected.graph;

  const workspaceManifest = buildWorkspace(graph);
  const profileManifest = buildProfile(graph);
  const collectionIds = [
    ...graph.collections.map((entry) => entry.id),
    graph.plugins.id,
  ];
  const collectionManifests = collectionIds.flatMap((collectionId) => [
    buildCollection(graph, collectionId, "workspace"),
    buildCollection(graph, collectionId, "profile"),
  ]);

  await materializeZip({
    sourceRoot,
    stageRoot: path.join(stagingRoot, "workspace-pack"),
    zipPath: path.join(buildRoot, "workspace-pack.zip"),
    manifest: workspaceManifest,
    label: "Workspace Pack",
    includeSettings: false,
    resolveSourcePath: projected.resolveSourcePath,
  });

  await materializeZip({
    sourceRoot,
    stageRoot: path.join(stagingRoot, "profile-pack"),
    zipPath: path.join(buildRoot, "profile-pack.zip"),
    manifest: profileManifest,
    label: "Profile Pack",
    includeSettings: true,
    resolveSourcePath: projected.resolveSourcePath,
  });

  for (const manifest of collectionManifests) {
    const collectionId = manifest.collection ?? "plugins";
    const zipName = `collection-${collectionId}-${manifest.target}.zip`;
    await materializeZip({
      sourceRoot,
      stageRoot: path.join(stagingRoot, `collection-${collectionId}-${manifest.target}`),
      zipPath: path.join(collectionsBuildRoot, zipName),
      manifest,
      label: `Collection ${collectionId}`,
      includeSettings: manifest.target === "profile",
      resolveSourcePath: projected.resolveSourcePath,
    });
  }

  const allManifests = [workspaceManifest, profileManifest, ...collectionManifests];
  const gateReport = evaluateValidationGates(graph, allManifests);
  const reportMarkdown = renderValidationReport(gateReport, allManifests);
  await fs.writeFile(path.join(root, "VALIDATION_REPORT.md"), reportMarkdown, "utf8");

  await fs.writeFile(
    path.join(docsBuildRoot, "settings.snippet.json"),
    settingsSnippet(),
    "utf8",
  );

  await fs.rm(stagingRoot, { recursive: true, force: true });

  const outputSummary = {
    sourceRoot: toPosix(sourceRoot),
    findings: findings.length,
    collections: collectionIds,
    generated: [
      "REORG_PLAN.md",
      "MIGRATION_MAP.csv",
      "VALIDATION_REPORT.md",
      "build/workspace-pack.zip",
      "build/profile-pack.zip",
      "build/collections/*.zip",
      "build/docs/settings.snippet.json",
    ],
  };

  console.log(JSON.stringify(outputSummary, null, 2));

  if (!gateReport.ok || graph.issues.some((issue) => issue.severity === "error")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
