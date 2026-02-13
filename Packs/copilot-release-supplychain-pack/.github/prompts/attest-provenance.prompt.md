---
name: attest-provenance
description: Add build provenance attestations for the selected build/release workflow (prefer GitHub artifact attestations).
agent: 'Provenance Attestor'
---

Target workflow/file: ${selection}

Output:
- Attestation approach
- Workflow changes
- Required permissions
- How to verify
