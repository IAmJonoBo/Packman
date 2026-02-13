---
name: flake-triage
description: Systematically diagnose and eliminate flaky tests and reduce future flake risk.
---

# Flake Triage

## Triage steps

1. Categorise: locator, timing, shared state, network/env, perf.
2. Reproduce deterministically (single test, headed mode, trace if available).
3. Fix root cause:
   - locators: role/label/test-id
   - timing: proper waits/assertions
   - state: isolate per test
   - network: mocks/fixtures
4. Add guardrails: lint rules or helper utilities.
