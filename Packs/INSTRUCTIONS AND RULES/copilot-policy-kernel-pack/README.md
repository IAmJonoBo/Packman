# Copilot Policy Kernel Pack (Instructions & Rules)

This pack implements **latest VS Code guidance** by splitting:

- **Always-on instructions**: `.github/copilot-instructions.md`
- **File-based instructions**: `.github/instructions/*.instructions.md` with YAML frontmatter (`name`, `description`, `applyTo`)

VS Code loads instruction files from `.github/instructions` by default via `chat.instructionsFilesLocations`.

## What you get

- A minimal, enforceable repo-wide policy kernel.
- File-based rules for TS/Python/Rust, UI areas, docs areas, review and release hygiene.
- Validator script: `tools/validate-instructions.py`

## How to use

- Add/adjust instruction files in `.github/instructions/`.
- Keep rules short and testable.
- Use VS Code “Configure Chat → Chat Instructions” to manage instruction files if preferred.

## References (source-of-truth)

- VS Code custom instructions + instruction files and locations.
- VS Code settings for instruction files (`chat.instructionsFilesLocations`, `applyTo`).
- VS Code customization overview (always-on vs file-based instructions).

## Directory layout

```text
├── .github/
│   ├── copilot-instructions.md
│   └── instructions/
│       ├── 00-repo-core.instructions.md
│       ├── 10-typescript.instructions.md
│       ├── 11-python.instructions.md
│       ├── 12-rust.instructions.md
│       ├── 20-ui.instructions.md
│       ├── 30-docs.instructions.md
│       ├── 40-code-review.instructions.md
│       └── 50-release.instructions.md
├── .vscode/
│   └── settings.json
├── AGENTS.md
└── tools/
    └── validate-instructions.py
```
