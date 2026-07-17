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
| `RESEND_AUDIENCE_ID` | Yes (production) | Resend Audience ID for duplicate detection |
| `AI_PROVIDER` | Yes (chatbot) | One of: `bedrock`, `openai`, `anthropic`, `gemini`, `deepseek`, `grok`, `openrouter`, `custom`. Default: `bedrock` |
| `AI_API_KEY` | Yes (chatbot) | AWS Access Key ID (Bedrock) or API key for other providers |
| `AI_API_SECRET` | Bedrock only | AWS Secret Access Key |
| `AI_REGION` | Bedrock only | AWS region, default `us-east-1` |
| `AI_MODEL` | No | Override the provider's default model |

In dev, if `RESEND_API_KEY` is absent the form returns a stub success so you can test the UI. If AI credentials are absent, the chatbot falls back to a static contact message.

The `/api/chat` Vercel serverless function is mirrored as a Vite dev middleware in `vite.config.ts` so the chatbot works in dev too.

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
