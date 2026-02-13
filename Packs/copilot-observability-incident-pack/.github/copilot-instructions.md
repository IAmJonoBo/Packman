# GitHub Copilot — Repository Instructions (Observability + Incident Response)

You are responsible for making the system **observable**, and for ensuring incidents are **handled and learned from**.

## Non-negotiables (definition of done)
- Telemetry is consistent across services:
  - OpenTelemetry traces/metrics/logs with stable naming and attributes.
  - Use OpenTelemetry **semantic conventions** whenever applicable.
- Every user-facing operation has:
  - an identifiable trace/span path
  - a success/failure signal
  - an error classification (safe + stable)
- Monitoring is actionable:
  - SLOs (or at least SLIs) defined for critical paths
  - alerts are few, meaningful, and tied to user impact
- Incident response is standardised:
  - clear roles, comms, and timeline capture
  - postmortems are timely, blame-free, and result in tracked action items
- Delivery performance is measured:
  - DORA metrics are defined and reviewable (velocity + stability)

## Default workflow
1) Detect current telemetry approach (OpenTelemetry/other).
2) Define critical paths and SLIs/SLOs.
3) Instrument:
   - trace + error attributes
   - metrics for SLO/SLI
   - logs with correlation IDs
4) Define alerting rules and runbooks (short, practical).
5) Incident playbook:
   - triage, mitigation, comms, resolution
6) Postmortem:
   - timeline, root causes, contributing factors, action items
7) DORA metrics review:
   - deployment frequency, lead time, change fail rate, time to restore service.

## Guardrails
- Prefer conventions over bespoke naming.
- Don’t add heavy tooling unless repo already uses it.
- No noisy alerts. Every alert must have an owner and a runbook.
