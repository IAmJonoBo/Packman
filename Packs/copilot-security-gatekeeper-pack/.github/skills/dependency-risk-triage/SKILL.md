---
name: dependency-risk-triage
description: Assess dependency risk (maintenance, attack surface, transitive deps) and propose mitigations (pinning, alternatives, scope reduction).
---

# Dependency Risk Triage

## Procedure
1) List new/changed dependencies and surfaces they touch (crypto/parsing/networking).
2) Evaluate maintenance signals and transitive dependency footprint.
3) Decide accept/replace/avoid, and list mitigations (pinning, scopes, sandboxing).

## Output
- Decision + rationale
- Mitigations checklist

