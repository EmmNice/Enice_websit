# ENICE Group

Marketing and product site for ENICE Group — https://enicehq.com

A static React SPA served by Vercel, with a small set of serverless functions for the
contact form, the AI assistant, and PulseAssist early-access registrations.

## Stack

| Concern           | Choice                                                       |
| ----------------- | ------------------------------------------------------------ |
| UI                | React 19, TypeScript                                         |
| Routing           | TanStack Router (file-based, code-split per route)           |
| Build             | Vite 7                                                       |
| Styling           | Tailwind CSS v4 — configured in CSS, no `tailwind.config.js` |
| Blog content      | Sanity                                                       |
| Email + form data | Resend                                                       |
| AI assistant      | Pluggable provider, AWS Bedrock by default                   |
| Hosting           | Vercel (`dist/` + `api/`)                                    |

## Getting started

```bash
bun install
cp .env.example .env   # then fill in the values you need
bun run dev            # http://localhost:5000
```

The site renders without any environment variables. Features degrade individually: the
assistant falls back to a canned reply without AI credentials, and the forms return a clear
error without `RESEND_API_KEY`.

### Scripts

| Script            | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `dev`             | Vite dev server on port 5000, including the `/api/*` bridge |
| `build`           | Production client build to `dist/`                          |
| `build:api`       | Bundle `api-src/` → `api/` with esbuild                     |
| `verify`          | Everything CI runs: format, lint, typecheck, both builds    |
| `typecheck`       | `tsc --noEmit` over `src/` and `api-src/`                   |
| `lint` / `format` | ESLint / Prettier                                           |

Run `bun run verify` before pushing.

## Layout

```
api-src/         Serverless handler sources
  lib/http.ts    Shared request/response contract, rate limiting, escaping
api/             esbuild output of api-src/ — committed, checked in CI
src/
  components/
    site/        Page sections and feature components
    ui/          shadcn primitives (only what is actually used)
  lib/
    ai/          AI provider abstraction and the assistant's system prompt
    early-access.ts             Field contract shared by client and server
    early-access-store.server.ts  Resend-backed storage (server only)
  routes/        File-based routes; __root.tsx is the shell
studio-enice-group/  Sanity Studio (deployed separately)
```

## API

All endpoints are same-origin Vercel functions. Nothing secret reaches the browser, and
there are no `VITE_`-prefixed variables.

| Endpoint                  | Method     | Purpose                                 |
| ------------------------- | ---------- | --------------------------------------- |
| `/api/early-access`       | POST       | PulseAssist early-access registration   |
| `/api/admin/early-access` | GET / POST | List registrations, update one's status |
| `/api/contact`            | POST       | Contact form → `corporate@enicehq.com`  |
| `/api/chat`               | POST       | AI assistant                            |
| `/api/ping`               | GET        | Dependency-free health check            |

`vite dev` serves these by loading the same handler modules through Vite's SSR pipeline
(see `apiBridgePlugin` in `vite.config.ts`), so local and production behaviour match.

Adding an endpoint means: create `api-src/<name>.ts` exporting a default handler, and add it
to `API_ROUTES` in `vite.config.ts`. The build glob picks it up automatically; files under
`api-src/lib/` are shared code and are never emitted as functions.

## PulseAssist early access

Every early-access CTA renders `PulseAssistEarlyAccessButton`, which opens a modal in place —
it never navigates. Submitting stores the application and sends a confirmation.

Registrations are Resend contacts in a **PulseAssist Early Access** segment, with the
application held in `pulseassist_*` [contact properties]. The segment and property keys are
created automatically on first use, because Resend silently drops values for property keys
that do not exist yet.

Review workflow — set from `/admin/early-access`, enforced server-side:

```
EARLY_ACCESS → UNDER_REVIEW → SELECTED_FOR_BETA → INVITATION_SENT → BETA_USER
                                                                  ↘ REJECTED
```

Only `status` is writable; an applicant's submitted details are immutable, and submitting the
form never grants product access.

Two constraints inherited from Resend's contacts API:

- Custom properties are returned by `contacts.get` but **not** by `contacts.list`, so listing
  registrations costs one request per row.
- Pagination exposes `limit` (max 100) with no cursor, so the admin table shows at most 100
  registrations and says so when the list is truncated. Use the Resend dashboard beyond that.

If the write fails — most likely a `RESEND_API_KEY` scoped to sending only — the applicant
still succeeds and the internal notification email is sent with an `[ACTION REQUIRED — not
saved]` subject, so a lead is never silently lost.

[contact properties]: https://resend.com/docs/dashboard/audiences/properties

## Environment

See `.env.example` for the full list. Server-side only:

| Variable                         | Required     | Purpose                                          |
| -------------------------------- | ------------ | ------------------------------------------------ |
| `RESEND_API_KEY`                 | production   | All email, plus early-access storage             |
| `ADMIN_PASSWORD`                 | admin routes | Gates `/admin/early-access`                      |
| `RESEND_EARLY_ACCESS_SEGMENT_ID` | no           | Pin a specific segment instead of lookup-by-name |
| `AI_PROVIDER`                    | assistant    | `bedrock` (default), `openai`, `anthropic`, …    |
| `AI_API_KEY` / `AI_API_SECRET`   | assistant    | Provider credentials; Bedrock needs both         |
| `AI_REGION`                      | Bedrock      | Defaults to `us-east-1`                          |

`ADMIN_PASSWORD` is compared in constant time and guarded by a failed-attempt limiter.

### Local testing without sending real email

The Resend SDK reads `RESEND_BASE_URL`, so pointing it at a local stub exercises the real
handlers without touching the live account or sending anything.

## Routing

File-based via TanStack Router. `src/routeTree.gen.ts` is generated — never edit it.

| File                     | URL                                         |
| ------------------------ | ------------------------------------------- |
| `index.tsx`              | `/`                                         |
| `about.tsx`              | `/about`                                    |
| `portfolio.pulsepay.tsx` | `/portfolio/pulsepay` (flat, dot-separated) |
| `blog/$slug.tsx`         | `/blog/:slug` (dynamic — bare `$`)          |
| `$.tsx`                  | catch-all 404                               |
| `__root.tsx`             | app shell; must keep `<Outlet />`           |

## Deployment

Vercel builds from `main`. `vercel-build` runs the client build and then bundles the
functions; `vercel.json` rewrites everything except `/api/*` to `index.html`.

The install command is deliberately `npm install` rather than bun: bun installs on Vercel
were intermittently failing with connection errors. Local development still uses bun.

Sanity Studio deploys separately via the **Deploy Sanity Studio** GitHub Action
(`workflow_dispatch`), which needs the `SANITY_AUTH_TOKEN` secret.

> GitHub Actions is currently disabled on this account for billing reasons, so CI and the
> Studio deploy workflow will not run until that is resolved.
