---
name: github-bootstrap
description: "End-to-end GitHub bootstrap: templates → CODEOWNERS → SECURITY → community health → dependabot (optional)."
agent: "GitHub Bootstrap Engineer"
---

Scope: ${selection}

Do:

1. If constraints missing, run /repo-settings-brief.
2. Add issue forms/templates and PR template.
3. Add CONTRIBUTING, SUPPORT, CODE_OF_CONDUCT as needed.
4. Add CODEOWNERS (ask for handles if missing).
5. Add SECURITY policy.
6. Add Dependabot config if allowed.
7. Run community-health audit and list remaining gaps.

Output:

- Files added/changed
- How to use
- Remaining TODOs
