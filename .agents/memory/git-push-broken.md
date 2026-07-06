---
name: Git push from agent shell is broken
description: git push from the main agent's bash tool hangs/times out on this project; use Replit's Git panel instead.
---

`git push origin main` (and similar) run from the main agent's bash tool reliably hangs and times out (exit 124) even after fetch/status succeed. Root cause: the `replit-git-askpass` helper requires `REPLIT_ASKPASS_PID2_SESSION`, which isn't set in the agent's shell session, so GitHub auth can never complete.

**Why:** Confirmed by reading the askpass script directly — it exits/hangs without a valid PID2 session env var, which only exists in an authenticated interactive Replit session, not the agent's sandboxed bash tool.

**How to apply:** Don't retry `git push` from the agent shell expecting a different result. Instead, either (a) use the project-tasks flow to have a task agent do the push, noting that task approval prompts may not always surface to non-technical users reliably, or (b) tell the user to push manually via Replit's own Git/version-control panel in the UI, which uses their authenticated session correctly.
