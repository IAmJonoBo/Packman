---
name: "brief:release-brief"
description: Ask for missing release constraints before adding supply-chain gates.
agent: ask
---

Ask me ONLY for missing info:

1. What are the release artifacts? (binaries, npm package, container, docs site, etc.)
2. Where are artifacts published? (GitHub Releases, registry, GHCR, etc.)
3. Current CI? (GitHub Actions?) and any constraints (no new deps/tools)?
4. SBOM format preference (CycloneDX or SPDX) if not already decided:
5. Provenance requirement target (SLSA level target if any):
6. Signing requirements? (cosign, GPG, none)
7. Versioning policy (SemVer?) and changelog expectations:

Then restate brief and proceed with provenance + SBOM + verification plan.
