# Gold Standard Repo Suite

## Purpose

Baseline suite for policy, governance, security, release reliability, documentation quality, scaffolding, and polish.

## Included packs (deterministic order)

1. `Packs/copilot-policy-kernel-pack`
2. `Packs/copilot-hooks-orchestrator-pack`
3. `Packs/copilot-security-gatekeeper-pack`
4. `Packs/copilot-release-supplychain-pack`
5. `Packs/copilot-docs-librarian-pack`
6. `Packs/copilot-project-scaffolding-pack`
7. `Packs/copilot-polish-tightening-pack`

## Install example

`pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-policy-kernel-pack --to /path/to/repo --mode fail --json`

Repeat for the remaining packs in order.
