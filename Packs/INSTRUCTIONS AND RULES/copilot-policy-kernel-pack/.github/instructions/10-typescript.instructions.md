---
name: TypeScript Conventions
description: TypeScript/JS guidance: typing, error handling, structure, and DX.
applyTo: "**/*.{ts,tsx,js,jsx}"
---

- Prefer explicit types at boundaries; infer internally.
- Avoid `any`; use `unknown` + narrowing.
- Prefer small pure functions; keep side effects at edges.
- Handle async errors explicitly; do not swallow rejections.
- Prefer stable, serialisable error shapes for APIs.

Testing:

- Tests should assert behaviour, not implementation details.
- Avoid time-based flakiness; use deterministic clocks where possible.
