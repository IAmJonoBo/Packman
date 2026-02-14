# Hooks Orchestrator

This folder contains the portable hooks profile and lifecycle scripts.

## Lifecycle goals

- `sessionStart`: announce suite/version, run validation, write diagnostics.
- `preToolUse`: enforce policy guardrails for unsafe operations.
- `errorOccurred`: capture non-sensitive diagnostics.
- `sessionEnd`: run doctor on target (if configured) and write summary.

## Safety controls

- Auto-commit disabled unless `PACKMAN_HOOKS_AUTOCOMMIT=1`.
- Network operations disabled unless `PACKMAN_HOOKS_NET=1`.
- Secrets are redacted in emitted reports.
