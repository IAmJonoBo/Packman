# Prompt Library (copilot-prompt-library-pack)

## Purpose
Describe the purpose of this pack.

## Install mode
suite

## Key prompts
- .github/prompts/audit/audit:repo-health.prompt.md
- .github/prompts/audit/audit:security-basics.prompt.md
- .github/prompts/audit/audit:ui-a11y.prompt.md
- .github/prompts/brief/brief:acceptance.prompt.md
- .github/prompts/brief/brief:clarify.prompt.md
- .github/prompts/gh/gh:bootstrap.prompt.md
- .github/prompts/gov/gov:ship.prompt.md
- .github/prompts/obs/obs:ship.prompt.md
- .github/prompts/polish/polish:ship.prompt.md
- .github/prompts/qa/qa:ship.prompt.md
- .github/prompts/rel/rel:ship.prompt.md
- .github/prompts/scaffold/scaffold:new.prompt.md

## Key agents
- None detected

## Directory tree

```text
copilot-prompt-library-pack/
  .github/
    copilot-instructions.md
    prompts/
      audit/
        audit:repo-health.prompt.md
        audit:security-basics.prompt.md
        audit:ui-a11y.prompt.md
      brief/
        brief:acceptance.prompt.md
        brief:clarify.prompt.md
      gh/
        gh:bootstrap.prompt.md
      gov/
        gov:ship.prompt.md
      obs/
        obs:ship.prompt.md
      polish/
        polish:ship.prompt.md
      qa/
        qa:ship.prompt.md
      rel/
        rel:ship.prompt.md
      scaffold/
        scaffold:new.prompt.md
      sec/
        sec:ship.prompt.md
      ship/
        ship:pr-ready.prompt.md
        ship:small-slice-plan.prompt.md
      suite/
        suite:route.prompt.md
      ui/
        ui:award.prompt.md
        ui:prototype.prompt.md
        ui:wiring.prompt.md
  .vscode/
    settings.json
  AGENTS.md
  README.md
  tools/
    validate-prompts.py
```

## Post-install checklist
- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
