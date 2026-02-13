import path from "node:path";
import fg from "fast-glob";
import type { Artifact, PackDetection } from "./types.js";
import { toPosixPath } from "./fs-utils.js";

const DETECTION_PATTERNS: Array<{ type: Artifact["type"]; pattern: string }> = [
  { type: "agent", pattern: ".github/agents/**/*.agent.md" },
  { type: "prompt", pattern: ".github/prompts/**/*.prompt.md" },
  { type: "instruction", pattern: ".github/instructions/**/*.instructions.md" },
  { type: "skill", pattern: ".github/skills/**/SKILL.md" },
  { type: "copilotInstructions", pattern: ".github/copilot-instructions.md" },
  { type: "settings", pattern: ".vscode/settings.json" },
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
