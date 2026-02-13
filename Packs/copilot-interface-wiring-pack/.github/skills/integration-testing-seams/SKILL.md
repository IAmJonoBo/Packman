---
name: integration-testing-seams
description: Set up mocks/fixtures and add integration tests for wired features (happy path + key errors).
---

# Integration Testing Seams

## When to use
Use when wiring is complete or when regression risk is non-trivial.

## Steps
1) Choose seam:
   - network mock (MSW/nock)
   - local stub server
   - provider fake (in-memory)
2) Create deterministic fixtures:
   - happy path
   - validation/domain error
   - transient error (retry)
3) Write a minimal test plan and implement it with existing harness.

## Template
- [Test plan](./templates/test-plan.md)

