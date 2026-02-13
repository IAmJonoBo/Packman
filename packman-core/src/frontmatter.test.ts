import { describe, expect, it } from "vitest";
import { parseFrontmatter } from "./frontmatter.js";

describe("parseFrontmatter", () => {
  it("parses yaml frontmatter", () => {
    const raw = `---\nname: brief:test\ndescription: Test\ntools:\n  - read_file\n---\nHello`;
    const parsed = parseFrontmatter(raw);

    expect(parsed.frontmatter.name).toBe("brief:test");
    expect(parsed.frontmatter.description).toBe("Test");
    expect(parsed.body.trim()).toBe("Hello");
  });

  it("captures parse errors for invalid yaml", () => {
    const raw = `---\ndescription: Invalid: YAML\n---\nHello`;
    const parsed = parseFrontmatter(raw);

    expect(parsed.parseError).toBeTruthy();
    expect(parsed.frontmatter).toEqual({});
  });
});
