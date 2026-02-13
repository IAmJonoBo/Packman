---
name: dora-metrics-definition
description: Define DORA metrics for this repo (data sources, computation, and review cadence).
---

# DORA Metrics Definition

## Metrics

- Deployment frequency
- Lead time for changes
- Change fail rate
- Time to restore service

## Procedure

1. Choose sources:
   - CI/CD deploy logs, tags/releases
   - incident log / pager records
2. Define computation:
   - exact definitions for this repo
3. Set cadence:
   - weekly operational review, monthly trend review

## Template

- [DORA worksheet](./templates/dora.md)
