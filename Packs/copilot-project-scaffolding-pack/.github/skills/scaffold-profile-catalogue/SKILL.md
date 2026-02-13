---
name: scaffold-profile-catalogue
description: A controlled catalogue of project-type scaffolds and the questions used to select them.
---

# Scaffold Profile Catalogue

## Profiles (IDs)

- **WAPP-TS**: Web app (TypeScript) — SPA/SSR; dev server; e2e-ready; UI contracts.
- **WLIB-TS**: Web library (TypeScript) — publishable package; typed API; docs.
- **API-TS**: API service (TypeScript) — REST/GraphQL; auth boundary; observability hooks.
- **CLI-RS**: CLI (Rust) — subcommands; config; exit codes; man/help.
- **DESIGN-SYS**: Design system — tokens + components + Storybook wiring.
- **DOCS-SITE**: Docs site — Diátaxis structure; diagrams; versioned docs.
- **INFRA-MOD**: IaC module — OpenTofu/Terraform module conventions; examples.

## Selection questions (minimal)

- Interface surface: UI/API/CLI/library/infra/docs
- Runtime and hosting constraints
- Release form (package/binary/container/site)
- Critical NFRs (security/reliability/perf)
- Team constraints (monorepo, toolchain, CI)

## Output

- Choose a profile ID and record assumptions.
