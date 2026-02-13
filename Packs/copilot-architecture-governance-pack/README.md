# Architecture Governance (copilot-architecture-governance-pack)

## Purpose
Describe the purpose of this pack.

## Install mode
suite

## Key prompts
- .github/prompts/architecture-brief.prompt.md
- .github/prompts/architecture-ship.prompt.md
- .github/prompts/governance-review.prompt.md
- .github/prompts/risk-score-change.prompt.md
- .github/prompts/trunk-slice.prompt.md
- .github/prompts/write-adr.prompt.md

## Key agents
- .github/agents/adr-writer.agent.md
- .github/agents/architecture-governance-steward.agent.md
- .github/agents/change-risk-scorer.agent.md
- .github/agents/code-review-marshal.agent.md
- .github/agents/trunk-coach.agent.md

## Directory tree

```text
copilot-architecture-governance-pack/
  .github/
    agents/
      adr-writer.agent.md
      architecture-governance-steward.agent.md
      change-risk-scorer.agent.md
      code-review-marshal.agent.md
      trunk-coach.agent.md
    copilot-instructions.md
    prompts/
      architecture-brief.prompt.md
      architecture-ship.prompt.md
      governance-review.prompt.md
      risk-score-change.prompt.md
      trunk-slice.prompt.md
      write-adr.prompt.md
    skills/
      adr-discipline-nygard/
        SKILL.md
        templates/
          adr-index.md
          adr-template.md
      change-risk-scoring/
        SKILL.md
      review-gates-google-standard/
        SKILL.md
      trunk-discipline/
        SKILL.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    architecture/
      adr/
        ADR-000-template.md
        README.md
      README.md
  README.md
```

## Post-install checklist
- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
