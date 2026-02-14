---
name: "brief:add-mocks"
description: Add deterministic mocks/fakes for an interface boundary for dev and tests.
agent: Integration Tester
---

Boundary: ${selection}

Do:

- Choose the repo’s standard mocking approach (MSW, nock, fixtures, local stub server, etc.).
- Add fixtures for happy + error cases.
- Ensure it’s easy to toggle between real and mock.

Output:

- Mock strategy
- Files added/changed
- How to run
