export interface ChatSettings {
  "chat.promptFilesLocations"?: string[] | Record<string, boolean>;
  "chat.instructionsFilesLocations"?: string[] | Record<string, boolean>;
  "chat.agentFilesLocations"?: string[] | Record<string, boolean>;
  "chat.agentSkillsLocations"?: string[] | Record<string, boolean>;
  [key: string]: unknown;
}

const CHAT_LOCATION_KEYS: Array<keyof ChatSettings> = [
  "chat.promptFilesLocations",
  "chat.instructionsFilesLocations",
  "chat.agentFilesLocations",
  "chat.agentSkillsLocations",
];

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    if (!seen.has(value)) {
      seen.add(value);
      output.push(value);
    }
  }

  return output;
}

function toObjectMap(values: string[]): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const value of values) {
    map[value] = true;
  }

  return map;
}

function fromObjectMap(value: unknown): string[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return [];
  }

  return Object.entries(value)
    .filter(([key, enabled]) => typeof key === "string" && Boolean(enabled))
    .map(([key]) => key);
}

function extractLocations(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqueStrings(value);
  }

  return uniqueStrings(fromObjectMap(value));
}

function isObjectMap(value: unknown): value is Record<string, boolean> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeSettings(
  base: ChatSettings,
  incoming: ChatSettings,
): ChatSettings {
  const merged: ChatSettings = { ...base };

  for (const key of Object.keys(incoming)) {
    if (!CHAT_LOCATION_KEYS.includes(key as keyof ChatSettings)) {
      merged[key] = incoming[key];
    }
  }

  for (const key of CHAT_LOCATION_KEYS) {
    const baseValue = extractLocations(base[key]);
    const incomingValue = extractLocations(incoming[key]);
    const union = uniqueStrings([...baseValue, ...incomingValue]);
    if (union.length > 0) {
      const preserveObjectMap = isObjectMap(base[key]);
      merged[key] = preserveObjectMap ? toObjectMap(union) : union;
    }
  }

  return merged;
}

export function minimalReadinessPatch(settings: ChatSettings): ChatSettings {
  const patch: ChatSettings = {};

  if (extractLocations(settings["chat.promptFilesLocations"]).length === 0) {
    patch["chat.promptFilesLocations"] = [".github/prompts"];
  }

  if (
    extractLocations(settings["chat.instructionsFilesLocations"]).length === 0
  ) {
    patch["chat.instructionsFilesLocations"] = [".github/instructions"];
  }

  if (extractLocations(settings["chat.agentFilesLocations"]).length === 0) {
    patch["chat.agentFilesLocations"] = [".github/agents"];
  }

  if (extractLocations(settings["chat.agentSkillsLocations"]).length === 0) {
    patch["chat.agentSkillsLocations"] = [".github/skills"];
  }

  return patch;
}
