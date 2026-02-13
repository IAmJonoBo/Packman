---
name: lint-docs
description: Run and fix documentation linting (Vale + markdownlint). Add configs if missing.
agent: 'Docs Lint Runner'
---

Do:
1) Detect existing lint tooling and config.
2) If missing, add minimal config:
   - .vale.ini + styles scaffolding
   - .markdownlint.json or .markdownlint.yaml
3) Run linters (or emulate by reasoning if execution unavailable) and fix issues.

Output:
- Lint config changes
- Violations fixed
- Any justified exceptions (narrow scope)
