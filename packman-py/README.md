# packman-py — Python CLI

This directory contains a lightweight Python CLI wrapper for Packman implemented
with Typer and Rich. It is intended to be a friendly, local CLI alternative to
the Node CLI.

## Packaging

Recommended local flow (use a virtualenv):

1. Create and activate a venv inside the project:

```sh
python3 -m venv .venv
source .venv/bin/activate
```

1. Install build tools:

```sh
python -m pip install --upgrade pip build pyinstaller
```

1. Build wheel + sdist:

```sh
sh ../scripts/build-python-dist.sh
```

1. Build a host one-file executable (PyInstaller):

```sh
sh ../scripts/build-python-exe.sh
```

Artifacts will appear in `packman-py/dist`. This repo intentionally ignores
`packman-py/.venv` and `packman-py/dist` so built artifacts are not committed.

From repository root, you can also run:

```sh
pnpm run package:py
pnpm run package:pyexe
pnpm run package:executables
```

- `package:py` builds wheel/sdist into `packman-py/dist`
- `package:pyexe` builds host executable into `packman-py/dist`
- `package:executables` builds Node CLI executables into `packman-cli/dist/bin`
  and Python executable into `packman-py/dist`

## CI packaging

The repository includes a GitHub Actions workflow that will build the wheel and
PyInstaller host binary on the runner and upload them as workflow artifacts.
This ensures packaging is done in a clean, reproducible environment.

## Usage

Run the Python CLI locally without installing:

```sh
PYTHONPATH=./packman-py python -m packman_py.packman info
PYTHONPATH=./packman-py python -m packman_py.packman validate ./Packs
```

Or from inside `packman-py`:

```sh
python -m packman_py.packman info
python -m packman_py.packman validate ../Packs
```

Or install the wheel into a venv:

```sh
pip install packman-py/dist/packman_py-0.1.0-py3-none-any.whl
packman-py info
```
