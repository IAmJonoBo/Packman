import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const packsRoot = path.join(root, "Packs");

function rel(inputPath) {
  return inputPath.split(path.sep).join("/");
}

async function exists(filePath) {
  return fs
    .stat(filePath)
    .then(() => true)
    .catch(() => false);
}

async function listCanonicalPackRoots() {
  const entries = await fs.readdir(packsRoot, { withFileTypes: true });
  const roots = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "docs") continue;
    if (!entry.name.endsWith("-pack")) continue;

    const absolutePack = path.join(packsRoot, entry.name);
    const hasReadme = await exists(path.join(absolutePack, "README.md"));
    if (!hasReadme) continue;

    roots.push(rel(path.relative(root, absolutePack)));
  }

  return roots.sort((left, right) => left.localeCompare(right));
}

async function walkFiles(startPath) {
  const out = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const full = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile()) {
        if (entry.name === ".DS_Store") continue;
        out.push(full);
      }
    }
  }

  await walk(startPath);
  return out;
}

function inferCollection(packRoot) {
  const slug = packRoot.replace(/^Packs\//, "");

  if (
    slug.includes("policy-kernel") ||
    slug.includes("suite-harmoniser") ||
    slug.includes("prompt-library")
  ) {
    return "foundation";
  }

  if (
    slug.includes("project-") ||
    slug.includes("interface-wiring") ||
    slug.includes("github-bootstrap")
  ) {
    return "delivery";
  }

  if (
    slug.includes("security") ||
    slug.includes("quality") ||
    slug.includes("release") ||
    slug.includes("observability") ||
    slug.includes("architecture") ||
    slug.includes("edge-case") ||
    slug.includes("gold-standards")
  ) {
    return "reliability";
  }

  if (
    slug.includes("docs") ||
    slug.includes("ux") ||
    slug.includes("award-ui")
  ) {
    return "experience";
  }

  return "misc";
}

async function detectInstallMode(absolutePackPath) {
  const manifestPath = path.join(absolutePackPath, "PACK_MANIFEST.json");
  if (await exists(manifestPath)) {
    try {
      const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
      if (typeof manifest.intended_install === "string") {
        return manifest.intended_install;
      }
    } catch {
      return "unknown";
    }
  }

  const readmePath = path.join(absolutePackPath, "README.md");
  const readme = await fs.readFile(readmePath, "utf8");
  const installModeMatch = /## Install mode\s+\n\s*([\w|\-]+)/im.exec(readme);
  if (installModeMatch?.[1]) {
    return installModeMatch[1].trim();
  }
  return "unknown";
}

function computeArtifactCounts(filePaths, absolutePackPath) {
  const counts = {
    agents: 0,
    prompts: 0,
    instructions: 0,
    skills: 0,
    hooks: 0,
    settings: 0,
  };

  for (const filePath of filePaths) {
    const relative = rel(path.relative(absolutePackPath, filePath));
    if (relative.endsWith(".agent.md")) counts.agents += 1;
    if (relative.endsWith(".prompt.md")) counts.prompts += 1;
    if (relative.endsWith(".instructions.md")) counts.instructions += 1;
    if (relative.endsWith("/SKILL.md")) counts.skills += 1;
    if (relative.startsWith(".github/hooks/") && relative.endsWith(".json")) {
      counts.hooks += 1;
    }
    if (
      relative === ".vscode/settings.json" ||
      relative.startsWith(".claude/settings")
    ) {
      counts.settings += 1;
    }
  }

  return counts;
}

function buildCollections(packRows) {
  const descriptors = {
    foundation: {
      name: "Foundation",
      description:
        "Core policy, route harmonisation, hooks, and prompt routing foundations.",
    },
    delivery: {
      name: "Delivery",
      description:
        "Planning, scaffolding, integration, and repository bootstrap accelerators.",
    },
    reliability: {
      name: "Reliability & Security",
      description:
        "Quality, security, architecture, release, and operational resilience packs.",
    },
    experience: {
      name: "Experience & Docs",
      description: "UX, visual craft, and documentation quality packs.",
    },
    misc: {
      name: "Misc",
      description: "Packs that do not fit a primary collection yet.",
    },
  };

  const grouped = new Map();
  for (const row of packRows) {
    const key = row.collection;
    const existing = grouped.get(key) ?? [];
    existing.push(row.packRoot);
    grouped.set(key, existing);
  }

  return Object.entries(descriptors)
    .map(([id, meta]) => ({
      id,
      name: meta.name,
      description: meta.description,
      packRoots: (grouped.get(id) ?? []).sort((left, right) =>
        left.localeCompare(right),
      ),
    }))
    .filter((entry) => entry.packRoots.length > 0);
}

function renderSuiteIndex(packRows) {
  const lines = [];
  lines.push("# Suite Index");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(
    "| Pack | Collection | Install mode | Manifest | Agents | Prompts | Instructions | Skills | Hooks | Settings |",
  );
  lines.push("|---|---|---|---:|---:|---:|---:|---:|---:|---:|");

  for (const row of packRows) {
    lines.push(
      `| ${row.packRoot} | ${row.collection} | ${row.installMode} | ${row.hasManifest ? "yes" : "no"} | ${row.counts.agents} | ${row.counts.prompts} | ${row.counts.instructions} | ${row.counts.skills} | ${row.counts.hooks} | ${row.counts.settings} |`,
    );
  }

  lines.push("");
  lines.push("## Totals");
  lines.push("");

  const totals = packRows.reduce(
    (acc, row) => {
      acc.packs += 1;
      acc.agents += row.counts.agents;
      acc.prompts += row.counts.prompts;
      acc.instructions += row.counts.instructions;
      acc.skills += row.counts.skills;
      acc.hooks += row.counts.hooks;
      acc.settings += row.counts.settings;
      return acc;
    },
    {
      packs: 0,
      agents: 0,
      prompts: 0,
      instructions: 0,
      skills: 0,
      hooks: 0,
      settings: 0,
    },
  );

  lines.push(`- Packs: **${totals.packs}**`);
  lines.push(`- Agents: **${totals.agents}**`);
  lines.push(`- Prompts: **${totals.prompts}**`);
  lines.push(`- Instructions: **${totals.instructions}**`);
  lines.push(`- Skills: **${totals.skills}**`);
  lines.push(`- Hooks: **${totals.hooks}**`);
  lines.push(`- Settings files: **${totals.settings}**`);

  return `${lines.join("\n")}\n`;
}

async function main() {
  if (!(await exists(packsRoot))) {
    throw new Error("Packs/ directory not found.");
  }

  const packRoots = await listCanonicalPackRoots();
  const packRows = [];

  for (const packRoot of packRoots) {
    const absolutePackPath = path.join(root, packRoot);
    const allFiles = await walkFiles(absolutePackPath);
    const hasManifest = await exists(
      path.join(absolutePackPath, "PACK_MANIFEST.json"),
    );
    packRows.push({
      packRoot,
      collection: inferCollection(packRoot),
      installMode: await detectInstallMode(absolutePackPath),
      hasManifest,
      counts: computeArtifactCounts(allFiles, absolutePackPath),
    });
  }

  const collections = buildCollections(packRows);
  const artifactsDir = path.join(root, "artifacts");
  await fs.mkdir(artifactsDir, { recursive: true });

  const collectionsPath = path.join(artifactsDir, "collections.json");
  await fs.writeFile(
    collectionsPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        canonicalRoot: "Packs",
        totalPacks: packRows.length,
        collections,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );

  const suiteIndexPath = path.join(artifactsDir, "suite-index.md");
  await fs.writeFile(suiteIndexPath, renderSuiteIndex(packRows), "utf8");

  console.log("Suite collections/index generated:");
  console.log(`- ${rel(path.relative(root, collectionsPath))}`);
  console.log(`- ${rel(path.relative(root, suiteIndexPath))}`);
  console.log(`- packs indexed: ${packRows.length}`);
  console.log(`- collections: ${collections.length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
