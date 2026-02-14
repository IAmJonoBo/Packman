---
name: repo-core-policy
description: Apply repo-core policy guardrails with small diffs, explicit verification, and ambiguity handling.
---

# Repo Core Policy

Use this skill when enforcing baseline repository rules for correctness and safe delivery.

## Rules

- Keep diffs small and separate refactors from behaviour changes.
- Include verification steps for non-trivial changes.
- Do not guess missing requirements; ask clarifying questions.

## Assets

- Checklist: `resources/policy-checklist.md`
- Helper script: `scripts/policy-self-check.sh`

## Usage

1. Run the checklist before proposing implementation.
2. Use the helper script to validate patch size and common anti-patterns.
3. Include verification notes in the final handoff.
