#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH='' cd -- "$SCRIPT_DIR/.." && pwd)"
PYTHON_BIN="python"
PYINSTALLER_BIN="pyinstaller"

if [ -x "$ROOT_DIR/packman-py/.venv/bin/python" ]; then
	PYTHON_BIN="$ROOT_DIR/packman-py/.venv/bin/python"
fi
if [ -x "$ROOT_DIR/packman-py/.venv/bin/pyinstaller" ]; then
	PYINSTALLER_BIN="$ROOT_DIR/packman-py/.venv/bin/pyinstaller"
fi

echo "Building local Python executable using PyInstaller (host OS)"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
	echo "Python not found"
	exit 1
fi

if ! "$PYTHON_BIN" -c "import PyInstaller" >/dev/null 2>&1; then
	echo "PyInstaller not available in this Python environment."
	echo "Please create and activate a virtual environment and install PyInstaller:"
	echo "  python -m venv .venv && source .venv/bin/activate && python -m pip install pyinstaller"
	exit 1
fi

cd "$ROOT_DIR/packman-py"
"$PYINSTALLER_BIN" --onefile --name packman-py -c packman_py/packman.py --collect-all rich --collect-all typer --distpath "$ROOT_DIR/packman-py/dist" --workpath "$ROOT_DIR/packman-py/build"

echo "Built executable in packman-py/dist (host-specific)"
ls -al "$ROOT_DIR/packman-py/dist" || true

exit 0
