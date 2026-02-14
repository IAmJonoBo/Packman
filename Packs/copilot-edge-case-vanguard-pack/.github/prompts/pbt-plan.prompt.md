---
name: test:pbt-plan
description: Design property-based tests that uncover edge-case violations and produce replayable failures.
---

Create a property-based testing plan for the selected module:

- Define invariants.
- Define input strategy domains and constraints.
- Identify known pathological examples.
- Specify replay seed handling and regression test conversion.
- Provide pass/fail gates and stop criteria.

Output must include:

- test files to add/update,
- smallest initial scope,
- rollback path if flaky behavior appears.
