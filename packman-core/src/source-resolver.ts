import path from "node:path";
import { promises as fs } from "node:fs";
import os from "node:os";
import fg from "fast-glob";
import JSZip from "jszip";
import { detectPack } from "./detect.js";

function isMacOsJunk(entryPath: string): boolean {
  return (
    entryPath.includes("__MACOSX/") ||
    entryPath.endsWith(".DS_Store") ||
    entryPath.split("/").some((part) => part.startsWith("._"))
  );
}

async function extractZipToTemp(
  zipPath: string,
  autoCleanMacOSJunk: boolean,
): Promise<string> {
  const bytes = await fs.readFile(zipPath);
  const zip = await JSZip.loadAsync(bytes);
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "packman-zip-"));

  for (const [entryPath, entry] of Object.entries(zip.files)) {
    if (entry.dir) {
      continue;
    }

    if (autoCleanMacOSJunk && isMacOsJunk(entryPath)) {
      continue;
    }

    const destination = path.join(tempRoot, entryPath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const content = await entry.async("nodebuffer");
    await fs.writeFile(destination, content);
  }

  return tempRoot;
}

export interface ResolvedPackSource {
  sourcePath: string;
  roots: string[];
  cleanup: () => Promise<void>;
}

function sortRoots(roots: string[]): string[] {
  return roots.sort((left, right) => {
    const leftDepth = left.split(path.sep).length;
    const rightDepth = right.split(path.sep).length;
    if (leftDepth !== rightDepth) {
      return leftDepth - rightDepth;
    }

    return left.localeCompare(right, undefined, { sensitivity: "base" });
  });
}

function candidateRootFromArtifactPath(artifactPath: string): string {
  const normalized = artifactPath.replaceAll("\\", "/");
  const githubMarker = "/.github/";
  const markerIndex = normalized.indexOf(githubMarker);
  if (markerIndex >= 0) {
    return normalized.slice(0, markerIndex);
  }

  if (normalized.endsWith("/PACK_MANIFEST.json")) {
    return normalized.slice(0, -"/PACK_MANIFEST.json".length);
  }

  return path.posix.dirname(normalized);
}

async function discoverPackRootsRecursively(
  rootPath: string,
): Promise<string[]> {
  const artifactMatches = await fg(
    [
      "**/PACK_MANIFEST.json",
      "**/.github/prompts/**/*.prompt.md",
      "**/.github/agents/**/*.agent.md",
      "**/.github/instructions/**/*.instructions.md",
      "**/.github/skills/**/SKILL.md",
      "**/.github/copilot-instructions.md",
    ],
    {
      cwd: rootPath,
      onlyFiles: true,
      dot: true,
      unique: true,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
    },
  );

  const candidateRoots = [
    ...new Set(artifactMatches.map(candidateRootFromArtifactPath)),
  ];
  const verifiedRoots: string[] = [];

  for (const candidate of candidateRoots) {
    const absolute = path.resolve(rootPath, candidate);
    const detected = await detectPack(absolute);
    if (detected.isPack) {
      verifiedRoots.push(absolute);
    }
  }

  return sortRoots([...new Set(verifiedRoots)]);
}

export async function resolvePackSource(
  sourcePath: string,
  options: { autoCleanMacOSJunk?: boolean } = {},
): Promise<ResolvedPackSource> {
  const absolutePath = path.resolve(sourcePath);
  const autoClean = Boolean(options.autoCleanMacOSJunk);

  let effectivePath = absolutePath;
  let tempPath: string | undefined;

  if (absolutePath.toLowerCase().endsWith(".zip")) {
    tempPath = await extractZipToTemp(absolutePath, autoClean);
    effectivePath = tempPath;
  }

  const selfDetection = await detectPack(effectivePath);
  if (selfDetection.isPack) {
    return {
      sourcePath: effectivePath,
      roots: [effectivePath],
      cleanup: async () => {
        if (tempPath) {
          await fs.rm(tempPath, { recursive: true, force: true });
        }
      },
    };
  }

  const entries = await fs.readdir(effectivePath, { withFileTypes: true });
  const roots: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const childPath = path.join(effectivePath, entry.name);
    const childDetection = await detectPack(childPath);
    if (childDetection.isPack) {
      roots.push(childPath);
    }
  }

  if (roots.length === 0) {
    const discoveredRoots = await discoverPackRootsRecursively(effectivePath);
    roots.push(...discoveredRoots);
  }

  return {
    sourcePath: effectivePath,
    roots: sortRoots([...new Set(roots)]),
    cleanup: async () => {
      if (tempPath) {
        await fs.rm(tempPath, { recursive: true, force: true });
      }
    },
  };
}

export async function resolvePackRoots(
  sourcePath: string,
  options: { autoCleanMacOSJunk?: boolean } = {},
): Promise<string[]> {
  const resolved = await resolvePackSource(sourcePath, options);
  try {
    return resolved.roots;
  } finally {
    await resolved.cleanup();
  }
}
