---
name: deterministic-testing
description: Make tests deterministic by controlling time, randomness, IO boundaries, and using stable locators and waits.
---

# Deterministic Testing

## Controls

- Time: fake clock / freeze time in tests
- Randomness: seeded RNG
- Network: mock or record/replay where supported
- DB/FS: isolated per test; no shared state
- UI: stable locators (roles/labels/test IDs), event-driven waits

## Checklist

- No arbitrary sleeps
- No order dependency
- Fixtures are minimal and composable
- Failures show actionable diagnostics
