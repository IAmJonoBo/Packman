# Design / UX Power Suite

## Purpose

Focused suite for UI quality, UX execution, component wiring, and prompt acceleration for design-heavy workflows.

## Included packs (deterministic order)

1. `Packs/copilot-award-ui-pack`
2. `Packs/copilot-interface-wiring-pack`
3. `Packs/copilot-ux-agent-pack`
4. `Packs/copilot-prompt-library-pack`

## Install example

`pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-award-ui-pack --to /path/to/repo --mode fail --json`

Repeat for the remaining packs in order.
