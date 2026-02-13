---
name: harden-builds
description: Harden builds for repeatability: pinned toolchains, lockfiles, deterministic outputs, minimal artifact surface.
agent: 'Build Hardener'
---

Scope: ${selection}

Output:

- Changes applied
- Determinism risks remaining
- How to reproduce locally/CI
