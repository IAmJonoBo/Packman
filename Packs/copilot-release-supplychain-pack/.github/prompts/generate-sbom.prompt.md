---
name: generate-sbom
description: Generate SBOMs (CycloneDX or SPDX) for release artifacts and publish them alongside artifacts.
agent: "SBOM Maintainer"
---

Scope: ${selection}

Output:

- SBOM format + tool choice (based on repo)
- Files/workflows changed
- Where SBOMs are published
