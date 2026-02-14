import path from "node:path";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { normalizePack } from "./normalize.js";
import { readJson } from "./fs-utils.js";

describe("normalizePack", () => {
  it("generates README and manifest when missing", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-normalize-"));
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "My Prompt.prompt.md"),
      `---\nname: customPrompt\ndescription: desc\n---\nBody\n`,
      "utf8",
    );

    const preview = await normalizePack(root, { apply: false });
    expect(
      preview.changes.some((change) => change.toPath.endsWith("README.md")),
    ).toBe(true);
    expect(
      preview.changes.some((change) =>
        change.toPath.endsWith("PACK_MANIFEST.json"),
      ),
    ).toBe(true);
    expect(
      preview.changes.some((change) =>
        change.toPath.endsWith("my-prompt.prompt.md"),
      ),
    ).toBe(true);
    expect(
      preview.changes.some((change) =>
        change.toPath.endsWith("my-prompt-prompt.md"),
      ),
    ).toBe(false);

    const applied = await normalizePack(root, { apply: true });
    expect(applied.ok).toBe(true);

    await rm(root, { recursive: true, force: true });
  });

  it("does not warn for supported non-legacy prompt namespaces", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-normalize-"));
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "route.prompt.md"),
      `---\nname: suite:route\ndescription: desc\n---\nBody\n`,
      "utf8",
    );

    const result = await normalizePack(root, {
      apply: false,
      autoPrefixNamespaces: true,
    });
    expect(
      result.issues.some((issue) => issue.code === "PROMPT_NAMESPACE"),
    ).toBe(false);

    await rm(root, { recursive: true, force: true });
  });

  it("infers suite intended_install and suite owned paths when creating manifest", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-normalize-"));
    await mkdir(path.join(root, ".github/hooks"), { recursive: true });
    await writeFile(
      path.join(root, ".github/hooks", "pre-install.json"),
      JSON.stringify({ hooks: [] }, null, 2),
      "utf8",
    );

    await normalizePack(root, { apply: true });
    const manifest = await readJson<Record<string, unknown>>(
      path.join(root, "PACK_MANIFEST.json"),
    );

    expect(manifest?.intended_install).toBe("suite");
    expect(Array.isArray(manifest?.owned_paths)).toBe(true);
    expect((manifest?.owned_paths as string[]).includes(".github/hooks")).toBe(
      true,
    );

    await rm(root, { recursive: true, force: true });
  });

  it("autofills missing manifest contract fields for existing manifest", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-normalize-"));
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:hello\ndescription: desc\n---\nBody\n`,
      "utf8",
    );
    await writeFile(
      path.join(root, "PACK_MANIFEST.json"),
      JSON.stringify(
        {
          id: "sample-pack",
          name: "Sample Pack",
          version: "1.0.0",
          commands: ["validate"],
        },
        null,
        2,
      ),
      "utf8",
    );

    const preview = await normalizePack(root, { apply: false });
    expect(
      preview.changes.some(
        (change) =>
          change.action === "update" &&
          change.toPath.endsWith("PACK_MANIFEST.json"),
      ),
    ).toBe(true);

    await normalizePack(root, { apply: true });
    const manifest = await readJson<Record<string, unknown>>(
      path.join(root, "PACK_MANIFEST.json"),
    );

    expect(manifest?.intended_install).toBe("solo");
    expect(Array.isArray(manifest?.owned_paths)).toBe(true);
    expect(
      (manifest?.owned_paths as string[]).includes(".github/prompts"),
    ).toBe(true);
    expect(
      (manifest?.commands as string[] | undefined)?.includes("validate"),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });
});
