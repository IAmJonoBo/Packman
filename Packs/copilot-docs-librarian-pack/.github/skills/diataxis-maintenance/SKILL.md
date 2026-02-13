---
name: diataxis-maintenance
description: Classify, refactor, and maintain documentation using Diátaxis (tutorial/how-to/reference/explanation), keeping modes clean and cross-linked.
---

# Diátaxis Maintenance

## When to use

Use when docs feel messy, mixed-mode, or hard to navigate.

## Procedure

1. Classify each doc: tutorial / how-to / reference / explanation.
2. Detect mixed-mode pages; split into mode-pure pages.
3. Standardise templates by mode:
   - Tutorial: prerequisites, steps, checkpoints
   - How-to: goal, steps, troubleshooting
   - Reference: tables/options, exhaustive, no narrative
   - Explanation: concepts, rationale, trade-offs
4. Cross-link:
   - tutorials → how-tos → reference → explanation (as needed)
5. Add a nav index per section (if repo supports).

## Templates

- [Mode templates](./templates/mode-templates.md)
