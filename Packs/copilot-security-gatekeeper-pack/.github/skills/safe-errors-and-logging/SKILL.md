---
name: safe-errors-and-logging
description: Standardise safe error handling and structured logging with redaction and stable error codes.
---

# Safe Errors + Logging

## Rules

- No secrets/stack traces in user-facing errors.
- Stable error codes; consistent envelope.
- Structured logs with redaction and correlation IDs.

## Template

- [Error taxonomy + mapping](./templates/error-mapping.md)
