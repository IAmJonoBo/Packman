# Observability Incident (copilot-observability-incident-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Key prompts

- .github/prompts/define-slos.prompt.md
- .github/prompts/dora-review.prompt.md
- .github/prompts/incident-triage.prompt.md
- .github/prompts/instrument-service.prompt.md
- .github/prompts/observability-brief.prompt.md
- .github/prompts/observability-ship.prompt.md
- .github/prompts/write-postmortem.prompt.md

## Key agents

- .github/agents/dora-reporter.agent.md
- .github/agents/incident-commander-coach.agent.md
- .github/agents/observability-lead.agent.md
- .github/agents/otel-instrumentation-engineer.agent.md
- .github/agents/postmortem-editor.agent.md
- .github/agents/slo-alert-designer.agent.md

## Directory tree

```text
copilot-observability-incident-pack/
  .github/
    agents/
      dora-reporter.agent.md
      incident-commander-coach.agent.md
      observability-lead.agent.md
      otel-instrumentation-engineer.agent.md
      postmortem-editor.agent.md
      slo-alert-designer.agent.md
    copilot-instructions.md
    prompts/
      define-slos.prompt.md
      dora-review.prompt.md
      incident-triage.prompt.md
      instrument-service.prompt.md
      observability-brief.prompt.md
      observability-ship.prompt.md
      write-postmortem.prompt.md
    skills/
      dora-metrics-definition/
        SKILL.md
        templates/
          dora.md
      incident-triage-and-timeline/
        SKILL.md
        templates/
          live-checklist.md
          timeline.md
      otel-semantic-conventions/
        SKILL.md
        templates/
          span-attribute-map.md
      postmortems-and-action-items/
        SKILL.md
        templates/
          action-items.md
          postmortem.md
      slo-alerting-runbooks/
        SKILL.md
        templates/
          alert-rubric.md
          runbook.md
          slo-table.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    ops/
      OBSERVABILITY.md
      POSTMORTEM_TEMPLATE.md
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
