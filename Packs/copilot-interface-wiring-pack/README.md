# Interface Wiring (copilot-interface-wiring-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Key prompts

- .github/prompts/add-mocks.prompt.md
- .github/prompts/api-contract.prompt.md
- .github/prompts/generate-typed-client.prompt.md
- .github/prompts/integration-test.prompt.md
- .github/prompts/wire-up-feature.prompt.md

## Key agents

- .github/agents/api-contract-analyst.agent.md
- .github/agents/integration-reviewer.agent.md
- .github/agents/integration-tester.agent.md
- .github/agents/interface-wireup.agent.md
- .github/agents/ui-integrator.agent.md

## Directory tree

```text
copilot-interface-wiring-pack/
  .github/
    agents/
      api-contract-analyst.agent.md
      integration-reviewer.agent.md
      integration-tester.agent.md
      interface-wireup.agent.md
      ui-integrator.agent.md
    copilot-instructions.md
    prompts/
      add-mocks.prompt.md
      api-contract.prompt.md
      generate-typed-client.prompt.md
      integration-test.prompt.md
      wire-up-feature.prompt.md
    skills/
      contract-first-integration/
        SKILL.md
        templates/
          contract.md
          error-taxonomy.md
      integration-testing-seams/
        SKILL.md
        templates/
          test-plan.md
      ui-backend-wiring-workflow/
        SKILL.md
        templates/
          mapping-table.md
          state-matrix.md
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
