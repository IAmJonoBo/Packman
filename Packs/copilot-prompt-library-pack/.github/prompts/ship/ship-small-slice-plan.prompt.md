---
name: ship:small-slice-plan
description: Convert the requested work into small mergeable slices with verification per slice.
agent: "ask"
---

Produce a slice plan:

| Slice | Purpose | Files/Areas | Risk | Verification |
| ----- | ------- | ----------- | ---- | ------------ |

Rules:

- Separate refactors from behaviour changes.
- Each slice should be reviewable and releasable.
