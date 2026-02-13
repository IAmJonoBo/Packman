---
name: Release Rules
description: Release hygiene and supply chain basics.
applyTo: "**"
---

- Prefer reproducible builds and pinned toolchains.
- Record release notes/changelog updates when user-visible changes occur.
- Avoid shipping secrets; verify SBOM/provenance if the repo uses it.
