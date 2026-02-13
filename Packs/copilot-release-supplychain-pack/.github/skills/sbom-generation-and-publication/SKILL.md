---
name: sbom-generation-and-publication
description: Generate SBOMs (CycloneDX or SPDX), link them to artifacts/versions, and publish alongside releases.
---

# SBOM Generation + Publication

## Rules
- Choose CycloneDX or SPDX based on repo ecosystem/tooling.
- Filename includes artifact name + version.
- Publish SBOM alongside artifact (GitHub Release assets, container registry, etc.).
- Include licensing and component pedigree where available.

## Template
- [SBOM publishing manifest](./templates/sbom-publish.md)

