---
name: projen-scaffolding
description: Uses projen as definition-as-code scaffolding; keeps .projenrc.* minimal and uses synth as the regeneration mechanism.
---

# Projen Scaffolding

## Principles
- `.projenrc.*` is the source of truth; files are synthesised.
- Use `npx projen new <type>` to start.
- Keep synthesis deterministic: pin toolchain, commit lockfiles, avoid env-dependent output.

## Notes
- projen creates `.projenrc.js/.ts/.py/.json` depending on project type.

## Templates
- [Projen starter checklist](./templates/projen-checklist.md)

