---
name: "brief:test:fuzz-plan"
description: >-
  Build a fuzzing plan and harness strategy focused on boundary-heavy and
  parser-adjacent failure surfaces.
---

Produce a fuzz plan with:

- target entrypoints,
- harness design,
- seed corpus strategy,
- crash triage workflow,
- conversion of crashes into deterministic regression tests.

Enforce:

- incremental rollout,
- clear abort conditions,
- explicit rollback instructions for any instrumentation/config changes.
