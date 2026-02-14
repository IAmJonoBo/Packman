---
name: "brief:art-direct-screen"
description: >-
  Produce 2–3 art directions, choose one with guidance, then implement an
  award-level screen with systemised tokens/components.
agent: UI Art Director
---

Target screen/flow: ${selection}

Do:

1. If brief is missing, run `/ui-brief` questions first.
2. Propose 2–3 art directions (ranked), each with:
   - grid + spacing rhythm
   - typography scale
   - colour role map
   - component language (radii, elevation, borders)
3. Ask me to choose (or specify a merge).
4. Implement:
   - tokens + typography
   - atomic components + variants
   - screen composition + states
5. Run Pixel QA and fix issues.

Output:

- Directions + recommendation
- What you need from me (if any)
- Files changed + verification checklist
