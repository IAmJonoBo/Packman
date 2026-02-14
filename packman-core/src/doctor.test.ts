import path from "node:path";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { doctorTarget } from "./doctor.js";

describe("doctorTarget", () => {
  it("flags duplicate prompt names", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-doctor-"));
    await mkdir(path.join(root, ".github/prompts/a"), { recursive: true });
    await mkdir(path.join(root, ".github/prompts/b"), { recursive: true });

    const prompt = `---\nname: qa:shared\ndescription: duplicate\n---\nBody\n`;
    await writeFile(
      path.join(root, ".github/prompts/a/one.prompt.md"),
      prompt,
      "utf8",
    );
    await writeFile(
      path.join(root, ".github/prompts/b/two.prompt.md"),
      prompt,
      "utf8",
    );

    const result = await doctorTarget(root);
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.code === "PROMPT_DUPLICATE_NAME"),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });

  it("detects expanded suite-owned files", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-doctor-"));
    await mkdir(path.join(root, ".github/hooks"), { recursive: true });
    await mkdir(path.join(root, ".vscode"), { recursive: true });
    await writeFile(path.join(root, "AGENTS.md"), "# AGENTS\n", "utf8");
    await writeFile(
      path.join(root, ".github/hooks", "post-tool-use.json"),
      JSON.stringify({ hooks: {} }, null, 2),
      "utf8",
    );
    await writeFile(
      path.join(root, ".vscode", "mcp.json"),
      JSON.stringify({ servers: {} }, null, 2),
      "utf8",
    );

    const result = await doctorTarget(root);
    const suiteInfos = result.issues.filter(
      (issue) => issue.code === "SUITE_OWNED_PRESENT",
    );

    expect(suiteInfos.length).toBeGreaterThanOrEqual(3);
    expect(suiteInfos.some((issue) => issue.path === "AGENTS.md")).toBe(true);
    expect(suiteInfos.some((issue) => issue.path === ".vscode/mcp.json")).toBe(
      true,
    );
    expect(suiteInfos.some((issue) => issue.path === ".github/hooks")).toBe(
      true,
    );

    await rm(root, { recursive: true, force: true });
  });
});
