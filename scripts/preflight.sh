#!/usr/bin/env sh
set -eu

echo "Running preflight checks..."

if command -v trunk >/dev/null 2>&1; then
  echo "Formatting with trunk (will fail if changes are produced)..."
  trunk fmt --all
  if ! git diff --quiet --; then
    echo "Formatting produced changes; please run 'trunk fmt --all' locally and commit the results."
    git --no-pager diff --name-only
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
