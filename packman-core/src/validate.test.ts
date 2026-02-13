import path from "node:path";
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
});
