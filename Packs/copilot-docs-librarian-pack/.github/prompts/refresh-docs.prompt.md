---
name: refresh-docs
description: Update documentation to be current, consistent, and lint-clean; add diagrams and glossary entries as needed.
agent: "Docs Librarian"
---

Scope: ${selection}

Do:

- Apply Diátaxis rules.
- Update content to match code.
- Add/refresh Mermaid diagrams.
- Update glossary.
- Run linters and fix issues.

Output:

- Files changed
- Sanity checks performed
- Lint status
