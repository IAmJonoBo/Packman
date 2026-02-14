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
- Governance suite inventory artifact: `pnpm run governance:suite-inventory`
- Governance install links report: `pnpm run governance:install-links-report`
- Governance collections + suite index: `pnpm run governance:suite-index`
- Governance validation log (all checks): `pnpm run governance:validation-log`
- CLI validate: `pnpm --filter packman-cli exec node dist/index.js validate ./Packs --strict`
- CLI validate zip with auto-clean: `pnpm --filter packman-cli exec node dist/index.js validate ./pack.zip --strict --auto-clean`
- CLI normalize: `pnpm --filter packman-cli exec node dist/index.js normalize ./Packs --apply`
- Normalize auto-fills missing `PACK_MANIFEST.json` contract fields (`intended_install`, `owned_paths`) based on detected artifacts.
- CLI install dry-run: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --to /path/to/repo --mode fail --dry-run --json`
- CLI install with skip collisions: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --to /path/to/repo --mode skip --json`
- CLI install with rename collisions: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --to /path/to/repo --mode rename --json`
- CLI install to global profile: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --target-type global --to /path/to/profile --mode fail --json`
- CLI install selected categories only: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --include-category agents prompts instructions --json`
- CLI install selected files only: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --include-path .github/agents/foo.agent.md --include-path .github/prompts/bar.prompt.md --json`
- Suite-owned paths (`.github/copilot-instructions.md`, `.vscode/settings.json`) are auto-handled during validate/install; no extra flag required for standard flows.
- If a pack defines `PACK_MANIFEST.json`, strict validation enforces `owned_paths` coverage and `intended_install` consistency.
- CLI doctor: `pnpm --filter packman-cli exec node dist/index.js doctor /path/to/repo`
- CLI readiness: `pnpm --filter packman-cli exec node dist/index.js readiness /path/to/repo`
- Tauri dev: `pnpm --filter packman-app tauri dev`
- Tauri release build (recommended): `pnpm --filter packman-app run tauri:build:safe`
- Tauri release build (raw): `pnpm --filter packman-app tauri build`
- App UI E2E smoke (Playwright): `pnpm --filter packman-app run test:e2e`

## Common snags and fixes

- Tauri icon error (`icon.png is not RGBA`): ensure `packman-app/src-tauri/icons/icon.png` has an alpha channel. On macOS, verify with:
  - `sips -g format -g space -g hasAlpha packman-app/src-tauri/icons/icon.png`
  - Expected: `format: png`, `hasAlpha: yes`
- Core package filter mismatch: `packman-core` is published as `@packman/core`.
  - Use: `pnpm --filter @packman/core run build`
  - Use: `pnpm --filter @packman/core run test`
- Trial workspace appears missing in UI:
  - Use Workspace Manager `Refresh` after creating or cleaning trial folders.
  - Trial workspace history is local to the app profile and prunes invalid paths.
- Plan fails due to workspace file:
  - Ensure target folder contains a `.code-workspace` file.
  - In Import Wizard plan step, use `Create VS Code Workspace File` and regenerate plan.
- Large source catalog slows plan/validate:
  - Prefer selecting a specific pack folder instead of a large catalog root when possible.
- Global profile install pathing:
  - In `--target-type global`, Packman maps artifacts into profile-ready folders (for example `.github/agents`, `.github/prompts`, `.github/instructions`, `.github/skills`, `.github/hooks`, `.vscode`).

## Release readiness checklist

- `pnpm run build`
- `pnpm run test`
- `pnpm run governance:manifest-owned-paths`
- `pnpm --filter packman-app tauri dev` (smoke start)
- `pnpm --filter packman-app run tauri:build:safe` (bundle verification)

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
