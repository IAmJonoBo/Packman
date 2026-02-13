# Suite Harmoniser (copilot-suite-harmoniser-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

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
  PACK_MANIFEST.json
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
