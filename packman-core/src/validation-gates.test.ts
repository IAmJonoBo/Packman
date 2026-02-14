import { describe, expect, it } from "vitest";
import { buildProfile, buildWorkspace } from "./build.js";
import { evaluateValidationGates, renderValidationReport } from "./validation-gates.js";
import type { RegistryGraph } from "./types.js";

function makeGraph(): RegistryGraph {
  return {
    rootPath: "repo",
    items: [
      {
        type: "agent",
        sourcePath: "agents/a.agent.md",
        name: "a",
        frontmatter: { name: "a", description: "desc" },
      },
      {
        type: "prompt",
        sourcePath: "prompts/p.prompt.md",
        name: "p",
        frontmatter: { name: "p", description: "desc" },
      },
      {
        type: "instruction",
        sourcePath: "instructions/01.instructions.md",
        name: "i",
        frontmatter: { name: "i", description: "desc", applyTo: "**/*" },
      },
    ],
    skills: [
      {
        name: "qa",
        rootPath: "skills/qa",
        skillPath: "skills/qa/SKILL.md",
        assetPaths: [],
      },
    ],
    collections: [],
    plugins: {
      id: "plugins",
      name: "Plugins",
      maturity: "stable",
      tags: ["meta", "plugin"],
      intendedStacks: ["github-copilot"],
      packRoots: [],
      collections: [],
    },
    issues: [],
  };
}

describe("validation gates", () => {
  it("passes all gates for valid registry/manifests", () => {
    const graph = makeGraph();
    const manifests = [buildWorkspace(graph), buildProfile(graph)];
    const report = evaluateValidationGates(graph, manifests);
    expect(report.ok).toBe(true);
    const markdown = renderValidationReport(report, manifests);
    expect(markdown).toContain("# VALIDATION_REPORT");
    expect(markdown).toContain("Overall: PASS");
  });

  it("fails gates on collisions and malformed items", () => {
    const graph = makeGraph();
    graph.items.push({
      type: "agent",
      sourcePath: "agents/a.agent.md",
      name: "dup",
      frontmatter: { name: "dup", description: "desc" },
    });
    graph.items.push({
      type: "prompt",
      sourcePath: "prompts/bad.md",
      name: "bad",
    });

    const manifests = [buildWorkspace(graph, { collisionPolicy: "error" })];
    const report = evaluateValidationGates(graph, manifests);
    expect(report.ok).toBe(false);
    expect(report.gates.find((gate) => gate.id === "gate2")?.pass).toBe(false);
    expect(report.gates.find((gate) => gate.id === "gate4")?.pass).toBe(false);
  });
});
