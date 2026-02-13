import path from "node:path";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { installPack } from "./install.js";

describe("installPack collisions", () => {
  it("returns install plan with collisions on dry-run", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(source, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:source\ndescription: source\n---\nSource\n`,
      "utf8",
    );

    await mkdir(path.join(target, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:target\ndescription: target\n---\nTarget\n`,
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
      dryRun: true,
      collisionStrategy: "fail",
    });

    expect(result.ok).toBe(true);
    expect(result.plans?.length).toBe(1);
    expect(result.plans?.[0]?.collisions.length).toBe(1);
    expect(
      result.plans?.[0]?.operations.some(
        (operation) =>
          operation.relativePath === ".github/prompts/brief.prompt.md",
      ),
    ).toBe(true);

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("fails by default on collisions", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(source, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:source\ndescription: source\n---\nSource\n`,
      "utf8",
    );

    await mkdir(path.join(target, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:target\ndescription: target\n---\nTarget\n`,
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
    });
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.code === "COLLISION_FAILSAFE"),
    ).toBe(true);

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("skips on collision when configured", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(source, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:source\ndescription: source\n---\nSource\n`,
      "utf8",
    );

    await mkdir(path.join(target, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:target\ndescription: target\n---\nTarget\n`,
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
      collisionStrategy: "skip",
    });

    expect(result.ok).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "COLLISION_SKIPPED"),
    ).toBe(true);
    const content = await readFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      "utf8",
    );
    expect(content).toContain("Target");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("overwrites on collision when configured", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(source, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:source\ndescription: source\n---\nSource\n`,
      "utf8",
    );

    await mkdir(path.join(target, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:target\ndescription: target\n---\nTarget\n`,
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
      collisionStrategy: "overwrite",
    });

    expect(result.ok).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "COLLISION_OVERWRITTEN"),
    ).toBe(true);
    const content = await readFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      "utf8",
    );
    expect(content).toContain("Source");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("renames incoming file on collision when configured", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(source, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:source\ndescription: source\n---\nSource\n`,
      "utf8",
    );

    await mkdir(path.join(target, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:target\ndescription: target\n---\nTarget\n`,
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
      collisionStrategy: "rename",
    });

    expect(result.ok).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "COLLISION_RENAMED"),
    ).toBe(true);
    const original = await readFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      "utf8",
    );
    const renamed = await readFile(
      path.join(target, ".github/prompts", "brief-incoming.prompt.md"),
      "utf8",
    );
    expect(original).toContain("Target");
    expect(renamed).toContain("Source");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("applies per-file collision decision overrides", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(source, ".github/prompts", "brief-overview.prompt.md"),
      `---\nname: brief:source\ndescription: source\n---\nSource\n`,
      "utf8",
    );

    await mkdir(path.join(target, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(target, ".github/prompts", "brief-overview.prompt.md"),
      `---\nname: brief:target\ndescription: target\n---\nTarget\n`,
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
      collisionStrategy: "fail",
      collisionDecisions: {
        ".github/prompts/brief-overview.prompt.md": "rename",
      },
    });

    expect(result.ok).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "COLLISION_RENAMED"),
    ).toBe(true);
    const renamed = await readFile(
      path.join(target, ".github/prompts", "brief-overview-incoming.prompt.md"),
      "utf8",
    );
    expect(renamed).toContain("Source");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });
});
