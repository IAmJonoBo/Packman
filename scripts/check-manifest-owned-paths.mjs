import { promises as fs } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();

function rel(inputPath) {
  return inputPath.split(path.sep).join("/");
}

async function collectManifestPaths(startPath) {
  const manifests = [];

  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }

      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name === "PACK_MANIFEST.json") {
        manifests.push(fullPath);
      }
    }
  }

  await walk(startPath);
  return manifests.sort((left, right) => left.localeCompare(right));
}

function runPackValidate(packPath) {
  return spawnSync(
    "pnpm",
    [
      "--filter",
      "packman-cli",
      "exec",
      "node",
      "dist/index.js",
      "validate",
      packPath,
      "--strict",
      "--suite",
      "--auto-clean",
    ],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
}

async function main() {
  const manifests = await collectManifestPaths(root);

  if (manifests.length === 0) {
    console.log("No PACK_MANIFEST.json files found.");
    return;
  }

  const failures = [];

  for (const manifestPath of manifests) {
    const packPath = path.dirname(manifestPath);
    const result = runPackValidate(packPath);
    const packRel = rel(path.relative(root, packPath));

    if (result.status === 0) {
      console.log(`[OK] ${packRel}`);
      continue;
    }

    const combinedOutput = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    failures.push({
      packRel,
      output: combinedOutput,
      exitCode: result.status ?? 1,
    });
    console.log(`[FAIL] ${packRel}`);
  }

  if (failures.length > 0) {
    console.error(
      `\nManifest ownership sweep failed for ${failures.length} pack(s).`,
    );
    for (const failure of failures) {
      console.error(`\n--- ${failure.packRel} (exit ${failure.exitCode})`);
      const lines = failure.output
        .split(/\r?\n/)
        .filter(
          (line) =>
            line.includes("Validation failed") ||
            line.includes("Artifact path") ||
            line.includes("MANIFEST_") ||
            line.includes("Fatal validation error"),
        );

      if (lines.length === 0) {
        console.error(failure.output.trim());
      } else {
        for (const line of lines) {
          console.error(line);
        }
      }
    }

    process.exit(1);
  }

  console.log(`\nAll manifest packs validated (${manifests.length}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
