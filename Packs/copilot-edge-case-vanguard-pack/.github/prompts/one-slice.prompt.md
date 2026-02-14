---
name: "brief:fix:one-slice"
description: >-
  Propose a single reversible mitigation slice with tests, verification gates,
  and rollback procedure.
---

Design one minimal remediation slice for the highest-priority edge case:

- exact code/config delta,
- tests to add first,
- verification sequence,
- deployment guardrails,
- rollback trigger + rollback steps.

Rules:

- no broad redesign,
- no hidden side effects,
- include residual risks and next-slice suggestions.
