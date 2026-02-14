# Github Bootstrap (copilot-github-bootstrap-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-github-bootstrap-pack/.github/prompts/add-issue-forms.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-github-bootstrap-pack/.github/prompts/add-issue-forms.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-github-bootstrap-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-github-bootstrap-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- .github/prompts/add-issue-forms.prompt.md
- .github/prompts/add-pr-template.prompt.md
- .github/prompts/community-profile-audit.prompt.md
- .github/prompts/dependabot-policy.prompt.md
- .github/prompts/github-bootstrap.prompt.md
- .github/prompts/repo-settings-brief.prompt.md
- .github/prompts/setup-codeowners.prompt.md
- .github/prompts/setup-security-policy.prompt.md

## Key agents

- .github/agents/community-health-auditor.agent.md
- .github/agents/dependabot-steward.agent.md
- .github/agents/github-bootstrap-engineer.agent.md
- .github/agents/ownership-marshal.agent.md
- .github/agents/security-policy-editor.agent.md
- .github/agents/template-curator.agent.md

## Directory tree

```text
copilot-github-bootstrap-pack/
  .github/
    agents/
      community-health-auditor.agent.md
      dependabot-steward.agent.md
      github-bootstrap-engineer.agent.md
      ownership-marshal.agent.md
      security-policy-editor.agent.md
      template-curator.agent.md
    CODEOWNERS
    copilot-instructions.md
    dependabot.yml
    ISSUE_TEMPLATE/
      bug-report.yml
      config.yml
      docs.yml
      feature-request.yml
    prompts/
      add-issue-forms.prompt.md
      add-pr-template.prompt.md
      community-profile-audit.prompt.md
      dependabot-policy.prompt.md
      github-bootstrap.prompt.md
      repo-settings-brief.prompt.md
      setup-codeowners.prompt.md
      setup-security-policy.prompt.md
    PULL_REQUEST_TEMPLATE.md
    skills/
      codeowners-ownership/
        SKILL.md
      github-community-health/
        SKILL.md
      issue-forms-and-templates/
        SKILL.md
      pr-template-and-review-contract/
        SKILL.md
  .vscode/
    settings.json
  AGENTS.md
  CODE_OF_CONDUCT.md
  CONTRIBUTING.md
  docs/
    github/
      BOOTSTRAP.md
  README.md
  SECURITY.md
  SUPPORT.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
