# Polish Tightening (copilot-polish-tightening-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-polish-tightening-pack/.github/prompts/consistency-pass.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-polish-tightening-pack/.github/prompts/consistency-pass.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-polish-tightening-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-polish-tightening-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- .github/prompts/consistency-pass.prompt.md
- .github/prompts/nit-sweep.prompt.md
- .github/prompts/polish-brief.prompt.md
- .github/prompts/polish-review.prompt.md
- .github/prompts/polish-ship.prompt.md
- .github/prompts/refactor-safely.prompt.md
- .github/prompts/slice-small-cls.prompt.md

## Key agents

- .github/agents/consistency-enforcer.agent.md
- .github/agents/nit-hunter.agent.md
- .github/agents/polish-gate-reviewer.agent.md
- .github/agents/polish-tightening-engineer.agent.md
- .github/agents/refactor-surgeon.agent.md
- .github/agents/small-cl-slicer.agent.md

## Directory tree

```text
copilot-polish-tightening-pack/
  .github/
    agents/
      consistency-enforcer.agent.md
      nit-hunter.agent.md
      polish-gate-reviewer.agent.md
      polish-tightening-engineer.agent.md
      refactor-surgeon.agent.md
      small-cl-slicer.agent.md
    copilot-instructions.md
    prompts/
      consistency-pass.prompt.md
      nit-sweep.prompt.md
      polish-brief.prompt.md
      polish-review.prompt.md
      polish-ship.prompt.md
      refactor-safely.prompt.md
      slice-small-cls.prompt.md
    skills/
      operational-tidiness-12factor-inspired/
        SKILL.md
      polish-checklist/
        SKILL.md
      refactoring-baby-steps/
        SKILL.md
        templates/
          refactor-plan.md
      small-change-discipline/
        SKILL.md
        templates/
          slice-plan.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    polish/
      POLISH_ENGINEERING.md
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
