# ENICE Website Manager

The Website Manager is ENICE Group's own content management system. It replaces the previous
Sanity setup: content now lives in a Postgres database we control, is edited from a private admin
panel, and is served to the public site through same-origin API endpoints.

This document is the operator's guide — how to run it, how it is structured, and the decisions
worth knowing before changing it.

---

## Getting in

The admin panel is at **`/admin`**. It is deliberately invisible from the public site: nothing
links to it, it is marked `noindex, nofollow`, and `robots.txt` disallows it. Optionally it can be
served from `admin.enicehq.com` by pointing that subdomain at the same Vercel project.

There is **no public registration** and **no self-service password reset by email**. Accounts exist
only because an existing administrator invited them. This removes the most common
account-takeover surface — there is no unauthenticated endpoint that takes an email and issues a
credential.

### First sign-in on a fresh deployment

Set `DATABASE_URL`, `CMS_SECRET`, and `CMS_OWNER_EMAIL` / `CMS_OWNER_PASSWORD`. The first time
anyone signs in, the Owner account is created from those variables (once — they are ignored
afterwards). Sign in, then:

1. Change the bootstrap password under **Administration → Settings**.
2. Turn on two-factor authentication.
3. Invite the rest of the team under **Administration → Administrators**.

If the required variables are missing, the panel shows a setup screen naming exactly what to set,
rather than a blank error.

---

## Security model

- **Passwords** are hashed with scrypt (per-user salt, parameters stored with the hash so they can
  be raised later). The policy is length-first: at least 12 characters, with a small blocklist of
  common values.
- **Sessions** are opaque tokens; only their SHA-256 digest is stored, so a database leak yields no
  usable sessions. Cookies are `HttpOnly`, `Secure`, `SameSite=Strict`. Sessions slide with use
  (12-hour idle) under a hard 7-day cap, and can be revoked individually or all-at-once
  ("sign out of all devices").
- **Two-factor authentication** is TOTP (RFC 6238), with ten single-use recovery codes. The secret
  is encrypted at rest with a key derived from `CMS_SECRET`. A half-authenticated session (password
  accepted, code pending) can reach only the second-factor endpoint.
- **CSRF**: every mutating request carries a session-bound token in the `x-enice-csrf` header,
  layered on top of the `SameSite=Strict` cookie and a same-origin check.
- **Failed-login protection**: per-account lockout after repeated failures, plus per-address rate
  limiting, both persisted (so they hold across serverless instances).
- **Roles**: Owner, Administrator, Editor. Authorization is expressed as capabilities
  (`content.publish`, `settings.write`, `ai.deploy`, …) checked on every request server-side; the
  UI only hides controls it knows will be refused. The last active Owner cannot be removed,
  suspended or demoted.

---

## Content

Four editorial kinds share one editor and one publishing pipeline:

| Kind          | Where it appears                     | Extra fields               |
| ------------- | ------------------------------------ | -------------------------- |
| Blog          | `/blog`                              | —                          |
| Announcements | `/announcements` and the news feed   | CTA button, display window |
| Updates       | the news feed (no page of their own) | CTA, featured, icon        |
| News          | `/news` (feed + changelog)           | featured                   |

Each item has a title, subtitle/excerpt, body, featured image, author, category, tags, slug and
full SEO fields (title, description, canonical, Open Graph, social image, index/noindex).

### The editor

A **block editor**: the body is an ordered list of typed blocks (heading, paragraph, list, quote,
image, video, table, code, callout, divider), and inline formatting inside a block is a narrow HTML
subset. This is deliberate — structure is explicit, so the published article is styled entirely by
the design system and cannot be knocked off-brand by pasted markup.

Three modes: **Write**, **Preview** (desktop/mobile, rendered by the _same_ component the public
site uses, so the preview is truthful), and **SEO** (live search-result and social-card previews,
with derived values shown as placeholders).

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

## Website

- **Pages** — the site's routes. Built-in pages (Home, Products, …) have a fixed address but
  editable SEO and managed sections. New pages are assembled from the same structured sections and
  inherit the design system.
- **Sections** — the global bands (homepage hero, statistics, partners, FAQ). Each is an instance
  of a schema in `src/lib/cms/types.ts`; you edit copy, images, links and visibility. There is no
  field for colour, spacing or layout anywhere in the model — that is the guardrail that keeps the
  site premium and consistent.
- **Navigation / Footer** — header menu and CTA; footer columns, tagline and copyright.
- **SEO** — site-wide metadata defaults. Turning off site-wide indexing requires typing a
  confirmation, because it removes the whole site from search engines.
- **Design** — logo, favicon, default share image, plus a _constrained_ choice of brand palette,
  typography pairing and button style. No free colour picker or arbitrary font, by design.

---

## Media

Object storage holds the bytes; only metadata is in Postgres. Uploads go straight from the browser
to the store via a short-lived presigned `PUT`, and the row is written only after the object is
confirmed to exist. Without storage configured the panel still works — uploads are disabled and
content can reference external image URLs instead.

Two backends satisfy that contract:

- **Vercel Blob** — create a store in the dashboard and connect it to the project. Vercel injects
  the credentials, so there is nothing to copy by hand.
- **S3-compatible** (`MEDIA_S3_*`) — AWS S3, Cloudflare R2, Backblaze B2, MinIO or DigitalOcean
  Spaces, using a hand-rolled SigV4 signer rather than the AWS SDK.

S3 wins if both are configured, because it takes deliberate effort to set up whereas a Blob token
can appear merely because someone connected a store — and because silently moving new uploads to a
different provider would split the library in two.

Neither backend routes the bytes through a function. That is not only a latency choice: Vercel caps
a function request body at 4.5 MB, and the library accepts video up to 200 MB, so a proxied upload
could not work at all. On Blob this is done with a signed URL scoped to a single `put` on a single
pathname, carrying the media allowlist and the per-category size ceiling in the signature itself —
the same guarantees the S3 path gets from binding `Content-Type` into `SignedHeaders`. Deletes are
never delegated to the browser on either backend.

Blob assigns an object's final URL itself, so the confirm step reads the URL back from the store
rather than deriving it. The S3 path reports its own derived URL through the same field, so nothing
above the storage module needs to know which backend is in use.

---

## AI Website Manager

Describe a change in plain language; the AI inspects the current site structure and design system
and returns a **proposal**. It never edits production directly.

- **Content proposals** — edits to data the CMS already owns (a section's copy, a new page from
  existing section types). On approval they apply to the database through the ordinary,
  validated, audited write paths, and can be rolled back afterwards.
- **Code proposals** — anything needing source changes. On approval the manager opens a **draft
  pull request** (requires `GITHUB_TOKEN` / `GITHUB_REPOSITORY`). CI runs on it and a human merges;
  the manager never writes to production for code changes.

```
request ─▶ AI drafts a proposal ─▶ review ─▶ approve ─▶ apply (content)   → live, reversible
                                                       └▶ pull request (code) → CI → human merge
```

---

## Architecture notes

- **Shared model** (`src/lib/cms/`) is isomorphic — imported by the browser, the serverless
  functions and the build-time prerender script, so the content shape, sanitiser and SEO rules can
  never disagree between them.
- **Two API functions** — `api-src/cms.ts` (private, authenticated) and `api-src/site.ts` (public,
  read-only, cacheable). Each routes ~30 sub-paths internally to stay within Vercel's function
  limit.
- **Sanitisation** is server-side on write and allowlist-based: author HTML is reconstructed from a
  parse rather than filtered, so stored content cannot carry script. The public renderer trusts
  that boundary and does not re-sanitise (a second implementation would be a second thing to get
  wrong).
- **Degrades, doesn't break** — if the database is unreachable, the public API returns empty
  collections rather than errors, and the marketing site renders normally.

See the module-level comments in `api-src/lib/` and `src/lib/cms/` for the specifics; each file
explains the decisions behind it.
