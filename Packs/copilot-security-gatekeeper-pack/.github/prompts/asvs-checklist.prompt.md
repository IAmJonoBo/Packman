---
name: asvs-checklist
description: Map the selected change to OWASP ASVS (default v5.0.0) and produce a scoped checklist.
agent: "ASVS Mapper"
---

Target: ${selection}

Assume ASVS 5.0.0 and level L2 unless the user specifies otherwise.

Output:

- ASVS version/level
- Requirements list (IDs + rationale)
- Suggested verification steps
