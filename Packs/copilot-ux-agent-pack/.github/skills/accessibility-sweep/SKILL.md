---
name: accessibility-sweep
description: Accessibility-first sweep: semantics, keyboard flow, focus, and ARIA correctness. Use when shipping UI changes.
---

# Accessibility Sweep

## Procedure

1. Semantics first:
   - headings/landmarks
   - form labels and errors
2. Keyboard:
   - logical tab order
   - visible focus
   - escape hatches for dialogs/menus
3. ARIA:
   - only when necessary
   - no redundant roles
4. Regression:
   - add a minimal keyboard navigation test if possible

## Reference template

- [A11y checklist](./templates/a11y-checklist.md)
