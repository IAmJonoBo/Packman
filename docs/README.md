# Packman docs

## VS Code readiness checklist

- `.vscode/settings.json` includes:
  - `chat.promptFilesLocations`
  - `chat.instructionsFilesLocations`
  - `chat.agentFilesLocations`
  - `chat.agentSkillsLocations`
- `.github/prompts` contains `*.prompt.md` with required frontmatter (`name`, `description`)
- `.github/instructions` contains `*.instructions.md` with `applyTo`
- `.github/agents` contains `*.agent.md` with required frontmatter
- `.github/skills/**/SKILL.md` files include `name` and `description`
- No macOS junk files (`__MACOSX`, `.DS_Store`, `._*`)

## Fix flow

1. `packman validate <path> --strict`
2. `packman normalize <path> --apply`
3. `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
4. `packman install <pack|packsdir> --target workspace --path <target> [--suite]`
5. `packman doctor <target>` and `packman readiness <target>`
