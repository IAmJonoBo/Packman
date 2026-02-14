export const SUITE_OWNED_PATH_PREFIXES = [
  ".github/copilot-instructions.md",
  ".vscode/settings.json",
  ".github/hooks",
  ".vscode/mcp.json",
  "AGENTS.md",
  "CLAUDE.md",
  "CLAUDE.local.md",
  ".claude/CLAUDE.md",
  ".claude/settings.json",
  ".claude/settings.local.json",
] as const;

export function normalizeOwnedPath(input: string): string {
  return input
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.\//, "")
    .replace(/\/+$/, "");
}

export function pathCoveredByOwnedPath(
  artifactPath: string,
  ownedPath: string,
): boolean {
  const normalizedArtifactPath = normalizeOwnedPath(artifactPath);
  const normalizedOwnedPath = normalizeOwnedPath(ownedPath);

  if (!normalizedOwnedPath) {
    return false;
  }

  return (
    normalizedArtifactPath === normalizedOwnedPath ||
    normalizedArtifactPath.startsWith(`${normalizedOwnedPath}/`)
  );
}

export function isSuiteOwnedPath(relativePath: string): boolean {
  return SUITE_OWNED_PATH_PREFIXES.some((prefix) =>
    pathCoveredByOwnedPath(relativePath, prefix),
  );
}
