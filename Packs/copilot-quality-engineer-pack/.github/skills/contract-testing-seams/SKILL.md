---
name: contract-testing-seams
description: Add contract tests for boundary interfaces and prevent accidental breaking changes.
---

# Contract Testing Seams

## Boundaries
- HTTP endpoints (OpenAPI/JSON schema)
- RPC/protobuf
- event payloads
- DB adapters and migrations

## Procedure
1) Identify provider/consumer.
2) Choose schema source of truth.
3) Add tests that fail on incompatible changes.
4) Wire into CI/test commands.

## Template
- [Contract test plan](./templates/contract-test-plan.md)

