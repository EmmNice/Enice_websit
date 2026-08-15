import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SITE_URL } from "@/lib/site";
import { SHADOW_CARD } from "@/lib/design";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "System Status | ENICE Group" },
      {
        name: "description",
        content:
          "Live availability of the ENICE Group public API and website, checked from your browser.",
      },
      { property: "og:title", content: "System Status | ENICE Group" },
      { property: "og:url", content: `${SITE_URL}/status` },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/status` }],
  }),
  component: StatusPage,
});

/**
 * Checks performed from the visitor's browser.
 *
 * This page used to display four hardcoded "Operational" rows and a "last checked" timestamp
 * that was simply the current time — it reported everything healthy even during an outage,
 * which is worse than having no status page. It now probes real endpoints and only reports
 * what it can actually observe.
 *
 * `probe` returns the HTTP status codes that count as healthy. A rate-limited or
 * unauthorised response still proves the service is up and answering.
 */
const CHECKS = [
  {
    id: "api",
    name: "Public API",
    detail: "Serverless request layer behind enicehq.com/api.",
    path: "/api/ping",
    method: "GET" as const,
    healthy: [200],
  },
  {
    id: "early-access",
    name: "Early Access Intake",
    detail: "PulseAssist early-access registration endpoint.",
    path: "/api/early-access",
    method: "POST" as const,
    // 400 is the expected answer to an empty body: the endpoint is up and validating.
    healthy: [400, 429],
  },
  {
    id: "contact",
    name: "Contact Delivery",
    detail: "Contact form intake and routing to corporate@enicehq.com.",
    path: "/api/contact",
    method: "POST" as const,
    healthy: [400, 429],
  },
] as const;

type CheckState = "checking" | "operational" | "degraded" | "down";

type Result = { state: CheckState; code: number | null; ms: number | null };

const STATE_META: Record<
  CheckState,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  checking: {
    label: "Checking",
    className: "text-muted-foreground",
    Icon: Loader2,
  },
  operational: {
    label: "Operational",
    className: "text-emerald-600",
    Icon: CheckCircle2,
  },
  degraded: {
    label: "Degraded",
    className: "text-amber-600",
    Icon: AlertTriangle,
  },
  down: { label: "Unreachable", className: "text-destructive", Icon: XCircle },
};

/** Slow but working still counts as operational; this is the line for "degraded". */
const SLOW_MS = 2_500;

function StatusPage() {
  const [results, setResults] = useState<Record<string, Result>>(() =>
    Object.fromEntries(CHECKS.map((c) => [c.id, { state: "checking", code: null, ms: null }])),
  );
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [running, setRunning] = useState(false);

  const runChecks = useCallback(async () => {
    setRunning(true);
    setResults(
      Object.fromEntries(CHECKS.map((c) => [c.id, { state: "checking", code: null, ms: null }])),
    );

    const entries = await Promise.all(
      CHECKS.map(async (check) => {
        const started = performance.now();
        try {
          const res = await fetch(check.path, {
            method: check.method,
            headers: check.method === "POST" ? { "Content-Type": "application/json" } : undefined,
            // An empty object is enough to reach validation without submitting anything.
            body: check.method === "POST" ? "{}" : undefined,
            cache: "no-store",
          });
          const ms = Math.round(performance.now() - started);
          const ok = (check.healthy as readonly number[]).includes(res.status);
          const state: CheckState = !ok ? "degraded" : ms > SLOW_MS ? "degraded" : "operational";
          return [check.id, { state, code: res.status, ms }] as const;
        } catch {
          return [
            check.id,
            {
              state: "down" as CheckState,
              code: null,
              ms: Math.round(performance.now() - started),
            },
          ] as const;
        }
      }),
    );

    setResults(Object.fromEntries(entries));
    setCheckedAt(new Date());
    setRunning(false);
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  const states = Object.values(results).map((r) => r.state);
  const overall: CheckState = states.includes("down")
    ? "down"
    : states.includes("degraded")
      ? "degraded"
      : states.includes("checking")
        ? "checking"
        : "operational";

  const overallCopy: Record<CheckState, string> = {
    checking: "Running checks…",
    operational: "All Systems Operational",
    degraded: "Partial Degradation",
    down: "Service Disruption",
  };

  const OverallIcon = STATE_META[overall].Icon;

  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />

      <main id="main" className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
            System Status
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            Platform Availability
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            These checks run live from your browser against our public endpoints, so what you see
            here is what your network can actually reach right now.
          </p>

          {/* Overall banner */}
          <div
            className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-background px-6 py-5"
            style={{ boxShadow: SHADOW_CARD }}
          >
            <div className="flex items-center gap-3">
              <OverallIcon
                className={`h-5 w-5 ${STATE_META[overall].className} ${overall === "checking" ? "animate-spin" : ""}`}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span
                className={`text-[15px] font-semibold ${STATE_META[overall].className}`}
                role="status"
              >
                {overallCopy[overall]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void runChecks()}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              Re-check
            </button>
          </div>

          {/* Individual checks */}
          <ul className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
            {CHECKS.map((check) => {
              const result = results[check.id];
              const meta = STATE_META[result.state];
              const Icon = meta.Icon;
              return (
                <li
                  key={check.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-5"
                >
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-foreground">{check.name}</div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {check.detail}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.ms !== null && result.state !== "checking" && (
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {result.ms} ms
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${meta.className}`}
                    >
                      <Icon
                        className={`h-4 w-4 ${result.state === "checking" ? "animate-spin" : ""}`}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      {meta.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-6 text-[12px] text-muted-foreground">
            {checkedAt ? `Last checked: ${checkedAt.toLocaleString()}` : "Running the first check…"}
          </p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Product-level status for PulsePay, PulseAssist, ePulse and PulseX is reported to
            integration partners directly under their agreements. For an incident report, contact{" "}
            <a
              href="mailto:corporate@enicehq.com"
              className="text-foreground underline hover:text-primary"
            >
              corporate@enicehq.com
            </a>
            .
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
