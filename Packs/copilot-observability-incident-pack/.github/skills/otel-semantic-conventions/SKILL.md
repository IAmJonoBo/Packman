---
name: otel-semantic-conventions
description: Standardise traces/metrics/logs using OpenTelemetry semantic conventions, including error and exception attributes.
---

# OTel Semantic Conventions

## Why
Consistent attribute naming enables cross-service correlation and usable dashboards.

## Rules
- Use OpenTelemetry semantic conventions where applicable.
- Record exceptions using the exception attributes.
- Set `error.type` where relevant; avoid setting it on successful operations.

## References
- OpenTelemetry semantic conventions (general)
- Error and exception attributes

## Templates
- [Span naming + attribute map](./templates/span-attribute-map.md)

