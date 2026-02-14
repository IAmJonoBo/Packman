---
name: edge-case-vanguard
description: Templates and methods for edge inventory, PBT/fuzz planning, chaos experiments, observability gap analysis, and one-slice mitigations.
---

# Edge Case Vanguard Skill

## Edge inventory template

```markdown
## Surface

- Component:
- Owner:
- User/Operator impact:

## Hypothesis

- Invariant expected:
- How it may break:
- Earliest signal:

## Edge vectors

- Inputs:
- State:
- Concurrency:
- Time:
- Resources:
- Dependencies:
- Operations:

## Evidence plan

- Tests to add/run:
- Runtime probes:
- Logs/metrics/traces to collect:

## Decision

- Mitigate now / instrument first / defer with rationale:
```

## Property-based test patterns (Hypothesis-inspired)

- Define invariant first, not example first.
- Generate broad input domains, then constrain to valid business space.
- Include shrinking expectations to isolate minimal failing cases.
- Preserve regression seeds for replay.

```markdown
### PBT plan

- Function/System under test:
- Property invariant(s):
- Input strategy domain(s):
- State model assumptions:
- Known bad examples to pin:
- Replay seed handling:
- Exit criteria:
```

## Fuzzing harness guidance (AFL++-style workflow)

- Start with parser/boundary-heavy entry points.
- Build a small deterministic harness with clear crash/non-crash outcomes.
- Seed with representative corpus + protocol edge samples.
- Track unique paths/crashes and bucket by root cause.
- Convert crashes into deterministic tests before patching.

```markdown
### Fuzz plan

- Target entrypoint:
- Harness path:
- Initial corpus:
- Sanitizers/instrumentation:
- Crash triage taxonomy:
- Reproducer minimization path:
- Fix verification tests:
```

## Chaos and DR experiment template

```markdown
## Experiment

- Steady state definition:
- Fault to inject:
- Blast radius guardrails:
- Abort conditions:

## Execution

- Scope (env/service/region):
- Time window:
- Control vs experiment comparison:

## Observations

- User-visible impact:
- Recovery behavior:
- Unexpected couplings:

## Follow-up

- Mitigation slice:
- Runbook update:
- Rollback rehearsal result:
```

## Observability gaps template

```markdown
## Gap report

- Service/component:
- Incident class covered:

## Missing telemetry

- Metrics:
- Logs:
- Traces:
- Alerts:

## Detection quality

- Current MTTD estimate:
- Current false-positive/negative indicators:

## Proposed additions

- New/changed signals:
- Alert thresholds + routing:
- Dashboard sections:
- Validation query/examples:
```

## One-slice remediation template

```markdown
## Single-slice remediation plan

- Hypothesis addressed:
- Minimal code/config change:
- Tests added:
- Operational verification:
- Rollback trigger:
- Rollback steps:
- Residual risk:
```
