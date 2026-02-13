---
name: audit:repo-health
description: Audit a repo for basic health: scripts, docs, CI, hygiene, and drift.
agent: 'ask'
---
Audit the selected repo area for:
- entry-point scripts (build/test/lint/fmt/typecheck/dev)
- pinned toolchains and lockfiles
- docs skeleton and correctness of examples
- CI entry points / required checks (if present)
- duplication, dead code, and inconsistency hotspots

Output:
- Top 10 findings (ranked)
- Quick fixes (small diffs)
- Follow-up improvements (sliced)
