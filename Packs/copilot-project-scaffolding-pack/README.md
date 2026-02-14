# Project Scaffolding (copilot-project-scaffolding-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-project-scaffolding-pack/.github/prompts/choose-scaffold-profile.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-project-scaffolding-pack/.github/prompts/choose-scaffold-profile.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-project-scaffolding-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-project-scaffolding-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- .github/prompts/choose-scaffold-profile.prompt.md
- .github/prompts/projen-synth.prompt.md
- .github/prompts/scaffold-audit.prompt.md
- .github/prompts/scaffold-brief.prompt.md
- .github/prompts/scaffold-new.prompt.md

## Key agents

- .github/agents/project-scaffolding-architect.agent.md
- .github/agents/projen-synthesizer.agent.md
- .github/agents/repospec-composer.agent.md
- .github/agents/scaffold-auditor.agent.md
- .github/agents/scaffold-profile-selector.agent.md

## Directory tree

```text
copilot-project-scaffolding-pack/
  .github/
    agents/
      project-scaffolding-architect.agent.md
      projen-synthesizer.agent.md
      repospec-composer.agent.md
      scaffold-auditor.agent.md
      scaffold-profile-selector.agent.md
    copilot-instructions.md
    prompts/
      choose-scaffold-profile.prompt.md
      projen-synth.prompt.md
      scaffold-audit.prompt.md
      scaffold-brief.prompt.md
      scaffold-new.prompt.md
    skills/
      projen-scaffolding/
        SKILL.md
        templates/
          projen-checklist.md
      repospec-contract/
        SKILL.md
        templates/
          repospec.md
      scaffold-profile-catalogue/
        SKILL.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    scaffolding/
      README.md
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
