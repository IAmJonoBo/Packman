export interface ChatSettings {
  'chat.promptFilesLocations'?: string[];
  'chat.instructionsFilesLocations'?: string[];
  'chat.agentFilesLocations'?: string[];
  'chat.agentSkillsLocations'?: string[];
  [key: string]: unknown;
}

const CHAT_LOCATION_KEYS: Array<keyof ChatSettings> = [
  'chat.promptFilesLocations',
  'chat.instructionsFilesLocations',
  'chat.agentFilesLocations',
  'chat.agentSkillsLocations',
];

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    if (typeof value !== 'string') {
      continue;
    }

    if (!seen.has(value)) {
      seen.add(value);
      output.push(value);
    }
  }

  return output;
}

export function mergeSettings(base: ChatSettings, incoming: ChatSettings): ChatSettings {
  const merged: ChatSettings = { ...base };

  for (const key of Object.keys(incoming)) {
    if (!CHAT_LOCATION_KEYS.includes(key as keyof ChatSettings)) {
      merged[key] = incoming[key];
    }
  }

  for (const key of CHAT_LOCATION_KEYS) {
    const baseValue = Array.isArray(base[key]) ? (base[key] as unknown[]) : [];
    const incomingValue = Array.isArray(incoming[key]) ? (incoming[key] as unknown[]) : [];
    const union = uniqueStrings([...baseValue, ...incomingValue]);
    if (union.length > 0) {
      merged[key] = union;
    }
  }

  return merged;
}

export function minimalReadinessPatch(settings: ChatSettings): ChatSettings {
  const patch: ChatSettings = {};

  if (!Array.isArray(settings['chat.promptFilesLocations']) || settings['chat.promptFilesLocations']?.length === 0) {
    patch['chat.promptFilesLocations'] = ['.github/prompts'];
  }

  if (
    !Array.isArray(settings['chat.instructionsFilesLocations']) ||
    settings['chat.instructionsFilesLocations']?.length === 0
  ) {
    patch['chat.instructionsFilesLocations'] = ['.github/instructions'];
  }

  if (!Array.isArray(settings['chat.agentFilesLocations']) || settings['chat.agentFilesLocations']?.length === 0) {
    patch['chat.agentFilesLocations'] = ['.github/agents'];
  }

  if (!Array.isArray(settings['chat.agentSkillsLocations']) || settings['chat.agentSkillsLocations']?.length === 0) {
    patch['chat.agentSkillsLocations'] = ['.github/skills'];
  }

  return patch;
}
