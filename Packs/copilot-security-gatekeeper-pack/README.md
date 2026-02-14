# Security Gatekeeper (copilot-security-gatekeeper-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-security-gatekeeper-pack/.github/prompts/asvs-checklist.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-security-gatekeeper-pack/.github/prompts/asvs-checklist.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-security-gatekeeper-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-security-gatekeeper-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- .github/prompts/asvs-checklist.prompt.md
- .github/prompts/dependency-risk-triage.prompt.md
- .github/prompts/secure-error-model.prompt.md
- .github/prompts/secure-ship.prompt.md
- .github/prompts/security-brief.prompt.md
- .github/prompts/security-review.prompt.md
- .github/prompts/threat-model.prompt.md

## Key agents

- .github/agents/asvs-mapper.agent.md
- .github/agents/secure-implementer.agent.md
- .github/agents/security-gatekeeper.agent.md
- .github/agents/security-reviewer.agent.md
- .github/agents/threat-modeler.agent.md

## Directory tree

```text
copilot-security-gatekeeper-pack/
  .github/
    agents/
      asvs-mapper.agent.md
      secure-implementer.agent.md
      security-gatekeeper.agent.md
      security-reviewer.agent.md
      threat-modeler.agent.md
    copilot-instructions.md
    prompts/
      asvs-checklist.prompt.md
      dependency-risk-triage.prompt.md
      secure-error-model.prompt.md
      secure-ship.prompt.md
      security-brief.prompt.md
      security-review.prompt.md
      threat-model.prompt.md
    skills/
      asvs-scoped-checklist/
        SKILL.md
        templates/
          asvs-mapping.md
      dependency-risk-triage/
        SKILL.md
      safe-errors-and-logging/
        SKILL.md
        templates/
          error-mapping.md
      threat-modeling-lite/
        SKILL.md
        templates/
          threat-model.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    security/
      SECURITY_GATEKEEPER.md
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
