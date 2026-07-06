---
name: Vercel + bun install unreliable
description: bun install intermittently fails on Vercel builds with connection errors; project uses npm on Vercel while keeping bun for local dev.
---

`bun install` run as Vercel's install step intermittently fails with `ConnectionRefused`/`FailedToOpenSocket` errors, breaking production builds even when the lockfile itself is valid. This is a bun-on-Vercel reliability issue, not a project misconfiguration.

**Why:** Confirmed by reproducing the failure on Vercel after already fixing an unrelated lockfile issue (internal-only registry URLs) — the build still failed until the install/build commands were switched away from bun.

**How to apply:** In `vercel.json`, use `"installCommand": "npm install"` and `"buildCommand": "npm run build"` for production, even though local Replit dev continues to use `bun run dev`/`bun install`. Don't revert Vercel to bun without strong evidence the underlying reliability issue is resolved.
