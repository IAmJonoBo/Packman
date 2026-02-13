# Copilot Policy Kernel (Repo-Wide)

This file is the **canonical always-on ruleset** for this repository. It is intentionally short, enforceable, and bias-to-safety.

## Working style
- Prefer **small, reviewable changes**. Split refactors from behaviour changes.
- Never guess requirements. If behaviour is ambiguous, ask for constraints.
- Every non-trivial change must include:
  - intent + scope boundaries
  - verification steps/commands
  - docs impact statement
- Avoid churn: no drive-by formatting, renames, or “cleanup” without an explicit goal.

## Code quality rules
- Choose the simplest design that will survive maintenance.
- Prefer readable, intention-revealing naming.
- Fail safely: validate inputs, handle edge cases, and return stable error messages.
- Do not commit secrets. Redact sensitive values in logs/tests/docs.

## Tests and verification
- If changing behaviour, add tests that would fail before the change.
- Provide a minimal reproduction or verification commands (copy/paste runnable).
- Prefer deterministic tests; eliminate flakiness rather than “retrying”.

## Documentation rules
- Keep docs current with code. Update examples when interfaces change.
- Use Oxford English by default.
- Prefer Diátaxis structure for substantial docs: tutorial / how-to / reference / explanation.

## Security basics
- Treat user input as hostile.
- Avoid unsafe defaults (open CORS, weak JWT secrets, permissive auth) unless explicitly required.
- Be conservative about dependency additions.

## When to use file-based instructions
Use the instruction files in `.github/instructions/` for:
- language-specific conventions
- directory-specific rules (e.g., UI, docs, infra)
- task-specific guidance (e.g., code review, releases)
