# ENICE Group — Coming Soon Website

A React + TanStack Router coming-soon page for ENICE Group with a countdown timer, watchlist sign-up form, and Sanity-powered blog/changelog.

## Stack

- **Framework**: React 19 + TanStack Router + Vite
- **Styling**: Tailwind CSS v4
- **CMS**: Sanity (`projectId: v87jayow`, `dataset: production`)
- **Email**: Resend (confirmation + 3 scheduled reminder emails)
- **Deploy target**: Vercel (`api/` serverless functions)

## Run

```
bun install
bun run dev   # starts on port 5000
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Yes (production) | Sends watchlist emails |
| `RESEND_AUDIENCE_ID` | Yes (production) | Resend Audience used to detect duplicate submissions — create one in the Resend dashboard and paste its ID here |

In dev, if `RESEND_API_KEY` is absent the form returns a stub success so you can test the UI. Duplicate detection in dev uses an in-memory Set (resets on server restart).

## Watchlist duplicate detection

- **Production** (`api/watchlist.ts`): on each POST, checks the Resend Audience (`RESEND_AUDIENCE_ID`) for the submitted email before sending. If found → HTTP 409 `{ ok: false, code: "DUPLICATE" }`. If new → sends emails + creates contact in the audience.
- **Dev** (`vite.config.ts` plugin): tracks submitted emails in a module-level `Set` during the dev session.
- **Frontend** (`src/components/site/ComingSoon.tsx`): detects 409/DUPLICATE and shows "You are already on the watchlist!" inline below the input.

## Project structure

```
api/          Vercel serverless functions (production)
src/
  components/ UI components (ComingSoon, etc.)
  lib/        Sanity client, email server module, utilities
  routes/     TanStack Router file-based routes
studio-enice-group/  Sanity Studio (local)
```

## User preferences

- Do not use Sanity for watchlist/form data — use Resend Audiences instead.
