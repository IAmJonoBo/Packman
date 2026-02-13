import path from 'node:path';
import fg from 'fast-glob';
import { parseFrontmatter } from './frontmatter.js';
import { readText, writeJson, writeText } from './fs-utils.js';
import type { RegistryResult } from './types.js';

interface PromptEntry {
  name: string;
  path: string;
  agent?: string;
  tools?: string[];
}

interface InstructionEntry {
  path: string;
  applyTo: string[];
  name?: string;
  description?: string;
}

interface AgentEntry {
  name: string;
  path: string;
  tools?: string[];
  handoffs?: string[];
}

export async function generateRegistry(targetPath: string): Promise<RegistryResult> {
  const started = Date.now();

  const prompts: PromptEntry[] = [];
  const instructions: InstructionEntry[] = [];
  const agents: AgentEntry[] = [];

  const promptFiles = await fg('.github/prompts/**/*.prompt.md', { cwd: targetPath, absolute: true, dot: true });
  for (const promptFile of promptFiles) {
    const raw = await readText(promptFile);
    const parsed = parseFrontmatter(raw);
    prompts.push({
      name: typeof parsed.frontmatter.name === 'string' ? parsed.frontmatter.name : path.basename(promptFile),
      path: path.relative(targetPath, promptFile),
      agent: typeof parsed.frontmatter.agent === 'string' ? parsed.frontmatter.agent : undefined,
      tools: Array.isArray(parsed.frontmatter.tools)
        ? parsed.frontmatter.tools.filter((tool): tool is string => typeof tool === 'string')
        : undefined,
    });
  }

  const instructionFiles = await fg('.github/instructions/**/*.instructions.md', {
    cwd: targetPath,
    absolute: true,
    dot: true,
  });

  for (const instructionFile of instructionFiles) {
    const raw = await readText(instructionFile);
    const parsed = parseFrontmatter(raw);
    const applyTo =
      typeof parsed.frontmatter.applyTo === 'string'
        ? parsed.frontmatter.applyTo
            .split(',')
            .map((glob) => glob.trim())
            .filter(Boolean)
        : [];

    instructions.push({
      path: path.relative(targetPath, instructionFile),
      applyTo,
      name: typeof parsed.frontmatter.name === 'string' ? parsed.frontmatter.name : undefined,
      description: typeof parsed.frontmatter.description === 'string' ? parsed.frontmatter.description : undefined,
    });
  }

  const agentFiles = await fg('.github/agents/**/*.agent.md', { cwd: targetPath, absolute: true, dot: true });
  for (const agentFile of agentFiles) {
    const raw = await readText(agentFile);
    const parsed = parseFrontmatter(raw);
    agents.push({
      name: typeof parsed.frontmatter.name === 'string' ? parsed.frontmatter.name : path.basename(agentFile),
      path: path.relative(targetPath, agentFile),
      tools: Array.isArray(parsed.frontmatter.tools)
        ? parsed.frontmatter.tools.filter((tool): tool is string => typeof tool === 'string')
        : undefined,
      handoffs: Array.isArray(parsed.frontmatter.handoffs)
        ? parsed.frontmatter.handoffs.filter((handoff): handoff is string => typeof handoff === 'string')
        : undefined,
    });
  }

  const coverageMap = instructions.map((entry) => ({
    instruction: entry.path,
    applyTo: entry.applyTo,
  }));

  const registry = {
    generatedAt: new Date().toISOString(),
    prompts,
    instructions,
    agents,
    coverageMap,
  };

  const registryJsonPath = path.join(targetPath, 'registry.json');
  const registryMdPath = path.join(targetPath, 'registry.md');

  await writeJson(registryJsonPath, registry);

  const markdown = `# Packman Registry\n\n## Prompts\n${prompts
    .map((prompt) => `- ${prompt.name} (${prompt.path})${prompt.agent ? ` -> ${prompt.agent}` : ''}`)
    .join('\n')}\n\n## Instructions\n${instructions
    .map((inst) => `- ${inst.path}: ${inst.applyTo.join(', ') || '(none)'}`)
    .join('\n')}\n\n## Agents\n${agents.map((agent) => `- ${agent.name} (${agent.path})`).join('\n')}\n`;

  await writeText(registryMdPath, markdown);

  return {
    ok: true,
    registryJsonPath,
    registryMdPath,
    elapsedMs: Date.now() - started,
  };
}
