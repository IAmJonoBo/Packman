---
name: "brief:scaffold-brief"
description: Capture missing constraints before scaffolding a new project.
agent: ask
---

Ask me ONLY for missing information:

1. Project type target (choose one): web-app | web-lib | api-service | cli | desktop | infra-module | design-system | docs-site
2. Primary goal (what must be true in v1):
3. Target users and usage context:
4. Stack constraints (TS/Python/Rust/Go/etc.; framework if already decided):
5. Hosting/runtime constraints (serverless/k8s/local; offline-first?):
6. Non-functional requirements (latency, reliability, security posture, compliance):
7. Repo constraints (monorepo? package manager? tooling preferences):
8. Release surface (library? binary? container? web deploy?):
9. Must-avoid list (deps/vendors/patterns):
10. Preferred scaffolding engine: projen (default) | template | hybrid

Then restate the brief and propose the best profile from the catalogue.
