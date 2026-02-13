---
name: review-gates-google-standard
description: Apply high-signal review gates aligned to Google's code review standard: code health over time, readability, correctness, and maintainability.
---

# Review Gates (Google-standard inspired)

## Goals

- Ensure the codebase’s health improves over time.
- Catch bugs and prevent regressions.
- Maintain readability and consistency.

## Gates

- Correctness and edge cases
- Tests: behaviour proven, not assumed
- Readability and consistency
- Security and secrets hygiene
- Performance and resource budgets
- Operability: logs/metrics, failure modes, configuration
- Docs/ADRs updated

## Output format

- Findings (ranked)
- Required fixes
- Verification steps
