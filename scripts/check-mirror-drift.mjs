import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const mirrorRoots = ["Packs/PROMPT FILES", "Packs/INSTRUCTIONS AND RULES"];

function rel(p) {
  return p.split(path.sep).join("/");
}

async function exists(filePath) {
  return fs
    .stat(filePath)
    .then(() => true)
    .catch(() => false);
}

async function collectFiles(dir) {
  const out = [];

  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        await walk(full);
      } else if (entry.isFile()) {
        if (entry.name === ".DS_Store") continue;
        out.push(rel(path.relative(root, full)));
      }
    }
  }

  await walk(dir);
  return out;
}

function mirrorToCanonical(filePath) {
  if (filePath.startsWith("Packs/PROMPT FILES/")) {
    return filePath.replace("Packs/PROMPT FILES/", "Packs/");
  }
  if (filePath.startsWith("Packs/INSTRUCTIONS AND RULES/")) {
    return filePath.replace("Packs/INSTRUCTIONS AND RULES/", "Packs/");
  }
  return undefined;
}

async function main() {
  for (const mirrorRoot of mirrorRoots) {
    const mirrorRootExists = await exists(path.join(root, mirrorRoot));
    if (!mirrorRootExists) {
      console.error(`Missing mirror root: ${mirrorRoot}`);
      process.exit(1);
    }
  }

  const drift = [];
  let checked = 0;

  for (const mirrorRoot of mirrorRoots) {
    const files = await collectFiles(path.join(root, mirrorRoot));
    for (const mirrorFile of files) {
      const canonicalFile = mirrorToCanonical(mirrorFile);
      if (!canonicalFile) {
        continue;
      }

      checked += 1;
      const canonicalAbsolute = path.join(root, canonicalFile);
      const mirrorAbsolute = path.join(root, mirrorFile);
      const canonicalExists = await exists(canonicalAbsolute);

      if (!canonicalExists) {
        drift.push({
          kind: "missing-canonical",
          mirrorFile,
          canonicalFile,
        });
        continue;
      }

      const [mirrorContent, canonicalContent] = await Promise.all([
        fs.readFile(mirrorAbsolute),
        fs.readFile(canonicalAbsolute),
      ]);
      if (!mirrorContent.equals(canonicalContent)) {
        drift.push({
          kind: "content-mismatch",
          mirrorFile,
          canonicalFile,
        });
      }
    }
  }

  if (drift.length > 0) {
    console.error("Mirror drift check failed.");
    for (const issue of drift) {
      console.error(
        `- ${issue.kind}: ${issue.mirrorFile} -> ${issue.canonicalFile}`,
      );
    }
    process.exit(1);
  }

  console.log(
    `Mirror drift check passed (${checked} mirrored files validated).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
