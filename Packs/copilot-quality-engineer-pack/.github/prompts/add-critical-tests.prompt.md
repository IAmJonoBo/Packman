---
name: "brief:add-critical-tests"
description: >-
  Create/refresh critical path inventory and add the smallest set of tests that
  materially reduce regression risk.
agent: Quality Engineer
---

Scope: ${selection}

Do:

1. Detect test stack and how to run it.
2. Create critical path inventory (flows → tests).
3. Add 2–5 high-impact tests (mix of unit/integration/e2e as needed).
4. Ensure determinism (fixtures, clocks, network control).

Output:

- Inventory
- Tests added
- Commands to run
