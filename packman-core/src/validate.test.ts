import path from "node:path";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { validatePack } from "./validate.js";

const fixturesRoot = path.resolve(process.cwd(), "..", "fixtures", "packs");

describe("validatePack", () => {
  it("passes valid fixture", async () => {
    const result = await validatePack(path.join(fixturesRoot, "good-minimal"), {
      strict: true,
      suiteMode: false,
    });
    expect(result.ok).toBe(true);
  });

  it("fails prompt missing frontmatter", async () => {
    const result = await validatePack(
      path.join(fixturesRoot, "bad-missing-frontmatter"),
      { strict: true },
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.code === "FRONTMATTER_REQUIRED"),
    ).toBe(true);
  });

  it("detects target prompt collision", async () => {
    const result = await validatePack(path.join(fixturesRoot, "collision-a"), {
      targetPathForCollisionScan: path.join(fixturesRoot, "collision-b"),
      strict: true,
    });
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.code === "PROMPT_NAME_DUPLICATE_TARGET",
      ),
    ).toBe(true);
  });

  it("fails strict validation for unknown handoff agent", async () => {
    const result = await validatePack(
      path.join(fixturesRoot, "bad-unknown-subagent"),
      { strict: true },
    );
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.code === "AGENT_HANDOFF_UNKNOWN"),
    ).toBe(true);
  });

  it("allows unknown handoff when explicitly allowlisted", async () => {
    const result = await validatePack(
      path.join(fixturesRoot, "bad-unknown-subagent"),
      {
        strict: true,
        allowedSubagents: ["UXResearcher"],
      },
    );
    expect(result.ok).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "AGENT_HANDOFF_UNKNOWN"),
    ).toBe(false);
  });

  it("accepts pack-local handoff agent references", async () => {
    const result = await validatePack(
      path.resolve(process.cwd(), "..", "Packs", "copilot-ux-agent-pack"),
      {
        strict: true,
        suiteMode: true,
      },
    );
    expect(
      result.issues.some((issue) => issue.code === "AGENT_HANDOFF_UNKNOWN"),
    ).toBe(false);
  });

  it("fails strict mode when manifest command has no matching prompt", async () => {
    const root = await mkdtemp(
      path.join(tmpdir(), "packman-validate-manifest-"),
    );
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:project-overview\ndescription: desc\n---\nBody\n`,
      "utf8",
    );
    await writeFile(
      path.join(root, "PACK_MANIFEST.json"),
      JSON.stringify({ commands: ["missing-command"] }, null, 2),
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: false });
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.code === "MANIFEST_COMMAND_MISSING_PROMPT",
      ),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });

  it("accepts manifest command matching prompt without namespace", async () => {
    const root = await mkdtemp(
      path.join(tmpdir(), "packman-validate-manifest-"),
    );
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:planning-brief\ndescription: desc\n---\nBody\n`,
      "utf8",
    );
    await writeFile(
      path.join(root, "PACK_MANIFEST.json"),
      JSON.stringify({ commands: ["planning-brief"] }, null, 2),
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: false });
    expect(
      result.issues.some(
        (issue) => issue.code === "MANIFEST_COMMAND_MISSING_PROMPT",
      ),
    ).toBe(false);

    await rm(root, { recursive: true, force: true });
  });

  it("accepts Claude rules without explicit paths", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-validate-claude-"));
    await mkdir(path.join(root, ".claude/rules"), { recursive: true });
    await writeFile(
      path.join(root, ".claude/rules", "general.md"),
      `---\nname: Claude rules\ndescription: defaults\n---\nBody\n`,
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: false });
    expect(result.ok).toBe(true);
    expect(
      result.issues.some((issue) => issue.code === "CLAUDE_RULE_PATHS_INVALID"),
    ).toBe(false);

    await rm(root, { recursive: true, force: true });
  });

  it("fails Claude rules when paths is invalid", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "packman-validate-claude-"));
    await mkdir(path.join(root, ".claude/rules"), { recursive: true });
    await writeFile(
      path.join(root, ".claude/rules", "general.md"),
      `---\nname: Claude rules\ndescription: invalid\npaths: \"**/*.py\"\n---\nBody\n`,
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: false });
    expect(result.ok).toBe(false);
    expect(
      result.issues.some((issue) => issue.code === "CLAUDE_RULE_PATHS_INVALID"),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });

  it("errors when manifest owned_paths does not cover detected artifacts", async () => {
    const root = await mkdtemp(
      path.join(tmpdir(), "packman-validate-manifest-"),
    );
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:covered\ndescription: desc\n---\nBody\n`,
      "utf8",
    );
    await writeFile(
      path.join(root, "PACK_MANIFEST.json"),
      JSON.stringify(
        {
          intended_install: "solo|suite",
          owned_paths: [".github/agents"],
          commands: ["brief:covered"],
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: false });
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.code === "MANIFEST_OWNED_PATHS_COVERAGE",
      ),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });

  it("errors when intended_install is solo but suite-owned paths exist", async () => {
    const root = await mkdtemp(
      path.join(tmpdir(), "packman-validate-manifest-"),
    );
    await mkdir(path.join(root, ".github"), { recursive: true });
    await writeFile(
      path.join(root, ".github", "copilot-instructions.md"),
      "# instructions\n",
      "utf8",
    );
    await writeFile(
      path.join(root, "PACK_MANIFEST.json"),
      JSON.stringify(
        {
          intended_install: "solo",
          owned_paths: [".github/copilot-instructions.md"],
          commands: [],
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: true });
    expect(result.ok).toBe(false);
    expect(
      result.issues.some(
        (issue) => issue.code === "MANIFEST_INTENT_PATH_CONFLICT",
      ),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });

  it("warns when intended_install is suite but no suite-owned paths exist", async () => {
    const root = await mkdtemp(
      path.join(tmpdir(), "packman-validate-manifest-"),
    );
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:covered\ndescription: desc\n---\nBody\n`,
      "utf8",
    );
    await writeFile(
      path.join(root, "PACK_MANIFEST.json"),
      JSON.stringify(
        {
          intended_install: "suite",
          owned_paths: [".github/prompts"],
          commands: ["brief:covered"],
        },
        null,
        2,
      ),
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: true });
    expect(
      result.issues.some(
        (issue) => issue.code === "MANIFEST_INTENT_NO_SUITE_PATHS",
      ),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });

  it("warns in strict mode when manifest omits intended_install and owned_paths", async () => {
    const root = await mkdtemp(
      path.join(tmpdir(), "packman-validate-manifest-"),
    );
    await mkdir(path.join(root, ".github/prompts"), { recursive: true });
    await writeFile(
      path.join(root, ".github/prompts", "brief.prompt.md"),
      `---\nname: brief:covered\ndescription: desc\n---\nBody\n`,
      "utf8",
    );
    await writeFile(
      path.join(root, "PACK_MANIFEST.json"),
      JSON.stringify({ commands: ["brief:covered"] }, null, 2),
      "utf8",
    );

    const result = await validatePack(root, { strict: true, suiteMode: false });
    expect(
      result.issues.some(
        (issue) => issue.code === "MANIFEST_INTENDED_INSTALL_RECOMMENDED",
      ),
    ).toBe(true);
    expect(
      result.issues.some(
        (issue) => issue.code === "MANIFEST_OWNED_PATHS_RECOMMENDED",
      ),
    ).toBe(true);

    await rm(root, { recursive: true, force: true });
  });
});
