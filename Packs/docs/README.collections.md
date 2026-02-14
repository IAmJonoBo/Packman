# Collections Guide

Collections are deterministic bundles of packs for one-shot installation.

## Location

- `Packs/collections/<collection>/README.md`
- required machine-readable descriptor (`collection.json`) in the same directory

## Required content

- Purpose and target use case
- Exact included packs (ordered list)
- One Packman install example

## Example install flow

1. Validate source packs:
   - `pnpm --filter packman-cli exec node dist/index.js validate ./Packs --strict --suite --auto-clean`
2. Install selected packs to target:
   - `pnpm --filter packman-cli exec node dist/index.js install ./Packs/<pack> --to /path/to/repo --mode fail --json`
3. Run doctor on target:
   - `pnpm --filter packman-cli exec node dist/index.js doctor /path/to/repo`
