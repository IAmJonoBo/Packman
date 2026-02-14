#!/usr/bin/env sh
set -eu

ROOT_DIR="${PACKMAN_HOOKS_ROOT:-$PWD}"
OUT_DIR="$ROOT_DIR/artifacts/packman"
OUT_FILE="$OUT_DIR/session-error-report.md"
mkdir -p "$OUT_DIR"

ERROR_MESSAGE="${PACKMAN_ERROR_MESSAGE:-unknown error}"
LAST_COMMAND="${PACKMAN_LAST_COMMAND:-unknown}"

redact_line() {
	printf '%s' "$1" | sed -E 's/([A-Za-z0-9_]*(TOKEN|SECRET|PASSWORD|KEY)[A-Za-z0-9_]*=)[^[:space:]]+/\1[REDACTED]/gI'
}

{
	echo "# Session error report"
	echo
	echo "- generated_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
	echo "- cwd: $PWD"
	echo "- platform: $(uname -s)"
	echo "- shell: ${SHELL:-unknown}"
	echo "- error: $(redact_line \"$ERROR_MESSAGE\")"
	echo "- last_command: $(redact_line \"$LAST_COMMAND\")"
} >"$OUT_FILE"

echo "Packman hooks: errorOccurred captured"
