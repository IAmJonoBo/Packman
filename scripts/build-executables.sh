#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH='' cd -- "$SCRIPT_DIR/.." && pwd)"

echo "Building packman-cli executables/wrappers"

if ! command -v node >/dev/null 2>&1; then
	echo "node is required but not found."
	exit 1
fi

echo "Building TypeScript output for packman-cli..."
pnpm --filter packman-cli -w run build

OUT_DIR="$ROOT_DIR/packman-cli/dist/bin"
mkdir -p "$OUT_DIR"

echo "Cleaning previous generated binaries/wrappers..."
rm -f "$OUT_DIR"/index-* "$OUT_DIR"/packman "$OUT_DIR"/packman.cmd

echo "Creating POSIX launcher wrapper..."
cat >"$OUT_DIR/packman" <<'EOF'
#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
node "$SCRIPT_DIR/../index.js" "$@"
EOF
chmod +x "$OUT_DIR/packman"

echo "Creating Windows launcher wrapper..."
cat >"$OUT_DIR/packman.cmd" <<'EOF'
@echo off
setlocal
set SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%..\index.js" %*
EOF

if command -v npx >/dev/null 2>&1; then
	TARGETS="node18-macos-x64,node18-macos-arm64,node18-linux-x64,node18-win-x64"
	echo "Attempting native pkg build (best effort): $TARGETS"
	if ! npx --yes pkg packman-cli/dist/index.js --targets $TARGETS --out-path "$OUT_DIR"; then
		echo "pkg native build failed; wrappers remain available in $OUT_DIR"
	fi
else
	echo "npx not found; skipped pkg native builds. Wrappers are available in $OUT_DIR"
fi

echo "Built executables in $OUT_DIR"
ls -al "$OUT_DIR" || true

echo "Note: packman-app builds are native via Tauri; run 'pnpm --filter packman-app run tauri' on host OS to produce app bundles."

exit 0
