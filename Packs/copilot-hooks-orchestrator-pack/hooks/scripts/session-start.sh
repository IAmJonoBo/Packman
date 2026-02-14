#!/usr/bin/env sh
set -eu

ROOT_DIR="${PACKMAN_HOOKS_ROOT:-$PWD}"
OUT_DIR="$ROOT_DIR/artifacts/packman"
OUT_FILE="$OUT_DIR/session-start.md"
mkdir -p "$OUT_DIR"

TARGET="${PACKMAN_HOOKS_TARGET:-$ROOT_DIR/Packs}"
SUITE_VERSION="${PACKMAN_SUITE_VERSION:-0.1.0}"

{
	echo "# Session start"
	echo
	echo "- suite_version: $SUITE_VERSION"
	echo "- target: $TARGET"
	echo "- generated_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo
} >"$OUT_FILE"

if command -v pnpm >/dev/null 2>&1; then
	if pnpm --filter packman-cli exec node dist/index.js validate "$TARGET" --strict --suite --auto-clean >/tmp/packman-session-start.log 2>&1; then
		printf '%s\n' "- validate: pass" >>"$OUT_FILE"
	else
		printf '%s\n' "- validate: fail" >>"$OUT_FILE"
		printf '%s\n' "" >>"$OUT_FILE"
		printf '%s\n' "## validate output" >>"$OUT_FILE"
		sed -n '1,120p' /tmp/packman-session-start.log >>"$OUT_FILE"
	fi
else
	printf '%s\n' "- validate: skipped (pnpm unavailable)" >>"$OUT_FILE"
fi

echo "Packman hooks: sessionStart completed"
