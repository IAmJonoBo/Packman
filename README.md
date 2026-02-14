# Packman monorepo

Monorepo for Packman (core library, CLI, and Tauri app) and the canonical pack catalog under `Packs/`.

## Packages

- `packman-core`: detection, validation, normalization, install, rollback, doctor, registry, readiness
- `packman-cli`: `packman` command surface
- `packman-app`: Tauri v2 desktop app with scoped permissions
- `fixtures`: test fixtures for good/bad/collision/suite-owned cases
- `docs`: operational docs and Mermaid diagrams

## Commands

- Install deps: `pnpm install`
- Build all: `pnpm build`
- Generate root launchers only: `pnpm run launchers`
- Run tests: `pnpm test`
- Governance manifest ownership sweep: `pnpm run governance:manifest-owned-paths`
- CLI validate: `pnpm --filter packman-cli exec node dist/index.js validate ./Packs --strict`
- CLI validate zip with auto-clean: `pnpm --filter packman-cli exec node dist/index.js validate ./pack.zip --strict --auto-clean`
- CLI normalize: `pnpm --filter packman-cli exec node dist/index.js normalize ./Packs --apply`
- Normalize auto-fills missing `PACK_MANIFEST.json` contract fields (`intended_install`, `owned_paths`) based on detected artifacts.
- CLI install dry-run: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --to /path/to/repo --mode fail --dry-run --json`
- CLI install with skip collisions: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --to /path/to/repo --mode skip --json`
- CLI install with rename collisions: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --to /path/to/repo --mode rename --json`
- Suite-owned paths (`.github/copilot-instructions.md`, `.vscode/settings.json`) are auto-handled during validate/install; no extra flag required for standard flows.
- If a pack defines `PACK_MANIFEST.json`, strict validation enforces `owned_paths` coverage and `intended_install` consistency.
- CLI doctor: `pnpm --filter packman-cli exec node dist/index.js doctor /path/to/repo`
- CLI readiness: `pnpm --filter packman-cli exec node dist/index.js readiness /path/to/repo`
- Tauri dev: `pnpm --filter packman-app tauri dev`
- Tauri release build (recommended): `pnpm --filter packman-app run tauri:build:safe`
- Tauri release build (raw): `pnpm --filter packman-app tauri build`
- App UI E2E smoke (Playwright): `pnpm --filter packman-app run test:e2e`

## App workflow highlights

- Use **Workspace Manager** to create `packman-trial-*` workspaces before import/install.
- Select a trial workspace as target, then move to **Import** for validate → plan → install.
- Cleanup of trial workspaces is guarded and confirmation-based in-app.

## Root launchers (generated on build)

After `pnpm build`, root launchers are generated for faster access:

- `./packman-rich` → Python Typer + Rich CLI (`packman-py`)
- `./packman-cli-launch` → Node CLI (`packman-cli/dist/index.js`)
- `./packman-app-launch` → opens/runs built desktop app if present

Launcher behavior notes:

- Terminal is cleared on startup when attached to a TTY.
- `./packman-rich` and `./packman-cli-launch` open the Typer/Rich interactive screen (arrow-key menu) when run without arguments.
- The interactive loop binds to `/dev/tty` so it still works when launch wrappers provide non-interactive stdin.
- If no terminal device is available, pass explicit arguments (for example `./packman-rich --help`).
- The home screen uses a two-column layout (`Action` + `Explainer`) for each option.
- Choosing `Exit` returns control to the launcher shell; if launched with `... ; exit;`, the terminal window closes automatically.

## Pack catalog

See `Packs/README.md`.

## AI customization scaffold (workspace root)

The repository now includes a ready-to-use directory scaffold aligned with the VS Code customization overview and Claude-compatible paths:

- `.github/instructions/`
- `.github/prompts/`
- `.github/agents/`
- `.github/skills/`
- `.github/hooks/`
- `.claude/rules/`
- `.claude/agents/`
- `.claude/skills/`
- `.agents/skills/`
- `.vscode/` (for `settings.json` / `mcp.json`)
- `AGENTS.md` and `CLAUDE.md` placeholders at workspace root

Pack detection/install now supports these locations for future expansion.
