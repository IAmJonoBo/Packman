import type { Artifact, ParsedArtifact } from "./types.js";
import { parseFrontmatter } from "./frontmatter.js";
import { readText } from "./fs-utils.js";

const FRONTMATTER_TYPES: Artifact["type"][] = [
  "prompt",
  "instruction",
  "agent",
  "skill",
];

export async function parseArtifacts(
  artifacts: Artifact[],
): Promise<ParsedArtifact[]> {
  const parsed: ParsedArtifact[] = [];

  for (const artifact of artifacts) {
    const shouldParseFrontmatter =
      FRONTMATTER_TYPES.includes(artifact.type) ||
      (artifact.type === "alwaysOnInstruction" &&
        (artifact.relativePath === "AGENTS.md" ||
          artifact.relativePath === "CLAUDE.md" ||
          artifact.relativePath === "CLAUDE.local.md" ||
          artifact.relativePath === ".claude/CLAUDE.md"));

    if (!shouldParseFrontmatter) {
      parsed.push({ ...artifact });
      continue;
    }

    const raw = await readText(artifact.absolutePath);
    const fm = parseFrontmatter(raw);

    parsed.push({
      ...artifact,
      frontmatter: fm.frontmatter,
      body: fm.body,
      raw: fm.raw,
      parseError: fm.parseError,
    });
  }

  return parsed;
}
