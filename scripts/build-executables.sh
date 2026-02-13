#!/usr/bin/env sh
set -eu

echo "Building native executables for packman-cli"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx required but not found. Install Node.js/npm or use pnpm dlx."
  exit 1
fi

echo "Building TypeScript output for packman-cli..."
pnpm --filter packman-cli -w run build

OUT_DIR="packman-cli/dist/bin"
mkdir -p "$OUT_DIR"

TARGETS="node18-macos-x64,node18-macos-arm64,node18-linux-x64,node18-win-x64"

echo "Running pkg to build: $TARGETS"
npx --yes pkg packman-cli/dist/index.js --targets $TARGETS --out-path "$OUT_DIR"

echo "Built executables in $OUT_DIR"
ls -al "$OUT_DIR" || true

echo "Note: packman-app builds are native via Tauri; run 'pnpm --filter packman-app run tauri' on host OS to produce app bundles."

exit 0
