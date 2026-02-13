---
name: fixture-kit
description: Create a deterministic fixture kit (data builders, fake servers, clocks) for reliable tests.
agent: 'Test Implementer'
---

Scope: ${selection}

Do:
- Identify needed fixtures and seams.
- Implement minimal builders/fixtures/mocks.
- Ensure no shared mutable global state.

Output:
- Fixture design
- Files added/changed
- Usage examples
