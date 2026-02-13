import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const canonicalRouteOwners = [
  "Packs/copilot-suite-harmoniser-pack/.github/prompts/suite/suite:route.prompt.md",
  "Packs/copilot-prompt-library-pack/.github/prompts/suite/suite:route.prompt.md",
];
const legacyMirrorRoots = [
  "Packs/PROMPT FILES",
  "Packs/INSTRUCTIONS AND RULES",
];

function rel(p) {
  return p.split(path.sep).join("/");
}

async function collectPromptFiles(dir) {
  const out = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
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
  for (const legacyDir of legacyMirrorRoots) {
    const exists = await fs
      .stat(path.join(root, legacyDir))
      .then(() => true)
      .catch(() => false);
    if (!exists) {
      console.error(
        `Missing expected interface mirror directory: ${legacyDir}`,
      );
      process.exit(1);
    }
  }

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

  const canonicalOwners = routeOwners.filter(
    (file) =>
      !file.startsWith("Packs/PROMPT FILES/") &&
      !file.startsWith("Packs/INSTRUCTIONS AND RULES/"),
  );
  const mirrorOwners = routeOwners.filter(
    (file) =>
      file.startsWith("Packs/PROMPT FILES/") ||
      file.startsWith("Packs/INSTRUCTIONS AND RULES/"),
  );

  const missing = canonicalRouteOwners.filter(
    (file) => !canonicalOwners.includes(file),
  );
  const unexpected = canonicalOwners.filter(
    (file) => !canonicalRouteOwners.includes(file),
  );

  const primaryOwner = canonicalRouteOwners[0];
  const primaryMissing =
    typeof primaryOwner === "string" && !canonicalOwners.includes(primaryOwner);

  const mirrorDrift = [];
  for (const mirrorFile of mirrorOwners) {
    const canonicalFile = mirrorFile
      .replace("Packs/PROMPT FILES/", "Packs/")
      .replace("Packs/INSTRUCTIONS AND RULES/", "Packs/");

    if (!canonicalRouteOwners.includes(canonicalFile)) {
      mirrorDrift.push({
        kind: "unmapped",
        mirrorFile,
        canonicalFile,
      });
      continue;
    }

    const [mirrorContent, canonicalContent] = await Promise.all([
      fs.readFile(path.join(root, mirrorFile), "utf8"),
      fs
        .readFile(path.join(root, canonicalFile), "utf8")
        .catch(() => undefined),
    ]);

    if (typeof canonicalContent !== "string") {
      mirrorDrift.push({
        kind: "missing-canonical",
        mirrorFile,
        canonicalFile,
      });
      continue;
    }

    if (mirrorContent !== canonicalContent) {
      mirrorDrift.push({
        kind: "content-mismatch",
        mirrorFile,
        canonicalFile,
      });
    }
  }

  if (
    missing.length > 0 ||
    unexpected.length > 0 ||
    primaryMissing ||
    mirrorDrift.length > 0
  ) {
    console.error("Route ownership check failed.");
    if (missing.length > 0) {
      console.error("Missing expected owners:");
      for (const file of missing) console.error(`- ${file}`);
    }
    if (unexpected.length > 0) {
      console.error("Unexpected route owners:");
      for (const file of unexpected) console.error(`- ${file}`);
    }
    if (primaryMissing) {
      console.error(`Primary route owner missing: ${primaryOwner}`);
    }
    if (mirrorDrift.length > 0) {
      console.error("Mirror route owner drift detected:");
      for (const issue of mirrorDrift) {
        console.error(
          `- ${issue.kind}: ${issue.mirrorFile} -> ${issue.canonicalFile}`,
        );
      }
    }
    process.exit(1);
  }

  console.log("Route ownership check passed.");
  for (const file of routeOwners) console.log(`- ${file}`);
  console.log(`Primary route owner precedence: ${primaryOwner}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
