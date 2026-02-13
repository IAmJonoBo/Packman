---
name: qa:ship
description: Run a quality pass: tests, determinism, linting and CI sanity for the selected scope.
agent: 'Quality Engineer'
---

Target: ${selection}

Do:

- Add/adjust tests (deterministic).
- Remove flakiness.
- Provide verification commands.

Output: what changed + commands.
