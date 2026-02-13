#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
PACK_PATH="$ROOT_DIR/Packs/copilot-project-management-planning-pack"
TARGET_PATH="${1:-$ROOT_DIR}"

echo "Running E2E lifecycle for project management planning pack"
echo "Pack: $PACK_PATH"
echo "Target (dry-run install): $TARGET_PATH"

pnpm --filter packman-cli run build
pnpm --filter packman-cli exec node dist/index.js normalize "$PACK_PATH" --apply
pnpm --filter packman-cli exec node dist/index.js readme-sync "$PACK_PATH" --apply
pnpm --filter packman-cli exec node dist/index.js validate "$PACK_PATH" --strict --suite
pnpm --filter packman-cli exec node dist/index.js install "$PACK_PATH" --target workspace --path "$TARGET_PATH" --dry-run --suite --on-collision fail
pnpm --filter packman-cli exec node dist/index.js readiness "$PACK_PATH"

echo "Planning pack E2E lifecycle checks passed."
