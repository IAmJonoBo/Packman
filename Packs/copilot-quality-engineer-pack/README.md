# Quality Engineer (copilot-quality-engineer-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Key prompts

- .github/prompts/add-critical-tests.prompt.md
- .github/prompts/contract-tests.prompt.md
- .github/prompts/fixture-kit.prompt.md
- .github/prompts/make-tests-deterministic.prompt.md
- .github/prompts/quality-brief.prompt.md
- .github/prompts/quality-review.prompt.md
- .github/prompts/quality-ship.prompt.md

## Key agents

- .github/agents/contract-tester.agent.md
- .github/agents/flake-hunter.agent.md
- .github/agents/quality-engineer.agent.md
- .github/agents/quality-gate-reviewer.agent.md
- .github/agents/test-implementer.agent.md
- .github/agents/test-planner.agent.md

## Directory tree

```text
copilot-quality-engineer-pack/
  .github/
    agents/
      contract-tester.agent.md
      flake-hunter.agent.md
      quality-engineer.agent.md
      quality-gate-reviewer.agent.md
      test-implementer.agent.md
      test-planner.agent.md
    copilot-instructions.md
    prompts/
      add-critical-tests.prompt.md
      contract-tests.prompt.md
      fixture-kit.prompt.md
      make-tests-deterministic.prompt.md
      quality-brief.prompt.md
      quality-review.prompt.md
      quality-ship.prompt.md
    skills/
      contract-testing-seams/
        SKILL.md
        templates/
          contract-test-plan.md
      critical-path-inventory/
        SKILL.md
        templates/
          critical-flows.md
      deterministic-testing/
        SKILL.md
      flake-triage/
        SKILL.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    quality/
      QUALITY_ENGINEERING.md
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
