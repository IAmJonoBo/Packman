---
name: contract-first-integration
description: Create/validate API contracts and error taxonomies before wiring UI, ensuring explicit mappings and type safety.
---

# Contract-First Integration

## When to use
Use when a task involves wiring UI to any interface boundary (HTTP, RPC, DB adapter, file IO).

## Steps
1) **Inventory** existing contract sources:
   - OpenAPI/Swagger, protobuf, zod/io-ts schemas, typed DTOs, fixtures
2) **Define** request/response shapes (types) and invariants.
3) **Error taxonomy**:
   - transport (network/timeouts)
   - auth (401/403)
   - not found (404)
   - validation (400 / field errors)
   - conflict (409)
   - rate limit (429)
   - server (5xx)
4) **Normalise errors** in one place (client seam).
5) **Map errors to UX**:
   - message, recovery action, retryability, escalation

## Outputs
- Contract doc (template)
- Error taxonomy (template)
- UI mapping table

