# ENICE Group — Product Company Website

A React + TanStack Router website for ENICE Group, a product-driven technology company building, owning, and operating products and platforms for financial services, commerce, and business communication. The primary products are PulsePay and PulseAssist, with ePulse and PulseX represented in the product ecosystem and roadmap.

## Stack

- **Framework**: React 19 + TanStack Router + Vite
- **Styling**: Tailwind CSS v4
- **CMS**: Sanity (`projectId: v87jayow`, `dataset: production`) — blog content only
- **Email + form storage**: Resend (transactional email, watchlist audience, and PulseAssist
  early-access registrations stored as contacts with custom Contact Properties)
- **Deploy target**: Vercel (`api/` serverless functions)

## Run

```
bun install
bun run dev   # starts on port 5000
```

The homepage can be previewed before the launch gate with `/?preview=1`.

## Positioning

- ENICE Group is presented as a technology product company, not a consulting, outsourcing, investment, or professional services firm.
- The primary homepage CTA is to explore products.
- PulsePay and PulseAssist are the most prominent products; the Products page contains the wider ecosystem.
- Keep future copy centered on products, platforms, product engineering, infrastructure, ownership, and operation. Avoid describing ENICE as a venture studio or using consultation-led messaging.

## Environment variables

| Variable                         | Required         | Purpose                                                                                                            |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`                 | Yes (production) | Sends watchlist emails                                                                                             |
| `RESEND_AUDIENCE_ID`             | Yes (production) | Resend Audience ID for watchlist duplicate detection                                                               |
| `ADMIN_PASSWORD`                 | Yes (admin)      | Gates `/admin/watchlist` and `/admin/early-access` via the `x-admin-password` header                               |
| `RESEND_EARLY_ACCESS_SEGMENT_ID` | No               | Pins the early-access segment. If unset, "PulseAssist Early Access" is found by name or created on first use       |
| `AI_PROVIDER`                    | Yes (chatbot)    | One of: `bedrock`, `openai`, `anthropic`, `gemini`, `deepseek`, `grok`, `openrouter`, `custom`. Default: `bedrock` |
| `AI_API_KEY`                     | Yes (chatbot)    | AWS Access Key ID (Bedrock) or API key for other providers                                                         |
| `AI_API_SECRET`                  | Bedrock only     | AWS Secret Access Key                                                                                              |
| `AI_REGION`                      | Bedrock only     | AWS region, default `us-east-1`                                                                                    |
| `AI_MODEL`                       | No               | Override the provider's default model                                                                              |

In dev, if `RESEND_API_KEY` is absent the form returns a stub success so you can test the UI. If AI credentials are absent, the chatbot falls back to a static contact message.

The `/api/chat` Vercel serverless function is mirrored as a Vite dev middleware in `vite.config.ts` so the chatbot works in dev too.

## Watchlist duplicate detection

- **Production** (`api/watchlist.ts`): on each POST, checks the Resend Audience (`RESEND_AUDIENCE_ID`) for the submitted email before sending. If found → HTTP 409 `{ ok: false, code: "DUPLICATE" }`. If new → sends emails + creates contact in the audience.
- **Dev** (`vite.config.ts` plugin): tracks submitted emails in a module-level `Set` during the dev session.
- **Frontend** (`src/components/site/ComingSoon.tsx`): detects 409/DUPLICATE and shows "You are already on the watchlist!" inline below the input.

## PulseAssist early access

Runs entirely on the existing site — CTA → modal → submit → Resend → confirmation email →
success state. There is no separate landing page and no redirect.

- **CTA**: `PulseAssistEarlyAccessButton` (`src/components/site/PulseAssistEarlyAccess.tsx`).
  Every PulseAssist CTA on the site renders this one component, so they all open the same
  modal. Label: "Get Early Access".
- **Contract**: `src/lib/early-access.ts` holds the field limits, business types, status
  list and client-side validation. The server mirrors these rules and is the authority.
- **Endpoint**: `POST /api/early-access` (`api-src/early-access.ts`). Honeypot is checked
  before validation and returns a silent 200. `product`, `source` and `status` are set
  server-side, so a client cannot self-assign a status.
- **Storage**: `src/lib/early-access-store.server.ts`. One Resend contact per applicant,
  added to the "PulseAssist Early Access" segment, with the application in `pulseassist_*`
  Contact Properties. The segment and the property keys are provisioned automatically on
  first use. Duplicate detection keys off the presence of `pulseassist_status`, so someone
  already on the launch watchlist can still apply.
- **Admin**: `/admin/early-access` → `GET/POST /api/admin/early-access`. Status workflow is
  `EARLY_ACCESS → UNDER_REVIEW → SELECTED_FOR_BETA → INVITATION_SENT → BETA_USER`
  (plus `REJECTED`). Only `status` is writable; submitted details are immutable. Submitting
  the form never grants product access.
- **Known limit**: Resend's contacts API exposes `limit` (max 100) with no pagination
  cursor, and custom properties are only returned by `contacts.get`, so the admin table
  reads at most 100 registrations and costs 1 + N requests. The UI says so when truncated.

Local testing: set `RESEND_BASE_URL` to point the Resend SDK at a stub — the SDK reads that
variable natively, so no application code changes are needed.

## Project structure

```
api-src/      Source for the Vercel serverless functions
api/          esbuild output of api-src/ (committed; CI checks it is in sync)
src/
  components/ UI components (ComingSoon, PulseAssistEarlyAccess, etc.)
  lib/        Sanity client, early-access contract + Resend store, AI providers, utilities
  routes/     TanStack Router file-based routes
supabase/     Legacy only — migrations for the retired early_access_registrations table
studio-enice-group/  Sanity Studio (local)
```

## User preferences

- Do not use Sanity for watchlist/form data — use Resend Audiences instead.
- Use Resend rather than Supabase for form storage. The Supabase Edge Functions and browser
  client that previously backed PulseAssist early access have been removed; `supabase/` now
  contains only the migration that documents the retired table, in case historical rows
  need exporting.
