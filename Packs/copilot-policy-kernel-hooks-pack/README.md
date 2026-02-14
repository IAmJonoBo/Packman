# Policy Kernel Hooks (copilot-policy-kernel-hooks-pack)

## Purpose

Provides a dedicated hooks-oriented policy kernel profile for both supported models:

- `.github/hooks/*.json` for GitHub/Copilot-style hook configuration.
- `.claude/settings.json` and `.claude/settings.local.json` for Claude settings-based hooks.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-policy-kernel-hooks-pack/.github/hooks/policy-kernel-hooks.json)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-policy-kernel-hooks-pack/.github/hooks/policy-kernel-hooks.json)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-policy-kernel-hooks-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-policy-kernel-hooks-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- None detected

## Key agents

- None detected

## Directory tree

```text
copilot-policy-kernel-hooks-pack/
  .github/
    hooks/
      policy-kernel-hooks.json
  .claude/
    settings.json
    settings.local.json
  PACK_MANIFEST.json
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
