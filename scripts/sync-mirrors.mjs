import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const mirrorRoots = ["Packs/PROMPT FILES", "Packs/INSTRUCTIONS AND RULES"];

async function exists(filePath) {
  return fs
    .stat(filePath)
    .then(() => true)
    .catch(() => false);
}

async function listDirectories(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function syncMirrorPackage(mirrorRoot, packageName) {
  const mirrorPath = path.join(root, mirrorRoot, packageName);
  const canonicalPath = path.join(root, "Packs", packageName);

  const canonicalExists = await exists(canonicalPath);
  if (!canonicalExists) {
    throw new Error(
      `Canonical pack does not exist for mirror '${mirrorRoot}/${packageName}': Packs/${packageName}`,
    );
  }

  await fs.rm(mirrorPath, { recursive: true, force: true });
  await fs.mkdir(path.dirname(mirrorPath), { recursive: true });
  await fs.cp(canonicalPath, mirrorPath, { recursive: true });
}

async function main() {
  const synced = [];

  for (const mirrorRoot of mirrorRoots) {
    const mirrorPath = path.join(root, mirrorRoot);
    const mirrorExists = await exists(mirrorPath);
    if (!mirrorExists) {
      throw new Error(`Missing mirror root: ${mirrorRoot}`);
    }

    const packageDirs = await listDirectories(mirrorPath);
    for (const packageName of packageDirs) {
      await syncMirrorPackage(mirrorRoot, packageName);
      synced.push(`${mirrorRoot}/${packageName}`);
    }
  }

  console.log(`Mirror sync complete (${synced.length} packages).`);
  for (const target of synced) {
    console.log(`- ${target}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
