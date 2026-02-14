# Packs Suite Contract

Canonical source for suite artifacts is `Packs/` only.

## Primitives

This suite ships these primitives:

- Agents (`.github/agents/*.agent.md`)
- Prompts (`.github/prompts/**/*.prompt.md`)
- Instructions (`.github/instructions/**/*.instructions.md`)
- Skills (`.github/skills/**/SKILL.md` + optional `resources/` and `scripts/`)
- Hooks (`.github/hooks/*.json` and `.claude/settings*.json`)
- Collections (`Packs/collections/*`)

## Install

### Packman (recommended)

- Validate: `pnpm --filter packman-cli exec node dist/index.js validate ./Packs --strict --suite --auto-clean`
- Normalize: `pnpm --filter packman-cli exec node dist/index.js normalize ./Packs --apply`
- Install (workspace): `pnpm --filter packman-cli exec node dist/index.js install ./Packs/<pack> --to /path/to/repo --mode fail --json`
- Install (global profile): `pnpm --filter packman-cli exec node dist/index.js install ./Packs/<pack> --target-type global --to /path/to/profile --mode fail --json`
- Index (`llms.txt`): `pnpm --filter packman-cli exec node dist/index.js index ./Packs --out ./Packs/llms.txt --per-pack`

### Manual

Copy only intended artifacts into target profile/workspace locations:

- `.github/agents/`, `.github/prompts/`, `.github/instructions/`, `.github/skills/`
- `.github/hooks/`
- `.claude/settings.json`, `.claude/settings.local.json`
- `.vscode/settings.json`, `.vscode/mcp.json`

## Validate / Normalize / Build

- Governance manifest ownership: `pnpm run governance:manifest-owned-paths`
- Inventory: `pnpm run governance:suite-inventory`
- Install-link coverage: `pnpm run governance:install-links-report`
- Collections + suite index: `pnpm run governance:suite-index`
- Unified validation log: `pnpm run governance:validation-log`

## Contribution rules

- Frontmatter is required on all agent/prompt/instruction/skill markdown artifacts.
- Prompt names must be unique and namespaced.
- `PACK_MANIFEST.json` must be present for packs and cover `owned_paths`.
- Suite-owned paths are restricted and require suite mode.
- Collision behavior is fail-safe by default; no silent overwrite.
- Canonical edits happen in `Packs/` only; mirrors are derivative.

## Suite ownership and collision policy

Suite-owned path families include:

- `.github/copilot-instructions.md`
- `.vscode/settings.json`
- `.github/hooks`
- `.vscode/mcp.json`
- root `AGENTS.md` / `CLAUDE.md`
- `.claude/settings.json` / `.claude/settings.local.json`

Any pack touching suite-owned paths should declare `intended_install: "suite"` (or `solo|suite`) and pass suite validation.
