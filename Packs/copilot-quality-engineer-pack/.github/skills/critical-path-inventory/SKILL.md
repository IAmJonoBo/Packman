---
name: critical-path-inventory
description: Define and maintain a critical path inventory (top flows) and map them to tests to prevent regressions.
---

# Critical Path Inventory

## Procedure
1) List top user/system flows (ranked by business impact).
2) For each flow, list:
   - entry conditions
   - primary steps
   - expected outcomes
   - failure modes
3) Map to tests:
   - unit tests for logic
   - integration tests for boundaries
   - e2e tests only for multi-system UX verification
4) Keep it current: update when flows change.

## Template
- [Critical flows table](./templates/critical-flows.md)

