---
name: observability-brief
description: Ask for missing constraints (telemetry, SLO targets, environments) before making observability changes.
agent: "ask"
---

Ask me ONLY for missing info:

1. Scope (services/modules) and critical user flows:
2. Runtime/platform (web/node/python/rust; k8s?):
3. Existing telemetry tooling (OTel? vendor? none?):
4. SLO expectations (target availability/latency) and support hours:
5. Incident process maturity (none/basic/standardised):
6. Constraints (no new deps? privacy/PII rules?):
7. Where incidents are tracked (issues, pager tool, docs):

Then restate the brief and proceed with instrumentation + SLOs + incident playbook.
