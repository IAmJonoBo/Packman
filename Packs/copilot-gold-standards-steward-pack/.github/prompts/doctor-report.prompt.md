---
name: "audit:doctor-report"
description: Generate a current-state doctor report with delta against baseline and gate readiness.
agent: gold-standards-steward
tools: ["codebase", "search", "usages", "fetch", "agent"]
---

# audit:doctor-report

Scope: ${selection}

Do:

1. Summarize current posture and trend vs prior baseline.
2. Report open gaps by standard/control area.
3. Recommend the smallest next high-value slice.

Output:

- Doctor summary
- Delta matrix
- Next-slice recommendation
