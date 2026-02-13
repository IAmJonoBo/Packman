---
name: reproducible-build-hardening
description: "Harden builds for repeatability: pinned toolchains, deterministic archives, controlled env/time, minimal artifact surface."
---

# Reproducible Build Hardening

## Checklist

- Pin toolchain versions (Node/Rust/Python/etc.)
- Enforce lockfile usage
- Avoid timestamps in artifacts (or normalise)
- Deterministic archive ordering
- Explicit env vars for builds
- Document exact build commands

## Template

- [Reproducibility audit](./templates/repro-audit.md)
