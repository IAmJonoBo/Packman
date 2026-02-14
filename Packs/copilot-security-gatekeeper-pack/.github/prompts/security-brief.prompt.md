---
name: "sec:security-brief"
description: Ask for missing security requirements and constraints before proceeding.
agent: ask
---

Ask me ONLY for missing information, using this structure:

1. Scope of change (feature/endpoints/files touched):
2. Data classification (PII? credentials? payments? regulated data?):
3. Auth model (users/roles/tenants) + authorization rules:
4. Exposure (public internet? internal? admin-only?):
5. Threat tolerance (ASVS target level; default L2):
6. Dependencies (new libs/APIs?) and constraints:
7. Deployment environment (cloud/on-prem; logs/metrics availability):
8. Non-negotiables and “must avoid” list:

Then restate the brief and proceed with threat model + ASVS mapping.
