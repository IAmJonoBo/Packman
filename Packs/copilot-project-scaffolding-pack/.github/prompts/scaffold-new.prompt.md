---
name: "brief:scaffold-new"
description: >-
  End-to-end scaffolding: brief → profile → RepoSpec → generate scaffold (prefer
  projen) → audit.
agent: Project Scaffolding Architect
---

Scope: ${selection}

Do:

1. If brief incomplete, run /scaffold-brief.
2. Choose profile (catalogue).
3. Write RepoSpec.
4. Scaffold using projen if feasible; otherwise minimal templates.
5. Audit and provide exact commands.

Output:

- RepoSpec path
- Commands to run
- Directory tree
- Remaining TODOs
