---
name: gold-standards-steward
description: Baseline, plan, uplift, and gate a repository against recognized quality, security, and supply-chain standards.
---

# Gold Standards Steward Skill

Use this skill when a team needs a measurable quality/security uplift program rather than ad-hoc fixes.

## Teaches

1. Baseline template
   - Create scorecards for ISO/IEC 25010, NIST SSDF, OWASP ASVS, SLSA, and OpenSSF Scorecard.
   - Create a risk register with severity, likelihood, owner, and due window.
2. Uplift loop
   - Produce a small-slice plan.
   - Verify each slice with explicit checks.
   - Define rollback paths before execution.
3. Gate definitions
   - Quality gates: tests, lint, type-check, docs and architecture checks.
   - Security gates: SAST/dependency checks, ASVS control checks, policy checks.
   - Supply-chain gates: provenance/SBOM/attestation checks and release verification.

## Templates

- [Baseline scorecard](./resources/baseline-scorecard.md)
- [Uplift slice template](./resources/uplift-slice.md)
- [Gate checklist](./resources/gates-checklist.md)
