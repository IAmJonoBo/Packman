# Error Taxonomy (Template)

| Category | Examples | Retry? | User Message | UX Action |
|---|---|---:|---|---|
| Transport | timeout, DNS, offline | Yes | “Check connection” | Retry button |
| Auth | 401, 403 | No | “Sign in” / “No access” | Re-auth / request access |
| Validation | 400 field errors | No | Field-level messages | Inline fixes |
| Not Found | 404 | Sometimes | “Item missing” | Back/link |
| Rate Limit | 429 | Yes (after wait) | “Try again later” | Backoff |
| Server | 5xx | Yes | “Something went wrong” | Retry + log |
