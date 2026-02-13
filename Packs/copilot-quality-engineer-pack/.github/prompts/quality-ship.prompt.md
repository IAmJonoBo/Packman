---
name: quality-ship
description: "End-to-end quality pass: brief → plan → implement → de-flake → review."
agent: "Quality Engineer"
---

Scope: ${selection}

Do:

1. If brief incomplete, run /quality-brief.
2. Detect stack and define critical paths.
3. Add smallest set of tests that reduce risk.
4. Harden determinism.
5. Provide run commands and review checklist.

Output:

- Summary of changes
- Tests and commands
- Remaining risks
