# Gold Standards Steward (copilot-gold-standards-steward-pack)

## Purpose

This pack provides a cross-domain uplift orchestrator that benchmarks repository posture and drives small, verifiable upgrades against:

- ISO/IEC 25010 quality characteristics
- NIST SSDF secure software development practices
- OWASP ASVS target level (L1/L2/L3)
- SLSA provenance and build integrity targets
- OpenSSF Scorecard observable supply-chain signals

## What it enforces

- Baseline first: no blind edits before current posture is measured.
- Explicit constraints: risk tolerance, rewrite limits, compliance targets, and critical boundaries are captured before planning.
- Small CL delivery: one focused change per slice, each with verification and rollback notes.
- Dry-run discipline: high-impact edits require an approved dry-run plan before execution.

## How it works

1. Baseline
   - Produce scorecards, risk register, and control-gap map.
2. Plan
   - Convert findings into prioritized uplift slices with blast-radius control.
3. Execute slices
   - Apply one reversible change at a time, with tests and proof.
4. Gate
   - Install and enforce CI/security/provenance gates for sustained posture.

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-gold-standards-steward-pack/.github/prompts/audit-gold-standard.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-gold-standards-steward-pack/.github/prompts/audit-gold-standard.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-gold-standards-steward-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-gold-standards-steward-pack --target-type global --to /path/to/profile --mode fail --json`

## Slash commands

- `/audit:gold-standard` — full benchmark and baseline report.
- `/uplift:plan` — generate prioritized, reversible uplift plan.
- `/uplift:execute-slice` — execute one approved slice with verification.
- `/gates:setup` — define and wire gates (quality, security, provenance).
- `/audit:doctor-report` — produce current-state doctor report and delta vs baseline.

## Handoff map

- Security controls and threat posture → `Security Gatekeeper`
- Supply-chain and release integrity → `Release & Supply Chain Engineer`
- Documentation and standards narratives → `Docs Librarian`
- Code polish and maintainability tightening → `Polish & Tightening Engineer`
- UI/user-facing quality implications → `UXPrototyper`

## Directory tree

```text
copilot-gold-standards-steward-pack/
  .github/
    agents/
      gold-standards-steward.agent.md
    instructions/
      gs-small-cls.instructions.md
    prompts/
      audit-gold-standard.prompt.md
      doctor-report.prompt.md
      gates-setup.prompt.md
      uplift-execute-slice.prompt.md
      uplift-plan.prompt.md
    skills/
      gold-standards-steward/
        SKILL.md
        resources/
          baseline-scorecard.md
          gates-checklist.md
          uplift-slice.md
  PACK_MANIFEST.json
  README.md
```
