---
name: "brief:setup-codeowners"
description: >-
  Add CODEOWNERS and a minimal ownership map (ask for actual handles/teams if
  not available).
agent: Ownership Marshal
---

Scope: ${selection}

Output:

- CODEOWNERS created/updated
- Assumptions
- Any missing owner handles needed
