---
name: style-and-lint-enforcement
description: Enforce prose + Markdown style using Vale and markdownlint; align to Oxford English and optional Google developer style conventions.
---

# Style + Lint Enforcement

## Tooling assumptions (common)

- Prose lint: Vale
- Markdown lint: markdownlint

## Procedure

1. Ensure config exists:
   - `.vale.ini`
   - `.markdownlint.json` (or YAML)
2. Decide style targets:
   - Oxford English (spelling + punctuation)
   - Google dev doc style conventions (clarity, word list)
3. Run linters and fix:
   - headings, list spacing, code fences, line length strategy
   - terminology consistency; passive voice; ambiguous wording
4. If exceptions needed:
   - scope narrowly (path or rule)
   - justify in config comments

## Templates

- [Vale config starter](./templates/vale.ini)
- [Markdownlint config starter](./templates/markdownlint.json)
