#!/usr/bin/env sh
set -eu

TARGET_DIR="${1:-.}"

if [ ! -d "$TARGET_DIR" ]; then
	echo "Target directory not found: $TARGET_DIR"
	exit 1
fi

echo "[policy-self-check] target=$TARGET_DIR"

if command -v git >/dev/null 2>&1 && git -C "$TARGET_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	CHANGED_COUNT="$(git -C "$TARGET_DIR" status --porcelain | wc -l | tr -d ' ')"
	echo "[policy-self-check] changed-files=$CHANGED_COUNT"
fi

if command -v grep >/dev/null 2>&1; then
	if grep -R -n "TODO\|FIXME" "$TARGET_DIR" >/dev/null 2>&1; then
		echo "[policy-self-check] note: TODO/FIXME markers found"
	fi
fi

echo "[policy-self-check] complete"
