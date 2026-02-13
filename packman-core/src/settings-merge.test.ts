import { describe, expect, it } from "vitest";
import { mergeSettings, minimalReadinessPatch } from "./settings-merge.js";

describe("mergeSettings", () => {
  it("unions chat location arrays and preserves unrelated keys", () => {
    const base = {
      "chat.promptFilesLocations": [".github/prompts"],
      editor: { tabSize: 2 },
    } as Record<string, unknown>;

    const incoming = {
      "chat.promptFilesLocations": [".github/prompts", ".github/extra-prompts"],
      "chat.agentFilesLocations": [".github/agents"],
    } as Record<string, unknown>;

    const merged = mergeSettings(base, incoming);

    expect(merged["chat.promptFilesLocations"]).toEqual([
      ".github/prompts",
      ".github/extra-prompts",
    ]);
    expect(merged["chat.agentFilesLocations"]).toEqual([".github/agents"]);
    expect(merged.editor).toEqual({ tabSize: 2 });
  });

  it("creates readiness patch for missing discovery settings", () => {
    const patch = minimalReadinessPatch({});
    expect(patch["chat.promptFilesLocations"]).toEqual([".github/prompts"]);
    expect(patch["chat.instructionsFilesLocations"]).toEqual([
      ".github/instructions",
    ]);
    expect(patch["chat.agentFilesLocations"]).toEqual([".github/agents"]);
    expect(patch["chat.agentSkillsLocations"]).toEqual([".github/skills"]);
  });

  it("merges object-map discovery settings and preserves object-map schema", () => {
    const base = {
      "chat.instructionsFilesLocations": {
        ".github/instructions": true,
      },
    } as Record<string, unknown>;

    const incoming = {
      "chat.instructionsFilesLocations": {
        ".github/instructions": true,
        ".github/custom-instructions": true,
      },
    } as Record<string, unknown>;

    const merged = mergeSettings(base, incoming);
    expect(merged["chat.instructionsFilesLocations"]).toEqual({
      ".github/instructions": true,
      ".github/custom-instructions": true,
    });
  });

  it("does not propose readiness patch when object-map discovery settings exist", () => {
    const patch = minimalReadinessPatch({
      "chat.promptFilesLocations": {
        ".github/prompts": true,
      },
      "chat.instructionsFilesLocations": {
        ".github/instructions": true,
      },
      "chat.agentFilesLocations": {
        ".github/agents": true,
      },
      "chat.agentSkillsLocations": {
        ".github/skills": true,
      },
    });

    expect(patch).toEqual({});
  });
});
