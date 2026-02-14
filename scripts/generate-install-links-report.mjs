import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const packsRoot = path.join(root, "Packs");

const repoOwner = process.env.PACKMAN_REPO_OWNER ?? "IAmJonoBo";
const repoName = process.env.PACKMAN_REPO_NAME ?? "Packman";
const repoBranch = process.env.PACKMAN_REPO_BRANCH ?? "main";

function rel(inputPath) {
  return inputPath.split(path.sep).join("/");
}

async function exists(filePath) {
  return fs
    .stat(filePath)
    .then(() => true)
    .catch(() => false);
}

async function getCanonicalPackRoots() {
  const entries = await fs.readdir(packsRoot, { withFileTypes: true });
  const roots = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "docs") continue;
    if (!entry.name.endsWith("-pack")) continue;

    const absolutePackRoot = path.join(packsRoot, entry.name);
    const hasReadme = await exists(path.join(absolutePackRoot, "README.md"));
    if (!hasReadme) continue;

    roots.push(rel(path.relative(root, absolutePackRoot)));
  }

  return roots.sort((left, right) => left.localeCompare(right));
}

async function collectInstallableFiles(absolutePackRoot) {
  const out = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;

      const full = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }

      if (!entry.isFile()) continue;
      if (entry.name === ".DS_Store") continue;

      const relativeToPack = rel(path.relative(absolutePackRoot, full));
      if (
        relativeToPack.startsWith(".github/") ||
        relativeToPack.startsWith(".vscode/") ||
        relativeToPack === "AGENTS.md" ||
        relativeToPack === "CLAUDE.md"
      ) {
        out.push(relativeToPack);
      }
    }
  }

  await walk(absolutePackRoot);
  return out.sort((left, right) => left.localeCompare(right));
}

function chooseRepresentativeFile(paths) {
  const preferred = paths.find((value) => value.endsWith(".prompt.md"));
  if (preferred) return preferred;

  const agent = paths.find((value) => value.endsWith(".agent.md"));
  if (agent) return agent;

  const instruction = paths.find((value) => value.endsWith(".instructions.md"));
  if (instruction) return instruction;

  return paths[0];
}

function buildLinks(packRoot, representativeFile) {
  const relativePath = `${packRoot}/${representativeFile}`;
  const deepLink = `https://vscode.dev/github/${repoOwner}/${repoName}/blob/${repoBranch}/${relativePath}`;
  const rawLink = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${repoBranch}/${relativePath}`;
  return { deepLink, rawLink, relativePath };
}

function detectReadmeCoverage(content) {
  const hasDeepLink =
    /https:\/\/vscode\.dev\/github\//i.test(content) ||
    /vscode:\/\//i.test(content);
  const hasRawLink = /https:\/\/raw\.githubusercontent\.com\//i.test(content);
  const hasInstallCommand =
    /packman\s+install/i.test(content) ||
    /dist\/index\.js\s+install/i.test(content);

  return {
    hasDeepLink,
    hasRawLink,
    hasInstallCommand,
  };
}

function renderMarkdownReport({
  generatedAt,
  packs,
  withDeepLink,
  withRawLink,
  withInstallCommand,
}) {
  const lines = [];
  lines.push("# Install Links Report");
  lines.push("");
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");
  lines.push("## Coverage summary");
  lines.push("");
  lines.push(`- Packs scanned: **${packs.length}**`);
  lines.push(`- README already has deep-link(s): **${withDeepLink}**`);
  lines.push(`- README already has raw-link(s): **${withRawLink}**`);
  lines.push(
    `- README already has install command(s): **${withInstallCommand}**`,
  );
  lines.push("");
  lines.push("## Per-pack recommendations");
  lines.push("");
  lines.push(
    "| Pack | Deep link present | Raw link present | Install command present | Suggested deep link | Suggested raw link | Suggested install command |",
  );
  lines.push("|---|---:|---:|---:|---|---|---|");

  for (const pack of packs) {
    lines.push(
      `| ${pack.packRoot} | ${pack.coverage.hasDeepLink ? "yes" : "no"} | ${pack.coverage.hasRawLink ? "yes" : "no"} | ${pack.coverage.hasInstallCommand ? "yes" : "no"} | ${pack.links.deepLink} | ${pack.links.rawLink} | \`pnpm --filter packman-cli exec node dist/index.js install ./${pack.packRoot} --to /path/to/repo --mode fail --json\` |`,
    );
  }

  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push(
    "- Suggested links use repository defaults from this script and can be overridden via environment variables: `PACKMAN_REPO_OWNER`, `PACKMAN_REPO_NAME`, `PACKMAN_REPO_BRANCH`.",
  );
  lines.push(
    "- This report is non-destructive and does not modify pack READMEs.",
  );

  return `${lines.join("\n")}\n`;
}

async function main() {
  const packsExists = await exists(packsRoot);
  if (!packsExists) {
    throw new Error("Packs/ directory not found.");
  }

  const canonicalPackRoots = await getCanonicalPackRoots();
  const packs = [];

  for (const packRoot of canonicalPackRoots) {
    const absolutePackRoot = path.join(root, packRoot);
    const readmePath = path.join(absolutePackRoot, "README.md");
    const readme = await fs.readFile(readmePath, "utf8");

    const installableFiles = await collectInstallableFiles(absolutePackRoot);
    const representativeFile = chooseRepresentativeFile(installableFiles);
    if (!representativeFile) {
      continue;
    }

    packs.push({
      packRoot,
      readmePath: rel(path.relative(root, readmePath)),
      coverage: detectReadmeCoverage(readme),
      links: buildLinks(packRoot, representativeFile),
      representativeFile,
    });
  }

  const withDeepLink = packs.filter((pack) => pack.coverage.hasDeepLink).length;
  const withRawLink = packs.filter((pack) => pack.coverage.hasRawLink).length;
  const withInstallCommand = packs.filter(
    (pack) => pack.coverage.hasInstallCommand,
  ).length;

  const artifactsDir = path.join(root, "artifacts");
  await fs.mkdir(artifactsDir, { recursive: true });

  const reportBody = renderMarkdownReport({
    generatedAt: new Date().toISOString(),
    packs,
    withDeepLink,
    withRawLink,
    withInstallCommand,
  });

  const reportPath = path.join(artifactsDir, "install-links-report.md");
  await fs.writeFile(reportPath, reportBody, "utf8");

  console.log("Install links report generated:");
  console.log(`- ${rel(path.relative(root, reportPath))}`);
  console.log(`- packs scanned: ${packs.length}`);
  console.log(
    `- deep links present: ${withDeepLink}, raw links present: ${withRawLink}, install commands present: ${withInstallCommand}`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
