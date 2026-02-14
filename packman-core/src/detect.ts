import path from "node:path";
import fg from "fast-glob";
import type { Artifact, PackDetection } from "./types.js";
import { toPosixPath } from "./fs-utils.js";

const DETECTION_PATTERNS: Array<{ type: Artifact["type"]; pattern: string }> = [
  { type: "agent", pattern: ".github/agents/**/*.agent.md" },
  { type: "agent", pattern: ".claude/agents/**/*.md" },
  { type: "prompt", pattern: ".github/prompts/**/*.prompt.md" },
  {
    type: "instruction",
    pattern: ".github/instructions/**/*.instructions.md",
  },
  { type: "instruction", pattern: ".claude/rules/**/*.md" },
  { type: "skill", pattern: ".github/skills/**/SKILL.md" },
  { type: "skill", pattern: ".claude/skills/**/SKILL.md" },
  { type: "skill", pattern: ".agents/skills/**/SKILL.md" },
  { type: "copilotInstructions", pattern: ".github/copilot-instructions.md" },
  { type: "alwaysOnInstruction", pattern: "AGENTS.md" },
  { type: "alwaysOnInstruction", pattern: "CLAUDE.md" },
  { type: "alwaysOnInstruction", pattern: "CLAUDE.local.md" },
  { type: "alwaysOnInstruction", pattern: ".claude/CLAUDE.md" },
  { type: "settings", pattern: ".vscode/settings.json" },
  { type: "mcpConfig", pattern: ".vscode/mcp.json" },
  { type: "hookConfig", pattern: ".github/hooks/*.json" },
  { type: "hookConfig", pattern: ".claude/settings.json" },
  { type: "hookConfig", pattern: ".claude/settings.local.json" },
  { type: "manifest", pattern: "PACK_MANIFEST.json" },
];

export async function detectPack(rootPath: string): Promise<PackDetection> {
  const artifacts: Artifact[] = [];

  for (const item of DETECTION_PATTERNS) {
    const matches = await fg(item.pattern, {
      cwd: rootPath,
      onlyFiles: true,
      dot: true,
    });

    for (const relativePath of matches) {
      artifacts.push({
        type: item.type,
        absolutePath: path.join(rootPath, relativePath),
        relativePath: toPosixPath(relativePath),
      });
    }
  }

  const manifest = artifacts.find((artifact) => artifact.type === "manifest");

  return {
    rootPath,
    artifacts,
    isPack: artifacts.some((artifact) => artifact.type !== "manifest"),
    manifestPath: manifest?.absolutePath,
  };
}

export async function detectMacOsJunk(rootPath: string): Promise<string[]> {
  const junk = await fg(["**/.DS_Store", "**/._*", "**/__MACOSX/**"], {
    cwd: rootPath,
    dot: true,
    onlyFiles: false,
  });

  return junk.map((entry) => toPosixPath(entry));
}
