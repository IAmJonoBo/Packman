import path from "node:path";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { normalizePack } from "./normalize.js";

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
});
