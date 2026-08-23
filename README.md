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
| Content + CMS     | ENICE Website Manager — our own CMS, backed by Postgres      |
| Email + form data | Resend                                                       |
| AI assistant      | Pluggable provider, AWS Bedrock by default                   |
| Hosting           | Vercel (`dist/` + `api/`)                                    |

## ENICE Website Manager

The site is managed from a private admin panel at **`/admin`** — our own CMS, not an
external service. Authorized administrators sign in, write blog posts, announcements,
updates and news, manage pages and website sections, upload media, and publish to the live
site without touching source code. Larger changes can be drafted by the built-in AI Website
Manager, which always produces a reviewable proposal rather than editing production directly.

See [`docs/website-manager.md`](docs/website-manager.md) for the full guide. In short:

- **Private, account-based access.** No public registration; invitation-only accounts with
  password + optional TOTP two-factor, session management, failed-login lockout, rate limiting
  and role-based permissions (Owner / Administrator / Editor). Nothing links to `/admin` from the
  public site, and it is `noindex` and disallowed in `robots.txt`.
- **Draft → Preview → Publish** for everything, with scheduling and archiving. Content is stored
  in our own Postgres database and served to the site through same-origin `/api/site/*` endpoints
  (edge-cached, and degrading to empty rather than erroring if the database is unavailable).
- **Data model** in `src/lib/cms/` (shared client + server + build script) and `api-src/lib/`
  (the serverless implementation). The block-document format (`EniceDoc`) and its renderer replace
  the previous Portable Text setup.

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
    cms/         Website Manager model shared by client, server and build script
                 (types, permissions, block document + sanitiser, API clients)
    early-access.ts             Field contract shared by client and server
    early-access-store.server.ts  Resend-backed storage (server only)
  routes/
    admin/       The Website Manager (private; wraps screens in <AdminShell>)
    ...          Public site routes; __root.tsx is the shell
api-src/
  cms.ts         Private admin API (one function, internal router)
  site.ts        Public read-only content API (cacheable, degrades gracefully)
  lib/
    db.ts, schema.ts, auth.ts, crypto.ts, storage.ts, audit.ts, ai-manager.ts
    repo/        Per-entity storage (content, website, media, admins, insights)
```

## API

All endpoints are same-origin Vercel functions. Nothing secret reaches the browser, and
there are no `VITE_`-prefixed variables.

| Endpoint                  | Method     | Purpose                                   |
| ------------------------- | ---------- | ----------------------------------------- |
| `/api/cms/*`              | any        | Website Manager admin API (authenticated) |
| `/api/site/*`             | GET        | Public content for the site (cacheable)   |
| `/api/early-access`       | POST       | PulseAssist early-access registration     |
| `/api/admin/early-access` | GET / POST | List registrations, update one's status   |
| `/api/contact`            | POST       | Contact form → `corporate@enicehq.com`    |
| `/api/chat`               | POST       | AI assistant                              |
| `/api/ping`               | GET        | Dependency-free health check              |

`/api/cms` and `/api/site` are each a single Vercel function that routes internally (there is a
cap on function count, and ~60 endpoints would otherwise be ~60 functions). `vercel.json` rewrites
`/api/cms/:path*` and `/api/site/:path*` onto them via a `__route` query parameter, and
`src/lib/router.ts` dispatches. `vite dev` mounts the same handlers on those prefixes so local and
production behave identically.

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

| Variable                         | Required           | Purpose                                             |
| -------------------------------- | ------------------ | --------------------------------------------------- |
| `DATABASE_URL`                   | Website Manager    | Postgres connection string (pooled endpoint)        |
| `CMS_SECRET`                     | Website Manager    | ≥32 random chars; encrypts 2FA secrets, signs CSRF  |
| `CMS_OWNER_EMAIL` / `_PASSWORD`  | first deploy       | Bootstraps the first Owner; ignored once one exists |
| `MEDIA_S3_*`                     | media uploads      | S3-compatible bucket for the media library          |
| `GITHUB_TOKEN` / `_REPOSITORY`   | AI code changes    | Lets the AI manager open pull requests              |
| `RESEND_API_KEY`                 | production         | All email, plus early-access storage                |
| `ADMIN_PASSWORD`                 | early-access page  | Gates the legacy `/admin/early-access` screen       |
| `RESEND_EARLY_ACCESS_SEGMENT_ID` | no                 | Pin a specific segment instead of lookup-by-name    |
| `AI_PROVIDER`                    | assistant          | `bedrock` (default), `openai`, `anthropic`, …       |
| `AI_API_KEY` / `AI_API_SECRET`   | assistant + AI CMS | Provider credentials; Bedrock needs both            |
| `AI_REGION`                      | Bedrock            | Defaults to `us-east-1`                             |

The Website Manager degrades safely: with no `DATABASE_URL` it shows a setup screen (naming the
missing variables) rather than crashing, and the public site keeps working with empty content
collections. `ADMIN_PASSWORD` (the legacy early-access screen) is compared in constant time and
guarded by a failed-attempt limiter.

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

Vercel builds from `main`. `vercel-build` runs the client build (which also queries the database
to prerender published article pages, when `DATABASE_URL` is set) and then bundles the functions;
`vercel.json` rewrites the two admin/site API prefixes and then everything except `/api/*` to
`index.html`.

Database migrations run automatically on the first request after a deploy (advisory-locked, so
concurrent cold starts are safe) — there is no separate migration step to forget.

The install command is deliberately `npm install` rather than bun: bun installs on Vercel
were intermittently failing with connection errors. Local development still uses bun.

### Admin subdomain (optional)

The Website Manager lives at `/admin` on the main domain and works there as-is. To serve it from a
dedicated hostname such as `admin.enicehq.com`, point that subdomain at the same Vercel project —
the SPA and the `/api/*` functions are shared, so no separate deployment is needed. `/admin` stays
`noindex` and `robots.txt`-disallowed wherever it is reached.

### Migrating existing Sanity content

The blog previously lived in Sanity. `scripts/import-sanity.mjs` performs a one-time, idempotent,
read-only import into the Website Manager's database:

```bash
DATABASE_URL=… node scripts/import-sanity.mjs --dry-run   # preview the conversion
DATABASE_URL=… node scripts/import-sanity.mjs             # import (never overwrites local edits)
```
