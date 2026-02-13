# GitHub Copilot — Repository Instructions (UX + Prototyping)

## Outcome bar (ship quality)
When building UI/UX, your definition of done includes:
- **Task clarity**: one primary user goal; explicit success criteria.
- **States covered**: default, loading, empty, error, success; and edge cases.
- **Accessibility**: semantic HTML, labels, keyboard flow, focus management; ARIA only when necessary.
- **Design consistency**: tokens, components, spacing rhythm, typography scale; no ad-hoc patterns.
- **Usability**: low cognitive load; progressive disclosure; clear primary actions.
- **Verification**: minimally reproducible steps + (when feasible) an interaction test for the critical path.

## Working method (expected)
1. Write a **1–2 sentence JTBD** (job-to-be-done) and acceptance criteria.
2. Draft a **UX contract**:
   - user states, system states, errors, empty, constraints, analytics events if relevant
3. Component-first:
   - define component props + variants
   - implement the variants (storybook/docs if present)
4. Tight loop:
   - build → run → verify → refine
5. Stop only when the outcome bar is met.

## Guardrails
- Prefer minimal, composable changes over big rewrites.
- Don’t introduce heavy dependencies for UX polish; use what exists first.
- If requirements are underspecified, propose the smallest reversible prototype and list assumptions.
