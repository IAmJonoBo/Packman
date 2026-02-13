import path from 'node:path';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { doctorTarget } from './doctor.js';

describe('doctorTarget', () => {
  it('flags duplicate prompt names', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'packman-doctor-'));
    await mkdir(path.join(root, '.github/prompts/a'), { recursive: true });
    await mkdir(path.join(root, '.github/prompts/b'), { recursive: true });

    const prompt = `---\nname: qa:shared\ndescription: duplicate\n---\nBody\n`;
    await writeFile(path.join(root, '.github/prompts/a/one.prompt.md'), prompt, 'utf8');
    await writeFile(path.join(root, '.github/prompts/b/two.prompt.md'), prompt, 'utf8');

    const result = await doctorTarget(root);
    expect(result.ok).toBe(false);
    expect(result.issues.some((issue) => issue.code === 'PROMPT_DUPLICATE_NAME')).toBe(true);

    await rm(root, { recursive: true, force: true });
  });
});
