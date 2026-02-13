---
name: change-risk-scoring
description: Score changes by blast radius and prescribe verification, rollout, and rollback plans proportional to risk.
---

# Change Risk Scoring

## Score (0–10) drivers
- Blast radius (users/services/data)
- Reversibility (rollback/flags)
- Novelty (new patterns/deps)
- Complexity (touch points)
- Test coverage confidence
- Operability risk (monitoring gaps)

## Output
- Score with drivers
- Verification gates
- Rollout plan (flags, canary, staged)
- Rollback plan

