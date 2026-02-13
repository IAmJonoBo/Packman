# Ux Agent (copilot-ux-agent-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Key prompts

- .github/prompts/component-spec.prompt.md
- .github/prompts/prototype-screen.prompt.md
- .github/prompts/tokens-hardening.prompt.md
- .github/prompts/ux-audit.prompt.md

## Key agents

- .github/agents/ux-implementer.agent.md
- .github/agents/ux-prototyper.agent.md
- .github/agents/ux-researcher.agent.md
- .github/agents/ux-reviewer.agent.md

## Directory tree

```text
copilot-ux-agent-pack/
  .github/
    agents/
      ux-implementer.agent.md
      ux-prototyper.agent.md
      ux-researcher.agent.md
      ux-reviewer.agent.md
    copilot-instructions.md
    prompts/
      component-spec.prompt.md
      prototype-screen.prompt.md
      tokens-hardening.prompt.md
      ux-audit.prompt.md
    skills/
      accessibility-sweep/
        SKILL.md
        templates/
          a11y-checklist.md
      ux-heuristic-audit/
        SKILL.md
      ux-prototype-workflow/
        SKILL.md
        templates/
          ux-contract.md
          verification-checklist.md
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
