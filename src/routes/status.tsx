import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, XCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Panel, Section, SectionIntro } from "@/components/site/primitives";
import { PRODUCTS } from "@/components/site/navigation";
import { CORPORATE_EMAIL, pageHead } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/status")({
  head: () => pageHead("/status"),
  component: StatusPage,
});

/** The public host, without its scheme — for prose that names the domain being probed. */
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

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
 *
 * The host and the support address are read from `SITE_URL` and `CORPORATE_EMAIL` rather than
 * spelled out again here, so a domain or inbox change cannot leave this page describing a
 * platform that no longer exists at that address.
 */
const CHECKS = [
  {
    id: "api",
    name: "Public API",
    detail: `Serverless request layer behind ${SITE_HOST}/api.`,
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
    detail: `Contact form intake and routing to ${CORPORATE_EMAIL}.`,
    path: "/api/contact",
    method: "POST" as const,
    healthy: [400, 429],
  },
] as const;

type CheckState = "checking" | "operational" | "degraded" | "down";

type Result = { state: CheckState; code: number | null; ms: number | null };

/**
 * State colours.
 *
 * `--positive` is the one non-warm accent in the system and this page is the only surface allowed
 * to assert availability, so green here means something: a probe that answered. Degraded takes the
 * warm accent and unreachable the destructive tone; "checking" stays deliberately quiet so a page
 * mid-check never looks like a verdict.
 */
const STATE_META: Record<
  CheckState,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  checking: {
    label: "Checking",
    className: "text-bone-soft",
    Icon: Loader2,
  },
  operational: {
    label: "Operational",
    className: "text-positive",
    Icon: CheckCircle2,
  },
  degraded: {
    label: "Degraded",
    className: "text-gold",
    Icon: AlertTriangle,
  },
  down: { label: "Unreachable", className: "text-destructive", Icon: XCircle },
};

/** Slow but working still counts as operational; this is the line for "degraded". */
const SLOW_MS = 2_500;

/** "A, B and C" — for prose that has to name every product without hardcoding the list. */
function nameList(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

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
    <SiteShell>
      <Section container="narrow" glow="center" aria-labelledby="status-heading">
        <SectionIntro
          level={1}
          id="status-heading"
          eyebrow="System Status"
          heading="Platform Availability"
          lead="These checks run live from your browser against our public endpoints, so what you see here is what your network can actually reach right now."
        />

        {/* Overall banner */}
        <Panel
          raised
          aria-busy={running}
          className="mt-10 flex flex-wrap items-center justify-between gap-4 px-6 py-5"
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
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Re-check
          </button>
        </Panel>

        {/* Individual checks */}
        <Panel as="ul" className="mt-6 divide-y divide-border overflow-hidden">
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
                  <p className="mt-1 text-[12px] leading-relaxed text-bone-soft">{check.detail}</p>
                </div>
                <div className="flex items-center gap-3">
                  {result.ms !== null && result.state !== "checking" && (
                    <span className="tnum text-[11px] text-bone-faint">{result.ms} ms</span>
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
        </Panel>

        <p className="type-meta mt-6">
          {checkedAt ? `Last checked: ${checkedAt.toLocaleString()}` : "Running the first check…"}
        </p>
        {/*
          The products are read from the shared registry rather than typed out here. The
          hardcoded sentence named four of them and had already fallen out of date — the
          ecosystem is five — so the one page a partner checks during an incident was quietly
          omitting a platform.
        */}
        <p className="mt-2 text-[12px] leading-relaxed text-bone-soft">
          Product-level status for {nameList(PRODUCTS.map((p) => p.label))} is reported to
          integration partners directly under their agreements. For an incident report, contact{" "}
          <a
            href={`mailto:${CORPORATE_EMAIL}`}
            className="text-foreground underline underline-offset-2 transition-colors hover:text-gold"
          >
            {CORPORATE_EMAIL}
          </a>
          .
        </p>
      </Section>
    </SiteShell>
  );
}
