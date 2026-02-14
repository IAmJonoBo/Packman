import path from "node:path";
import { writeJson, writeText } from "./fs-utils.js";
import { loadRegistryGraph } from "./domain/loader.js";
import type { RegistryResult } from "./types.js";

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

export async function generateRegistry(
  targetPath: string,
): Promise<RegistryResult> {
  const started = Date.now();

  const graph = await loadRegistryGraph(targetPath, {
    layout: "workspace",
    includePluginsCollection: false,
  });

  const prompts: PromptEntry[] = [];
  const instructions: InstructionEntry[] = [];
  const agents: AgentEntry[] = [];

  for (const item of graph.items) {
    if (item.type === "prompt") {
      prompts.push({
        name: item.name || path.basename(item.sourcePath),
        path: item.sourcePath,
        agent:
          typeof item.frontmatter?.agent === "string"
            ? item.frontmatter.agent
            : undefined,
        tools: Array.isArray(item.frontmatter?.tools)
          ? item.frontmatter.tools.filter(
            (tool): tool is string => typeof tool === "string",
          )
          : undefined,
      });
      continue;
    }

    if (item.type === "instruction") {
      const applyTo =
        typeof item.frontmatter?.applyTo === "string"
          ? item.frontmatter.applyTo
            .split(",")
            .map((glob) => glob.trim())
            .filter(Boolean)
          : [];

      instructions.push({
        path: item.sourcePath,
        applyTo,
        name:
          typeof item.frontmatter?.name === "string"
            ? item.frontmatter.name
            : undefined,
        description:
          typeof item.frontmatter?.description === "string"
            ? item.frontmatter.description
            : undefined,
      });
      continue;
    }

    if (item.type === "agent") {
      agents.push({
        name: item.name || path.basename(item.sourcePath),
        path: item.sourcePath,
        tools: Array.isArray(item.frontmatter?.tools)
          ? item.frontmatter.tools.filter(
            (tool): tool is string => typeof tool === "string",
          )
          : undefined,
        handoffs: Array.isArray(item.frontmatter?.handoffs)
          ? item.frontmatter.handoffs.filter(
            (handoff): handoff is string => typeof handoff === "string",
          )
          : undefined,
      });
    }
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

  const registryJsonPath = path.join(targetPath, "registry.json");
  const registryMdPath = path.join(targetPath, "registry.md");

  await writeJson(registryJsonPath, registry);

  const markdown = `# Packman Registry\n\n## Prompts\n${prompts
    .map(
      (prompt) =>
        `- ${prompt.name} (${prompt.path})${prompt.agent ? ` -> ${prompt.agent}` : ""}`,
    )
    .join("\n")}\n\n## Instructions\n${instructions
      .map((inst) => `- ${inst.path}: ${inst.applyTo.join(", ") || "(none)"}`)
      .join(
        "\n",
      )}\n\n## Agents\n${agents.map((agent) => `- ${agent.name} (${agent.path})`).join("\n")}\n`;

  await writeText(registryMdPath, markdown);

  return {
    ok: true,
    registryJsonPath,
    registryMdPath,
    elapsedMs: Date.now() - started,
  };
}
