---
name: suite:route
description: Route the request to the right pack orchestrator (if installed) or produce a minimal plan.
agent: 'Suite Chief of Staff'
---

Request: ${selection}

Do:
- Determine domain.
- If orchestrator exists, hand off and summarise.
- Otherwise produce a minimal reversible plan and what to install.
