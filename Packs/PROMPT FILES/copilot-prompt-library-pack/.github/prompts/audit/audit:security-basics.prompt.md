---
name: audit:security-basics
description: "Audit for common security footguns: secrets, auth, input validation, unsafe defaults."
agent: "ask"
---

Scan the selected code for:

- secrets exposure
- permissive auth / weak defaults
- missing input validation / injection risks
- insecure CORS / headers
- unsafe deserialisation patterns

Output:

- Findings ranked by severity and exploitability
- Minimal safe fixes
- Verification plan
