---
name: secure-error-model
description: Implement/standardise a safe error model and map server errors to user-safe messages.
agent: "Secure Implementer"
---

Target: ${selection}

Do:

- Find existing error conventions.
- Implement a consistent error envelope (code/message/details) without leaking secrets.
- Add mapping from internal errors to user-safe messages.
- Add tests for at least 2 error cases.

Output:

- Error taxonomy + envelope
- Files changed
- Verification steps
