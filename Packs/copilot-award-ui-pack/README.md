# Award Ui (copilot-award-ui-pack)

## Purpose
Describe the purpose of this pack.

## Install mode
suite

## Key prompts
- .github/prompts/art-direct-screen.prompt.md
- .github/prompts/design-system-blueprint.prompt.md
- .github/prompts/layout-grid.prompt.md
- .github/prompts/pixel-perfect-review.prompt.md
- .github/prompts/tokens-and-typography.prompt.md
- .github/prompts/ui-brief.prompt.md

## Key agents
- .github/agents/art-direction-planner.agent.md
- .github/agents/design-system-engineer.agent.md
- .github/agents/pixel-qa-reviewer.agent.md
- .github/agents/screen-composer.agent.md
- .github/agents/ui-art-director.agent.md

## Directory tree

```text
copilot-award-ui-pack/
  .github/
    agents/
      art-direction-planner.agent.md
      design-system-engineer.agent.md
      pixel-qa-reviewer.agent.md
      screen-composer.agent.md
      ui-art-director.agent.md
    copilot-instructions.md
    prompts/
      art-direct-screen.prompt.md
      design-system-blueprint.prompt.md
      layout-grid.prompt.md
      pixel-perfect-review.prompt.md
      tokens-and-typography.prompt.md
      ui-brief.prompt.md
    skills/
      art-direction-intake-and-options/
        SKILL.md
        templates/
          brief.md
      design-tokens-and-typography/
        SKILL.md
        templates/
          type-scale.md
      layout-composition-grid/
        SKILL.md
        templates/
          grid-spec.md
      pixel-perfect-qa/
        SKILL.md
  .vscode/
    settings.json
  AGENTS.md
  README.md
```

## Post-install checklist
- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
