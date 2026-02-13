import path from 'node:path';
import { promises as fs } from 'node:fs';
import fg from 'fast-glob';
import { exists, readJson, readText, writeText } from './fs-utils.js';
import { resolvePackSource } from './source-resolver.js';
import type { FileChange, Issue, ReadmeSyncResult } from './types.js';

interface ManifestLike {
  intended_install?: string;
}

async function treeForDir(rootPath: string, maxDepth = 4): Promise<string[]> {
  const lines: string[] = [];

  const recurse = async (currentPath: string, depth: number, prefix: string): Promise<void> => {
    if (depth > maxDepth) {
      return;
    }

    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    lines.push(`${prefix}${path.basename(currentPath)}/`);

    const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of sorted) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.DS_Store') {
        continue;
      }

      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await recurse(entryPath, depth + 1, `${prefix}  `);
      } else {
        lines.push(`${prefix}  ${entry.name}`);
      }
    }
  };

  await recurse(rootPath, 0, '');
  return lines;
}

function extractPurpose(existingReadme?: string): string {
  if (!existingReadme) {
    return 'Describe the purpose of this pack.';
  }

  const heading = /##\s+Purpose\s*\n([\s\S]*?)(\n##\s+|$)/m.exec(existingReadme);
  const section = heading?.[1]?.trim();
  if (section && section.length > 0) {
    return section;
  }

  return 'Describe the purpose of this pack.';
}

function toDisplayName(packDirName: string): string {
  return packDirName
    .replace(/^copilot-/, '')
    .replace(/-pack$/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildReadme(params: {
  packRoot: string;
  purpose: string;
  installMode: string;
  prompts: string[];
  agents: string[];
  tree: string;
}): string {
  const packName = path.basename(params.packRoot);
  const title = toDisplayName(packName);

  const promptLines = params.prompts.length
    ? params.prompts.slice(0, 12).map((item) => `- ${item}`).join('\n')
    : '- None detected';

  const agentLines = params.agents.length
    ? params.agents.slice(0, 12).map((item) => `- ${item}`).join('\n')
    : '- None detected';

  return `# ${title} (${packName})\n\n## Purpose\n${params.purpose}\n\n## Install mode\n${params.installMode}\n\n## Key prompts\n${promptLines}\n\n## Key agents\n${agentLines}\n\n## Directory tree\n\n\`\`\`text\n${params.tree}\n\`\`\`\n\n## Post-install checklist\n- Run \`packman validate <pack> --strict\`\n- Run \`packman normalize <pack>\` and review changes\n- Run \`packman install <pack|packsdir> --target workspace --path <target> --dry-run\`\n- Run \`packman doctor <target>\`\n- Run \`packman readiness <target>\`\n`;
}

function hasSuiteOwnedFiles(relativePaths: string[]): boolean {
  return relativePaths.includes('.github/copilot-instructions.md') || relativePaths.includes('.vscode/settings.json');
}

export async function syncPackReadmes(sourcePath: string, apply = false): Promise<ReadmeSyncResult> {
  const started = Date.now();
  const issues: Issue[] = [];
  const changes: FileChange[] = [];

  const resolved = await resolvePackSource(sourcePath);
  const packRoots = resolved.roots;

  try {
    for (const packRoot of packRoots) {
      const readmePath = path.join(packRoot, 'README.md');
      const existingReadme = (await exists(readmePath)) ? await readText(readmePath) : undefined;
      const purpose = extractPurpose(existingReadme);

      const promptFiles = (await fg('.github/prompts/**/*.prompt.md', { cwd: packRoot, dot: true })).sort((a, b) =>
        a.localeCompare(b),
      );
      const agentFiles = (await fg('.github/agents/**/*.agent.md', { cwd: packRoot, dot: true })).sort((a, b) =>
        a.localeCompare(b),
      );
      const relativeFiles = await fg(['.github/copilot-instructions.md', '.vscode/settings.json'], {
        cwd: packRoot,
        dot: true,
      });

      const manifest = await readJson<ManifestLike>(path.join(packRoot, 'PACK_MANIFEST.json'));
      const installMode =
        typeof manifest?.intended_install === 'string'
          ? manifest.intended_install
          : hasSuiteOwnedFiles(relativeFiles)
            ? 'suite'
            : 'solo';

      const tree = (await treeForDir(packRoot, 4)).join('\n');
      const nextReadme = buildReadme({
        packRoot,
        purpose,
        installMode,
        prompts: promptFiles,
        agents: agentFiles,
        tree,
      });

      if (existingReadme !== nextReadme) {
        changes.push({
          action: existingReadme ? 'update' : 'create',
          toPath: readmePath,
          before: existingReadme,
          after: nextReadme,
        });

        if (apply) {
          await writeText(readmePath, nextReadme);
        }
      }

      if (promptFiles.length === 0) {
        issues.push({
          severity: 'warning',
          code: 'README_SYNC_NO_PROMPTS',
          message: 'Pack has no prompt files listed under .github/prompts',
          path: packRoot,
        });
      }
    }
  } finally {
    await resolved.cleanup();
  }

  return {
    ok: !issues.some((issue) => issue.severity === 'error'),
    issues,
    changes,
    packRoots,
    elapsedMs: Date.now() - started,
  };
}
