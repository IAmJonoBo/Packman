---
name: secure-ship
description: End-to-end secure shipping: brief → threat model → ASVS mapping → implement mitigations → verify.
agent: 'Security Gatekeeper'
---

Scope: ${selection}

Do:

1. If brief incomplete, run /security-brief.
2. Threat model + abuse cases.
3. ASVS checklist (scoped).
4. Implement mitigations with minimal diffs.
5. Verify with tests/checks.

Output:

- What changed
- What was verified
- Remaining risks
