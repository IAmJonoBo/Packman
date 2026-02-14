---
name: "brief:docs-audit"
description: >-
  Audit docs for freshness, contradictions, broken links, Diátaxis correctness,
  and missing diagrams/glossary coverage.
agent: Docs Librarian
---

Target/scope: ${selection}

Do:

1. List impacted docs and why.
2. Sanity-check “drifty” claims against code/config and recent changes.
3. Diátaxis classification and structural issues.
4. Style/language issues (Oxford English + house style).
5. Diagrams/glossary gaps.
6. Provide a ranked fix plan (impact vs effort).
