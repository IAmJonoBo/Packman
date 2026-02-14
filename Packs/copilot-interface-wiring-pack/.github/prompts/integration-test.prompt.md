---
name: "brief:integration-test"
description: >-
  Add a critical-path integration test for a wired feature (plus one error
  case).
agent: Integration Tester
---

Target flow: ${selection}

Do:

- Write a minimal test plan (2–3 tests).
- Implement the tests using existing harness.
- Ensure deterministic data via mocks/fixtures.

Output:

- Test plan
- Tests added
- Commands to run
