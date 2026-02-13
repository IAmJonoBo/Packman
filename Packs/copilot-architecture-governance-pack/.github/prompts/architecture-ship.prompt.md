---
name: architecture-ship
description: "End-to-end governance: brief → ADR → risk score → review gates → trunk slicing (if needed)."
agent: "Architecture & Governance Steward"
---

Scope: ${selection}

Do:

1. If brief incomplete, run /architecture-brief.
2. Decide if architecture material; if yes, write/update ADR.
3. Produce risk score and verification gates.
4. Perform governance review.
5. If work is large, produce trunk slicing plan.

Output:

- ADR link (if any)
- Risk score + verification
- Required fixes
- Slice plan (if any)
