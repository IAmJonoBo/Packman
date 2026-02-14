---
name: "brief:uplift:plan"
description: >-
  Convert baseline findings into a sequenced uplift plan of reversible small CL
  slices.
agent: gold-standards-steward
tools:
  - codebase
  - search
  - usages
  - agent
---

# uplift:plan

Scope: ${selection}

Do:

1. Select target standards level and timing assumptions.
2. Produce sequenced small-CL slices with owners and verification.
3. Mark high-impact slices requiring approved dry-run plans.

Output:

- Sequenced uplift plan
- Slice definitions (scope, verify, rollback)
- Gate dependencies and acceptance criteria
