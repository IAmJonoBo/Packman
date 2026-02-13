---
name: ui-backend-wiring-workflow
description: End-to-end workflow for wiring UI to backend interfaces with explicit state matrices, retries, and cancellation.
---

# UI ↔ Backend Wiring Workflow

## Procedure
1) **Boundary**: list endpoints and data dependencies.
2) **State matrix**: loading/empty/error/success per view + per sub-component.
3) **Data fetching**: follow repo standard (query lib/hooks).
4) **Mutations**: optimistic update only if safe; rollback path defined.
5) **Cancellation**: abort inflight requests on unmount/nav or rapid changes.
6) **Copy**: error/empty states must be actionable.

## Templates
- [State matrix](./templates/state-matrix.md)
- [Mapping table](./templates/mapping-table.md)

