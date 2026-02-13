# Prompt Library Pack

This pack provides a **namespaced prompt library** for Copilot Chat in VS Code.

Rules:

- Prompt names are namespaced: `brief:*`, `audit:*`, `ship:*`, and domain namespaces (`sec:*`, `qa:*`, `ui:*`, etc.).
- Prompts should be short task macros; use agents/skills for long policy.
- If a referenced agent is not installed, the prompt should still be useful by producing a plan.
