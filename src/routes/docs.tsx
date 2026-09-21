import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Copy, Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Cta, Eyebrow, Section, SectionIntro } from "@/components/site/primitives";
import { CORPORATE_EMAIL, breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/docs")({
  head: () => pageHead("/docs", [breadcrumbJsonLd([{ name: "API Documentation", path: "/docs" }])]),
  component: DocsPage,
});

/**
 * The published API base.
 *
 * It was written out by hand in three places — the header chip and two examples — which is how a
 * reference ends up documenting a host it no longer answers on. One constant, interpolated
 * everywhere, so the prose and the examples cannot disagree.
 */
const API_BASE_URL = "https://api.enice.group/v1";

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const NAV = [
  { id: "introduction", label: "Introduction" },
  { id: "authentication", label: "Authentication" },
  { id: "errors", label: "Errors & Rate Limits" },
  { id: "wallets", label: "Wallets" },
  { id: "ledger", label: "Ledger" },
  { id: "assist", label: "Assist" },
  { id: "kyc", label: "KYC & Identity" },
  { id: "webhooks", label: "Webhooks" },
];

// ─── Method badge ─────────────────────────────────────────────────────────────

/**
 * HTTP verbs are the one place on the site where distinct hues carry meaning rather than
 * decoration: a developer scanning a reference reads the colour before the word. The set is still
 * drawn from the system's three accents — positive for a safe read, warm for a write, destructive
 * for a delete — at pill scale, so the page never accumulates a field of colour.
 */
const METHOD_COLORS: Record<string, string> = {
  GET: "border-positive/25 bg-positive/[0.08] text-positive",
  POST: "border-gold/25 bg-gold/[0.08] text-gold",
  PUT: "border-gold/25 bg-gold/[0.08] text-gold",
  PATCH: "border-gold/25 bg-gold/[0.08] text-gold",
  DELETE: "border-destructive/25 bg-destructive/[0.08] text-destructive",
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest ${METHOD_COLORS[method] ?? "border-border bg-surface-1 text-bone-strong"}`}
    >
      {method}
    </span>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────

/**
 * A highlighted example.
 *
 * The examples used to carry their own theme — a `#0d1117` GitHub-dark panel with sky, amber and
 * violet tokens — which was the brightest thing on any page and belonged to no palette the site
 * uses. The highlighting now runs on five roles only, all from the system:
 *
 * - `text-bone-faint`  comments
 * - `text-gold`        object keys, and a pending state
 * - `text-bone-strong` string literals
 * - `text-bone-soft`   numbers, booleans, null, and the block's base text
 * - `text-positive`    a verb or value that reports success
 *
 * Five roles is the ceiling on purpose. A reference is read, not admired, and a token per data
 * type turns a code sample into a legend the reader has to learn first.
 */
function CodeBlock({ title, code }: { title?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-allow-select
      className="overflow-hidden rounded-lg border border-border bg-surface-1 text-[12.5px]"
    >
      {title && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-bone-faint">{title}</span>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold text-bone-soft transition-colors hover:bg-surface-3 hover:text-foreground"
          >
            {copied ? (
              <>
                <Check aria-hidden className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy aria-hidden className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-5 font-mono leading-[1.75] text-bone-soft whitespace-pre">
        <code dangerouslySetInnerHTML={{ __html: code }} />
      </pre>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

/**
 * One block of the reference.
 *
 * Renders its own heading so the band and the `aria-labelledby` that names it cannot come apart,
 * and takes its rhythm from the system's `tight` spacing rather than a hand-picked `py-16`. The
 * heading sits at the `h3` type role while remaining an `h2` in the outline: it is a subsection of
 * the page's one `h1`, and at display scale eight of them in a column would read as eight pages.
 */
function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Section
      id={id}
      spacing="tight"
      container={null}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 border-t border-border first:border-t-0 first:pt-0"
    >
      <h2 id={`${id}-heading`} className="type-h3 text-foreground">
        {title}
      </h2>
      {children}
    </Section>
  );
}

// ─── Split row ────────────────────────────────────────────────────────────────

function SplitRow({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="min-w-0">{left}</div>
      <div className="min-w-0 space-y-4">{right}</div>
    </div>
  );
}

// ─── Param table ──────────────────────────────────────────────────────────────

/**
 * A parameter row.
 *
 * Name and description are a `dt`/`dd` pair inside the enclosing `dl`. They were two anonymous
 * `div`s, so a screen reader read a reference of forty parameters as a flat run of text with
 * nothing tying a name to what it does.
 */
function ParamRow({
  name,
  type,
  required,
  desc,
}: {
  name: string;
  type: string;
  required?: boolean;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-t border-border py-4 first:border-t-0 sm:flex-row sm:gap-6">
      <dt className="flex shrink-0 items-baseline gap-2 sm:w-48">
        <span className="font-mono text-[13px] font-semibold text-foreground">{name}</span>
        {required && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-destructive">
            required
          </span>
        )}
      </dt>
      <dd className="min-w-0">
        <span className="font-mono text-[11px] text-bone-faint">{type}</span>
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-bone-soft">{desc}</p>
      </dd>
    </div>
  );
}

/** The inline `<code>` treatment used inside reference prose. */
const INLINE_CODE = "rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[12px] text-bone-strong";

// ─── Page ────────────────────────────────────────────────────────────────────

function DocsPage() {
  const [active, setActive] = useState("introduction");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <SiteShell>
      {/* Page header. Was a `bg-secondary/40` strip with a hard bottom rule; the dark system
          separates bands with rhythm and ambient light instead of a tinted block. */}
      <Section spacing="tight" glow="center" aria-labelledby="docs-heading">
        <SectionIntro
          level={1}
          id="docs-heading"
          eyebrow="Developers · ENICE Core"
          heading="API Documentation"
          lead="A complete reference for the ENICE Core REST API. Full sandbox keys and partner onboarding are issued upon request."
        >
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3.5 py-1.5 text-[11px] font-semibold text-bone-soft">
              Base URL:
              <span className="font-mono text-foreground">{API_BASE_URL}</span>
            </div>
            <Cta to="/contact" size="sm" icon="external">
              Request API Access
            </Cta>
          </div>
        </SectionIntro>
      </Section>

      {/* Body: sidebar + content */}
      <Section spacing="tight" divider containerClassName="flex gap-0 lg:gap-12">
        {/* Sticky sidebar */}
        <aside className="hidden w-52 shrink-0 lg:block">
          <div className="sticky top-24">
            <Eyebrow muted className="mb-3 text-[10px] tracking-[0.22em]">
              Reference
            </Eyebrow>
            <nav aria-label="API reference sections" className="space-y-0.5">
              {NAV.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => scrollTo(n.id)}
                  aria-current={active === n.id ? "true" : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                    active === n.id
                      ? "bg-surface-1 text-foreground"
                      : "text-bone-soft hover:bg-surface-1 hover:text-foreground"
                  }`}
                >
                  {active === n.id && (
                    <ChevronRight aria-hidden className="h-3 w-3 shrink-0 text-gold" />
                  )}
                  {n.label}
                </button>
              ))}
            </nav>

            <div className="panel-quiet mt-10 p-4">
              <p className="text-[11px] font-semibold text-foreground">Need help?</p>
              <p className="mt-1 text-[11px] leading-relaxed text-bone-soft">
                Write to us at{" "}
                <a
                  href={`mailto:${CORPORATE_EMAIL}`}
                  className="text-foreground underline underline-offset-2 transition-colors hover:text-gold"
                >
                  {CORPORATE_EMAIL}
                </a>
              </p>
            </div>
          </div>
        </aside>

        {/* Main content. A nested `<main>` used to sit inside the shell's own `<main>`, which gave
            the page two main landmarks and made the skip link ambiguous. */}
        <div data-allow-select className="min-w-0 flex-1">
          {/* ── INTRODUCTION ── */}
          <DocSection id="introduction" title="Introduction">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              The ENICE Core API gives verified partners programmatic access to our infrastructure:
              wallet issuance, ledger operations, AI agent routing, KYC verification, and more. All
              endpoints use HTTPS and return JSON.
            </p>

            <SplitRow
              left={
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Base URL</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-bone-soft">
                      All API requests must be made to the versioned base URL. We maintain backward
                      compatibility within each version prefix.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Response format</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-bone-soft">
                      Every response is a JSON object. Successful responses carry a{" "}
                      <code className={INLINE_CODE}>data</code> key. Errors include{" "}
                      <code className={INLINE_CODE}>error.code</code> and{" "}
                      <code className={INLINE_CODE}>error.message</code>.
                    </p>
                  </div>
                </div>
              }
              right={
                <CodeBlock
                  title="BASE URL"
                  code={`<span class="text-bone-faint"># All requests target this versioned base</span>
${API_BASE_URL}

<span class="text-bone-faint"># Example: retrieve ecosystem health</span>
<span class="text-positive">GET</span> /v1/core

<span class="text-bone-faint"># Standard response envelope</span>
{
  <span class="text-gold">"data"</span>: { ... },
  <span class="text-gold">"meta"</span>: {
    <span class="text-gold">"request_id"</span>: <span class="text-bone-strong">"req_01jz..."</span>,
    <span class="text-gold">"timestamp"</span>:  <span class="text-bone-strong">"2026-07-03T00:00:00Z"</span>
  }
}`}
                />
              }
            />
          </DocSection>

          {/* ── AUTHENTICATION ── */}
          <DocSection id="authentication" title="Authentication">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              The API uses scoped Bearer tokens issued through the ENICE Partner Console. Tokens are
              environment-specific. Always use <code className={INLINE_CODE}>ek_test_</code> keys
              during development and <code className={INLINE_CODE}>ek_live_</code> keys in
              production.
            </p>

            <SplitRow
              left={
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Bearer token</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-bone-soft">
                      Pass your API key in the <code className={INLINE_CODE}>Authorization</code>{" "}
                      header of every request. Never expose live keys in client-side code or public
                      repositories.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Token scopes</h3>
                    <dl className="mt-3 rounded-lg border border-border">
                      {[
                        ["wallets:read", "Read wallet balances and transaction history"],
                        ["wallets:write", "Issue cards and initiate transfers"],
                        ["ledger:write", "Post and reconcile ledger entries"],
                        ["kyc:verify", "Submit and retrieve identity verifications"],
                        ["assist:*", "Full access to AI agent routing"],
                      ].map(([scope, desc]) => (
                        <div
                          key={scope}
                          className="flex flex-col gap-1 border-t border-border px-4 py-3 first:border-t-0 sm:flex-row sm:items-center sm:gap-6"
                        >
                          <dt className="w-28 shrink-0">
                            <code className="font-mono text-[12px] text-gold">{scope}</code>
                          </dt>
                          <dd className="text-[13px] text-bone-soft">{desc}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              }
              right={
                <>
                  <CodeBlock
                    title="REQUEST HEADER"
                    code={`Authorization: Bearer <span class="text-bone-strong">ek_live_xxxxxxxxxxxxxxxxxxxx</span>
Content-Type: application/json`}
                  />
                  <CodeBlock
                    title="EXAMPLE: cURL"
                    code={`<span class="text-bone-faint"># Authenticated request to /v1/core</span>
curl <span class="text-bone-strong">${API_BASE_URL}/core</span> \\
  -H <span class="text-bone-strong">"Authorization: Bearer ek_live_xxx"</span> \\
  -H <span class="text-bone-strong">"Content-Type: application/json"</span>

<span class="text-bone-faint"># 401: missing or invalid token</span>
{
  <span class="text-gold">"error"</span>: {
    <span class="text-gold">"code"</span>:    <span class="text-bone-strong">"unauthorized"</span>,
    <span class="text-gold">"message"</span>: <span class="text-bone-strong">"API key missing or invalid."</span>
  }
}`}
                  />
                </>
              }
            />
          </DocSection>

          {/* ── ERRORS & RATE LIMITS ── */}
          <DocSection id="errors" title="Errors & Rate Limits">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              The API uses standard HTTP status codes. All error bodies follow a consistent shape so
              you can handle them uniformly.
            </p>

            <SplitRow
              left={
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">HTTP status codes</h3>
                    <dl className="mt-3 rounded-lg border border-border">
                      {[
                        ["200", "Success"],
                        ["201", "Resource created"],
                        ["400", "Bad request: validation failed"],
                        ["401", "Unauthorized: invalid or missing token"],
                        ["403", "Forbidden: insufficient token scope"],
                        ["404", "Resource not found"],
                        ["429", "Rate limit exceeded"],
                        ["500", "Internal server error"],
                      ].map(([code, desc]) => (
                        <div
                          key={code}
                          className="flex items-center gap-4 border-t border-border px-4 py-3 first:border-t-0"
                        >
                          <dt className="w-10 shrink-0">
                            <code
                              className={`font-mono text-[13px] font-semibold ${code.startsWith("2") ? "text-positive" : code.startsWith("4") || code.startsWith("5") ? "text-destructive" : "text-foreground"}`}
                            >
                              {code}
                            </code>
                          </dt>
                          <dd className="text-[13px] text-bone-soft">{desc}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Rate limits</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-bone-soft">
                      Production keys are provisioned at{" "}
                      <strong className="font-semibold text-foreground">1,000 req/min</strong> by
                      default, burstable to 5,000. Enterprise agreements unlock higher tiers.
                      Remaining quota is returned on every response header.
                    </p>
                  </div>
                </div>
              }
              right={
                <CodeBlock
                  title="ERROR RESPONSE"
                  code={`<span class="text-bone-faint"># HTTP 429: rate limit exceeded</span>
{
  <span class="text-gold">"error"</span>: {
    <span class="text-gold">"code"</span>:       <span class="text-bone-strong">"rate_limit_exceeded"</span>,
    <span class="text-gold">"message"</span>:    <span class="text-bone-strong">"Too many requests. Retry after 60s."</span>,
    <span class="text-gold">"retry_after"</span>: <span class="text-bone-soft">60</span>
  }
}

<span class="text-bone-faint"># Rate-limit response headers</span>
X-RateLimit-Limit:     <span class="text-bone-soft">1000</span>
X-RateLimit-Remaining: <span class="text-bone-soft">0</span>
X-RateLimit-Reset:     <span class="text-bone-soft">1751500860</span>`}
                />
              }
            />
          </DocSection>

          {/* ── WALLETS ── */}
          <DocSection id="wallets" title="Wallets">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              Programmable wallets support multi-currency balances, virtual card issuance, and
              peer-to-peer transfers. Each wallet is isolated per tenant.
            </p>

            {/* List wallet */}
            <div className="mt-10">
              <div className="flex items-center gap-3">
                <MethodBadge method="GET" />
                <code className="font-mono text-[14px] font-semibold text-foreground">
                  /v1/wallets
                </code>
                <span className="text-[12px] text-bone-soft">List all wallets</span>
              </div>
              <SplitRow
                left={
                  <div>
                    <p className="text-[14px] leading-relaxed text-bone-soft">
                      Returns a paginated list of wallets scoped to your tenant. Supports filtering
                      by currency and status.
                    </p>
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                        Query parameters
                      </p>
                      <dl className="mt-3 rounded-lg border border-border">
                        <ParamRow
                          name="currency"
                          type="string"
                          desc="Filter by ISO 4217 currency code (e.g. NGN, USD)."
                        />
                        <ParamRow
                          name="limit"
                          type="integer"
                          desc="Number of results per page. Default: 20. Max: 100."
                        />
                        <ParamRow
                          name="after"
                          type="string"
                          desc="Cursor for pagination. Use the last result's id."
                        />
                      </dl>
                    </div>
                  </div>
                }
                right={
                  <CodeBlock
                    title="RESPONSE: 200 OK"
                    code={`{
  <span class="text-gold">"data"</span>: [
    {
      <span class="text-gold">"id"</span>:       <span class="text-bone-strong">"wlt_01jz4k9m..."</span>,
      <span class="text-gold">"currency"</span>: <span class="text-bone-strong">"NGN"</span>,
      <span class="text-gold">"balance"</span>:  <span class="text-bone-soft">500000</span>,
      <span class="text-gold">"status"</span>:   <span class="text-positive">"active"</span>,
      <span class="text-gold">"created_at"</span>: <span class="text-bone-strong">"2026-07-03T..."</span>
    }
  ],
  <span class="text-gold">"pagination"</span>: {
    <span class="text-gold">"has_more"</span>: <span class="text-bone-soft">false</span>,
    <span class="text-gold">"next_cursor"</span>: <span class="text-bone-faint">null</span>
  }
}`}
                  />
                }
              />
            </div>

            {/* Create wallet */}
            <div className="mt-12 border-t border-border pt-10">
              <div className="flex items-center gap-3">
                <MethodBadge method="POST" />
                <code className="font-mono text-[14px] font-semibold text-foreground">
                  /v1/wallets
                </code>
                <span className="text-[12px] text-bone-soft">Create a wallet</span>
              </div>
              <SplitRow
                left={
                  <div>
                    <p className="text-[14px] leading-relaxed text-bone-soft">
                      Provisions a new wallet for an end-user or sub-account. Optionally issue a
                      virtual card at creation.
                    </p>
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                        Body parameters
                      </p>
                      <dl className="mt-3 rounded-lg border border-border">
                        <ParamRow
                          name="currency"
                          type="string"
                          required
                          desc="ISO 4217 currency code. Supported: NGN, USD."
                        />
                        <ParamRow
                          name="label"
                          type="string"
                          desc="Human-readable name for this wallet."
                        />
                        <ParamRow
                          name="issue_card"
                          type="boolean"
                          desc="If true, a virtual card is issued and linked on creation."
                        />
                        <ParamRow
                          name="metadata"
                          type="object"
                          desc="Arbitrary key-value pairs for your internal reference."
                        />
                      </dl>
                    </div>
                  </div>
                }
                right={
                  <CodeBlock
                    title="REQUEST BODY"
                    code={`{
  <span class="text-gold">"currency"</span>:   <span class="text-bone-strong">"USD"</span>,
  <span class="text-gold">"label"</span>:      <span class="text-bone-strong">"Operating Account"</span>,
  <span class="text-gold">"issue_card"</span>: <span class="text-bone-soft">true</span>,
  <span class="text-gold">"metadata"</span>: {
    <span class="text-gold">"user_id"</span>: <span class="text-bone-strong">"usr_8823..."</span>
  }
}`}
                  />
                }
              />
            </div>
          </DocSection>

          {/* ── LEDGER ── */}
          <DocSection id="ledger" title="Ledger">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              The ENICE Core ledger is a double-entry, append-only transaction log. Every financial
              event is recorded as an immutable entry and reconciled in real time.
            </p>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <MethodBadge method="POST" />
                <code className="font-mono text-[14px] font-semibold text-foreground">
                  /v1/ledger/tx
                </code>
                <span className="text-[12px] text-bone-soft">Post a transaction</span>
              </div>
              <SplitRow
                left={
                  <div>
                    <p className="text-[14px] leading-relaxed text-bone-soft">
                      Posts a debit/credit pair to the ledger. The operation is atomic: if either
                      leg fails, the entire transaction is rolled back.
                    </p>
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                        Body parameters
                      </p>
                      <dl className="mt-3 rounded-lg border border-border">
                        <ParamRow
                          name="debit_wallet"
                          type="string"
                          required
                          desc="Wallet ID to debit."
                        />
                        <ParamRow
                          name="credit_wallet"
                          type="string"
                          required
                          desc="Wallet ID to credit."
                        />
                        <ParamRow
                          name="amount"
                          type="integer"
                          required
                          desc="Amount in the smallest currency unit (kobo / cents)."
                        />
                        <ParamRow
                          name="currency"
                          type="string"
                          required
                          desc="Must match both wallets' currency."
                        />
                        <ParamRow
                          name="reference"
                          type="string"
                          desc="Unique idempotency key. Duplicate references are ignored."
                        />
                      </dl>
                    </div>
                  </div>
                }
                right={
                  <CodeBlock
                    title="REQUEST / RESPONSE"
                    code={`<span class="text-bone-faint"># POST /v1/ledger/tx</span>
{
  <span class="text-gold">"debit_wallet"</span>:  <span class="text-bone-strong">"wlt_01jz..."</span>,
  <span class="text-gold">"credit_wallet"</span>: <span class="text-bone-strong">"wlt_02ab..."</span>,
  <span class="text-gold">"amount"</span>:         <span class="text-bone-soft">500000</span>,
  <span class="text-gold">"currency"</span>:       <span class="text-bone-strong">"NGN"</span>,
  <span class="text-gold">"reference"</span>:      <span class="text-bone-strong">"inv_2026_07_001"</span>
}

<span class="text-bone-faint"># 201 Created</span>
{
  <span class="text-gold">"data"</span>: {
    <span class="text-gold">"id"</span>:        <span class="text-bone-strong">"txn_01kz9..."</span>,
    <span class="text-gold">"status"</span>:    <span class="text-positive">"settled"</span>,
    <span class="text-gold">"settled_at"</span>: <span class="text-bone-strong">"2026-07-03T00:00:00Z"</span>
  }
}`}
                  />
                }
              />
            </div>
          </DocSection>

          {/* ── ASSIST ── */}
          <DocSection id="assist" title="Assist">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              The Assist API exposes PulseAssist's multi-tenant AI routing engine. Invoke agents,
              manage conversation state, and configure policy-bound automations via REST.
            </p>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <MethodBadge method="POST" />
                <code className="font-mono text-[14px] font-semibold text-foreground">
                  /v1/assist/query
                </code>
                <span className="text-[12px] text-bone-soft">Invoke an AI agent</span>
              </div>
              <SplitRow
                left={
                  <div>
                    <p className="text-[14px] leading-relaxed text-bone-soft">
                      Routes a user message through the configured tenant agent. The agent applies
                      your policy rules, executes permitted actions, and returns a structured
                      response.
                    </p>
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                        Body parameters
                      </p>
                      <dl className="mt-3 rounded-lg border border-border">
                        <ParamRow
                          name="session_id"
                          type="string"
                          required
                          desc="Unique conversation session identifier. Use the same ID to maintain context across turns."
                        />
                        <ParamRow
                          name="message"
                          type="string"
                          required
                          desc="End-user's input message."
                        />
                        <ParamRow
                          name="tenant_id"
                          type="string"
                          required
                          desc="Your PulseAssist tenant identifier."
                        />
                        <ParamRow
                          name="language"
                          type="string"
                          desc="BCP-47 language tag. Default: en."
                        />
                      </dl>
                    </div>
                  </div>
                }
                right={
                  <CodeBlock
                    title="REQUEST / RESPONSE"
                    code={`<span class="text-bone-faint"># POST /v1/assist/query</span>
{
  <span class="text-gold">"session_id"</span>: <span class="text-bone-strong">"sess_01kz..."</span>,
  <span class="text-gold">"message"</span>:    <span class="text-bone-strong">"What is my account balance?"</span>,
  <span class="text-gold">"tenant_id"</span>:  <span class="text-bone-strong">"ten_bank_ng"</span>,
  <span class="text-gold">"language"</span>:   <span class="text-bone-strong">"en"</span>
}

<span class="text-bone-faint"># 200 OK</span>
{
  <span class="text-gold">"data"</span>: {
    <span class="text-gold">"reply"</span>:      <span class="text-bone-strong">"Your NGN balance is ₦500,000."</span>,
    <span class="text-gold">"intent"</span>:     <span class="text-bone-strong">"account.balance_inquiry"</span>,
    <span class="text-gold">"confidence"</span>: <span class="text-bone-soft">0.98</span>,
    <span class="text-gold">"actions"</span>:    []
  }
}`}
                  />
                }
              />
            </div>
          </DocSection>

          {/* ── KYC ── */}
          <DocSection id="kyc" title="KYC & Identity">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              Submit identity verification requests and retrieve screening results. All KYC data is
              encrypted in transit and at rest and is never stored beyond the retention window.
            </p>

            <div className="mt-10">
              <div className="flex items-center gap-3">
                <MethodBadge method="POST" />
                <code className="font-mono text-[14px] font-semibold text-foreground">
                  /v1/kyc/verify
                </code>
                <span className="text-[12px] text-bone-soft">Submit a verification</span>
              </div>
              <SplitRow
                left={
                  <div>
                    <p className="text-[14px] leading-relaxed text-bone-soft">
                      Initiates an identity verification workflow. Returns immediately with a
                      pending status. Subscribe to the{" "}
                      <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[11px] text-bone-strong">
                        kyc.verified
                      </code>{" "}
                      webhook for the final result.
                    </p>
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                        Body parameters
                      </p>
                      <dl className="mt-3 rounded-lg border border-border">
                        <ParamRow
                          name="first_name"
                          type="string"
                          required
                          desc="Legal first name of the individual."
                        />
                        <ParamRow
                          name="last_name"
                          type="string"
                          required
                          desc="Legal last name of the individual."
                        />
                        <ParamRow
                          name="dob"
                          type="string"
                          required
                          desc="Date of birth in ISO 8601 format (YYYY-MM-DD)."
                        />
                        <ParamRow
                          name="id_type"
                          type="string"
                          required
                          desc="One of: national_id, passport, drivers_license."
                        />
                        <ParamRow
                          name="id_number"
                          type="string"
                          required
                          desc="Document identification number."
                        />
                      </dl>
                    </div>
                  </div>
                }
                right={
                  <CodeBlock
                    title="REQUEST / RESPONSE"
                    code={`<span class="text-bone-faint"># POST /v1/kyc/verify</span>
{
  <span class="text-gold">"first_name"</span>: <span class="text-bone-strong">"Amara"</span>,
  <span class="text-gold">"last_name"</span>:  <span class="text-bone-strong">"Osei"</span>,
  <span class="text-gold">"dob"</span>:        <span class="text-bone-strong">"1992-04-15"</span>,
  <span class="text-gold">"id_type"</span>:    <span class="text-bone-strong">"passport"</span>,
  <span class="text-gold">"id_number"</span>:  <span class="text-bone-strong">"A09123456"</span>
}

<span class="text-bone-faint"># 202 Accepted</span>
{
  <span class="text-gold">"data"</span>: {
    <span class="text-gold">"verification_id"</span>: <span class="text-bone-strong">"kyc_01mn..."</span>,
    <span class="text-gold">"status"</span>:          <span class="text-gold">"pending"</span>
  }
}`}
                  />
                }
              />
            </div>
          </DocSection>

          {/* ── WEBHOOKS ── */}
          <DocSection id="webhooks" title="Webhooks">
            <p className="mt-4 text-[15px] leading-relaxed text-bone-soft">
              The ENICE Core delivers all asynchronous events via HMAC-SHA256 signed webhooks with
              at-least-once delivery semantics and configurable retry windows.
            </p>

            <SplitRow
              left={
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">
                      Signature verification
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-bone-soft">
                      Each delivery includes an{" "}
                      <code className={INLINE_CODE}>X-ENICE-Signature</code> header. Verify it
                      against your webhook secret to confirm authenticity.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-foreground">Event types</h3>
                    <dl className="mt-3 rounded-lg border border-border">
                      {[
                        ["wallet.created", "A new wallet was provisioned"],
                        ["ledger.tx.settled", "A ledger transaction settled"],
                        ["kyc.verified", "Identity verification completed"],
                        ["kyc.failed", "Identity verification failed"],
                        ["assist.escalated", "Agent escalated to live agent"],
                      ].map(([event, desc]) => (
                        <div
                          key={event}
                          className="flex flex-col gap-1 border-t border-border px-4 py-3 first:border-t-0 sm:flex-row sm:items-center sm:gap-6"
                        >
                          <dt className="shrink-0 sm:w-44">
                            <code className="font-mono text-[12px] text-gold">{event}</code>
                          </dt>
                          <dd className="text-[13px] text-bone-soft">{desc}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              }
              right={
                <CodeBlock
                  title="WEBHOOK PAYLOAD"
                  code={`<span class="text-bone-faint"># Example: kyc.verified event</span>
{
  <span class="text-gold">"id"</span>:      <span class="text-bone-strong">"evt_01pq..."</span>,
  <span class="text-gold">"type"</span>:    <span class="text-bone-strong">"kyc.verified"</span>,
  <span class="text-gold">"created"</span>: <span class="text-bone-strong">"2026-07-03T00:00:00Z"</span>,
  <span class="text-gold">"data"</span>: {
    <span class="text-gold">"verification_id"</span>: <span class="text-bone-strong">"kyc_01mn..."</span>,
    <span class="text-gold">"status"</span>:          <span class="text-positive">"verified"</span>,
    <span class="text-gold">"name"</span>:            <span class="text-bone-strong">"Amara Osei"</span>
  }
}

<span class="text-bone-faint"># Verify the signature</span>
X-ENICE-Signature: <span class="text-bone-strong">sha256=a1b2c3d4e5f6...</span>`}
                />
              }
            />
          </DocSection>
        </div>
      </Section>
    </SiteShell>
  );
}
