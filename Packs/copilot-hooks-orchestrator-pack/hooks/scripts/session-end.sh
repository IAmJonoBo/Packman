#!/usr/bin/env sh
set -eu

ROOT_DIR="${PACKMAN_HOOKS_ROOT:-$PWD}"
OUT_DIR="$ROOT_DIR/artifacts/packman"
OUT_FILE="$OUT_DIR/session-end.md"
mkdir -p "$OUT_DIR"

TARGET="${PACKMAN_HOOKS_TARGET-}"

{
	echo "# Session end"
	echo
	echo "- generated_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
	if [ -n "$TARGET" ]; then
		echo "- target: $TARGET"
	else
		echo "- target: (not configured)"
	fi
} >"$OUT_FILE"

if [ -n "$TARGET" ] && command -v pnpm >/dev/null 2>&1; then
	if pnpm --filter packman-cli exec node dist/index.js doctor "$TARGET" >/tmp/packman-session-end.log 2>&1; then
		printf '%s\n' "- doctor: pass" >>"$OUT_FILE"
	else
		printf '%s\n' "- doctor: fail" >>"$OUT_FILE"
		printf '%s\n' "" >>"$OUT_FILE"
		printf '%s\n' "## doctor output" >>"$OUT_FILE"
		sed -n '1,120p' /tmp/packman-session-end.log >>"$OUT_FILE"
	fi
else
	printf '%s\n' "- doctor: skipped" >>"$OUT_FILE"
fi

echo "Packman hooks: sessionEnd completed"
