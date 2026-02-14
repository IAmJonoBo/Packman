---
name: "brief:polish-ship"
description: >-
  End-to-end polish pass: brief → nits → slice plan → safe refactors →
  consistency → gate review.
agent: Polish & Tightening Engineer
---

Scope: ${selection}

Do:

1. If brief incomplete, run /polish-brief.
2. Run /nit-sweep and rank items.
3. Produce a small-CL slice plan.
4. Apply safe refactors and consistency pass (only what is approved by brief).
5. Run /polish-review and provide verification commands.

Output:

- Improvements shipped
- Remaining opportunities
- Next suggested slices
