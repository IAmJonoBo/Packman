---
name: "brief:repo-settings-brief"
description: >-
  Ask for missing GitHub bootstrapping constraints before generating .github
  files.
agent: ask
---

Ask me ONLY for missing information:

1. Repo type: public | private
2. Ownership model: who approves PRs (GitHub users/teams handles)?
3. Contribution model: internal only | OSS contributions | mixed
4. Support channel: Issues | Discussions | Email | None
5. Security reporting: private vulnerability reporting | email | both
6. Release style: tags | GitHub releases | none
7. Dependency policy: allow Dependabot? (yes/no) + ecosystems used (npm/pip/cargo/etc.)
8. Style conventions: tone/voice and any required sections

Then restate the brief and proceed with /github-bootstrap.
