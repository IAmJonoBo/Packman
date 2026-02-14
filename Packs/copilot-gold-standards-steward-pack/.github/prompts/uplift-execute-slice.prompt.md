---
name: "brief:uplift:execute-slice"
description: >-
  Execute one approved uplift slice with verification evidence and rollback
  notes.
agent: gold-standards-steward
tools:
  - codebase
  - search
  - editFiles
  - terminalLastCommand
  - agent
---

# uplift:execute-slice

Scope: ${selection}

Do:

1. Confirm approved dry-run for high-impact edits.
2. Execute exactly one slice.
3. Run verification checks and capture evidence.
4. Record rollback path and residual risk.

Output:

- Files changed
- Verification outputs
- Rollback notes
- Next slice recommendation
