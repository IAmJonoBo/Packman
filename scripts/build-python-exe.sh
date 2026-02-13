#!/usr/bin/env sh
set -eu

echo "Building local Python executable using PyInstaller (host OS)"

if ! command -v python >/dev/null 2>&1; then
  echo "Python not found"
  exit 1
fi

if ! python -c "import PyInstaller" >/dev/null 2>&1; then
  echo "PyInstaller not available in this Python environment."
  echo "Please create and activate a virtual environment and install PyInstaller:" 
  echo "  python -m venv .venv && source .venv/bin/activate && python -m pip install pyinstaller"
  exit 1
fi

cd packman-py
pyinstaller --onefile --name packman-py -c packman_py/packman.py

echo "Built executable in packman-py/dist (host-specific)"
ls -al dist || true

exit 0
