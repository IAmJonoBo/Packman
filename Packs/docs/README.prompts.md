# Prompts Guide

Prompt files live under `.github/prompts/**` and use `*.prompt.md`.

## Required frontmatter

- `name`
- `description`
- optional: `agent`, `tools`

## Naming

- Prompt names must be globally unique across the suite.
- Use stable namespaces (`brief:`, `audit:`, `ship:`, `sec:`, `qa:`, `ops:`, `ux:`, `suite:`).

## Install UX

Each pack README should include grouped install links:

- Install agent in VS Code / Insiders
- Install prompts in VS Code / Insiders

## Validation

- `pnpm run governance:suite-inventory`
- `pnpm run governance:install-links-report`
