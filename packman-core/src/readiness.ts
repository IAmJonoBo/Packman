import path from 'node:path';
import { readJson } from './fs-utils.js';
import { minimalReadinessPatch } from './settings-merge.js';
import type { Issue, ReadinessResult } from './types.js';

export async function readinessReport(targetPath: string): Promise<ReadinessResult> {
  const started = Date.now();
  const settingsPath = path.join(targetPath, '.vscode/settings.json');
  const settings = (await readJson<Record<string, unknown>>(settingsPath)) ?? {};

  const patch = minimalReadinessPatch(settings);
  const issues: Issue[] = [];

  for (const key of Object.keys(patch)) {
    issues.push({
      severity: 'warning',
      code: 'MISSING_DISCOVERY_SETTING',
      message: `Missing VS Code discovery setting: ${key}`,
      path: '.vscode/settings.json',
      details: { suggestedValue: patch[key] },
    });
  }

  return {
    ok: issues.length === 0,
    issues,
    proposedPatch: patch,
    elapsedMs: Date.now() - started,
  };
}
