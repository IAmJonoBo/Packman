---
name: ux-prototype-workflow
description: End-to-end workflow for turning intent into a working UI prototype with states, accessibility, and consistency.
---

# UX Prototype Workflow

## When to use
Use this skill when asked to **prototype a screen/flow** or to turn requirements into UI quickly without sacrificing quality.

## Procedure
1) **JTBD + success**  
   - One sentence user goal  
   - Acceptance criteria bullets

2) **UX contract** (must cover)  
   - Default state  
   - Loading (skeleton/spinner strategy)  
   - Empty state (explain + next action)  
   - Error state (recovery path)  
   - Success state (confirmation + next step)  
   - Edge cases (validation, permissions, network)

3) **Component breakdown**
   - list components, responsibilities, props, variants
   - reuse existing components where possible

4) **Implement**
   - component-first
   - wire minimal state/routing
   - polish: copy, spacing rhythm, affordances

5) **Accessibility**
   - semantic HTML first
   - labels, focus order, keyboard shortcuts
   - ARIA only if necessary

6) **Verification**
   - manual checklist (see template)
   - add an interaction test if there’s a test harness

## Templates
- [UX contract template](./templates/ux-contract.md)
- [Prototype verification checklist](./templates/verification-checklist.md)

