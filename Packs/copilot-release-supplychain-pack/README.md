# Release Supplychain (copilot-release-supplychain-pack)

## Purpose

Describe the purpose of this pack.

## Install mode

suite

## Install links

- VS Code Web sample: [Open sample artifact](https://vscode.dev/github/IAmJonoBo/Packman/blob/main/Packs/copilot-release-supplychain-pack/.github/prompts/attest-provenance.prompt.md)
- Raw sample: [Download raw artifact](https://raw.githubusercontent.com/IAmJonoBo/Packman/main/Packs/copilot-release-supplychain-pack/.github/prompts/attest-provenance.prompt.md)

## Install commands

- Workspace target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-release-supplychain-pack --to /path/to/repo --mode fail --json`
- Global profile target: `pnpm --filter packman-cli exec node dist/index.js install ./Packs/copilot-release-supplychain-pack --target-type global --to /path/to/profile --mode fail --json`

## Key prompts

- .github/prompts/attest-provenance.prompt.md
- .github/prompts/curate-release-notes.prompt.md
- .github/prompts/generate-sbom.prompt.md
- .github/prompts/harden-builds.prompt.md
- .github/prompts/release-brief.prompt.md
- .github/prompts/release-ship.prompt.md
- .github/prompts/verify-release.prompt.md

## Key agents

- .github/agents/build-hardener.agent.md
- .github/agents/provenance-attestor.agent.md
- .github/agents/release-notes-curator.agent.md
- .github/agents/release-supplychain-engineer.agent.md
- .github/agents/sbom-maintainer.agent.md
- .github/agents/verifier.agent.md

## Directory tree

```text
copilot-release-supplychain-pack/
  .github/
    agents/
      build-hardener.agent.md
      provenance-attestor.agent.md
      release-notes-curator.agent.md
      release-supplychain-engineer.agent.md
      sbom-maintainer.agent.md
      verifier.agent.md
    copilot-instructions.md
    prompts/
      attest-provenance.prompt.md
      curate-release-notes.prompt.md
      generate-sbom.prompt.md
      harden-builds.prompt.md
      release-brief.prompt.md
      release-ship.prompt.md
      verify-release.prompt.md
    skills/
      artifact-verification/
        SKILL.md
        templates/
          verify.md
      release-notes-and-versioning/
        SKILL.md
        templates/
          release-notes.md
      reproducible-build-hardening/
        SKILL.md
        templates/
          repro-audit.md
      sbom-generation-and-publication/
        SKILL.md
        templates/
          sbom-publish.md
      slsa-provenance-attestations/
        SKILL.md
        templates/
          provenance-checklist.md
  .vscode/
    settings.json
  AGENTS.md
  docs/
    release/
      RELEASE_ENGINEERING.md
      VERIFY_RELEASE.md
  README.md
```

## Post-install checklist

- Run `packman validate <pack> --strict`
- Run `packman normalize <pack>` and review changes
- Run `packman install <pack|packsdir> --target workspace --path <target> --dry-run`
- Run `packman doctor <target>`
- Run `packman readiness <target>`
