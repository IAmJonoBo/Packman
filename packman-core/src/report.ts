import type { Issue, OperationReport } from "./types.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function createReport<TPayload>(
  operation: string,
  input: Record<string, unknown>,
  output: TPayload,
  issues: Issue[],
  startedAtMs: number,
): OperationReport<TPayload> {
  return {
    operation,
    startedAt: new Date(startedAtMs).toISOString(),
    elapsedMs: Date.now() - startedAtMs,
    input,
    output,
    issues,
  };
}

export function hasErrors(issues: Issue[]): boolean {
  return issues.some((issue) => issue.severity === "error");
}

export function summarizeIssues(issues: Issue[]): {
  errors: number;
  warnings: number;
  info: number;
} {
  return issues.reduce(
    (acc, issue) => {
      if (issue.severity === "error") {
        acc.errors += 1;
      } else if (issue.severity === "warning") {
        acc.warnings += 1;
      } else {
        acc.info += 1;
      }
      return acc;
    },
    { errors: 0, warnings: 0, info: 0 },
  );
}
