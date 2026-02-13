---
name: Python Conventions
description: Python guidance: typing, structure, packaging, and tests.
applyTo: "**/*.py"
---

- Prefer type hints on public functions and module boundaries.
- Keep functions small; avoid hidden global state.
- Use explicit exceptions and messages; avoid broad `except:` without re-raise.
- Ensure scripts have clear entry points; prefer modules for reuse.

Testing:

- Tests must be deterministic; avoid network unless explicitly integration tests.
- Use fixtures to remove duplication.
