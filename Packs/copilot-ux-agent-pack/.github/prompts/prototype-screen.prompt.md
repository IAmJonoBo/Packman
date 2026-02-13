---
name: prototype-screen
description: Build a clickable prototype for a described screen/flow with strong UX states.
agent: 'UX Prototyper'
---

Goal: Produce a working prototype (screen + components), covering states and accessibility.

Inputs:
- Screen/flow description: ${selection}

Steps:
1) JTBD + acceptance criteria.
2) Define states: default/loading/empty/error/success + edge cases.
3) Component decomposition (props + variants).
4) Implement components then wire up minimal flow.
5) Verify keyboard + semantics. Add a minimal test if the repo has a harness.

Deliver:
- Files changed
- Commands to run
- Verification checklist
