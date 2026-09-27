# Website Manager

ENICE Group's own content management system. Content lives in a Postgres database we control, is
edited from a private admin panel, and is served to the public site through same-origin API
endpoints.

This document is the operator's guide — how to run it, how it is structured, and the decisions worth
knowing before changing it.

## Scope

The manager does two things: **publish content** and **hold the notes the assistant is trained on**.
That is the whole surface.

It used to also manage pages, site sections, navigation, the footer, SEO defaults, design tokens, a
media library, administrator accounts, roles, an audit-log browser, four publishing queues and an AI
proposal workflow. Those were removed deliberately. Most of them needed credentials the deployment
does not have — object storage for media, a model key for the AI manager, a GitHub token for its pull
requests — which meant they shipped as screens that were permanently disabled or empty, and each one
was a surface a future maintainer would have to understand before touching anything.

What that bought:

|                                          | before   | after  |
| ---------------------------------------- | -------- | ------ |
| admin screens                            | 22       | 5      |
| environment variables to run the manager | up to 11 | **4**  |
| `api/cms.js` bundle                      | 4.69 MB  | 374 KB |

The removed code is in the git history, and the database tables it used are still created by the
migrations — nothing was dropped, so restoring a screen is additive rather than a migration.

---

## Getting in

The admin panel is at **`/admin`**. It is deliberately invisible from the public site: nothing links
to it, it is marked `noindex, nofollow`, and `robots.txt` disallows it. Optionally it can be served
from `admin.enicehq.com` by pointing that subdomain at the same Vercel project.

There is **no public registration** and **no self-service password reset by email**. This removes the
most common account-takeover surface — there is no unauthenticated endpoint that takes an email and
issues a credential.

### First sign-in on a fresh deployment

Four variables, and that is the complete list:

| Variable             | Why                                                                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Any Postgres — Neon, Supabase, Vercel Postgres, RDS. Use the **pooled** endpoint; the driver runs with prepared statements disabled so a pooler is safe. Migrations run automatically on the first request after a deploy. |
| `CMS_SECRET`         | At least 32 random characters (`openssl rand -base64 48`). Encrypts stored two-factor secrets and signs CSRF tokens.                                                                                                       |
| `CMS_OWNER_EMAIL`    | Creates the first Owner account on first sign-in, then ignored.                                                                                                                                                            |
| `CMS_OWNER_PASSWORD` | That account's initial password.                                                                                                                                                                                           |

A database attached through a Vercel integration under a _prefix_ also works: any variable ending in
`_DATABASE_URL`, `_POSTGRES_URL` and similar is accepted, provided the value begins with
`postgres://` or `postgresql://`.

If any of these is missing the panel shows a setup screen naming exactly what to set, rather than a
blank error. Sign in, then change the bootstrap password and turn on two-factor authentication under
**Account → Settings**.

**There is no invite flow.** Administrator management was one of the removed screens, so the
bootstrap Owner is the only account unless someone restores it. For one or two operators that is
simpler than maintaining an invitation pipeline; if the team grows, `administration.admins.tsx` and
the `/admins/*` routes are in the history.

---

## Security model

- **Passwords** are hashed with scrypt (per-user salt, parameters stored with the hash so they can be
  raised later). The policy is length-first: at least 12 characters, with a small blocklist.
- **Sessions** are opaque tokens; only their SHA-256 digest is stored, so a database leak yields no
  usable sessions. Cookies are `HttpOnly`, `Secure`, `SameSite=Strict`. Sessions slide with use
  (12-hour idle) under a hard 7-day cap, and can be revoked individually or all at once.
- **Two-factor authentication** is TOTP (RFC 6238) with ten single-use recovery codes. The secret is
  encrypted at rest with a key derived from `CMS_SECRET`. A half-authenticated session (password
  accepted, code pending) can reach only the second-factor endpoint.
- **CSRF**: every mutating request carries a session-bound token in the `x-enice-csrf` header, on top
  of the `SameSite=Strict` cookie and a same-origin check.
- **Failed-login protection**: per-account lockout plus per-address rate limiting, both persisted so
  they hold across serverless instances.
- **Roles**: Owner, Administrator, Editor. Authorization is expressed as capabilities checked on
  every request server-side; the UI only hides controls it knows will be refused. Six capabilities
  remain — `content.read/write/publish/delete` and `ai.knowledge.read/write` — because the screens
  the others guarded are gone.

---

## Content

Four editorial kinds share one editor and one publishing pipeline:

| Kind          | Where it appears                     | Extra fields               |
| ------------- | ------------------------------------ | -------------------------- |
| Blog          | `/blog`                              | —                          |
| Announcements | `/announcements` and the news feed   | CTA button, display window |
| Updates       | the news feed (no page of their own) | CTA, featured, icon        |
| News          | `/news` (feed + changelog)           | featured                   |

Each item has a title, subtitle/excerpt, body, cover image, author, category, tags, slug and full SEO
fields (title, description, canonical, Open Graph, social image, index/noindex).

### The editor

A **block editor**: the body is an ordered list of typed blocks (heading, paragraph, list, quote,
image, video, table, code, callout, divider), and inline formatting inside a block is a narrow HTML
subset. This is deliberate — structure is explicit, so the published article is styled entirely by
the design system and cannot be knocked off-brand by pasted markup.

Three modes: **Write**, **Preview** (desktop/mobile, rendered by the _same_ component the public site
uses, so the preview is truthful), and **SEO** (live search-result and social-card previews).

### Images

Images are referenced **by URL**, with a live preview beside the field. There is no upload, because
uploads need object storage and this deployment has none — an upload button would have been a control
that is disabled everywhere the site actually runs.

In practice that means putting images on a CDN or any public host and pasting the link. The preview
matters more than it sounds: a pasted URL is easy to get wrong, and without it a broken image reaches
a published post and is noticed on the live page.

### Publishing workflow

```
Draft ─▶ Scheduled ─▶ Published ─▶ Archived
  ▲          │            │            │
  └──────────┴────────────┴────────────┘   (any state can return to draft)
```

Only **Published** is public. **Scheduled** items go live automatically — resolved when the
collection is next read, so a missed cron tick can never hold a release back. **Archived** items
leave the site but are kept on record. Every save snapshots the previous version, so any change can
be reverted.

---

## Assistant knowledge — "AI training"

Under **AI training → Assistant knowledge**. Each entry is a title plus facts in plain sentences,
tagged, and either `active` or `disabled` so a fact can be parked without deleting it. Entries are
typed directly; PDF ingestion was removed along with object storage, and a scanned PDF never
contributed usable text anyway.

**Read this before relying on it.** Nothing in _this_ repository consumes these entries. There is no
`/api/chat` function here and no retrieval code: the visitor-facing chatbot is **PulseAssist**, an
external product, and its knowledge lives in the PulseAssist console. So today this screen is a
curated store that the assistant does not read.

**It is retained on purpose, as a fallback — do not delete it as dead code.** That decision is
recorded here so it does not have to be rediscovered. If PulseAssist is ever dropped, the company
facts are already captured in a structured, permissioned form and only the retrieval half has to be
built: a Postgres full-text search over `knowledge_entries` (`websearch_to_tsquery` over a
`to_tsvector` index, no extension required) injected into a chat endpoint. The table, the CRUD, the
permissions and the `active`/`disabled` flag all already exist, so that is the smaller half of the
work.

Until then it is a store, not a training pipeline, and **the screen's own copy says so** rather than
implying the assistant is reading it. That wording is load-bearing: an operator who believes a note is
live when it is not will conclude the chatbot is broken rather than unwired, which is a far more
expensive thing to debug. If retrieval is ever wired up, update that copy in the same commit.

In the meantime, facts that need to affect the live chatbot today belong in the **PulseAssist
console**.

---

## Architecture notes

- **Shared model** (`src/lib/cms/`) is isomorphic — imported by the browser, the serverless functions
  and the build-time prerender script, so the content shape, sanitiser and SEO rules can never
  disagree between them.
- **Two API functions** — `api-src/cms.ts` (private, authenticated) and `api-src/site.ts` (public,
  read-only, cacheable). Each routes its sub-paths internally to stay within Vercel's function limit.
- **`repo/website.ts` is still here** even though the Website screens are gone: the public site reads
  site sections and settings through it, and it seeds their defaults. The _screens_ were removed, not
  the data — which is why editing the homepage copy now means editing
  `DEFAULT_SECTIONS` in that file and deploying.
- **Sanitisation** is server-side on write and allowlist-based: author HTML is reconstructed from a
  parse rather than filtered, so stored content cannot carry script. The public renderer trusts that
  boundary and does not re-sanitise (a second implementation would be a second thing to get wrong).
- **Degrades, doesn't break** — if the database is unreachable the public API returns empty
  collections rather than errors, and the marketing site renders from its in-code fallbacks.

See the module-level comments in `api-src/lib/` and `src/lib/cms/` for specifics; each file explains
the decisions behind it.
