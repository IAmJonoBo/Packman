import path from 'node:path';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import JSZip from 'jszip';
import { detectPack } from './detect.js';

function isMacOsJunk(entryPath: string): boolean {
  return (
    entryPath.includes('__MACOSX/') ||
    entryPath.endsWith('.DS_Store') ||
    entryPath.split('/').some((part) => part.startsWith('._'))
  );
}

async function extractZipToTemp(zipPath: string, autoCleanMacOSJunk: boolean): Promise<string> {
  const bytes = await fs.readFile(zipPath);
  const zip = await JSZip.loadAsync(bytes);
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'packman-zip-'));

  for (const [entryPath, entry] of Object.entries(zip.files)) {
    if (entry.dir) {
      continue;
    }

    if (autoCleanMacOSJunk && isMacOsJunk(entryPath)) {
      continue;
    }

    const destination = path.join(tempRoot, entryPath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    const content = await entry.async('nodebuffer');
    await fs.writeFile(destination, content);
  }

  return tempRoot;
}

export interface ResolvedPackSource {
  sourcePath: string;
  roots: string[];
  cleanup: () => Promise<void>;
}

export async function resolvePackSource(
  sourcePath: string,
  options: { autoCleanMacOSJunk?: boolean } = {},
): Promise<ResolvedPackSource> {
  const absolutePath = path.resolve(sourcePath);
  const autoClean = Boolean(options.autoCleanMacOSJunk);

  let effectivePath = absolutePath;
  let tempPath: string | undefined;

  if (absolutePath.toLowerCase().endsWith('.zip')) {
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

  return {
    sourcePath: effectivePath,
    roots: roots.sort(),
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
