---
name: release-ship
description: End-to-end release hardening: brief → provenance → SBOM → reproducibility → verification → notes.
agent: 'Release & Supply Chain Engineer'
---

Scope: ${selection}

Do:

1. If brief incomplete, run /release-brief.
2. Add/confirm provenance attestations in CI.
3. Generate and publish SBOMs.
4. Harden build repeatability.
5. Add verification docs/scripts.
6. Curate release notes/changelog.

Output:

- Files changed
- How to run/verify
- Remaining gaps
