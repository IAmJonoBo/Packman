# Hooks Orchestrator (copilot-hooks-orchestrator-pack)

## Purpose

Provides policy-safe lifecycle hooks that integrate Packman validation and diagnostics into session start, guarded tool usage, error capture, and session end workflows.

## Install mode

suite

## Install links

- Install hooks profile (VS Code): <https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-hooks-orchestrator-pack/.github/hooks/packman-hooks.json>
- Install hooks profile (raw): <https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-hooks-orchestrator-pack/.github/hooks/packman-hooks.json>

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-hooks-orchestrator-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-hooks-orchestrator-pack --target-type global --to /path/to/profile --mode fail --json`

## Usage

- `sessionStart` validates the configured target and writes `artifacts/packman/session-start.md`.
- `preToolUse` blocks unsafe operations by default.
- `errorOccurred` emits a redacted report at `artifacts/packman/session-error-report.md`.
- `sessionEnd` runs doctor for configured targets and writes `artifacts/packman/session-end.md`.

## Validation checklist

- Run `pnpm --filter packman-cli exec node dist/index.js validate ./Packs/copilot-hooks-orchestrator-pack --strict --suite --auto-clean`
- Confirm `.github/hooks/*.json` and `.claude/settings*.json` are present.
- Verify scripts are safe-by-default and do not auto-commit/network without explicit env vars.

## Directory tree

```text
copilot-hooks-orchestrator-pack/
  .github/
    hooks/
      packman-hooks.json
  .claude/
    settings.json
    settings.local.json
  hooks/
    README.md
    hooks.json
    scripts/
      error-occurred.sh
      pre-tool-use.sh
      session-end.sh
      session-start.sh
  PACK_MANIFEST.json
  README.md
```
