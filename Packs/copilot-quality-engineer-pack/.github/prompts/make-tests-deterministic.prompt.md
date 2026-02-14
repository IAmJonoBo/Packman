---
name: "brief:make-tests-deterministic"
description: "Remove flakiness by hardening locators, waits, fixtures, time, and randomness."
agent: Flake Hunter
---

Target: ${selection}

Output:

- Root causes
- Fixes applied
- Repro steps + verification commands
