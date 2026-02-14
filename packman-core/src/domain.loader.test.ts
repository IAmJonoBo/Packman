import path from "node:path";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { loadRegistryGraph, validateCollectionSchema } from "./domain/loader.js";

describe("domain loader", () => {
  it("validates collection schema", () => {
    const result = validateCollectionSchema(
      {
        id: "design-suite",
        packRoots: ["Packs/copilot-ux-agent-pack"],
      },
      "collections/design-suite/collection.json",
    );

    expect(result.ok).toBe(true);
    expect(result.collection?.id).toBe("design-suite");
  });

  it("fails collection schema without required fields", () => {
    const result = validateCollectionSchema(
      {
        name: "Broken",
      },
      "collections/broken/collection.json",
    );

    expect(result.ok).toBe(false);
    expect(
      result.issues.some((entry) => entry.code === "COLLECTION_ID_REQUIRED"),
    ).toBe(true);
    expect(
      result.issues.some(
        (entry) => entry.code === "COLLECTION_PACKROOTS_REQUIRED",
      ),
    ).toBe(true);
  });

  it("loads canonical layout with collections fallback and generated plugins graph", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-domain-canonical-"));

    await mkdir(path.join(root, "agents"), { recursive: true });
    await writeFile(
      path.join(root, "agents", "ux.agent.md"),
      `---\nname: UX Agent\ndescription: desc\n---\nBody\n`,
      "utf8",
    );

    await mkdir(path.join(root, "prompts"), { recursive: true });
    await writeFile(
      path.join(root, "prompts", "flow.prompt.md"),
      `---\nname: flow:run\ndescription: desc\nagent: UX Agent\n---\nBody\n`,
      "utf8",
    );

    await mkdir(path.join(root, "instructions"), { recursive: true });
    await writeFile(
      path.join(root, "instructions", "01-core.instructions.md"),
      `---\nname: Core\ndescription: desc\napplyTo: **/*\n---\nBody\n`,
      "utf8",
    );

    await mkdir(path.join(root, "skills", "qa"), { recursive: true });
    await writeFile(
      path.join(root, "skills", "qa", "SKILL.md"),
      `---\nname: qa\ndescription: desc\n---\nBody\n`,
      "utf8",
    );

    await mkdir(path.join(root, "collections", "gold"), { recursive: true });
    await writeFile(
      path.join(root, "collections", "gold", "collection.json"),
      JSON.stringify(
        {
          id: "gold",
          name: "Gold",
          packRoots: ["Packs/copilot-ux-agent-pack"],
        },
        null,
        2,
      ),
      "utf8",
    );

    await mkdir(path.join(root, "collections", "legacy"), { recursive: true });
    await writeFile(
      path.join(root, "collections", "legacy", "packs.txt"),
      "Packs/copilot-quality-engineer-pack\n",
      "utf8",
    );

    const graph = await loadRegistryGraph(root, {
      layout: "canonical",
      strictCollections: true,
    });

    expect(graph.items.some((item) => item.type === "agent")).toBe(true);
    expect(graph.skills).toHaveLength(1);
    expect(graph.collections.map((entry) => entry.id)).toEqual([
      "gold",
      "legacy",
    ]);
    expect(graph.plugins.id).toBe("plugins");
    expect(graph.plugins.collections).toEqual(["gold", "legacy"]);
    expect(graph.plugins.packRoots).toEqual([
      "Packs/copilot-quality-engineer-pack",
      "Packs/copilot-ux-agent-pack",
    ]);

    await rm(root, { recursive: true, force: true });
  });

  it("loads workspace layout without collection scanning", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-domain-workspace-"));

    await mkdir(path.join(root, ".github", "agents"), { recursive: true });
    await writeFile(
      path.join(root, ".github", "agents", "ops.agent.md"),
      `---\nname: Ops\ndescription: desc\n---\nBody\n`,
      "utf8",
    );

    await mkdir(path.join(root, ".github", "prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github", "prompts", "ops.prompt.md"),
      `---\nname: ops:triage\ndescription: desc\n---\nBody\n`,
      "utf8",
    );

    const graph = await loadRegistryGraph(root, {
      layout: "workspace",
    });

    expect(graph.collections).toEqual([]);
    expect(graph.plugins.packRoots).toEqual([]);
    expect(graph.items.map((item) => item.type)).toEqual(["agent", "prompt"]);

    await rm(root, { recursive: true, force: true });
  });
});
