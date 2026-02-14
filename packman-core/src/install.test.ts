import path from "node:path";
import { mkdtemp, mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { installPack, installPacks, rollbackInstall } from "./install.js";

describe("installPack collisions", () => {
  it("auto-enables suite handling for single-pack suite-owned files", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github"), { recursive: true });
    await writeFile(
      path.join(source, ".github", "copilot-instructions.md"),
      "# Always-on instructions\n",
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
    });

    expect(result.ok).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "SUITE_ONLY_FILE"),
    ).toBe(false);

    const written = await readFile(
      path.join(target, ".github", "copilot-instructions.md"),
      "utf8",
    );
    expect(written).toContain("Always-on instructions");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

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

  it("fails installPacks when source set has duplicate prompt names", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    const packA = path.join(source, "pack-a");
    const packB = path.join(source, "pack-b");
    await mkdir(path.join(packA, ".github/prompts"), { recursive: true });
    await mkdir(path.join(packB, ".github/prompts"), { recursive: true });

    await writeFile(
      path.join(packA, ".github/prompts", "one.prompt.md"),
      `---\nname: brief:shared\ndescription: a\n---\nA\n`,
      "utf8",
    );
    await writeFile(
      path.join(packB, ".github/prompts", "two.prompt.md"),
      `---\nname: brief:shared\ndescription: b\n---\nB\n`,
      "utf8",
    );

    const result = await installPacks(source, {
      targetPath: target,
      targetType: "workspace",
      dryRun: true,
      suite: false,
    });

    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.code === "PROMPT_NAME_DUPLICATE_SOURCE_SET",
      ),
    ).toBe(true);

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("auto-resolves duplicate suite prompt names when suite-harmoniser is present", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    const packA = path.join(source, "copilot-prompt-library-pack");
    const harmoniser = path.join(source, "copilot-suite-harmoniser-pack");
    await mkdir(path.join(packA, ".github/prompts/suite"), { recursive: true });
    await mkdir(path.join(harmoniser, ".github/prompts/suite"), {
      recursive: true,
    });

    await writeFile(
      path.join(packA, ".github/prompts/suite", "suite:route.prompt.md"),
      `---\nname: suite:route\ndescription: library\n---\nfrom-library\n`,
      "utf8",
    );
    await writeFile(
      path.join(harmoniser, ".github/prompts/suite", "suite:route.prompt.md"),
      `---\nname: suite:route\ndescription: harmoniser\n---\nfrom-harmoniser\n`,
      "utf8",
    );

    const result = await installPacks(source, {
      targetPath: target,
      targetType: "workspace",
      collisionStrategy: "fail",
      suite: true,
    });

    expect(result.ok).toBe(true);
    expect(
      result.issues.some(
        (issue) => issue.code === "PROMPT_NAME_DUPLICATE_AUTO_RESOLVED",
      ),
    ).toBe(true);
    expect(
      result.issues.some(
        (issue) => issue.code === "PROMPT_NAME_DUPLICATE_SOURCE_SET",
      ),
    ).toBe(false);

    const installed = await readFile(
      path.join(target, ".github/prompts/suite", "suite:route.prompt.md"),
      "utf8",
    );
    expect(installed).toContain("from-harmoniser");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("fails installPacks when multiple suite owners without suite harmoniser", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    const packA = path.join(source, "pack-a");
    const packB = path.join(source, "pack-b");
    await mkdir(path.join(packA, ".github/prompts"), { recursive: true });
    await mkdir(path.join(packB, ".github/prompts"), { recursive: true });

    await writeFile(
      path.join(packA, ".github/copilot-instructions.md"),
      "instructions a\n",
      "utf8",
    );
    await writeFile(
      path.join(packB, ".github/copilot-instructions.md"),
      "instructions b\n",
      "utf8",
    );
    await writeFile(
      path.join(packA, ".github/prompts", "a.prompt.md"),
      `---\nname: brief:a\ndescription: a\n---\nA\n`,
      "utf8",
    );
    await writeFile(
      path.join(packB, ".github/prompts", "b.prompt.md"),
      `---\nname: brief:b\ndescription: b\n---\nB\n`,
      "utf8",
    );

    const result = await installPacks(source, {
      targetPath: target,
      targetType: "workspace",
      dryRun: true,
      suite: true,
    });

    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.code === "SUITE_OWNER_COLLISION"),
    ).toBe(true);

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("restores files from backup using rollbackInstall", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".github/prompts"), { recursive: true });
    await mkdir(path.join(target, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(source, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:source\ndescription: source\n---\nSource\n`,
      "utf8",
    );
    await writeFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:target\ndescription: target\n---\nTarget\n`,
      "utf8",
    );

    const installResult = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
      collisionStrategy: "overwrite",
    });

    expect(installResult.ok).toBe(true);
    expect(installResult.backupZipPath).toBeTruthy();

    const overwritten = await readFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      "utf8",
    );
    expect(overwritten).toContain("Source");

    const rollbackResult = await rollbackInstall(
      target,
      installResult.backupZipPath as string,
    );
    expect(rollbackResult.ok).toBe(true);

    const restored = await readFile(
      path.join(target, ".github/prompts", "brief.prompt.md"),
      "utf8",
    );
    expect(restored).toContain("Target");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });

  it("installs MCP config, hook config, and skill resources", async () => {
    const source = await mkdtemp(
      path.join(tmpdir(), "packman-install-source-"),
    );
    const target = await mkdtemp(
      path.join(tmpdir(), "packman-install-target-"),
    );

    await mkdir(path.join(source, ".vscode"), { recursive: true });
    await mkdir(path.join(source, ".github/hooks"), { recursive: true });
    await mkdir(path.join(source, ".github/skills/release-check/examples"), {
      recursive: true,
    });

    await writeFile(
      path.join(source, ".vscode", "mcp.json"),
      JSON.stringify(
        { servers: { github: { type: "stdio", command: "npx" } } },
        null,
        2,
      ),
      "utf8",
    );
    await writeFile(
      path.join(source, ".github/hooks", "post-tool-use.json"),
      JSON.stringify({ hooks: { PostToolUse: [] } }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(source, ".github/skills/release-check", "SKILL.md"),
      `---\nname: release-check\ndescription: validate release readiness\n---\nBody\n`,
      "utf8",
    );
    await writeFile(
      path.join(source, ".github/skills/release-check/examples", "sample.txt"),
      "example",
      "utf8",
    );

    const result = await installPack(source, {
      targetPath: target,
      targetType: "workspace",
    });

    expect(result.ok).toBe(true);

    const mcp = await readFile(
      path.join(target, ".vscode", "mcp.json"),
      "utf8",
    );
    const hook = await readFile(
      path.join(target, ".github/hooks", "post-tool-use.json"),
      "utf8",
    );
    const skillResource = await readFile(
      path.join(target, ".github/skills/release-check/examples", "sample.txt"),
      "utf8",
    );

    expect(mcp).toContain("github");
    expect(hook).toContain("PostToolUse");
    expect(skillResource).toContain("example");

    await rm(source, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  });
});
