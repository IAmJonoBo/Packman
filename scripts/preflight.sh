#!/usr/bin/env sh
set -eu

echo "Running preflight checks..."

if command -v trunk >/dev/null 2>&1; then
	echo "Formatting with trunk (will fail if changes are produced)..."
	BEFORE_DIFF_FILE="$(mktemp)"
	AFTER_DIFF_FILE="$(mktemp)"
	NEW_DIFF_FILE="$(mktemp)"
	trap 'rm -f "$BEFORE_DIFF_FILE" "$AFTER_DIFF_FILE" "$NEW_DIFF_FILE"' EXIT
	git --no-pager diff --name-only | sort >"$BEFORE_DIFF_FILE"
	trunk fmt --all
	git --no-pager diff --name-only | sort >"$AFTER_DIFF_FILE"
	comm -13 "$BEFORE_DIFF_FILE" "$AFTER_DIFF_FILE" >"$NEW_DIFF_FILE"
	if [ -s "$NEW_DIFF_FILE" ]; then
		echo "Formatting produced changes; please run 'trunk fmt --all' locally and commit the results."
		cat "$NEW_DIFF_FILE"
		exit 2
	fi
else
	echo "Warning: trunk not found, skipping trunk fmt check"
fi

echo "Running monorepo tests..."
pnpm -r test

echo "Building packages..."
pnpm -r build

echo "Preflight checks passed."

exit 0
