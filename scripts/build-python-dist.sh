#!/usr/bin/env sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
ROOT_DIR="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
PYTHON_BIN="python"

if [ -x "$ROOT_DIR/packman-py/.venv/bin/python" ]; then
  PYTHON_BIN="$ROOT_DIR/packman-py/.venv/bin/python"
fi

echo "Building Python wheel for packman-py"

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "Python not found"
  exit 1
fi

echo "Installing build dependency (python -m pip install --user build) if needed"
# Try installing build into the current environment; prefer user install but
# fall back to a direct install if the module isn't available after the first attempt.
"$PYTHON_BIN" -m pip install --user build >/dev/null 2>&1 || true
if ! "$PYTHON_BIN" -c "import build" >/dev/null 2>&1; then
  echo "The 'build' package is not available in this Python environment."
  echo "This environment may be managed by the OS (PEP 668)."
  echo "Please create and activate a virtual environment, then install the 'build' package:"
  echo "  python -m venv .venv && source .venv/bin/activate && python -m pip install build"
  exit 1
fi

cd "$ROOT_DIR/packman-py"
"$PYTHON_BIN" -m build
echo "Built distributions in packman-py/dist"
ls -al dist || true

exit 0
