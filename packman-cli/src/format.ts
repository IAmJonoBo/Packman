import type { Issue } from '@packman/core';

export function printIssues(issues: Issue[]): void {
  if (issues.length === 0) {
    return;
  }

  for (const issue of issues) {
    const scope = issue.path ? ` (${issue.path})` : '';
    console.log(`- [${issue.severity}] ${issue.code}: ${issue.message}${scope}`);
  }
}

export function printHeader(title: string): void {
  console.log(`\n== ${title} ==`);
}

export function printJson(payload: unknown): void {
  console.log(JSON.stringify(payload, null, 2));
}
