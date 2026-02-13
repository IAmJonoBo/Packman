---
name: "audit:gold-standard"
description: Produce a standards-mapped baseline (ISO 25010, SSDF, ASVS, SLSA, Scorecard) and prioritized risk register.
agent: gold-standards-steward
tools: ["codebase", "search", "usages", "fetch", "agent"]
---

# audit:gold-standard

Scope: ${selection}

Do:

1. Capture constraints first (risk tolerance, rewrite policy, compliance target).
2. Build baseline scorecards across ISO 25010, SSDF, ASVS, SLSA, and Scorecard.
3. Produce risk register and top-priority uplift candidates.

Output:

- Baseline scorecards
- Risk register
- Prioritized uplift backlog
