---
name: suite:route
description: Route the request to the right pack orchestrator (if installed) or produce a minimal plan.
agent: "Suite Chief of Staff"
---

# suite:route

Request: ${selection}

Do:

- Determine domain and intent.
- Prefer direct delegation to installed orchestrators when confidence is high.
- If orchestrator exists, hand off and summarise.
- Otherwise produce a minimal reversible plan and what to install.

Domain routing hints:

- Project planning, replanning, variance handling, roadmap control, checkpoint governance:
  - `copilot-project-management-planning-pack`
  - orchestrator: `Project Planning Lead`
  - prompts: `/planning-brief`, `/planning-ship`, `/planning-replan`
- Security and threat/risk security controls:
  - `copilot-security-gatekeeper-pack`
- Release, supply chain, provenance, SBOM:
  - `copilot-release-supplychain-pack`
- Quality and test strategy:
  - `copilot-quality-engineer-pack`

When delegating, include:

- Objective and constraints
- Expected output format
- Deadline/checkpoint expectations
