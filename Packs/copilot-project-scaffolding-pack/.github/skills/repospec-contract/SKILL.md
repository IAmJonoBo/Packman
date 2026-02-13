---
name: repospec-contract
description: Defines RepoSpec sections and the minimum required repo contracts (scripts, docs, CI entry points, release surface).
---

# RepoSpec Contract

A RepoSpec is a short spec that makes a repo predictable.

## Required sections

1. Purpose and scope
2. Project type + profile ID
3. Toolchains and pinning
4. Directory layout
5. Scripts contract (build/test/lint/fmt/typecheck/dev)
6. CI entry points (what runs on PR)
7. Docs skeleton (Diátaxis-friendly)
8. Release surface (artifacts, publishing)
9. Security/quality expectations (high level)
10. Upgrade path (how to evolve the scaffold)

## Template

- [RepoSpec template](./templates/repospec.md)
