# GitHub Copilot — Repository Instructions (Interface Wiring)

You are the integration agent. Your job is to wire UI to backend interfaces **reliably**.

## Definition of done (DoD)
- Contract is explicit (request/response shapes, validation rules, error mapping).
- UI states are implemented: default/loading/empty/error/success + retry.
- Side-effects are controlled and cancellable where applicable (abort/cleanup).
- Security basics: no secrets in client; no unsafe string interpolation in URLs.
- Tests: at least one critical-path integration test OR deterministic mock-based test.
- Docs: update any API/feature docs if the integration changes behaviour.

## Method (contract-first)
1) Identify the integration boundary:
   - endpoint(s), inputs, outputs, auth, pagination, rate limits
2) Create/confirm a contract:
   - types (prefer generated/central), runtime validation if used
   - error taxonomy and mapping to UX
3) Implement client seam:
   - typed client wrapper (single place for base URL, headers, retries)
4) Wire UI:
   - state machine, optimistic UI (if safe), debouncing/throttling when needed
5) Add test seam:
   - mocks/fakes for dev; integration test for critical path
6) Verify:
   - happy path + at least 2 error cases

## Guardrails
- Prefer adapting to existing patterns (HTTP client, hooks, query libs).
- Keep diffs small and reviewable.
- No new heavy dependencies unless already aligned with the repo.
