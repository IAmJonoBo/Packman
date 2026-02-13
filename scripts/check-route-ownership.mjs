import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const expected = [
  "Packs/copilot-suite-harmoniser-pack/.github/prompts/suite/suite:route.prompt.md",
  "Packs/copilot-prompt-library-pack/.github/prompts/suite/suite:route.prompt.md",
];

function rel(p) {
  return p.split(path.sep).join("/");
}

async function collectPromptFiles(dir) {
  const out = [];
  const ignoredRoots = new Set(["PROMPT FILES", "INSTRUCTIONS AND RULES"]);

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (current === dir && ignoredRoots.has(entry.name.toUpperCase())) {
          continue;
        }
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        await walk(full);
      } else if (entry.name.endsWith(".prompt.md")) {
        out.push(full);
      }
    }
  }
  await walk(dir);
  return out;
}

async function main() {
  const promptFiles = await collectPromptFiles(path.join(root, "Packs"));
  const routeOwners = [];

  for (const file of promptFiles) {
    const content = await fs.readFile(file, "utf8");
    if (
      content.includes("name: suite:route") ||
      content.includes('name: "suite:route"')
    ) {
      routeOwners.push(rel(path.relative(root, file)));
    }
  }

  const missing = expected.filter((file) => !routeOwners.includes(file));
  const unexpected = routeOwners.filter((file) => !expected.includes(file));

  if (missing.length > 0 || unexpected.length > 0) {
    console.error("Route ownership check failed.");
    if (missing.length > 0) {
      console.error("Missing expected owners:");
      for (const file of missing) console.error(`- ${file}`);
    }
    if (unexpected.length > 0) {
      console.error("Unexpected route owners:");
      for (const file of unexpected) console.error(`- ${file}`);
    }
    process.exit(1);
  }

  console.log("Route ownership check passed.");
  for (const file of routeOwners) console.log(`- ${file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
