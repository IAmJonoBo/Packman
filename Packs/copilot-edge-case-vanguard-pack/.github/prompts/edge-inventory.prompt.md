---
name: audit:edge-inventory
description: Build a complete edge-case inventory across code, runtime, and operations with evidence-driven prioritization.
---

Use the edge-case-vanguard skill and produce:

1. A taxonomy-based inventory (inputs/state/concurrency/time/resources/dependencies/ops).
2. Top 5 high-risk hypotheses with rationale and blast radius.
3. Verification plan for each (tests + runtime/ops checks).
4. Recommended first one-slice mitigation candidate.

Constraints:

- Be hypothesis-driven and verification-first.
- Avoid broad refactors; prefer surgical, reversible actions.
