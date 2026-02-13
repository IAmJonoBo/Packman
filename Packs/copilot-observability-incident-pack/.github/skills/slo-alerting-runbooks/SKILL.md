---
name: slo-alerting-runbooks
description: Define SLIs/SLOs and low-noise alerts with short runbooks tied to user impact.
---

# SLOs, Alerts, Runbooks

## Procedure
1) Identify critical paths (top user journeys).
2) Define SLIs (availability, latency, correctness).
3) Choose SLOs (targets + error budget).
4) Design alerts:
   - page on SLO burn
   - ticket on symptom thresholds
5) Write runbooks:
   - how to confirm impact
   - fastest mitigations
   - rollback/feature flag options

## Templates
- [SLO table](./templates/slo-table.md)
- [Alert rubric](./templates/alert-rubric.md)
- [Runbook stub](./templates/runbook.md)

