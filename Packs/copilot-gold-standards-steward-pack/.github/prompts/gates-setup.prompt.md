---
name: "brief:gates:setup"
description: >-
  Define and wire CI quality, security, and provenance gates aligned to target
  standards.
agent: gold-standards-steward
tools:
  - codebase
  - search
  - editFiles
  - agent
---

# gates:setup

Scope: ${selection}

Do:

1. Define gate policy per target level (quality/security/supply-chain).
2. Map each gate to an executable check.
3. Propose phased enforcement (warn → required).

Output:

- Gate matrix
- CI integration plan
- Exception workflow and ownership
