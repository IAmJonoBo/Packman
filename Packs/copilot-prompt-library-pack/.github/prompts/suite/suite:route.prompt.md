---
name: suite:route
description: Route the request to the correct specialist agent if installed; otherwise produce a plan.
agent: "Suite Chief of Staff"
---

Request: ${selection}

Do:

- Route to the relevant orchestrator pack.
- Summarise result and verification checklist.
- If orchestrator missing, propose minimal plan + what pack to install.
