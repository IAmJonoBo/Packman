---
name: "brief:checkpoint-review"
description: >-
  Run a structured checkpoint review and produce decisions, actions, and
  escalation needs.
agent: Execution Gate Reviewer
---

Scope: ${selection}

Do:

1. Review progress against planned checkpoint outcomes.
2. Compare expected vs actual variance.
3. Confirm blockers, dependencies, and readiness.
4. Produce go or hold recommendation.

Output:

- Checkpoint status
- Decisions and action owners
- Escalations and deadline impacts
