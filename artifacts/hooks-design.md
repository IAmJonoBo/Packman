# Hooks design (CHECKPOINT D)

Generated: 2026-02-14

## Objective

Add a dedicated hooks pack that supports both agreed hook models without breaking existing governance:

1. `.github/hooks/*.json`
2. `.claude/settings*.json`

## New pack

- Path: `Packs/copilot-policy-kernel-hooks-pack`
- Manifest id: `copilot-policy-kernel-hooks`
- Intended install: `suite`
- Owned paths:
  - `.github/hooks`
  - `.claude/settings.json`
  - `.claude/settings.local.json`

## Artifacts

- `.github/hooks/policy-kernel-hooks.json`
  - Reference hook profile for policy preflight and post-edit checks.
- `.claude/settings.json`
  - Shared Claude hooks profile.
- `.claude/settings.local.json`
  - Local override profile for workstation-specific policies.

## Install behavior notes

- Workspace installs keep paths as-authored.
- Global installs map hook/config artifacts according to current core target mapping:
  - `.github/hooks/*` -> `.github/hooks/*`
  - `.claude/settings.json` -> `.vscode/settings.json` category (`settings`) behavior in current mapper.
  - `.claude/settings.local.json` -> `.vscode/settings.local.json` filename-preserving mapping.

## Why a separate pack

- Keeps policy-kernel instruction concerns isolated from hook execution profiles.
- Allows teams to adopt hooks independently from instruction packs.
- Keeps future hook schema evolution localized.

## Follow-up

- If needed, add stricter JSON schema validation for hook files in `packman-core` validation phase.
