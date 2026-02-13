#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH='' cd -- "$SCRIPT_DIR/.." && pwd)"

echo "Creating root launchers..."

cat >"$ROOT_DIR/packman-rich" <<'EOF'
#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

if [ -t 1 ] && command -v clear >/dev/null 2>&1; then
	clear
fi

if [ -x "$ROOT_DIR/packman-py/.venv/bin/python" ]; then
	PYTHON_BIN="$ROOT_DIR/packman-py/.venv/bin/python"
elif command -v python3 >/dev/null 2>&1; then
	PYTHON_BIN="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
	PYTHON_BIN="$(command -v python)"
else
	echo "Python is required to run the Rich/Typer CLI launcher."
	echo "Install Python 3 and try again."
	exit 1
fi

if ! "$PYTHON_BIN" -c "import typer, rich" >/dev/null 2>&1; then
	echo "Missing Python dependencies: typer and rich."
	echo "Install them with: python -m pip install typer[all] rich"
	exit 2
fi

if [ ! -d "$ROOT_DIR/packman-py/packman_py" ]; then
	echo "packman-py sources not found under $ROOT_DIR/packman-py"
	exit 3
fi

if [ -n "${PYTHONPATH:-}" ]; then
	export PYTHONPATH="$ROOT_DIR/packman-py:$PYTHONPATH"
else
	export PYTHONPATH="$ROOT_DIR/packman-py"
fi

if [ "$#" -gt 0 ]; then
	exec "$PYTHON_BIN" -m packman_py.packman "$@"
fi

TTY_DEVICE="/dev/tty"
if [ ! -r "$TTY_DEVICE" ] || [ ! -w "$TTY_DEVICE" ]; then
	echo "No interactive terminal available for packman-rich."
	echo "Run with explicit arguments, e.g. './packman-rich --help' or './packman-rich info'."
	exit 1
fi

exec "$PYTHON_BIN" -m packman_py.packman interactive <"$TTY_DEVICE" >"$TTY_DEVICE" 2>&1
EOF
chmod +x "$ROOT_DIR/packman-rich"

cat >"$ROOT_DIR/packman-cli-launch" <<'EOF'
#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

if [ -t 1 ] && command -v clear >/dev/null 2>&1; then
	clear
fi

if ! command -v node >/dev/null 2>&1; then
	echo "Node.js is required to run packman-js."
	exit 1
fi

if [ ! -f "$ROOT_DIR/packman-cli/dist/index.js" ]; then
	echo "packman-cli is not built yet."
	echo "Run: pnpm --filter packman-cli run build"
	exit 2
fi

if [ "$#" -gt 0 ]; then
	exec node "$ROOT_DIR/packman-cli/dist/index.js" "$@"
fi

TTY_DEVICE="/dev/tty"
if [ ! -r "$TTY_DEVICE" ] || [ ! -w "$TTY_DEVICE" ]; then
	echo "No interactive terminal available for packman-cli-launch."
	echo "Run with explicit arguments, e.g. './packman-cli-launch --help'."
	exit 1
fi

exec "$ROOT_DIR/packman-rich" interactive
EOF
chmod +x "$ROOT_DIR/packman-cli-launch"

cat >"$ROOT_DIR/packman-app-launch" <<'EOF'
#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"

if [ -t 1 ] && command -v clear >/dev/null 2>&1; then
	clear
fi

APP_BUNDLE="$ROOT_DIR/packman-app/src-tauri/target/release/bundle/macos/Packman.app"
APP_BIN="$ROOT_DIR/packman-app/src-tauri/target/release/packman-app"

if [ -d "$APP_BUNDLE" ]; then
	echo "Launching Packman app bundle..."
	exec open "$APP_BUNDLE"
fi

if [ -x "$APP_BIN" ]; then
	echo "Launching Packman app binary..."
	exec "$APP_BIN" "$@"
fi

echo "No built app found."
echo "Run: pnpm --filter packman-app run tauri:build:safe"
exit 1
EOF
chmod +x "$ROOT_DIR/packman-app-launch"

cat >"$ROOT_DIR/packman-rich.cmd" <<'EOF'
@echo off
setlocal
set ROOT_DIR=%~dp0

where python >nul 2>&1
if errorlevel 1 (
	if not exist "%ROOT_DIR%packman-py\.venv\Scripts\python.exe" (
		echo Python is required to run the Rich/Typer CLI launcher.
		echo Install Python 3 and try again.
		exit /b 1
	)
)

if exist "%ROOT_DIR%packman-py\.venv\Scripts\python.exe" (
  set PYTHON_BIN=%ROOT_DIR%packman-py\.venv\Scripts\python.exe
) else (
  set PYTHON_BIN=python
)

"%PYTHON_BIN%" -c "import typer, rich" >nul 2>&1
if errorlevel 1 (
	echo Missing Python dependencies: typer and rich.
	echo Install them with: python -m pip install typer[all] rich
	exit /b 2
)

if not exist "%ROOT_DIR%packman-py\packman_py" (
	echo packman-py sources not found under %ROOT_DIR%packman-py
	exit /b 3
)

set PYTHONPATH=%ROOT_DIR%packman-py;%PYTHONPATH%

if "%~1"=="" (
	"%PYTHON_BIN%" -m packman_py.packman interactive
) else (
	"%PYTHON_BIN%" -m packman_py.packman %*
)
EOF

cat >"$ROOT_DIR/packman-cli-launch.cmd" <<'EOF'
@echo off
setlocal
set ROOT_DIR=%~dp0

where node >nul 2>&1
if errorlevel 1 (
	echo Node.js is required to run packman-js.
	exit /b 1
)

if not exist "%ROOT_DIR%packman-cli\dist\index.js" (
	echo packman-cli is not built yet.
	echo Run: pnpm --filter packman-cli run build
	exit /b 2
)

if "%~1"=="" (
	call "%ROOT_DIR%packman-rich.cmd" interactive
	exit /b %errorlevel%
)

node "%ROOT_DIR%packman-cli\dist\index.js" %*
EOF

cat >"$ROOT_DIR/packman-app-launch.cmd" <<'EOF'
@echo off
setlocal
set ROOT_DIR=%~dp0
set APP_EXE=%ROOT_DIR%packman-app\src-tauri\target\release\packman-app.exe
set APP_MSI_DIR=%ROOT_DIR%packman-app\src-tauri\target\release\bundle\msi

if exist "%APP_EXE%" (
	echo Launching Packman app binary...
	start "" "%APP_EXE%"
	exit /b 0
)

if exist "%APP_MSI_DIR%" (
	echo Opening Packman MSI bundle folder...
	start "" "%APP_MSI_DIR%"
	exit /b 0
)

echo No built app found.
echo Run: pnpm --filter packman-app run tauri:build:safe
exit /b 1
EOF

echo "Created root launchers:"
ls -al "$ROOT_DIR"/packman-rich "$ROOT_DIR"/packman-cli-launch "$ROOT_DIR"/packman-app-launch || true

echo "Root launchers ready."
