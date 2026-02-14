import path from "node:path";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  analyzeRepo,
  applyMigration,
  planMigration,
} from "./migration.js";

describe("migration APIs", () => {
  it("analyzes and plans migration outputs", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-migration-"));
    await mkdir(path.join(root, "agents"), { recursive: true });
    await writeFile(
      path.join(root, "agents", "ops.agent.md"),
      `---\nname: ops\ndescription: desc\n---\n- step one\n- step two\n- step three\n\n## Definition of Done\nAlways-on\n---\nname: duplicate\n---\n`,
      "utf8",
    );

    const findings = await analyzeRepo(root);
    expect(findings.length).toBeGreaterThan(0);

    const plan = planMigration(findings);
    expect(plan.reorgPlanMarkdown).toContain("# REORG_PLAN");
    expect(plan.migrationMapCsv).toContain("old_path,new_path,action,notes");

    const dryRun = await applyMigration(plan, {
      rootPath: root,
      dryRun: true,
      backup: true,
    });
    expect(dryRun.dryRun).toBe(true);
    expect(dryRun.filesWritten).toEqual([]);

    const applied = await applyMigration(plan, {
      rootPath: root,
      dryRun: false,
      backup: true,
    });
    expect(applied.ok).toBe(true);
    expect(applied.filesWritten).toEqual(["REORG_PLAN.md", "MIGRATION_MAP.csv"]);
    expect(applied.backupPath).toBeDefined();

    await rm(root, { recursive: true, force: true });
  });
});
