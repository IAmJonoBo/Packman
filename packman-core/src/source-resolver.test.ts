import path from "node:path";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { resolvePackRoots } from "./source-resolver.js";

describe("resolvePackRoots", () => {
  it("discovers pack roots recursively from a broad source folder", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-resolve-source-"),
    );
    const nestedPackA = path.join(source, "Packs", "copilot-a-pack");
    const nestedPackB = path.join(source, "Packs", "copilot-b-pack");

    await mkdir(path.join(nestedPackA, ".github", "prompts"), {
      recursive: true,
    });
    await mkdir(path.join(nestedPackB, ".github", "instructions"), {
      recursive: true,
    });

    await writeFile(
      path.join(nestedPackA, ".github", "prompts", "a.prompt.md"),
      `---\nname: brief:a\ndescription: a\n---\nA\n`,
      "utf8",
    );
    await writeFile(
      path.join(nestedPackB, ".github", "instructions", "b.instructions.md"),
      `---\nname: b\ndescription: b\napplyTo: "**"\n---\nB\n`,
      "utf8",
    );

    const roots = await resolvePackRoots(source);
    expect(roots).toContain(nestedPackA);
    expect(roots).toContain(nestedPackB);

    await rm(source, { recursive: true, force: true });
  });
});
