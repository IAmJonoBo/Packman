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

async function walkFiles(startPath) {
  const out = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }

      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        if (entry.name === ".DS_Store") continue;
        out.push(fullPath);
      }
    }
  }

  await walk(startPath);
  return out;
}

async function getCanonicalPackRoots() {
  const entries = await fs.readdir(packsRoot, { withFileTypes: true });
  const roots = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "docs") continue;
    if (!entry.name.endsWith("-pack")) continue;

    const full = path.join(packsRoot, entry.name);
    const hasGitHubDir = await exists(path.join(full, ".github"));
    const hasManifest = await exists(path.join(full, "PACK_MANIFEST.json"));
    if (!hasGitHubDir && !hasManifest) continue;

    roots.push(rel(path.relative(root, full)));
  }

  return roots.sort((left, right) => left.localeCompare(right));
}

function inferCategory(fileName, installPath) {
  if (fileName.endsWith(".agent.md")) return "agents";
  if (fileName.endsWith(".prompt.md")) return "prompts";
  if (fileName.endsWith(".instructions.md")) return "instructions";
  if (fileName === "SKILL.md") return "skills";
  if (installPath.startsWith(".github/hooks/")) return "hooks";
  return "other";
}

function hasFrontmatter(content) {
  return /^---\n[\s\S]*?\n---(\n|$)/.test(content);
}

function detectNamingIssue(fileName, category) {
  if (category === "agents") {
    const stem = fileName.slice(0, -".agent.md".length);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(stem)) {
      return "agent file stem should be lowercase kebab-case";
    }
  }

  if (category === "prompts") {
    const stem = fileName.slice(0, -".prompt.md".length);
    if (!/^[a-z0-9]+(?:(?:-|:)[a-z0-9]+)*$/.test(stem)) {
      return "prompt file stem should be lowercase and use '-' or ':' separators";
    }
  }

  if (category === "instructions") {
    const stem = fileName.slice(0, -".instructions.md".length);
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(stem) &&
      !/^[0-9]{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(stem)
    ) {
      return "instructions file stem should be lowercase kebab-case (optional NN- prefix)";
    }
  }

  return undefined;
}

async function main() {
  const packsExists = await exists(packsRoot);
  if (!packsExists) {
    throw new Error("Packs/ directory not found.");
  }

  const canonicalPackRoots = await getCanonicalPackRoots();
  const artifactFiles = [];

  for (const packRoot of canonicalPackRoots) {
    const absolutePackRoot = path.join(root, packRoot);
    const files = await walkFiles(absolutePackRoot);

    for (const filePath of files) {
      const relativeToPack = rel(path.relative(absolutePackRoot, filePath));
      const fileName = path.basename(filePath);

      const installPath =
        relativeToPack.startsWith(".github/") ||
        relativeToPack.startsWith(".vscode/")
          ? relativeToPack
          : undefined;
      if (!installPath) continue;

      const category = inferCategory(fileName, installPath);
      if (category === "other") continue;

      artifactFiles.push({
        packRoot,
        path: rel(path.relative(root, filePath)),
        installPath,
        fileName,
        category,
      });
    }
  }

  const duplicatesByInstallPath = [];
  const groupedByInstallPath = new Map();
  for (const artifact of artifactFiles) {
    const existing = groupedByInstallPath.get(artifact.installPath) ?? [];
    existing.push(artifact.path);
    groupedByInstallPath.set(artifact.installPath, existing);
  }

  for (const [installPath, sources] of groupedByInstallPath.entries()) {
    if (sources.length > 1) {
      duplicatesByInstallPath.push({
        installPath,
        sources: sources.sort((left, right) => left.localeCompare(right)),
      });
    }
  }
  duplicatesByInstallPath.sort((left, right) =>
    left.installPath.localeCompare(right.installPath),
  );

  const missingFrontmatter = [];
  for (const artifact of artifactFiles) {
    if (
      artifact.category !== "agents" &&
      artifact.category !== "prompts" &&
      artifact.category !== "instructions"
    ) {
      continue;
    }

    const content = await fs.readFile(path.join(root, artifact.path), "utf8");
    if (!hasFrontmatter(content)) {
      missingFrontmatter.push({
        path: artifact.path,
        category: artifact.category,
        reason: "missing YAML frontmatter block",
      });
    }
  }
  missingFrontmatter.sort((left, right) => left.path.localeCompare(right.path));

  const namingIssues = [];
  for (const artifact of artifactFiles) {
    const issue = detectNamingIssue(artifact.fileName, artifact.category);
    if (!issue) continue;

    namingIssues.push({
      path: artifact.path,
      category: artifact.category,
      issue,
    });
  }
  namingIssues.sort((left, right) => left.path.localeCompare(right.path));

  const categoryCounts = artifactFiles.reduce((acc, current) => {
    acc[current.category] = (acc[current.category] ?? 0) + 1;
    return acc;
  }, {});

  const output = {
    generatedAt: new Date().toISOString(),
    canonicalRoot: "Packs",
    canonicalPackRoots,
    totals: {
      canonicalPacks: canonicalPackRoots.length,
      artifacts: artifactFiles.length,
      duplicatesByInstallPath: duplicatesByInstallPath.length,
      missingFrontmatter: missingFrontmatter.length,
      namingIssues: namingIssues.length,
    },
    categoryCounts,
    duplicatesByInstallPath,
    missingFrontmatter,
    namingIssues,
  };

  const artifactsDir = path.join(root, "artifacts");
  await fs.mkdir(artifactsDir, { recursive: true });
  const outputPath = path.join(artifactsDir, "suite-inventory.json");
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(output, null, 2)}\n`,
    "utf8",
  );

  console.log("Suite inventory generated:");
  console.log(`- ${rel(path.relative(root, outputPath))}`);
  console.log(`- canonical packs: ${output.totals.canonicalPacks}`);
  console.log(`- artifacts: ${output.totals.artifacts}`);
  console.log(
    `- duplicates: ${output.totals.duplicatesByInstallPath}, missing frontmatter: ${output.totals.missingFrontmatter}, naming issues: ${output.totals.namingIssues}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
