---
name: refactoring-baby-steps
description: Perform behaviour-preserving refactors using small transformations; verify continuously; avoid rewrites.
---

# Refactoring in Baby Steps

## Principles

- Refactoring improves design without changing behaviour.
- Apply a series of small, behaviour-preserving transformations.
- Keep the system working after each step; tests protect you.

## Checklist

- Add/confirm tests before risky transformations
- Rename/move in isolated commits
- Reduce complexity gradually
- Remove dead code only after confirming no use

## Template

- [Refactor plan](./templates/refactor-plan.md)
