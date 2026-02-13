# Policy Kernel (copilot-policy-kernel-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Key prompts

- None detected

## Key agents

- None detected

## Directory tree

```text
copilot-policy-kernel-pack/
  .github/
    copilot-instructions.md
    instructions/
      00-repo-core.instructions.md
  .vscode/
    settings.json
  PACK_MANIFEST.json
  README.md
  tools/
    validate-instructions.py
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
