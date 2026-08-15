import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, ChevronRight, Copy, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/docs")({
  head: () => pageHead("/docs"),
  component: DocsPage,
});

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

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POST: "bg-blue-50   text-blue-700   border-blue-200",
  DELETE: "bg-red-50    text-red-700    border-red-200",
  PATCH: "bg-amber-50  text-amber-700  border-amber-200",
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest ${METHOD_COLORS[method] ?? "bg-secondary text-foreground border-border"}`}
    >
      {method}
    </span>
  );
}

// ─── Dark code block ──────────────────────────────────────────────────────────

function CodeBlock({ title, code }: { title?: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#1e2433] bg-[#0d1117] text-[12.5px]">
      {title && (
        <div className="flex items-center justify-between border-b border-[#1e2433] px-4 py-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] text-slate-400">{title}</span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-semibold text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-5 font-mono leading-[1.75] text-slate-300 whitespace-pre">
        <code dangerouslySetInnerHTML={{ __html: code }} />
      </pre>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────

function DocSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border py-16 first:border-t-0">
      {children}
    </section>
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
      <div className="flex shrink-0 items-baseline gap-2 sm:w-48">
        <span className="font-mono text-[13px] font-semibold text-foreground">{name}</span>
        {required && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-red-500">
            required
          </span>
        )}
      </div>
      <div className="min-w-0">
        <span className="font-mono text-[11px] text-muted-foreground">{type}</span>
        <p className="mt-0.5 text-[13.5px] leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function DocsPage() {
  const [active, setActive] = useState("introduction");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">
        {/* Page header */}
        <div className="border-b border-border bg-secondary/40 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Developers · ENICE Core
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl md:text-5xl">
              API Documentation
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              A complete reference for the ENICE Core REST API. Full sandbox keys and partner
              onboarding are issued upon request.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3.5 py-1.5 text-[11px] font-semibold text-muted-foreground">
                Base URL:
                <span className="font-mono text-foreground">https://api.enice.group/v1</span>
              </div>
              <Link
                to="/contact"
                className="group inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Request API Access
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
              </Link>
            </div>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="mx-auto flex max-w-7xl gap-0 px-5 sm:px-8 lg:gap-12">
          {/* Sticky sidebar */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24 py-12">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Reference
              </p>
              <nav className="space-y-0.5">
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => scrollTo(n.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium transition-colors ${
                      active === n.id
                        ? "bg-primary/8 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {active === n.id && <ChevronRight className="h-3 w-3 shrink-0 text-primary" />}
                    {n.label}
                  </button>
                ))}
              </nav>

              <div className="mt-10 rounded-lg border border-border bg-secondary/60 p-4">
                <p className="text-[11px] font-semibold text-foreground">Need help?</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Write to us at{" "}
                  <a href="mailto:corporate@enicehq.com" className="text-primary hover:underline">
                    corporate@enicehq.com
                  </a>
                </p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 py-12">
            {/* ── INTRODUCTION ── */}
            <DocSection id="introduction">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Introduction
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                The ENICE Core API gives verified partners programmatic access to our
                infrastructure: wallet issuance, ledger operations, AI agent routing, KYC
                verification, and more. All endpoints use HTTPS and return JSON.
              </p>

              <SplitRow
                left={
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Base URL</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        All API requests must be made to the versioned base URL. We maintain
                        backward compatibility within each version prefix.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Response format</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        Every response is a JSON object. Successful responses carry a{" "}
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]">
                          data
                        </code>{" "}
                        key. Errors include{" "}
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]">
                          error.code
                        </code>{" "}
                        and{" "}
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]">
                          error.message
                        </code>
                        .
                      </p>
                    </div>
                  </div>
                }
                right={
                  <CodeBlock
                    title="BASE URL"
                    code={`<span class="text-slate-500"># All requests target this versioned base</span>
https://api.enice.group/v1

<span class="text-slate-500"># Example: retrieve ecosystem health</span>
<span class="text-emerald-400">GET</span> /v1/core

<span class="text-slate-500"># Standard response envelope</span>
{
  <span class="text-sky-300">"data"</span>: { ... },
  <span class="text-sky-300">"meta"</span>: {
    <span class="text-sky-300">"request_id"</span>: <span class="text-amber-300">"req_01jz..."</span>,
    <span class="text-sky-300">"timestamp"</span>:  <span class="text-amber-300">"2026-07-03T00:00:00Z"</span>
  }
}`}
                  />
                }
              />
            </DocSection>

            {/* ── AUTHENTICATION ── */}
            <DocSection id="authentication">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Authentication
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                The API uses scoped Bearer tokens issued through the ENICE Partner Console. Tokens
                are environment-specific. Always use{" "}
                <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]">
                  ek_test_
                </code>{" "}
                keys during development and{" "}
                <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]">
                  ek_live_
                </code>{" "}
                keys in production.
              </p>

              <SplitRow
                left={
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Bearer token</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        Pass your API key in the{" "}
                        <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[12px]">
                          Authorization
                        </code>{" "}
                        header of every request. Never expose live keys in client-side code or
                        public repositories.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Token scopes</h3>
                      <div className="mt-3 rounded-lg border border-border">
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
                            <code className="w-28 shrink-0 font-mono text-[12px] text-primary">
                              {scope}
                            </code>
                            <span className="text-[13px] text-muted-foreground">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                }
                right={
                  <>
                    <CodeBlock
                      title="REQUEST HEADER"
                      code={`Authorization: Bearer <span class="text-amber-300">ek_live_xxxxxxxxxxxxxxxxxxxx</span>
Content-Type: application/json`}
                    />
                    <CodeBlock
                      title="EXAMPLE: cURL"
                      code={`<span class="text-slate-500"># Authenticated request to /v1/core</span>
curl <span class="text-amber-300">https://api.enice.group/v1/core</span> \\
  -H <span class="text-emerald-400">"Authorization: Bearer ek_live_xxx"</span> \\
  -H <span class="text-emerald-400">"Content-Type: application/json"</span>

<span class="text-slate-500"># 401: missing or invalid token</span>
{
  <span class="text-sky-300">"error"</span>: {
    <span class="text-sky-300">"code"</span>:    <span class="text-amber-300">"unauthorized"</span>,
    <span class="text-sky-300">"message"</span>: <span class="text-amber-300">"API key missing or invalid."</span>
  }
}`}
                    />
                  </>
                }
              />
            </DocSection>

            {/* ── ERRORS & RATE LIMITS ── */}
            <DocSection id="errors">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Errors & Rate Limits
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                The API uses standard HTTP status codes. All error bodies follow a consistent shape
                so you can handle them uniformly.
              </p>

              <SplitRow
                left={
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">
                        HTTP status codes
                      </h3>
                      <div className="mt-3 rounded-lg border border-border">
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
                            <code
                              className={`w-10 shrink-0 font-mono text-[13px] font-semibold ${code.startsWith("2") ? "text-emerald-600" : code.startsWith("4") || code.startsWith("5") ? "text-red-600" : "text-foreground"}`}
                            >
                              {code}
                            </code>
                            <span className="text-[13px] text-muted-foreground">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Rate limits</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
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
                    code={`<span class="text-slate-500"># HTTP 429: rate limit exceeded</span>
{
  <span class="text-sky-300">"error"</span>: {
    <span class="text-sky-300">"code"</span>:       <span class="text-amber-300">"rate_limit_exceeded"</span>,
    <span class="text-sky-300">"message"</span>:    <span class="text-amber-300">"Too many requests. Retry after 60s."</span>,
    <span class="text-sky-300">"retry_after"</span>: <span class="text-violet-400">60</span>
  }
}

<span class="text-slate-500"># Rate-limit response headers</span>
X-RateLimit-Limit:     <span class="text-violet-400">1000</span>
X-RateLimit-Remaining: <span class="text-violet-400">0</span>
X-RateLimit-Reset:     <span class="text-violet-400">1751500860</span>`}
                  />
                }
              />
            </DocSection>

            {/* ── WALLETS ── */}
            <DocSection id="wallets">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Wallets</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
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
                  <span className="text-[12px] text-muted-foreground">List all wallets</span>
                </div>
                <SplitRow
                  left={
                    <div>
                      <p className="text-[14px] leading-relaxed text-muted-foreground">
                        Returns a paginated list of wallets scoped to your tenant. Supports
                        filtering by currency and status.
                      </p>
                      <div className="mt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Query parameters
                        </p>
                        <div className="mt-3 rounded-lg border border-border">
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
                        </div>
                      </div>
                    </div>
                  }
                  right={
                    <CodeBlock
                      title="RESPONSE: 200 OK"
                      code={`{
  <span class="text-sky-300">"data"</span>: [
    {
      <span class="text-sky-300">"id"</span>:       <span class="text-amber-300">"wlt_01jz4k9m..."</span>,
      <span class="text-sky-300">"currency"</span>: <span class="text-amber-300">"NGN"</span>,
      <span class="text-sky-300">"balance"</span>:  <span class="text-violet-400">500000</span>,
      <span class="text-sky-300">"status"</span>:   <span class="text-amber-300">"active"</span>,
      <span class="text-sky-300">"created_at"</span>: <span class="text-amber-300">"2026-07-03T..."</span>
    }
  ],
  <span class="text-sky-300">"pagination"</span>: {
    <span class="text-sky-300">"has_more"</span>: <span class="text-violet-400">false</span>,
    <span class="text-sky-300">"next_cursor"</span>: <span class="text-slate-500">null</span>
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
                  <span className="text-[12px] text-muted-foreground">Create a wallet</span>
                </div>
                <SplitRow
                  left={
                    <div>
                      <p className="text-[14px] leading-relaxed text-muted-foreground">
                        Provisions a new wallet for an end-user or sub-account. Optionally issue a
                        virtual card at creation.
                      </p>
                      <div className="mt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Body parameters
                        </p>
                        <div className="mt-3 rounded-lg border border-border">
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
                        </div>
                      </div>
                    </div>
                  }
                  right={
                    <CodeBlock
                      title="REQUEST BODY"
                      code={`{
  <span class="text-sky-300">"currency"</span>:   <span class="text-amber-300">"USD"</span>,
  <span class="text-sky-300">"label"</span>:      <span class="text-amber-300">"Operating Account"</span>,
  <span class="text-sky-300">"issue_card"</span>: <span class="text-violet-400">true</span>,
  <span class="text-sky-300">"metadata"</span>: {
    <span class="text-sky-300">"user_id"</span>: <span class="text-amber-300">"usr_8823..."</span>
  }
}`}
                    />
                  }
                />
              </div>
            </DocSection>

            {/* ── LEDGER ── */}
            <DocSection id="ledger">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Ledger</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                The ENICE Core ledger is a double-entry, append-only transaction log. Every
                financial event is recorded as an immutable entry and reconciled in real time.
              </p>

              <div className="mt-10">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-[14px] font-semibold text-foreground">
                    /v1/ledger/tx
                  </code>
                  <span className="text-[12px] text-muted-foreground">Post a transaction</span>
                </div>
                <SplitRow
                  left={
                    <div>
                      <p className="text-[14px] leading-relaxed text-muted-foreground">
                        Posts a debit/credit pair to the ledger. The operation is atomic: if either
                        leg fails, the entire transaction is rolled back.
                      </p>
                      <div className="mt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Body parameters
                        </p>
                        <div className="mt-3 rounded-lg border border-border">
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
                        </div>
                      </div>
                    </div>
                  }
                  right={
                    <CodeBlock
                      title="REQUEST / RESPONSE"
                      code={`<span class="text-slate-500"># POST /v1/ledger/tx</span>
{
  <span class="text-sky-300">"debit_wallet"</span>:  <span class="text-amber-300">"wlt_01jz..."</span>,
  <span class="text-sky-300">"credit_wallet"</span>: <span class="text-amber-300">"wlt_02ab..."</span>,
  <span class="text-sky-300">"amount"</span>:         <span class="text-violet-400">500000</span>,
  <span class="text-sky-300">"currency"</span>:       <span class="text-amber-300">"NGN"</span>,
  <span class="text-sky-300">"reference"</span>:      <span class="text-amber-300">"inv_2026_07_001"</span>
}

<span class="text-slate-500"># 201 Created</span>
{
  <span class="text-sky-300">"data"</span>: {
    <span class="text-sky-300">"id"</span>:        <span class="text-amber-300">"txn_01kz9..."</span>,
    <span class="text-sky-300">"status"</span>:    <span class="text-amber-300">"settled"</span>,
    <span class="text-sky-300">"settled_at"</span>: <span class="text-amber-300">"2026-07-03T00:00:00Z"</span>
  }
}`}
                    />
                  }
                />
              </div>
            </DocSection>

            {/* ── ASSIST ── */}
            <DocSection id="assist">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Assist</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                The Assist API exposes PulseAssist's multi-tenant AI routing engine. Invoke agents,
                manage conversation state, and configure policy-bound automations via REST.
              </p>

              <div className="mt-10">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-[14px] font-semibold text-foreground">
                    /v1/assist/query
                  </code>
                  <span className="text-[12px] text-muted-foreground">Invoke an AI agent</span>
                </div>
                <SplitRow
                  left={
                    <div>
                      <p className="text-[14px] leading-relaxed text-muted-foreground">
                        Routes a user message through the configured tenant agent. The agent applies
                        your policy rules, executes permitted actions, and returns a structured
                        response.
                      </p>
                      <div className="mt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Body parameters
                        </p>
                        <div className="mt-3 rounded-lg border border-border">
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
                        </div>
                      </div>
                    </div>
                  }
                  right={
                    <CodeBlock
                      title="REQUEST / RESPONSE"
                      code={`<span class="text-slate-500"># POST /v1/assist/query</span>
{
  <span class="text-sky-300">"session_id"</span>: <span class="text-amber-300">"sess_01kz..."</span>,
  <span class="text-sky-300">"message"</span>:    <span class="text-amber-300">"What is my account balance?"</span>,
  <span class="text-sky-300">"tenant_id"</span>:  <span class="text-amber-300">"ten_bank_ng"</span>,
  <span class="text-sky-300">"language"</span>:   <span class="text-amber-300">"en"</span>
}

<span class="text-slate-500"># 200 OK</span>
{
  <span class="text-sky-300">"data"</span>: {
    <span class="text-sky-300">"reply"</span>:      <span class="text-amber-300">"Your NGN balance is ₦500,000."</span>,
    <span class="text-sky-300">"intent"</span>:     <span class="text-amber-300">"account.balance_inquiry"</span>,
    <span class="text-sky-300">"confidence"</span>: <span class="text-violet-400">0.98</span>,
    <span class="text-sky-300">"actions"</span>:    []
  }
}`}
                    />
                  }
                />
              </div>
            </DocSection>

            {/* ── KYC ── */}
            <DocSection id="kyc">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                KYC & Identity
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Submit identity verification requests and retrieve screening results. All KYC data
                is encrypted in transit and at rest and is never stored beyond the retention window.
              </p>

              <div className="mt-10">
                <div className="flex items-center gap-3">
                  <MethodBadge method="POST" />
                  <code className="font-mono text-[14px] font-semibold text-foreground">
                    /v1/kyc/verify
                  </code>
                  <span className="text-[12px] text-muted-foreground">Submit a verification</span>
                </div>
                <SplitRow
                  left={
                    <div>
                      <p className="text-[14px] leading-relaxed text-muted-foreground">
                        Initiates an identity verification workflow. Returns immediately with a
                        pending status. Subscribe to the{" "}
                        <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[11px]">
                          kyc.verified
                        </code>{" "}
                        webhook for the final result.
                      </p>
                      <div className="mt-6">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Body parameters
                        </p>
                        <div className="mt-3 rounded-lg border border-border">
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
                        </div>
                      </div>
                    </div>
                  }
                  right={
                    <CodeBlock
                      title="REQUEST / RESPONSE"
                      code={`<span class="text-slate-500"># POST /v1/kyc/verify</span>
{
  <span class="text-sky-300">"first_name"</span>: <span class="text-amber-300">"Amara"</span>,
  <span class="text-sky-300">"last_name"</span>:  <span class="text-amber-300">"Osei"</span>,
  <span class="text-sky-300">"dob"</span>:        <span class="text-amber-300">"1992-04-15"</span>,
  <span class="text-sky-300">"id_type"</span>:    <span class="text-amber-300">"passport"</span>,
  <span class="text-sky-300">"id_number"</span>:  <span class="text-amber-300">"A09123456"</span>
}

<span class="text-slate-500"># 202 Accepted</span>
{
  <span class="text-sky-300">"data"</span>: {
    <span class="text-sky-300">"verification_id"</span>: <span class="text-amber-300">"kyc_01mn..."</span>,
    <span class="text-sky-300">"status"</span>:          <span class="text-amber-300">"pending"</span>
  }
}`}
                    />
                  }
                />
              </div>
            </DocSection>

            {/* ── WEBHOOKS ── */}
            <DocSection id="webhooks">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Webhooks</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
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
                      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                        Each delivery includes an{" "}
                        <code className="rounded bg-secondary px-1 py-0.5 font-mono text-[12px]">
                          X-ENICE-Signature
                        </code>{" "}
                        header. Verify it against your webhook secret to confirm authenticity.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-foreground">Event types</h3>
                      <div className="mt-3 rounded-lg border border-border">
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
                            <code className="shrink-0 font-mono text-[12px] text-primary sm:w-44">
                              {event}
                            </code>
                            <span className="text-[13px] text-muted-foreground">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                }
                right={
                  <CodeBlock
                    title="WEBHOOK PAYLOAD"
                    code={`<span class="text-slate-500"># Example: kyc.verified event</span>
{
  <span class="text-sky-300">"id"</span>:      <span class="text-amber-300">"evt_01pq..."</span>,
  <span class="text-sky-300">"type"</span>:    <span class="text-amber-300">"kyc.verified"</span>,
  <span class="text-sky-300">"created"</span>: <span class="text-amber-300">"2026-07-03T00:00:00Z"</span>,
  <span class="text-sky-300">"data"</span>: {
    <span class="text-sky-300">"verification_id"</span>: <span class="text-amber-300">"kyc_01mn..."</span>,
    <span class="text-sky-300">"status"</span>:          <span class="text-amber-300">"verified"</span>,
    <span class="text-sky-300">"name"</span>:            <span class="text-amber-300">"Amara Osei"</span>
  }
}

<span class="text-slate-500"># Verify the signature</span>
X-ENICE-Signature: <span class="text-emerald-400">sha256=a1b2c3d4e5f6...</span>`}
                  />
                }
              />
            </DocSection>
          </main>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
