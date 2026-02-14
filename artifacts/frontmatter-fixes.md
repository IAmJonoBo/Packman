# Frontmatter and naming fixes

Generated: 2026-02-14

## Scope

- Input artifact: `artifacts/suite-inventory.json`
- Canonical root: `Packs/`
- Focus: missing frontmatter and naming normalization

## Findings (pre-fix)

- Missing frontmatter: **0**
- Naming issues: **1**

## Applied fixes

1. Renamed non-conforming agent filename to kebab-case:
   - from: `Packs/copilot-release-supplychain-pack/.github/agents/release-supplychain.engineer.agent.md`
   - to: `Packs/copilot-release-supplychain-pack/.github/agents/release-supplychain-engineer.agent.md`

2. Updated references to the renamed file:
   - `Packs/copilot-release-supplychain-pack/README.md`
   - `Packs/README.md`

## Frontmatter notes

- No frontmatter fixes were required in this checkpoint.

## Next checkpoint handoff

- Regenerate `artifacts/suite-inventory.json` to verify naming issue count drops to zero.
- Proceed to install-link/report generation (CHECKPOINT C).
