---
name: wire-up-feature
description: Wire a UI surface to backend interface(s) contract-first, with explicit states and tests.
agent: "Interface Wire‑Up"
---

Target / description: ${selection}

Do:

1. Find existing patterns for API calls and UI data fetching in this repo.
2. Define the boundary: endpoint(s), inputs/outputs, auth.
3. Create/confirm types + error taxonomy.
4. Implement typed client seam (single source of truth).
5. Wire UI with state matrix + retry + empty/error/success copy.
6. Add mocks and one critical-path test.

Output:

- Contract summary
- Files changed
- How to run/verify
