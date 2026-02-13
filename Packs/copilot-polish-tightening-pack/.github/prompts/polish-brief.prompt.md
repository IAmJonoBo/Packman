---
name: polish-brief
description: Capture constraints for a polish pass to avoid unintended product changes.
agent: "ask"
---

Ask me ONLY for missing info:

1. Scope (folders/modules) and what is explicitly out-of-scope:
2. “Must not break” behaviours / critical flows:
3. Risk tolerance: low-only | moderate | aggressive refactor
4. Existing standards to follow (style, error model, logs, UI conventions):
5. Performance budgets (if any) and target platforms:
6. Any current pain points (bugs, rough edges, confusing APIs):
7. Expected output: patch only | patch + tests | patch + docs

Then restate the brief and proceed with ranked findings + a small-CL slice plan.
