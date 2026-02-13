---
name: sec:ship
description: Run the security gatekeeper pass for the selected scope.
agent: 'Security Gatekeeper'
---
Target: ${selection}

Do:
- Identify threats and footguns.
- Apply minimal safe fixes.
- Provide verification steps.

Output: findings + patches + verification.
