# Span Naming + Attribute Map (Template)

## Span naming rules

- Use verb+noun or boundary.operation style:
  - `http.request`
  - `db.query`
  - `auth.validate`
  - `payments.charge`
- Keep names stable; add detail via attributes, not span names.

## Attribute map

| Signal | Attribute                          | Source           | Notes               |
| ------ | ---------------------------------- | ---------------- | ------------------- |
| Trace  | http.request.method                | incoming request | semantic convention |
| Trace  | server.address / server.port       | runtime          | semantic convention |
| Logs   | exception.type / exception.message | caught exception | semantic convention |
| Any    | error.type                         | error taxonomy   | stable, non-secret  |
