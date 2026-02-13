---
name: docs-sanity-check
description: "A sanity-check workflow to keep documentation current: validate commands, versions, paths, behaviour, and link integrity."
---

# Docs Sanity Check

## Procedure

1. Identify drift-prone claims:
   - versions, command flags, env vars, defaults
   - file paths, API endpoints, feature availability
2. Validate against:
   - codebase (source, config, constants)
   - build scripts/CI
   - release notes/changelogs (if present)
3. Update docs and add notes where behaviour differs by version.
4. Verify link integrity (internal anchors + important external links).

## Output

- Drift items validated
- Evidence notes (where you checked)
- Edits applied
