# Hooks Guide

This suite supports both hook models:

- GitHub/Copilot model: `.github/hooks/*.json`
- Claude model: `.claude/settings.json` and `.claude/settings.local.json`

## Safety defaults

- No destructive operations by default.
- No auto-commit unless explicitly enabled (`PACKMAN_HOOKS_AUTOCOMMIT=1`).
- No network operations unless explicitly enabled (`PACKMAN_HOOKS_NET=1`).
- Hook diagnostics must redact sensitive values.

## Validation workflow

- Validate suite artifacts: `pnpm run governance:manifest-owned-paths`
- Validate packs: `pnpm --filter packman-cli exec node dist/index.js validate ./Packs --strict --suite --auto-clean`
- Run final checks and emit log: `pnpm run governance:validation-log`
