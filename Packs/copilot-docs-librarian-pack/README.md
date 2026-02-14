# Docs Librarian (copilot-docs-librarian-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-docs-librarian-pack/.github/prompts/add-diagrams.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-docs-librarian-pack/.github/prompts/add-diagrams.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-docs-librarian-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-docs-librarian-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- .github/prompts/add-diagrams.prompt.md
- .github/prompts/diataxis-restructure.prompt.md
- .github/prompts/docs-audit.prompt.md
- .github/prompts/lint-docs.prompt.md
- .github/prompts/refresh-docs.prompt.md
- .github/prompts/refresh-glossary.prompt.md
- .github/prompts/style-sweep.prompt.md

## Key agents

- .github/agents/diagram-curator.agent.md
- .github/agents/diataxis-architect.agent.md
- .github/agents/docs-librarian.agent.md
- .github/agents/docs-lint-runner.agent.md
- .github/agents/glossary-curator.agent.md
- .github/agents/style-enforcer.agent.md

## Directory tree

```text
copilot-docs-librarian-pack/
  .github/
    agents/
      diagram-curator.agent.md
      diataxis-architect.agent.md
      docs-librarian.agent.md
      docs-lint-runner.agent.md
      glossary-curator.agent.md
      style-enforcer.agent.md
    copilot-instructions.md
    prompts/
      add-diagrams.prompt.md
      diataxis-restructure.prompt.md
      docs-audit.prompt.md
      lint-docs.prompt.md
      refresh-docs.prompt.md
      refresh-glossary.prompt.md
      style-sweep.prompt.md
    skills/
      diagram-and-glossary-coverage/
        SKILL.md
        templates/
          glossary.md
          mermaid-snippets.md
      diataxis-maintenance/
        SKILL.md
        templates/
          mode-templates.md
      docs-sanity-check/
        SKILL.md
      style-and-lint-enforcement/
        SKILL.md
        templates/
          markdownlint.json
          vale.ini
  .markdownlint.json
  .vale.ini
  .vscode/
    settings.json
  AGENTS.md
  docs/
    glossary.md
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
