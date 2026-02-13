---
name: architecture-brief
description: Ask for missing architecture/governance constraints before proceeding.
agent: "ask"
---

Ask me ONLY for missing info:

1. Goal and scope boundaries:
2. Non-functional requirements (latency, cost, reliability, security):
3. Constraints (tech stack, hosting, data rules, compliance):
4. Team/repo norms (branching, review rules, release cadence):
5. Backward compatibility expectations:
6. Migration/rollout constraints (flags, phased rollout):
7. “Must avoid” list (deps, patterns, vendors):

Then restate the brief and proceed with ADR + risk scoring.
