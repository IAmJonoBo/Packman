# Packs

Pack library (repo-local Copilot customisations; no extensions).

## Install guidance

- **Solo**: install one pack into a repo.
- **Suite**: install multiple packs; include `copilot-suite-harmoniser-pack` to avoid collisions.

| Folder                                 | Purpose                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| `copilot-architecture-governance-pack` | Copilot Architecture + Governance Pack (drop-in)         |
| `copilot-award-ui-pack`                | Copilot Award‑Winning UI Art Director Pack (drop‑in)     |
| `copilot-docs-librarian-pack`          | Copilot Docs Librarian Pack (drop-in)                    |
| `copilot-github-bootstrap-pack`        | Copilot GitHub Bootstrap Pack (drop-in)                  |
| `copilot-interface-wiring-pack`        | Copilot Interface Wiring Pack (drop-in)                  |
| `copilot-observability-incident-pack`  | Copilot Observability + Incident Response Pack (drop-in) |
| `copilot-policy-kernel-pack`           | Copilot Policy Kernel Pack                               |
| `copilot-polish-tightening-pack`       | Copilot Polish + Tightening Pack (drop-in)               |
| `copilot-project-scaffolding-pack`     | Copilot Project-Type Scaffolding Pack (drop-in)          |
| `copilot-prompt-library-pack`          | Copilot Prompt Library Pack (Prompt Files)               |
| `copilot-quality-engineer-pack`        | Copilot Quality Engineer Pack (drop-in)                  |
| `copilot-release-supplychain-pack`     | Copilot Release + Supply Chain Pack (drop-in)            |
| `copilot-security-gatekeeper-pack`     | Copilot Security Gatekeeper Pack (drop‑in)               |
| `copilot-suite-harmoniser-pack`        | Copilot Suite Harmoniser Pack                            |
| `copilot-ux-agent-pack`                | Copilot UX + Prototype Agent Pack (drop-in)              |
| `docs`                                 | docs                                                     |

## Structure

```text
├── copilot-architecture-governance-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── adr-writer.agent.md
│   │   │   ├── architecture-governance-steward.agent.md
│   │   │   ├── change-risk-scorer.agent.md
│   │   │   ├── code-review-marshal.agent.md
│   │   │   └── trunk-coach.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── architecture-brief.prompt.md
│   │   │   ├── architecture-ship.prompt.md
│   │   │   ├── governance-review.prompt.md
│   │   │   ├── risk-score-change.prompt.md
│   │   │   ├── trunk-slice.prompt.md
│   │   │   └── write-adr.prompt.md
│   │   └── skills/
│   │       ├── adr-discipline-nygard/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       ├── adr-index.md
│   │       │       └── adr-template.md
│   │       ├── change-risk-scoring/
│   │       │   └── SKILL.md
│   │       ├── review-gates-google-standard/
│   │       │   └── SKILL.md
│   │       └── trunk-discipline/
│   │           └── SKILL.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── architecture/
│           ├── README.md
│           └── adr/
│               ├── ADR-000-template.md
│               └── README.md
├── copilot-award-ui-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── art-direction-planner.agent.md
│   │   │   ├── design-system-engineer.agent.md
│   │   │   ├── pixel-qa-reviewer.agent.md
│   │   │   ├── screen-composer.agent.md
│   │   │   └── ui-art-director.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── art-direct-screen.prompt.md
│   │   │   ├── design-system-blueprint.prompt.md
│   │   │   ├── layout-grid.prompt.md
│   │   │   ├── pixel-perfect-review.prompt.md
│   │   │   ├── tokens-and-typography.prompt.md
│   │   │   └── ui-brief.prompt.md
│   │   └── skills/
│   │       ├── art-direction-intake-and-options/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── brief.md
│   │       ├── design-tokens-and-typography/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── type-scale.md
│   │       ├── layout-composition-grid/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── grid-spec.md
│   │       └── pixel-perfect-qa/
│   │           └── SKILL.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   └── README.md
├── copilot-docs-librarian-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── diagram-curator.agent.md
│   │   │   ├── diataxis-architect.agent.md
│   │   │   ├── docs-librarian.agent.md
│   │   │   ├── docs-lint-runner.agent.md
│   │   │   ├── glossary-curator.agent.md
│   │   │   └── style-enforcer.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── add-diagrams.prompt.md
│   │   │   ├── diataxis-restructure.prompt.md
│   │   │   ├── docs-audit.prompt.md
│   │   │   ├── lint-docs.prompt.md
│   │   │   ├── refresh-docs.prompt.md
│   │   │   ├── refresh-glossary.prompt.md
│   │   │   └── style-sweep.prompt.md
│   │   └── skills/
│   │       ├── diagram-and-glossary-coverage/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       ├── glossary.md
│   │       │       └── mermaid-snippets.md
│   │       ├── diataxis-maintenance/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── mode-templates.md
│   │       ├── docs-sanity-check/
│   │       │   └── SKILL.md
│   │       └── style-and-lint-enforcement/
│   │           ├── SKILL.md
│   │           └── templates/
│   │               ├── markdownlint.json
│   │               └── vale.ini
│   ├── .markdownlint.json
│   ├── .vale.ini
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── glossary.md
├── copilot-github-bootstrap-pack/
│   ├── .github/
│   │   ├── CODEOWNERS
│   │   ├── ISSUE_TEMPLATE/
│   │   │   ├── bug-report.yml
│   │   │   ├── config.yml
│   │   │   ├── docs.yml
│   │   │   └── feature-request.yml
│   │   ├── PULL_REQUEST_TEMPLATE.md
│   │   ├── agents/
│   │   │   ├── community-health-auditor.agent.md
│   │   │   ├── dependabot-steward.agent.md
│   │   │   ├── github-bootstrap-engineer.agent.md
│   │   │   ├── ownership-marshal.agent.md
│   │   │   ├── security-policy-editor.agent.md
│   │   │   └── template-curator.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── dependabot.yml
│   │   ├── prompts/
│   │   │   ├── add-issue-forms.prompt.md
│   │   │   ├── add-pr-template.prompt.md
│   │   │   ├── community-profile-audit.prompt.md
│   │   │   ├── dependabot-policy.prompt.md
│   │   │   ├── github-bootstrap.prompt.md
│   │   │   ├── repo-settings-brief.prompt.md
│   │   │   ├── setup-codeowners.prompt.md
│   │   │   └── setup-security-policy.prompt.md
│   │   └── skills/
│   │       ├── codeowners-ownership/
│   │       │   └── SKILL.md
│   │       ├── github-community-health/
│   │       │   └── SKILL.md
│   │       ├── issue-forms-and-templates/
│   │       │   └── SKILL.md
│   │       └── pr-template-and-review-contract/
│   │           └── SKILL.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── README.md
│   ├── SECURITY.md
│   ├── SUPPORT.md
│   └── docs/
│       └── github/
│           └── BOOTSTRAP.md
├── copilot-interface-wiring-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── api-contract-analyst.agent.md
│   │   │   ├── integration-reviewer.agent.md
│   │   │   ├── integration-tester.agent.md
│   │   │   ├── interface-wireup.agent.md
│   │   │   └── ui-integrator.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── add-mocks.prompt.md
│   │   │   ├── api-contract.prompt.md
│   │   │   ├── generate-typed-client.prompt.md
│   │   │   ├── integration-test.prompt.md
│   │   │   └── wire-up-feature.prompt.md
│   │   └── skills/
│   │       ├── contract-first-integration/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       ├── contract.md
│   │       │       └── error-taxonomy.md
│   │       ├── integration-testing-seams/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── test-plan.md
│   │       └── ui-backend-wiring-workflow/
│   │           ├── SKILL.md
│   │           └── templates/
│   │               ├── mapping-table.md
│   │               └── state-matrix.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   └── README.md
├── copilot-observability-incident-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── dora-reporter.agent.md
│   │   │   ├── incident-commander-coach.agent.md
│   │   │   ├── observability-lead.agent.md
│   │   │   ├── otel-instrumentation-engineer.agent.md
│   │   │   ├── postmortem-editor.agent.md
│   │   │   └── slo-alert-designer.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── define-slos.prompt.md
│   │   │   ├── dora-review.prompt.md
│   │   │   ├── incident-triage.prompt.md
│   │   │   ├── instrument-service.prompt.md
│   │   │   ├── observability-brief.prompt.md
│   │   │   ├── observability-ship.prompt.md
│   │   │   └── write-postmortem.prompt.md
│   │   └── skills/
│   │       ├── dora-metrics-definition/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── dora.md
│   │       ├── incident-triage-and-timeline/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       ├── live-checklist.md
│   │       │       └── timeline.md
│   │       ├── otel-semantic-conventions/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── span-attribute-map.md
│   │       ├── postmortems-and-action-items/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       ├── action-items.md
│   │       │       └── postmortem.md
│   │       └── slo-alerting-runbooks/
│   │           ├── SKILL.md
│   │           └── templates/
│   │               ├── alert-rubric.md
│   │               ├── runbook.md
│   │               └── slo-table.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── ops/
│           ├── OBSERVABILITY.md
│           └── POSTMORTEM_TEMPLATE.md
├── copilot-policy-kernel-pack/
│   ├── .github/
│   │   ├── copilot-instructions.md
│   │   └── instructions/
│   │       └── 00-repo-core.instructions.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── PACK_MANIFEST.json
│   ├── README.md
│   └── tools/
│       └── validate-instructions.py
├── copilot-polish-tightening-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── consistency-enforcer.agent.md
│   │   │   ├── nit-hunter.agent.md
│   │   │   ├── polish-gate-reviewer.agent.md
│   │   │   ├── polish-tightening-engineer.agent.md
│   │   │   ├── refactor-surgeon.agent.md
│   │   │   └── small-cl-slicer.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── consistency-pass.prompt.md
│   │   │   ├── nit-sweep.prompt.md
│   │   │   ├── polish-brief.prompt.md
│   │   │   ├── polish-review.prompt.md
│   │   │   ├── polish-ship.prompt.md
│   │   │   ├── refactor-safely.prompt.md
│   │   │   └── slice-small-cls.prompt.md
│   │   └── skills/
│   │       ├── operational-tidiness-12factor-inspired/
│   │       │   └── SKILL.md
│   │       ├── polish-checklist/
│   │       │   └── SKILL.md
│   │       ├── refactoring-baby-steps/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── refactor-plan.md
│   │       └── small-change-discipline/
│   │           ├── SKILL.md
│   │           └── templates/
│   │               └── slice-plan.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── polish/
│           └── POLISH_ENGINEERING.md
├── copilot-project-scaffolding-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── project-scaffolding-architect.agent.md
│   │   │   ├── projen-synthesizer.agent.md
│   │   │   ├── repospec-composer.agent.md
│   │   │   ├── scaffold-auditor.agent.md
│   │   │   └── scaffold-profile-selector.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── choose-scaffold-profile.prompt.md
│   │   │   ├── projen-synth.prompt.md
│   │   │   ├── scaffold-audit.prompt.md
│   │   │   ├── scaffold-brief.prompt.md
│   │   │   └── scaffold-new.prompt.md
│   │   └── skills/
│   │       ├── projen-scaffolding/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── projen-checklist.md
│   │       ├── repospec-contract/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── repospec.md
│   │       └── scaffold-profile-catalogue/
│   │           └── SKILL.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── scaffolding/
│           └── README.md
├── copilot-prompt-library-pack/
│   ├── .github/
│   │   ├── copilot-instructions.md
│   │   └── prompts/
│   │       ├── audit/
│   │       │   ├── audit:repo-health.prompt.md
│   │       │   ├── audit:security-basics.prompt.md
│   │       │   └── audit:ui-a11y.prompt.md
│   │       ├── brief/
│   │       │   ├── brief:acceptance.prompt.md
│   │       │   └── brief:clarify.prompt.md
│   │       ├── gh/
│   │       │   └── gh:bootstrap.prompt.md
│   │       ├── gov/
│   │       │   └── gov:ship.prompt.md
│   │       ├── obs/
│   │       │   └── obs:ship.prompt.md
│   │       ├── polish/
│   │       │   └── polish:ship.prompt.md
│   │       ├── qa/
│   │       │   └── qa:ship.prompt.md
│   │       ├── rel/
│   │       │   └── rel:ship.prompt.md
│   │       ├── scaffold/
│   │       │   └── scaffold:new.prompt.md
│   │       ├── sec/
│   │       │   └── sec:ship.prompt.md
│   │       ├── ship/
│   │       │   ├── ship:pr-ready.prompt.md
│   │       │   └── ship:small-slice-plan.prompt.md
│   │       ├── suite/
│   │       │   └── suite:route.prompt.md
│   │       └── ui/
│   │           ├── ui:award.prompt.md
│   │           ├── ui:prototype.prompt.md
│   │           └── ui:wiring.prompt.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── tools/
│       └── validate-prompts.py
├── copilot-quality-engineer-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── contract-tester.agent.md
│   │   │   ├── flake-hunter.agent.md
│   │   │   ├── quality-engineer.agent.md
│   │   │   ├── quality-gate-reviewer.agent.md
│   │   │   ├── test-implementer.agent.md
│   │   │   └── test-planner.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── add-critical-tests.prompt.md
│   │   │   ├── contract-tests.prompt.md
│   │   │   ├── fixture-kit.prompt.md
│   │   │   ├── make-tests-deterministic.prompt.md
│   │   │   ├── quality-brief.prompt.md
│   │   │   ├── quality-review.prompt.md
│   │   │   └── quality-ship.prompt.md
│   │   └── skills/
│   │       ├── contract-testing-seams/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── contract-test-plan.md
│   │       ├── critical-path-inventory/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── critical-flows.md
│   │       ├── deterministic-testing/
│   │       │   └── SKILL.md
│   │       └── flake-triage/
│   │           └── SKILL.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── quality/
│           └── QUALITY_ENGINEERING.md
├── copilot-release-supplychain-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── build-hardener.agent.md
│   │   │   ├── provenance-attestor.agent.md
│   │   │   ├── release-notes-curator.agent.md
│   │   │   ├── release-supplychain.engineer.agent.md
│   │   │   ├── sbom-maintainer.agent.md
│   │   │   └── verifier.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── attest-provenance.prompt.md
│   │   │   ├── curate-release-notes.prompt.md
│   │   │   ├── generate-sbom.prompt.md
│   │   │   ├── harden-builds.prompt.md
│   │   │   ├── release-brief.prompt.md
│   │   │   ├── release-ship.prompt.md
│   │   │   └── verify-release.prompt.md
│   │   └── skills/
│   │       ├── artifact-verification/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── verify.md
│   │       ├── release-notes-and-versioning/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── release-notes.md
│   │       ├── reproducible-build-hardening/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── repro-audit.md
│   │       ├── sbom-generation-and-publication/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── sbom-publish.md
│   │       └── slsa-provenance-attestations/
│   │           ├── SKILL.md
│   │           └── templates/
│   │               └── provenance-checklist.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── release/
│           ├── RELEASE_ENGINEERING.md
│           └── VERIFY_RELEASE.md
├── copilot-security-gatekeeper-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── asvs-mapper.agent.md
│   │   │   ├── secure-implementer.agent.md
│   │   │   ├── security-gatekeeper.agent.md
│   │   │   ├── security-reviewer.agent.md
│   │   │   └── threat-modeler.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── asvs-checklist.prompt.md
│   │   │   ├── dependency-risk-triage.prompt.md
│   │   │   ├── secure-error-model.prompt.md
│   │   │   ├── secure-ship.prompt.md
│   │   │   ├── security-brief.prompt.md
│   │   │   ├── security-review.prompt.md
│   │   │   └── threat-model.prompt.md
│   │   └── skills/
│   │       ├── asvs-scoped-checklist/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── asvs-mapping.md
│   │       ├── dependency-risk-triage/
│   │       │   └── SKILL.md
│   │       ├── safe-errors-and-logging/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── error-mapping.md
│   │       └── threat-modeling-lite/
│   │           ├── SKILL.md
│   │           └── templates/
│   │               └── threat-model.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── README.md
│   └── docs/
│       └── security/
│           └── SECURITY_GATEKEEPER.md
├── copilot-suite-harmoniser-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   └── suite-chief-of-staff.agent.md
│   │   ├── copilot-instructions.md
│   │   └── prompts/
│   │       └── suite/
│   │           └── suite:route.prompt.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   ├── PACK_MANIFEST.json
│   └── README.md
├── copilot-ux-agent-pack/
│   ├── .github/
│   │   ├── agents/
│   │   │   ├── ux-implementer.agent.md
│   │   │   ├── ux-prototyper.agent.md
│   │   │   ├── ux-researcher.agent.md
│   │   │   └── ux-reviewer.agent.md
│   │   ├── copilot-instructions.md
│   │   ├── prompts/
│   │   │   ├── component-spec.prompt.md
│   │   │   ├── prototype-screen.prompt.md
│   │   │   ├── tokens-hardening.prompt.md
│   │   │   └── ux-audit.prompt.md
│   │   └── skills/
│   │       ├── accessibility-sweep/
│   │       │   ├── SKILL.md
│   │       │   └── templates/
│   │       │       └── a11y-checklist.md
│   │       ├── ux-heuristic-audit/
│   │       │   └── SKILL.md
│   │       └── ux-prototype-workflow/
│   │           ├── SKILL.md
│   │           └── templates/
│   │               ├── ux-contract.md
│   │               └── verification-checklist.md
│   ├── .vscode/
│   │   └── settings.json
│   ├── AGENTS.md
│   └── README.md
└── docs/
    └── diagrams/
```

## Flow diagrams

- `docs/diagrams/suite-routing.md`
- `docs/diagrams/pack-anatomy.md`
