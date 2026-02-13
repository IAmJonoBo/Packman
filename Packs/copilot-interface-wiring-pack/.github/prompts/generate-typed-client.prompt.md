---
name: generate-typed-client
description: Create or extend a typed client wrapper for an API, consistent with repo patterns.
agent: "UI Integrator"
---

Scope: ${selection}

Do:

- Locate existing client wrappers (fetch/axios/query libs).
- Add typed functions for the endpoints in scope.
- Centralise headers/base URL/auth and error normalisation.
- Provide example usage.

Output:

- New/updated client files
- Example usage snippet
