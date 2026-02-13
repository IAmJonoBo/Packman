# Copilot Prompt Library Pack (Prompt Files)

A **namespaced prompt library** for VS Code Copilot Chat. These prompts are reusable task macros.

## Namespaces
- `brief:*` constraint capture and acceptance criteria
- `audit:*` systematic audits
- `ship:*` shipping helpers (slice plans, PR-ready summaries)
- domain namespaces: `scaffold:*`, `gh:*`, `sec:*`, `qa:*`, `obs:*`, `rel:*`, `gov:*`, `polish:*`, `ui:*`
- optional suite router: `suite:route` (if Suite Chief of Staff exists)

## Validation
Run:
- `python tools/validate-prompts.py .`

## Directory layout
```text
├── .github/
│   ├── copilot-instructions.md
│   └── prompts/
│       ├── audit/
│       │   ├── audit:repo-health.prompt.md
│       │   ├── audit:security-basics.prompt.md
│       │   └── audit:ui-a11y.prompt.md
│       ├── brief/
│       │   ├── brief:acceptance.prompt.md
│       │   └── brief:clarify.prompt.md
│       ├── gh/
│       │   └── gh:bootstrap.prompt.md
│       ├── gov/
│       │   └── gov:ship.prompt.md
│       ├── obs/
│       │   └── obs:ship.prompt.md
│       ├── polish/
│       │   └── polish:ship.prompt.md
│       ├── qa/
│       │   └── qa:ship.prompt.md
│       ├── rel/
│       │   └── rel:ship.prompt.md
│       ├── scaffold/
│       │   └── scaffold:new.prompt.md
│       ├── sec/
│       │   └── sec:ship.prompt.md
│       ├── ship/
│       │   ├── ship:pr-ready.prompt.md
│       │   └── ship:small-slice-plan.prompt.md
│       ├── suite/
│       │   └── suite:route.prompt.md
│       └── ui/
│           ├── ui:award.prompt.md
│           ├── ui:prototype.prompt.md
│           └── ui:wiring.prompt.md
├── .vscode/
│   └── settings.json
├── AGENTS.md
└── tools/
    └── validate-prompts.py
```
