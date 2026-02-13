---
name: dependency-risk-triage
description: Assess new/changed dependencies for security and supply-chain risk; propose mitigations.
agent: "Security Reviewer"
---

Scope: ${selection}

Output:

- New deps list + why needed
- Risk notes (maintenance, attack surface, transitive deps)
- Mitigations (pinning, alternatives, reduced scope)
