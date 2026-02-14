# Skills Guide

Skills should hold reusable, rules-heavy guidance with assets.

## Layout

- `SKILL.md` (intent, constraints, usage)
- `resources/` (templates, checklists, reference tables)
- `scripts/` (safe helper scripts)

## Authoring rules

- Keep `SKILL.md` concise and operational.
- Put large examples/checklists in `resources/`.
- Reference bundled assets from `SKILL.md` using relative paths.
- Keep scripts idempotent and safe-by-default.

## Validation

- `pnpm --filter packman-cli exec node dist/index.js validate <pack> --strict --suite`
- `pnpm --filter packman-cli exec node dist/index.js normalize <pack> --apply`
