---
name: instrument-service
description: Add/standardise OpenTelemetry instrumentation using semantic conventions; include correlation and exception attributes.
agent: 'OTel Instrumentation Engineer'
---

Target: ${selection}

Do:
- Detect existing instrumentation patterns.
- Add/standardise spans for key operations and boundaries.
- Add semantic convention attributes where applicable.
- Ensure errors/exceptions are recorded safely and consistently.
- Provide run/verify steps.

Output:
- What was instrumented
- Attributes used
- How to verify (local + prod-safe)
