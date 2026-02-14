# Copilot Edge Case Vanguard Pack

## Purpose

The Edge Case Vanguard pack improves Copilot’s ability to discover and mitigate failure-prone edge conditions across:

- code-level behavior,
- runtime/execution boundaries,
- operations/production resilience.

It emphasizes hypothesis-driven investigation, verification-first decisions, and one-slice reversible remediation.

## How it works

1. Start with `audit:edge-inventory` to map edge surfaces and rank hypotheses.
2. Choose a validation mode:
   - `test:pbt-plan` for invariant-led property testing plans.
   - `test:fuzz-plan` for harness/corpus/crash triage plans.
   - `ops:chaos-experiments` for bounded resilience experiments.
3. Use `ops:observability-gaps` to close signal and alerting blind spots.
4. Ship one reversible mitigation via `fix:one-slice`.

## Prompt usage

- `audit:edge-inventory` → taxonomy inventory + prioritized hypotheses.
- `test:pbt-plan` → property strategy, seeds, and deterministic regression conversion.
- `test:fuzz-plan` → fuzz harness strategy, corpus, triage, and crash-to-test flow.
- `ops:chaos-experiments` → controlled experiment with blast radius and abort guards.
- `ops:observability-gaps` → signal deficit report with instrumentation plan.
- `fix:one-slice` → minimal remediation plan with tests and rollback.

## Handoff map

The orchestrator agent explicitly coordinates cross-domain handoffs for deeper review:

- Security handoff for abuse paths, auth/authz drift, and sanitization risk.
- Release handoff for rollout safety, dependency integrity, and rollback mechanics.
- Docs handoff for runbook/ADR/policy updates.
- Standards handoff for test sizing, quality gate fit, and maintainability.

## Validation checklist

- Namespaced and unique prompts are present.
- No suite-owned files are included (no `.github/copilot-instructions.md`, no `.vscode/settings.json`).
- `PACK_MANIFEST.json` `owned_paths` covers all artifacts.
- Agent doctrine follows: enumerate → generate (PBT/fuzz) → experiment (chaos) → instrument → patch.
- Every mitigation proposal is small, reversible, test-backed, and includes rollback.

## Directory tree

```text
copilot-edge-case-vanguard-pack/
  .github/
    agents/
      edge-case-vanguard.agent.md
    prompts/
      chaos-experiments.prompt.md
      edge-inventory.prompt.md
      fuzz-plan.prompt.md
      observability-gaps.prompt.md
      one-slice.prompt.md
      pbt-plan.prompt.md
    skills/
      edge-case-vanguard/
        SKILL.md
  PACK_MANIFEST.json
  README.md
```
