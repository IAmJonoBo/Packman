# Policy Kernel (copilot-policy-kernel-pack)

## Purpose

Provides baseline repository policy guardrails for correctness, verification, and ambiguity handling, with reusable skills assets for consistent enforcement.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-policy-kernel-pack/.github/instructions/00-repo-core.instructions.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-policy-kernel-pack/.github/instructions/00-repo-core.instructions.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-policy-kernel-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-policy-kernel-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- None detected

## Key agents

- None detected

## Key skills

- .github/skills/repo-core-policy/SKILL.md

## Directory tree

```text
copilot-policy-kernel-pack/
  .github/
    copilot-instructions.md
    instructions/
      00-repo-core.instructions.md
    skills/
      repo-core-policy/
        SKILL.md
        resources/
          policy-checklist.md
        scripts/
          policy-self-check.sh
  .vscode/
    settings.json
  PACK_MANIFEST.json
  README.md
  tools/
    validate-instructions.py
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
