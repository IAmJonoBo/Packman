# Suite Harmoniser (copilot-suite-harmoniser-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-suite-harmoniser-pack/.github/prompts/suite/suite:route.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-suite-harmoniser-pack/.github/prompts/suite/suite:route.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-suite-harmoniser-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-suite-harmoniser-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- .github/prompts/suite/suite:route.prompt.md

## Key agents

- .github/agents/suite-chief-of-staff.agent.md

## Directory tree

```text
copilot-suite-harmoniser-pack/
  .github/
    agents/
      suite-chief-of-staff.agent.md
    copilot-instructions.md
    prompts/
      suite/
        suite:route.prompt.md
  .vscode/
    settings.json
  AGENTS.md
  ALLOWED_SUBAGENTS.json
  PACK_MANIFEST.json
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
