---
name: slsa-provenance-attestations
description: Configure and verify build provenance attestations aligned to SLSA provenance expectations; prefer CI-native attestations.
---

# SLSA Provenance Attestations

## Goal
Attach verifiable provenance to release artifacts.

## Procedure
1) Ensure builds run in CI with pinned inputs.
2) Generate provenance attestations (SLSA provenance / in-toto attestation format).
3) Store attestations with artifacts (release assets or registry).
4) Document verification steps (how consumers verify).

## Template
- [Provenance checklist](./templates/provenance-checklist.md)

