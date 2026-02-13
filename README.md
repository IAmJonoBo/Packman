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
- Run tests: `pnpm test`
- CLI validate: `pnpm --filter packman-cli exec node dist/index.js validate ./Packs --strict`
- CLI validate zip with auto-clean: `pnpm --filter packman-cli exec node dist/index.js validate ./pack.zip --strict --auto-clean`
- CLI normalize: `pnpm --filter packman-cli exec node dist/index.js normalize ./Packs --apply`
- CLI install dry-run: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --target workspace --path /path/to/repo --suite --dry-run --on-collision fail`
- CLI install with skip collisions: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --target workspace --path /path/to/repo --on-collision skip`
- CLI install with rename collisions: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --target workspace --path /path/to/repo --on-collision rename`
- CLI install with per-file decisions (inline): `pnpm --filter packman-cli exec node dist/index.js install ./Packs --target workspace --path /path/to/repo --on-collision fail --collision-decisions-json '{".github/prompts/foo.prompt.md":"rename"}'`
- CLI install with per-file decisions (file): `pnpm --filter packman-cli exec node dist/index.js install ./Packs --target workspace --path /path/to/repo --collision-decisions ./decisions.json`
- CLI export install plan JSON: `pnpm --filter packman-cli exec node dist/index.js install ./Packs --target workspace --path /path/to/repo --dry-run --plan-out ./artifacts/install-plan.json`
- CLI doctor: `pnpm --filter packman-cli exec node dist/index.js doctor /path/to/repo`
- CLI readiness: `pnpm --filter packman-cli exec node dist/index.js readiness /path/to/repo`
- Tauri dev: `pnpm --filter packman-app tauri dev`
- Tauri release build: `pnpm --filter packman-app tauri build`

## Pack catalog

See `Packs/README.md`.
