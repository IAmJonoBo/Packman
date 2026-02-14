import { describe, expect, it } from "vitest";
import { buildCollection, buildProfile, buildWorkspace } from "./build.js";
import type { RegistryGraph } from "./types.js";

function makeGraph(): RegistryGraph {
  return {
    rootPath: "repo",
    items: [
      {
        type: "prompt",
        sourcePath: "prompts/a.prompt.md",
        name: "a",
      },
      {
        type: "agent",
        sourcePath: "agents/z.agent.md",
        name: "z",
      },
      {
        type: "instruction",
        sourcePath: "instructions/01-core.instructions.md",
        name: "core",
      },
      {
        type: "copilotInstructions",
        sourcePath: "instructions/copilot-instructions.md",
        name: "copilot-instructions",
      },
    ],
    skills: [
      {
        name: "quality",
        rootPath: "skills/quality",
        skillPath: "skills/quality/SKILL.md",
        assetPaths: ["skills/quality/templates/checklist.md"],
      },
    ],
    collections: [
      {
        id: "gold",
        name: "Gold",
        maturity: "stable",
        tags: ["curated"],
        intendedStacks: ["github-copilot"],
        packRoots: ["Packs/copilot-ux-agent-pack"],
        collections: [],
      },
    ],
    plugins: {
      id: "plugins",
      name: "Plugins",
      maturity: "stable",
      tags: ["meta", "plugin"],
      intendedStacks: ["github-copilot"],
      packRoots: ["Packs/copilot-ux-agent-pack"],
      collections: ["gold"],
    },
    issues: [],
  };
}

describe("export manifest builders", () => {
  it("builds workspace manifest shape", () => {
    const manifest = buildWorkspace(makeGraph());
    expect(manifest.target).toBe("workspace");
    expect(manifest.entries.map((entry) => entry.targetPath)).toEqual([
      ".github/agents/z.agent.md",
      ".github/copilot-instructions.md",
      ".github/instructions/01-core.instructions.md",
      ".github/prompts/a.prompt.md",
      ".github/skills/quality/SKILL.md",
      ".github/skills/quality/templates/checklist.md",
    ]);
    expect(manifest.collisions).toEqual([]);
  });

  it("builds profile manifest shape", () => {
    const manifest = buildProfile(makeGraph());
    expect(manifest.target).toBe("profile");
    expect(manifest.entries.map((entry) => entry.targetPath)).toEqual([
      "agents/z.agent.md",
      "instructions/01-core.instructions.md",
      "instructions/copilot-instructions.md",
      "prompts/a.prompt.md",
      "skills/quality/SKILL.md",
      "skills/quality/templates/checklist.md",
    ]);
  });

  it("supports excluding copilot instructions", () => {
    const manifest = buildWorkspace(makeGraph(), {
      includeCopilotInstructions: false,
    });

    expect(
      manifest.entries.some(
        (entry) => entry.targetPath === ".github/copilot-instructions.md",
      ),
    ).toBe(false);
  });

  it("reports collection not found", () => {
    const manifest = buildCollection(makeGraph(), "missing", "workspace");
    expect(manifest.entries).toEqual([]);
    expect(
      manifest.collisions.some((issue) => issue.code === "COLLECTION_NOT_FOUND"),
    ).toBe(true);
  });

  it("uses deterministic collision handling", () => {
    const graph = makeGraph();
    graph.items.push({
      type: "agent",
      sourcePath: "agents/z.agent.md",
      name: "z-duplicate",
    });

    const errorManifest = buildWorkspace(graph, { collisionPolicy: "error" });
    expect(
      errorManifest.collisions.some(
        (issue) => issue.code === "EXPORT_TARGET_COLLISION",
      ),
    ).toBe(true);

    const firstManifest = buildWorkspace(graph, { collisionPolicy: "first" });
    expect(firstManifest.entries.filter((entry) => entry.targetPath === ".github/agents/z.agent.md")).toHaveLength(1);

    const lastManifest = buildWorkspace(graph, { collisionPolicy: "last" });
    expect(lastManifest.entries.filter((entry) => entry.targetPath === ".github/agents/z.agent.md")).toHaveLength(1);
  });
});
