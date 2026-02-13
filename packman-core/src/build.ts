import path from 'node:path';
import { promises as fs } from 'node:fs';
import fg from 'fast-glob';
import JSZip from 'jszip';

function shouldExclude(relativePath: string): boolean {
  return (
    relativePath.includes('__MACOSX/') ||
    relativePath.endsWith('.DS_Store') ||
    relativePath.split('/').some((segment) => segment.startsWith('._'))
  );
}

export async function buildCleanZip(sourceDir: string, outZipPath: string): Promise<{ filesAdded: number; outZipPath: string }> {
  const zip = new JSZip();

  const files = await fg('**/*', {
    cwd: sourceDir,
    dot: true,
    onlyFiles: true,
  });

  let filesAdded = 0;

  for (const relativePath of files) {
    if (shouldExclude(relativePath)) {
      continue;
    }

    const absolutePath = path.join(sourceDir, relativePath);
    const content = await fs.readFile(absolutePath);
    zip.file(relativePath, content);
    filesAdded += 1;
  }

  const output = await zip.generateAsync({ type: 'nodebuffer' });
  await fs.mkdir(path.dirname(outZipPath), { recursive: true });
  await fs.writeFile(outZipPath, output);

  return {
    filesAdded,
    outZipPath,
  };
}
