# Project Management Planning (copilot-project-management-planning-pack)

## Purpose

Create and maintain an end-to-end project plan that stays current as scope, risk, and execution conditions change.

## Install mode

suite

## Key prompts

- .github/prompts/checkpoint-review.prompt.md
- .github/prompts/planning-brief.prompt.md
- .github/prompts/planning-replan.prompt.md
- .github/prompts/planning-ship.prompt.md
- .github/prompts/variance-triage.prompt.md

## Key agents

- .github/agents/execution-gate-reviewer.agent.md
- .github/agents/project-planning-lead.agent.md
- .github/agents/risk-dependency-coordinator.agent.md
- .github/agents/scope-clarifier.agent.md
- .github/agents/work-breakdown-planner.agent.md

## Directory tree

```text
copilot-project-management-planning-pack/
  .github/
    agents/
      execution-gate-reviewer.agent.md
      project-planning-lead.agent.md
      risk-dependency-coordinator.agent.md
      scope-clarifier.agent.md
      work-breakdown-planner.agent.md
    copilot-instructions.md
    prompts/
      checkpoint-review.prompt.md
      planning-brief.prompt.md
      planning-replan.prompt.md
      planning-ship.prompt.md
      variance-triage.prompt.md
    skills/
      dependency-critical-path-mapping/
        SKILL.md
        templates/
          dependency-map.md
      execution-gate-checklist/
        SKILL.md
        templates/
          gate-checklist.md
      project-plan-contract/
        SKILL.md
        templates/
          project-plan.md
      variance-and-backpedal-management/
        SKILL.md
        templates/
          replan-delta.md
          variance-log.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    planning/
      PROJECT_PLANNING.md
  PACK_MANIFEST.json
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
