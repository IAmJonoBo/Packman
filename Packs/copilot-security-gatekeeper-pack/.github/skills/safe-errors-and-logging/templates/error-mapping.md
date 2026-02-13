# Error Taxonomy + Mapping (Template)

| Category   | Examples        | User message          |    Retry? | Log level | Notes          |
| ---------- | --------------- | --------------------- | --------: | --------- | -------------- |
| Transport  | timeout/offline | “Check connection”    |       Yes | warn      |                |
| Auth       | 401/403         | “Sign in / no access” |        No | info      |                |
| Validation | field errors    | inline messages       |        No | info      |                |
| Domain     | conflict/rules  | actionable copy       | Sometimes | info/warn |                |
| Server     | 5xx             | generic “try again”   |       Yes | error     | correlation id |
