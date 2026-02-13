---
name: Rust Conventions
description: Rust guidance: error handling, APIs, and reliability.
applyTo: "**/*.rs"
---

- Prefer explicit error types (`thiserror`/`anyhow` patterns as appropriate) and clear context.
- Avoid `unwrap()`/`expect()` in production paths (tests are fine).
- Keep public APIs minimal and well-documented.
- Prefer clippy-friendly code; address warnings rather than suppressing.

Testing:
- Prefer unit tests for logic, integration tests for boundaries.
