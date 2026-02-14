# REORG_PLAN

Generated: 2026-02-14T05:25:49.666Z

## Canonical taxonomy

- Canonical roots: `Packs/*-pack`
- Mirror roots treated as non-canonical references: `Packs/PROMPT FILES`, `Packs/INSTRUCTIONS AND RULES`
- Naming normalization: keep lowercase slug conventions for compatibility
- Collections are curation descriptors (references only), including minimal `plugins` meta-collection

## Redistribution policy

- Agent files contain persona, protocol, and handoff behavior
- Prompt files contain repeatable procedural runbooks
- Instructions contain stable standards and constraints
- Skills contain deep reusable checklists, rubrics, and how-to capability

## Step 0 inventory

| path | detected type | problems |
|---|---|---|
| Packs/copilot-architecture-governance-pack/.github/agents/adr-writer.agent.md | agent | - |
| Packs/copilot-architecture-governance-pack/.github/agents/architecture-governance-steward.agent.md | agent | - |
| Packs/copilot-architecture-governance-pack/.github/agents/change-risk-scorer.agent.md | agent | - |
| Packs/copilot-architecture-governance-pack/.github/agents/code-review-marshal.agent.md | agent | - |
| Packs/copilot-architecture-governance-pack/.github/agents/trunk-coach.agent.md | agent | - |
| Packs/copilot-architecture-governance-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-architecture-governance-pack/.github/prompts/architecture-brief.prompt.md | prompt | - |
| Packs/copilot-architecture-governance-pack/.github/prompts/architecture-ship.prompt.md | prompt | - |
| Packs/copilot-architecture-governance-pack/.github/prompts/governance-review.prompt.md | prompt | - |
| Packs/copilot-architecture-governance-pack/.github/prompts/risk-score-change.prompt.md | prompt | - |
| Packs/copilot-architecture-governance-pack/.github/prompts/trunk-slice.prompt.md | prompt | - |
| Packs/copilot-architecture-governance-pack/.github/prompts/write-adr.prompt.md | prompt | - |
| Packs/copilot-architecture-governance-pack/.github/skills/adr-discipline-nygard/SKILL.md | skill | - |
| Packs/copilot-architecture-governance-pack/.github/skills/adr-discipline-nygard/templates/adr-index.md | other | - |
| Packs/copilot-architecture-governance-pack/.github/skills/adr-discipline-nygard/templates/adr-template.md | other | - |
| Packs/copilot-architecture-governance-pack/.github/skills/change-risk-scoring/SKILL.md | skill | - |
| Packs/copilot-architecture-governance-pack/.github/skills/review-gates-google-standard/SKILL.md | skill | - |
| Packs/copilot-architecture-governance-pack/.github/skills/trunk-discipline/SKILL.md | skill | - |
| Packs/copilot-architecture-governance-pack/.vscode/settings.json | settings | - |
| Packs/copilot-architecture-governance-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-architecture-governance-pack/docs/architecture/adr/ADR-000-template.md | other | - |
| Packs/copilot-architecture-governance-pack/docs/architecture/adr/README.md | other | - |
| Packs/copilot-architecture-governance-pack/docs/architecture/README.md | other | - |
| Packs/copilot-architecture-governance-pack/llms.txt | other | - |
| Packs/copilot-architecture-governance-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-architecture-governance-pack/README.md | other | - |
| Packs/copilot-award-ui-pack/.github/agents/art-direction-planner.agent.md | agent | - |
| Packs/copilot-award-ui-pack/.github/agents/design-system-engineer.agent.md | agent | - |
| Packs/copilot-award-ui-pack/.github/agents/pixel-qa-reviewer.agent.md | agent | - |
| Packs/copilot-award-ui-pack/.github/agents/screen-composer.agent.md | agent | - |
| Packs/copilot-award-ui-pack/.github/agents/ui-art-director.agent.md | agent | - |
| Packs/copilot-award-ui-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-award-ui-pack/.github/prompts/art-direct-screen.prompt.md | prompt | - |
| Packs/copilot-award-ui-pack/.github/prompts/design-system-blueprint.prompt.md | prompt | - |
| Packs/copilot-award-ui-pack/.github/prompts/layout-grid.prompt.md | prompt | - |
| Packs/copilot-award-ui-pack/.github/prompts/pixel-perfect-review.prompt.md | prompt | - |
| Packs/copilot-award-ui-pack/.github/prompts/tokens-and-typography.prompt.md | prompt | - |
| Packs/copilot-award-ui-pack/.github/prompts/ui-brief.prompt.md | prompt | - |
| Packs/copilot-award-ui-pack/.github/skills/art-direction-intake-and-options/SKILL.md | skill | - |
| Packs/copilot-award-ui-pack/.github/skills/art-direction-intake-and-options/templates/brief.md | other | - |
| Packs/copilot-award-ui-pack/.github/skills/design-tokens-and-typography/SKILL.md | skill | - |
| Packs/copilot-award-ui-pack/.github/skills/design-tokens-and-typography/templates/type-scale.md | other | - |
| Packs/copilot-award-ui-pack/.github/skills/layout-composition-grid/SKILL.md | skill | - |
| Packs/copilot-award-ui-pack/.github/skills/layout-composition-grid/templates/grid-spec.md | other | - |
| Packs/copilot-award-ui-pack/.github/skills/pixel-perfect-qa/SKILL.md | skill | - |
| Packs/copilot-award-ui-pack/.vscode/settings.json | settings | - |
| Packs/copilot-award-ui-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-award-ui-pack/llms.txt | other | - |
| Packs/copilot-award-ui-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-award-ui-pack/README.md | other | - |
| Packs/copilot-docs-librarian-pack/.github/agents/diagram-curator.agent.md | agent | - |
| Packs/copilot-docs-librarian-pack/.github/agents/diataxis-architect.agent.md | agent | - |
| Packs/copilot-docs-librarian-pack/.github/agents/docs-librarian.agent.md | agent | - |
| Packs/copilot-docs-librarian-pack/.github/agents/docs-lint-runner.agent.md | agent | - |
| Packs/copilot-docs-librarian-pack/.github/agents/glossary-curator.agent.md | agent | - |
| Packs/copilot-docs-librarian-pack/.github/agents/style-enforcer.agent.md | agent | - |
| Packs/copilot-docs-librarian-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-docs-librarian-pack/.github/prompts/add-diagrams.prompt.md | prompt | - |
| Packs/copilot-docs-librarian-pack/.github/prompts/diataxis-restructure.prompt.md | prompt | - |
| Packs/copilot-docs-librarian-pack/.github/prompts/docs-audit.prompt.md | prompt | - |
| Packs/copilot-docs-librarian-pack/.github/prompts/lint-docs.prompt.md | prompt | - |
| Packs/copilot-docs-librarian-pack/.github/prompts/refresh-docs.prompt.md | prompt | - |
| Packs/copilot-docs-librarian-pack/.github/prompts/refresh-glossary.prompt.md | prompt | - |
| Packs/copilot-docs-librarian-pack/.github/prompts/style-sweep.prompt.md | prompt | - |
| Packs/copilot-docs-librarian-pack/.github/skills/diagram-and-glossary-coverage/SKILL.md | skill | - |
| Packs/copilot-docs-librarian-pack/.github/skills/diagram-and-glossary-coverage/templates/glossary.md | other | - |
| Packs/copilot-docs-librarian-pack/.github/skills/diagram-and-glossary-coverage/templates/mermaid-snippets.md | other | - |
| Packs/copilot-docs-librarian-pack/.github/skills/diataxis-maintenance/SKILL.md | skill | - |
| Packs/copilot-docs-librarian-pack/.github/skills/diataxis-maintenance/templates/mode-templates.md | other | - |
| Packs/copilot-docs-librarian-pack/.github/skills/docs-sanity-check/SKILL.md | skill | - |
| Packs/copilot-docs-librarian-pack/.github/skills/style-and-lint-enforcement/SKILL.md | skill | - |
| Packs/copilot-docs-librarian-pack/.github/skills/style-and-lint-enforcement/templates/markdownlint.json | other | - |
| Packs/copilot-docs-librarian-pack/.github/skills/style-and-lint-enforcement/templates/vale.ini | other | - |
| Packs/copilot-docs-librarian-pack/.markdownlint.json | other | - |
| Packs/copilot-docs-librarian-pack/.vale.ini | other | - |
| Packs/copilot-docs-librarian-pack/.vscode/settings.json | settings | - |
| Packs/copilot-docs-librarian-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-docs-librarian-pack/docs/glossary.md | other | - |
| Packs/copilot-docs-librarian-pack/llms.txt | other | - |
| Packs/copilot-docs-librarian-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-docs-librarian-pack/README.md | other | - |
| Packs/copilot-edge-case-vanguard-pack/.github/agents/edge-case-vanguard.agent.md | agent | - |
| Packs/copilot-edge-case-vanguard-pack/.github/prompts/chaos-experiments.prompt.md | prompt | - |
| Packs/copilot-edge-case-vanguard-pack/.github/prompts/edge-inventory.prompt.md | prompt | - |
| Packs/copilot-edge-case-vanguard-pack/.github/prompts/fuzz-plan.prompt.md | prompt | - |
| Packs/copilot-edge-case-vanguard-pack/.github/prompts/observability-gaps.prompt.md | prompt | - |
| Packs/copilot-edge-case-vanguard-pack/.github/prompts/one-slice.prompt.md | prompt | - |
| Packs/copilot-edge-case-vanguard-pack/.github/prompts/pbt-plan.prompt.md | prompt | - |
| Packs/copilot-edge-case-vanguard-pack/.github/skills/edge-case-vanguard/SKILL.md | skill | - |
| Packs/copilot-edge-case-vanguard-pack/llms.txt | other | - |
| Packs/copilot-edge-case-vanguard-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-edge-case-vanguard-pack/README.md | other | - |
| Packs/copilot-github-bootstrap-pack/.github/agents/community-health-auditor.agent.md | agent | - |
| Packs/copilot-github-bootstrap-pack/.github/agents/dependabot-steward.agent.md | agent | - |
| Packs/copilot-github-bootstrap-pack/.github/agents/github-bootstrap-engineer.agent.md | agent | - |
| Packs/copilot-github-bootstrap-pack/.github/agents/ownership-marshal.agent.md | agent | - |
| Packs/copilot-github-bootstrap-pack/.github/agents/security-policy-editor.agent.md | agent | - |
| Packs/copilot-github-bootstrap-pack/.github/agents/template-curator.agent.md | agent | - |
| Packs/copilot-github-bootstrap-pack/.github/CODEOWNERS | other | - |
| Packs/copilot-github-bootstrap-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-github-bootstrap-pack/.github/dependabot.yml | other | - |
| Packs/copilot-github-bootstrap-pack/.github/ISSUE_TEMPLATE/bug-report.yml | other | - |
| Packs/copilot-github-bootstrap-pack/.github/ISSUE_TEMPLATE/config.yml | other | - |
| Packs/copilot-github-bootstrap-pack/.github/ISSUE_TEMPLATE/docs.yml | other | - |
| Packs/copilot-github-bootstrap-pack/.github/ISSUE_TEMPLATE/feature-request.yml | other | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/add-issue-forms.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/add-pr-template.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/community-profile-audit.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/dependabot-policy.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/github-bootstrap.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/repo-settings-brief.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/setup-codeowners.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/prompts/setup-security-policy.prompt.md | prompt | - |
| Packs/copilot-github-bootstrap-pack/.github/PULL_REQUEST_TEMPLATE.md | other | - |
| Packs/copilot-github-bootstrap-pack/.github/skills/codeowners-ownership/SKILL.md | skill | - |
| Packs/copilot-github-bootstrap-pack/.github/skills/github-community-health/SKILL.md | skill | - |
| Packs/copilot-github-bootstrap-pack/.github/skills/issue-forms-and-templates/SKILL.md | skill | - |
| Packs/copilot-github-bootstrap-pack/.github/skills/pr-template-and-review-contract/SKILL.md | skill | - |
| Packs/copilot-github-bootstrap-pack/.vscode/settings.json | settings | - |
| Packs/copilot-github-bootstrap-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-github-bootstrap-pack/CODE_OF_CONDUCT.md | other | - |
| Packs/copilot-github-bootstrap-pack/CONTRIBUTING.md | other | - |
| Packs/copilot-github-bootstrap-pack/docs/github/BOOTSTRAP.md | other | - |
| Packs/copilot-github-bootstrap-pack/llms.txt | other | - |
| Packs/copilot-github-bootstrap-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-github-bootstrap-pack/README.md | other | - |
| Packs/copilot-github-bootstrap-pack/SECURITY.md | other | - |
| Packs/copilot-github-bootstrap-pack/SUPPORT.md | other | - |
| Packs/copilot-gold-standards-steward-pack/.github/agents/gold-standards-steward.agent.md | agent | - |
| Packs/copilot-gold-standards-steward-pack/.github/instructions/gs-small-cls.instructions.md | instruction | - |
| Packs/copilot-gold-standards-steward-pack/.github/prompts/audit-gold-standard.prompt.md | prompt | - |
| Packs/copilot-gold-standards-steward-pack/.github/prompts/doctor-report.prompt.md | prompt | - |
| Packs/copilot-gold-standards-steward-pack/.github/prompts/gates-setup.prompt.md | prompt | - |
| Packs/copilot-gold-standards-steward-pack/.github/prompts/uplift-execute-slice.prompt.md | prompt | - |
| Packs/copilot-gold-standards-steward-pack/.github/prompts/uplift-plan.prompt.md | prompt | - |
| Packs/copilot-gold-standards-steward-pack/.github/skills/gold-standards-steward/resources/baseline-scorecard.md | other | - |
| Packs/copilot-gold-standards-steward-pack/.github/skills/gold-standards-steward/resources/gates-checklist.md | other | - |
| Packs/copilot-gold-standards-steward-pack/.github/skills/gold-standards-steward/resources/uplift-slice.md | other | - |
| Packs/copilot-gold-standards-steward-pack/.github/skills/gold-standards-steward/SKILL.md | skill | - |
| Packs/copilot-gold-standards-steward-pack/llms.txt | other | - |
| Packs/copilot-gold-standards-steward-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-gold-standards-steward-pack/README.md | other | - |
| Packs/copilot-hooks-orchestrator-pack/.claude/settings.json | other | - |
| Packs/copilot-hooks-orchestrator-pack/.claude/settings.local.json | other | - |
| Packs/copilot-hooks-orchestrator-pack/.github/hooks/packman-hooks.json | hook | - |
| Packs/copilot-hooks-orchestrator-pack/hooks/hooks.json | other | - |
| Packs/copilot-hooks-orchestrator-pack/hooks/README.md | other | - |
| Packs/copilot-hooks-orchestrator-pack/hooks/scripts/error-occurred.sh | other | - |
| Packs/copilot-hooks-orchestrator-pack/hooks/scripts/pre-tool-use.sh | other | - |
| Packs/copilot-hooks-orchestrator-pack/hooks/scripts/session-end.sh | other | - |
| Packs/copilot-hooks-orchestrator-pack/hooks/scripts/session-start.sh | other | - |
| Packs/copilot-hooks-orchestrator-pack/llms.txt | other | - |
| Packs/copilot-hooks-orchestrator-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-hooks-orchestrator-pack/README.md | other | - |
| Packs/copilot-interface-wiring-pack/.github/agents/api-contract-analyst.agent.md | agent | - |
| Packs/copilot-interface-wiring-pack/.github/agents/integration-reviewer.agent.md | agent | - |
| Packs/copilot-interface-wiring-pack/.github/agents/integration-tester.agent.md | agent | - |
| Packs/copilot-interface-wiring-pack/.github/agents/interface-wireup.agent.md | agent | - |
| Packs/copilot-interface-wiring-pack/.github/agents/ui-integrator.agent.md | agent | - |
| Packs/copilot-interface-wiring-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-interface-wiring-pack/.github/prompts/add-mocks.prompt.md | prompt | - |
| Packs/copilot-interface-wiring-pack/.github/prompts/api-contract.prompt.md | prompt | - |
| Packs/copilot-interface-wiring-pack/.github/prompts/generate-typed-client.prompt.md | prompt | - |
| Packs/copilot-interface-wiring-pack/.github/prompts/integration-test.prompt.md | prompt | - |
| Packs/copilot-interface-wiring-pack/.github/prompts/wire-up-feature.prompt.md | prompt | - |
| Packs/copilot-interface-wiring-pack/.github/skills/contract-first-integration/SKILL.md | skill | - |
| Packs/copilot-interface-wiring-pack/.github/skills/contract-first-integration/templates/contract.md | other | - |
| Packs/copilot-interface-wiring-pack/.github/skills/contract-first-integration/templates/error-taxonomy.md | other | - |
| Packs/copilot-interface-wiring-pack/.github/skills/integration-testing-seams/SKILL.md | skill | - |
| Packs/copilot-interface-wiring-pack/.github/skills/integration-testing-seams/templates/test-plan.md | other | - |
| Packs/copilot-interface-wiring-pack/.github/skills/ui-backend-wiring-workflow/SKILL.md | skill | - |
| Packs/copilot-interface-wiring-pack/.github/skills/ui-backend-wiring-workflow/templates/mapping-table.md | other | - |
| Packs/copilot-interface-wiring-pack/.github/skills/ui-backend-wiring-workflow/templates/state-matrix.md | other | - |
| Packs/copilot-interface-wiring-pack/.vscode/settings.json | settings | - |
| Packs/copilot-interface-wiring-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-interface-wiring-pack/llms.txt | other | - |
| Packs/copilot-interface-wiring-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-interface-wiring-pack/README.md | other | - |
| Packs/copilot-observability-incident-pack/.github/agents/dora-reporter.agent.md | agent | - |
| Packs/copilot-observability-incident-pack/.github/agents/incident-commander-coach.agent.md | agent | - |
| Packs/copilot-observability-incident-pack/.github/agents/observability-lead.agent.md | agent | - |
| Packs/copilot-observability-incident-pack/.github/agents/otel-instrumentation-engineer.agent.md | agent | - |
| Packs/copilot-observability-incident-pack/.github/agents/postmortem-editor.agent.md | agent | - |
| Packs/copilot-observability-incident-pack/.github/agents/slo-alert-designer.agent.md | agent | - |
| Packs/copilot-observability-incident-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-observability-incident-pack/.github/prompts/define-slos.prompt.md | prompt | - |
| Packs/copilot-observability-incident-pack/.github/prompts/dora-review.prompt.md | prompt | - |
| Packs/copilot-observability-incident-pack/.github/prompts/incident-triage.prompt.md | prompt | - |
| Packs/copilot-observability-incident-pack/.github/prompts/instrument-service.prompt.md | prompt | - |
| Packs/copilot-observability-incident-pack/.github/prompts/observability-brief.prompt.md | prompt | - |
| Packs/copilot-observability-incident-pack/.github/prompts/observability-ship.prompt.md | prompt | - |
| Packs/copilot-observability-incident-pack/.github/prompts/write-postmortem.prompt.md | prompt | - |
| Packs/copilot-observability-incident-pack/.github/skills/dora-metrics-definition/SKILL.md | skill | - |
| Packs/copilot-observability-incident-pack/.github/skills/dora-metrics-definition/templates/dora.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/incident-triage-and-timeline/SKILL.md | skill | - |
| Packs/copilot-observability-incident-pack/.github/skills/incident-triage-and-timeline/templates/live-checklist.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/incident-triage-and-timeline/templates/timeline.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/otel-semantic-conventions/SKILL.md | skill | - |
| Packs/copilot-observability-incident-pack/.github/skills/otel-semantic-conventions/templates/span-attribute-map.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/postmortems-and-action-items/SKILL.md | skill | - |
| Packs/copilot-observability-incident-pack/.github/skills/postmortems-and-action-items/templates/action-items.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/postmortems-and-action-items/templates/postmortem.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/slo-alerting-runbooks/SKILL.md | skill | - |
| Packs/copilot-observability-incident-pack/.github/skills/slo-alerting-runbooks/templates/alert-rubric.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/slo-alerting-runbooks/templates/runbook.md | other | - |
| Packs/copilot-observability-incident-pack/.github/skills/slo-alerting-runbooks/templates/slo-table.md | other | - |
| Packs/copilot-observability-incident-pack/.vscode/settings.json | settings | - |
| Packs/copilot-observability-incident-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-observability-incident-pack/docs/ops/OBSERVABILITY.md | other | - |
| Packs/copilot-observability-incident-pack/docs/ops/POSTMORTEM_TEMPLATE.md | other | - |
| Packs/copilot-observability-incident-pack/llms.txt | other | - |
| Packs/copilot-observability-incident-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-observability-incident-pack/README.md | other | - |
| Packs/copilot-policy-kernel-hooks-pack/.claude/settings.json | other | - |
| Packs/copilot-policy-kernel-hooks-pack/.claude/settings.local.json | other | - |
| Packs/copilot-policy-kernel-hooks-pack/.github/hooks/policy-kernel-hooks.json | hook | - |
| Packs/copilot-policy-kernel-hooks-pack/llms.txt | other | - |
| Packs/copilot-policy-kernel-hooks-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-policy-kernel-hooks-pack/README.md | other | - |
| Packs/copilot-policy-kernel-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-policy-kernel-pack/.github/instructions/00-repo-core.instructions.md | instruction | - |
| Packs/copilot-policy-kernel-pack/.github/skills/repo-core-policy/resources/policy-checklist.md | other | - |
| Packs/copilot-policy-kernel-pack/.github/skills/repo-core-policy/scripts/policy-self-check.sh | other | - |
| Packs/copilot-policy-kernel-pack/.github/skills/repo-core-policy/SKILL.md | skill | - |
| Packs/copilot-policy-kernel-pack/.vscode/settings.json | settings | - |
| Packs/copilot-policy-kernel-pack/llms.txt | other | - |
| Packs/copilot-policy-kernel-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-policy-kernel-pack/README.md | other | - |
| Packs/copilot-policy-kernel-pack/tools/validate-instructions.py | other | - |
| Packs/copilot-polish-tightening-pack/.github/agents/consistency-enforcer.agent.md | agent | - |
| Packs/copilot-polish-tightening-pack/.github/agents/nit-hunter.agent.md | agent | - |
| Packs/copilot-polish-tightening-pack/.github/agents/polish-gate-reviewer.agent.md | agent | - |
| Packs/copilot-polish-tightening-pack/.github/agents/polish-tightening-engineer.agent.md | agent | - |
| Packs/copilot-polish-tightening-pack/.github/agents/refactor-surgeon.agent.md | agent | - |
| Packs/copilot-polish-tightening-pack/.github/agents/small-cl-slicer.agent.md | agent | - |
| Packs/copilot-polish-tightening-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-polish-tightening-pack/.github/prompts/consistency-pass.prompt.md | prompt | - |
| Packs/copilot-polish-tightening-pack/.github/prompts/nit-sweep.prompt.md | prompt | - |
| Packs/copilot-polish-tightening-pack/.github/prompts/polish-brief.prompt.md | prompt | - |
| Packs/copilot-polish-tightening-pack/.github/prompts/polish-review.prompt.md | prompt | - |
| Packs/copilot-polish-tightening-pack/.github/prompts/polish-ship.prompt.md | prompt | - |
| Packs/copilot-polish-tightening-pack/.github/prompts/refactor-safely.prompt.md | prompt | - |
| Packs/copilot-polish-tightening-pack/.github/prompts/slice-small-cls.prompt.md | prompt | - |
| Packs/copilot-polish-tightening-pack/.github/skills/operational-tidiness-12factor-inspired/SKILL.md | skill | - |
| Packs/copilot-polish-tightening-pack/.github/skills/polish-checklist/SKILL.md | skill | - |
| Packs/copilot-polish-tightening-pack/.github/skills/refactoring-baby-steps/SKILL.md | skill | - |
| Packs/copilot-polish-tightening-pack/.github/skills/refactoring-baby-steps/templates/refactor-plan.md | other | - |
| Packs/copilot-polish-tightening-pack/.github/skills/small-change-discipline/SKILL.md | skill | - |
| Packs/copilot-polish-tightening-pack/.github/skills/small-change-discipline/templates/slice-plan.md | other | - |
| Packs/copilot-polish-tightening-pack/.vscode/settings.json | settings | - |
| Packs/copilot-polish-tightening-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-polish-tightening-pack/docs/polish/POLISH_ENGINEERING.md | other | - |
| Packs/copilot-polish-tightening-pack/llms.txt | other | - |
| Packs/copilot-polish-tightening-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-polish-tightening-pack/README.md | other | - |
| Packs/copilot-project-management-planning-pack/.github/agents/execution-gate-reviewer.agent.md | agent | - |
| Packs/copilot-project-management-planning-pack/.github/agents/project-planning-lead.agent.md | agent | - |
| Packs/copilot-project-management-planning-pack/.github/agents/risk-dependency-coordinator.agent.md | agent | - |
| Packs/copilot-project-management-planning-pack/.github/agents/scope-clarifier.agent.md | agent | - |
| Packs/copilot-project-management-planning-pack/.github/agents/work-breakdown-planner.agent.md | agent | - |
| Packs/copilot-project-management-planning-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-project-management-planning-pack/.github/prompts/checkpoint-review.prompt.md | prompt | - |
| Packs/copilot-project-management-planning-pack/.github/prompts/planning-brief.prompt.md | prompt | - |
| Packs/copilot-project-management-planning-pack/.github/prompts/planning-replan.prompt.md | prompt | - |
| Packs/copilot-project-management-planning-pack/.github/prompts/planning-ship.prompt.md | prompt | - |
| Packs/copilot-project-management-planning-pack/.github/prompts/variance-triage.prompt.md | prompt | - |
| Packs/copilot-project-management-planning-pack/.github/skills/dependency-critical-path-mapping/SKILL.md | skill | - |
| Packs/copilot-project-management-planning-pack/.github/skills/dependency-critical-path-mapping/templates/dependency-map.md | other | - |
| Packs/copilot-project-management-planning-pack/.github/skills/execution-gate-checklist/SKILL.md | skill | - |
| Packs/copilot-project-management-planning-pack/.github/skills/execution-gate-checklist/templates/gate-checklist.md | other | - |
| Packs/copilot-project-management-planning-pack/.github/skills/project-plan-contract/SKILL.md | skill | - |
| Packs/copilot-project-management-planning-pack/.github/skills/project-plan-contract/templates/project-plan.md | other | - |
| Packs/copilot-project-management-planning-pack/.github/skills/variance-and-backpedal-management/SKILL.md | skill | - |
| Packs/copilot-project-management-planning-pack/.github/skills/variance-and-backpedal-management/templates/replan-delta.md | other | - |
| Packs/copilot-project-management-planning-pack/.github/skills/variance-and-backpedal-management/templates/variance-log.md | other | - |
| Packs/copilot-project-management-planning-pack/.vscode/settings.json | settings | - |
| Packs/copilot-project-management-planning-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-project-management-planning-pack/docs/planning/PROJECT_PLANNING.md | other | - |
| Packs/copilot-project-management-planning-pack/llms.txt | other | - |
| Packs/copilot-project-management-planning-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-project-management-planning-pack/README.md | other | - |
| Packs/copilot-project-scaffolding-pack/.github/agents/project-scaffolding-architect.agent.md | agent | - |
| Packs/copilot-project-scaffolding-pack/.github/agents/projen-synthesizer.agent.md | agent | - |
| Packs/copilot-project-scaffolding-pack/.github/agents/repospec-composer.agent.md | agent | - |
| Packs/copilot-project-scaffolding-pack/.github/agents/scaffold-auditor.agent.md | agent | - |
| Packs/copilot-project-scaffolding-pack/.github/agents/scaffold-profile-selector.agent.md | agent | - |
| Packs/copilot-project-scaffolding-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-project-scaffolding-pack/.github/prompts/choose-scaffold-profile.prompt.md | prompt | - |
| Packs/copilot-project-scaffolding-pack/.github/prompts/projen-synth.prompt.md | prompt | - |
| Packs/copilot-project-scaffolding-pack/.github/prompts/scaffold-audit.prompt.md | prompt | - |
| Packs/copilot-project-scaffolding-pack/.github/prompts/scaffold-brief.prompt.md | prompt | - |
| Packs/copilot-project-scaffolding-pack/.github/prompts/scaffold-new.prompt.md | prompt | - |
| Packs/copilot-project-scaffolding-pack/.github/skills/projen-scaffolding/SKILL.md | skill | - |
| Packs/copilot-project-scaffolding-pack/.github/skills/projen-scaffolding/templates/projen-checklist.md | other | - |
| Packs/copilot-project-scaffolding-pack/.github/skills/repospec-contract/SKILL.md | skill | - |
| Packs/copilot-project-scaffolding-pack/.github/skills/repospec-contract/templates/repospec.md | other | - |
| Packs/copilot-project-scaffolding-pack/.github/skills/scaffold-profile-catalogue/SKILL.md | skill | - |
| Packs/copilot-project-scaffolding-pack/.vscode/settings.json | settings | - |
| Packs/copilot-project-scaffolding-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-project-scaffolding-pack/docs/scaffolding/README.md | other | - |
| Packs/copilot-project-scaffolding-pack/llms.txt | other | - |
| Packs/copilot-project-scaffolding-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-project-scaffolding-pack/README.md | other | - |
| Packs/copilot-prompt-library-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-prompt-library-pack/.github/prompts/audit/audit-repo-health.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/audit/audit-security-basics.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/audit/audit-ui-a11y.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/brief/brief-acceptance.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/brief/brief-clarify.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/gh/gh-bootstrap.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/gov/gov-ship.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/obs/obs-ship.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/polish/polish-ship.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/qa/qa-ship.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/rel/rel-ship.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/scaffold/scaffold-new.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/sec/sec-ship.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/ship/ship-pr-ready.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/ship/ship-small-slice-plan.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/suite/suite:route.prompt.md | prompt | duplicate-target-path |
| Packs/copilot-prompt-library-pack/.github/prompts/ui/ui-award.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/ui/ui-prototype.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.github/prompts/ui/ui-wiring.prompt.md | prompt | - |
| Packs/copilot-prompt-library-pack/.vscode/settings.json | settings | - |
| Packs/copilot-prompt-library-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-prompt-library-pack/llms.txt | other | - |
| Packs/copilot-prompt-library-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-prompt-library-pack/README.md | other | - |
| Packs/copilot-prompt-library-pack/tools/validate-prompts.py | other | - |
| Packs/copilot-quality-engineer-pack/.github/agents/contract-tester.agent.md | agent | - |
| Packs/copilot-quality-engineer-pack/.github/agents/flake-hunter.agent.md | agent | - |
| Packs/copilot-quality-engineer-pack/.github/agents/quality-engineer.agent.md | agent | - |
| Packs/copilot-quality-engineer-pack/.github/agents/quality-gate-reviewer.agent.md | agent | - |
| Packs/copilot-quality-engineer-pack/.github/agents/test-implementer.agent.md | agent | - |
| Packs/copilot-quality-engineer-pack/.github/agents/test-planner.agent.md | agent | - |
| Packs/copilot-quality-engineer-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-quality-engineer-pack/.github/prompts/add-critical-tests.prompt.md | prompt | - |
| Packs/copilot-quality-engineer-pack/.github/prompts/contract-tests.prompt.md | prompt | - |
| Packs/copilot-quality-engineer-pack/.github/prompts/fixture-kit.prompt.md | prompt | - |
| Packs/copilot-quality-engineer-pack/.github/prompts/make-tests-deterministic.prompt.md | prompt | - |
| Packs/copilot-quality-engineer-pack/.github/prompts/quality-brief.prompt.md | prompt | - |
| Packs/copilot-quality-engineer-pack/.github/prompts/quality-review.prompt.md | prompt | - |
| Packs/copilot-quality-engineer-pack/.github/prompts/quality-ship.prompt.md | prompt | - |
| Packs/copilot-quality-engineer-pack/.github/skills/contract-testing-seams/SKILL.md | skill | - |
| Packs/copilot-quality-engineer-pack/.github/skills/contract-testing-seams/templates/contract-test-plan.md | other | - |
| Packs/copilot-quality-engineer-pack/.github/skills/critical-path-inventory/SKILL.md | skill | - |
| Packs/copilot-quality-engineer-pack/.github/skills/critical-path-inventory/templates/critical-flows.md | other | - |
| Packs/copilot-quality-engineer-pack/.github/skills/deterministic-testing/SKILL.md | skill | - |
| Packs/copilot-quality-engineer-pack/.github/skills/flake-triage/SKILL.md | skill | - |
| Packs/copilot-quality-engineer-pack/.vscode/settings.json | settings | - |
| Packs/copilot-quality-engineer-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-quality-engineer-pack/docs/quality/QUALITY_ENGINEERING.md | other | - |
| Packs/copilot-quality-engineer-pack/llms.txt | other | - |
| Packs/copilot-quality-engineer-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-quality-engineer-pack/README.md | other | - |
| Packs/copilot-release-supplychain-pack/.github/agents/build-hardener.agent.md | agent | - |
| Packs/copilot-release-supplychain-pack/.github/agents/provenance-attestor.agent.md | agent | - |
| Packs/copilot-release-supplychain-pack/.github/agents/release-notes-curator.agent.md | agent | - |
| Packs/copilot-release-supplychain-pack/.github/agents/release-supplychain-engineer.agent.md | agent | - |
| Packs/copilot-release-supplychain-pack/.github/agents/sbom-maintainer.agent.md | agent | - |
| Packs/copilot-release-supplychain-pack/.github/agents/verifier.agent.md | agent | - |
| Packs/copilot-release-supplychain-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-release-supplychain-pack/.github/prompts/attest-provenance.prompt.md | prompt | - |
| Packs/copilot-release-supplychain-pack/.github/prompts/curate-release-notes.prompt.md | prompt | - |
| Packs/copilot-release-supplychain-pack/.github/prompts/generate-sbom.prompt.md | prompt | - |
| Packs/copilot-release-supplychain-pack/.github/prompts/harden-builds.prompt.md | prompt | - |
| Packs/copilot-release-supplychain-pack/.github/prompts/release-brief.prompt.md | prompt | - |
| Packs/copilot-release-supplychain-pack/.github/prompts/release-ship.prompt.md | prompt | - |
| Packs/copilot-release-supplychain-pack/.github/prompts/verify-release.prompt.md | prompt | - |
| Packs/copilot-release-supplychain-pack/.github/skills/artifact-verification/SKILL.md | skill | - |
| Packs/copilot-release-supplychain-pack/.github/skills/artifact-verification/templates/verify.md | other | - |
| Packs/copilot-release-supplychain-pack/.github/skills/release-notes-and-versioning/SKILL.md | skill | - |
| Packs/copilot-release-supplychain-pack/.github/skills/release-notes-and-versioning/templates/release-notes.md | other | - |
| Packs/copilot-release-supplychain-pack/.github/skills/reproducible-build-hardening/SKILL.md | skill | - |
| Packs/copilot-release-supplychain-pack/.github/skills/reproducible-build-hardening/templates/repro-audit.md | other | - |
| Packs/copilot-release-supplychain-pack/.github/skills/sbom-generation-and-publication/SKILL.md | skill | - |
| Packs/copilot-release-supplychain-pack/.github/skills/sbom-generation-and-publication/templates/sbom-publish.md | other | - |
| Packs/copilot-release-supplychain-pack/.github/skills/slsa-provenance-attestations/SKILL.md | skill | - |
| Packs/copilot-release-supplychain-pack/.github/skills/slsa-provenance-attestations/templates/provenance-checklist.md | other | - |
| Packs/copilot-release-supplychain-pack/.vscode/settings.json | settings | - |
| Packs/copilot-release-supplychain-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-release-supplychain-pack/docs/release/RELEASE_ENGINEERING.md | other | - |
| Packs/copilot-release-supplychain-pack/docs/release/VERIFY_RELEASE.md | other | - |
| Packs/copilot-release-supplychain-pack/llms.txt | other | - |
| Packs/copilot-release-supplychain-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-release-supplychain-pack/README.md | other | - |
| Packs/copilot-security-gatekeeper-pack/.github/agents/asvs-mapper.agent.md | agent | - |
| Packs/copilot-security-gatekeeper-pack/.github/agents/secure-implementer.agent.md | agent | - |
| Packs/copilot-security-gatekeeper-pack/.github/agents/security-gatekeeper.agent.md | agent | - |
| Packs/copilot-security-gatekeeper-pack/.github/agents/security-reviewer.agent.md | agent | - |
| Packs/copilot-security-gatekeeper-pack/.github/agents/threat-modeler.agent.md | agent | - |
| Packs/copilot-security-gatekeeper-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-security-gatekeeper-pack/.github/prompts/asvs-checklist.prompt.md | prompt | - |
| Packs/copilot-security-gatekeeper-pack/.github/prompts/dependency-risk-triage.prompt.md | prompt | - |
| Packs/copilot-security-gatekeeper-pack/.github/prompts/secure-error-model.prompt.md | prompt | - |
| Packs/copilot-security-gatekeeper-pack/.github/prompts/secure-ship.prompt.md | prompt | - |
| Packs/copilot-security-gatekeeper-pack/.github/prompts/security-brief.prompt.md | prompt | - |
| Packs/copilot-security-gatekeeper-pack/.github/prompts/security-review.prompt.md | prompt | - |
| Packs/copilot-security-gatekeeper-pack/.github/prompts/threat-model.prompt.md | prompt | - |
| Packs/copilot-security-gatekeeper-pack/.github/skills/asvs-scoped-checklist/SKILL.md | skill | - |
| Packs/copilot-security-gatekeeper-pack/.github/skills/asvs-scoped-checklist/templates/asvs-mapping.md | other | - |
| Packs/copilot-security-gatekeeper-pack/.github/skills/dependency-risk-triage/SKILL.md | skill | - |
| Packs/copilot-security-gatekeeper-pack/.github/skills/safe-errors-and-logging/SKILL.md | skill | - |
| Packs/copilot-security-gatekeeper-pack/.github/skills/safe-errors-and-logging/templates/error-mapping.md | other | - |
| Packs/copilot-security-gatekeeper-pack/.github/skills/threat-modeling-lite/SKILL.md | skill | - |
| Packs/copilot-security-gatekeeper-pack/.github/skills/threat-modeling-lite/templates/threat-model.md | other | - |
| Packs/copilot-security-gatekeeper-pack/.vscode/settings.json | settings | - |
| Packs/copilot-security-gatekeeper-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-security-gatekeeper-pack/docs/security/SECURITY_GATEKEEPER.md | other | - |
| Packs/copilot-security-gatekeeper-pack/llms.txt | other | - |
| Packs/copilot-security-gatekeeper-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-security-gatekeeper-pack/README.md | other | - |
| Packs/copilot-suite-harmoniser-pack/.github/agents/suite-chief-of-staff.agent.md | agent | - |
| Packs/copilot-suite-harmoniser-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-suite-harmoniser-pack/.github/prompts/suite/suite:route.prompt.md | prompt | duplicate-target-path |
| Packs/copilot-suite-harmoniser-pack/.vscode/settings.json | settings | - |
| Packs/copilot-suite-harmoniser-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-suite-harmoniser-pack/ALLOWED_SUBAGENTS.json | other | - |
| Packs/copilot-suite-harmoniser-pack/llms.txt | other | - |
| Packs/copilot-suite-harmoniser-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-suite-harmoniser-pack/README.md | other | - |
| Packs/copilot-ux-agent-pack/.github/agents/ux-implementer.agent.md | agent | - |
| Packs/copilot-ux-agent-pack/.github/agents/ux-prototyper.agent.md | agent | - |
| Packs/copilot-ux-agent-pack/.github/agents/ux-researcher.agent.md | agent | - |
| Packs/copilot-ux-agent-pack/.github/agents/ux-reviewer.agent.md | agent | - |
| Packs/copilot-ux-agent-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, duplicate-target-path |
| Packs/copilot-ux-agent-pack/.github/prompts/component-spec.prompt.md | prompt | - |
| Packs/copilot-ux-agent-pack/.github/prompts/prototype-screen.prompt.md | prompt | - |
| Packs/copilot-ux-agent-pack/.github/prompts/tokens-hardening.prompt.md | prompt | - |
| Packs/copilot-ux-agent-pack/.github/prompts/ux-audit.prompt.md | prompt | - |
| Packs/copilot-ux-agent-pack/.github/skills/accessibility-sweep/SKILL.md | skill | - |
| Packs/copilot-ux-agent-pack/.github/skills/accessibility-sweep/templates/a11y-checklist.md | other | - |
| Packs/copilot-ux-agent-pack/.github/skills/ux-heuristic-audit/SKILL.md | skill | - |
| Packs/copilot-ux-agent-pack/.github/skills/ux-prototype-workflow/SKILL.md | skill | - |
| Packs/copilot-ux-agent-pack/.github/skills/ux-prototype-workflow/templates/ux-contract.md | other | - |
| Packs/copilot-ux-agent-pack/.github/skills/ux-prototype-workflow/templates/verification-checklist.md | other | - |
| Packs/copilot-ux-agent-pack/.vscode/settings.json | settings | - |
| Packs/copilot-ux-agent-pack/AGENTS.md | instruction | missing-frontmatter |
| Packs/copilot-ux-agent-pack/llms.txt | other | - |
| Packs/copilot-ux-agent-pack/PACK_MANIFEST.json | other | - |
| Packs/copilot-ux-agent-pack/README.md | other | - |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, mirror-duplicate-root |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/.github/instructions/00-repo-core.instructions.md | instruction | mirror-duplicate-root |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/.github/skills/repo-core-policy/resources/policy-checklist.md | other | - |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/.github/skills/repo-core-policy/scripts/policy-self-check.sh | other | - |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/.github/skills/repo-core-policy/SKILL.md | skill | mirror-duplicate-root |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/.vscode/settings.json | settings | mirror-duplicate-root |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/llms.txt | other | - |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/PACK_MANIFEST.json | other | - |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/README.md | other | - |
| Packs/INSTRUCTIONS AND RULES/copilot-policy-kernel-pack/tools/validate-instructions.py | other | - |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/copilot-instructions.md | instruction | missing-frontmatter, mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/audit/audit-repo-health.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/audit/audit-security-basics.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/audit/audit-ui-a11y.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/brief/brief-acceptance.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/brief/brief-clarify.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/gh/gh-bootstrap.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/gov/gov-ship.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/obs/obs-ship.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/polish/polish-ship.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/qa/qa-ship.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/rel/rel-ship.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/scaffold/scaffold-new.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/sec/sec-ship.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/ship/ship-pr-ready.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/ship/ship-small-slice-plan.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/suite/suite:route.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/ui/ui-award.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/ui/ui-prototype.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.github/prompts/ui/ui-wiring.prompt.md | prompt | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/.vscode/settings.json | settings | mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/AGENTS.md | instruction | missing-frontmatter, mirror-duplicate-root |
| Packs/PROMPT FILES/copilot-prompt-library-pack/llms.txt | other | - |
| Packs/PROMPT FILES/copilot-prompt-library-pack/PACK_MANIFEST.json | other | - |
| Packs/PROMPT FILES/copilot-prompt-library-pack/README.md | other | - |
| Packs/PROMPT FILES/copilot-prompt-library-pack/tools/validate-prompts.py | other | - |

## Planned moves and normalisation

- Keep canonical files in-place under `Packs/*-pack`
- Mark mirror-root files as deprecated references in migration map
- Resolve duplicate suite route prompt by deterministic export precedence (`suite-harmoniser` wins)
- Generate collection descriptors (`collection.json`) and export artifacts under `build/`
