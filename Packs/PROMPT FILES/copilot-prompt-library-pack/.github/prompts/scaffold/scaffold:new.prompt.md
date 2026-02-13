---
name: scaffold:new
description: End-to-end scaffolding: brief → profile selection → RepoSpec → scaffold.
agent: 'Project Scaffolding Architect'
---
Scope: ${selection}

Do:
1) If constraints missing, run a brief capture.
2) Choose a standard scaffold profile.
3) Write a RepoSpec.
4) Scaffold (prefer definition-as-code).
5) Provide exact commands to run/synth.

Output: RepoSpec path + directory tree + commands.
