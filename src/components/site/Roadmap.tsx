import { useState } from "react";
import { ArrowUpRight, Clock, CheckCircle2, Circle, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Status = "completed" | "in-progress" | "planned";

interface Milestone {
  when: string;
  quarter: string;
  status: Status;
  product: string;
  title: string;
  body: string;
  tags: string[];
}

const MILESTONES: Milestone[] = [
  {
    when: "Q1 2026",
    quarter: "Q1 2026",
    status: "completed",
    product: "ENICE Core",
    title: "Shared Ecosystem Framework",
    body: "The unified AI pipeline, ledger, and compliance backbone that now underpins every ENICE product.",
    tags: ["Infrastructure", "AI", "Compliance"],
  },
  {
    when: "Q3 2026",
    quarter: "Q3 2026",
    status: "completed",
    product: "PulsePay",
    title: "Extended Pilot with Regional Treasury Partners",
    body: "Programmable wallets, instant virtual card issuance, and embedded compliance controls, rolled out to a wider pilot group across West Africa.",
    tags: ["Fintech", "Wallets", "KYC"],
  },
  {
    when: "Q4 2026",
    quarter: "Q4 2026",
    status: "in-progress",
    product: "PulseAssist",
    title: "Enterprise B2B Launch",
    body: "First rollout of support automation to banking, fintech, and telecom partners, with policy-bound agents and live-agent failover.",
    tags: ["AI", "B2B", "Telecom"],
  },
  {
    when: "Q2 2026",
    quarter: "Q2 2026",
    status: "in-progress",
    product: "PulsePay",
    title: "Developer API Public Beta",
    body: "The ENICE Core API opens to verified integration partners, with wallet issuance, ledger, KYC, and Assist endpoints available in a sandbox.",
    tags: ["API", "Developer", "Fintech"],
  },
  {
    when: "Q3 2026",
    quarter: "Q3 2026",
    status: "planned",
    product: "PulsePay",
    title: "Multi-Currency Expansion",
    body: "Multi-currency wallet rails, programmable spend controls, and embedded treasury operations for the payment platform.",
    tags: ["Fintech", "Multi-Currency", "Treasury"],
  },
  {
    when: "Q1 2027",
    quarter: "Q1 2027",
    status: "planned",
    product: "PulsePay",
    title: "Payment Collection Launch",
    body: "PulsePay Payment Collection launches: a unified API for businesses to accept and manage customer payments, with real time status updates and webhook notifications.",
    tags: ["Fintech", "Payments", "API"],
  },
  {
    when: "Q3 2027",
    quarter: "Q3 2027",
    status: "planned",
    product: "PulseX",
    title: "Global Digital Asset Exchange Private Beta",
    body: "PulseX opens to institutional and qualified retail participants, with support for major digital asset pairs, custody, and compliance reporting.",
    tags: ["Crypto", "Exchange", "Global"],
  },
  {
    when: "Q4 2027",
    quarter: "Q4 2027",
    status: "planned",
    product: "ePulse",
    title: "Digital Banking Infrastructure Closed Alpha",
    body: "ePulse begins closed alpha with select institutional partners: digital banking core, account management, and statement APIs.",
    tags: ["Banking", "Alpha"],
  },
  {
    when: "2027",
    quarter: "2027",
    status: "planned",
    product: "ENICE Core",
    title: "Universal Financial Hub",
    body: "A global virtual-dollar and asset infrastructure layer connecting institutional liquidity across markets through a single API.",
    tags: ["Infrastructure", "Global", "Liquidity"],
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    icon: React.ElementType;
    pill: string;
    dot: string;
  }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  "in-progress": {
    label: "In Progress",
    icon: Zap,
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-primary",
  },
  planned: {
    label: "Planned",
    icon: Clock,
    pill: "bg-secondary text-muted-foreground border-border",
    dot: "bg-muted-foreground/40",
  },
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "in-progress", label: "In Progress" },
  { key: "planned", label: "Planned" },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

function MilestoneCard({ m }: { m: Milestone }) {
  const cfg = STATUS_CONFIG[m.status];
  const Icon = cfg.icon;

  return (
    <article
      className="group relative flex flex-col rounded-xl border border-border bg-background p-7 transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cfg.pill}`}
          >
            <Icon className="h-3 w-3" strokeWidth={2.5} />
            {cfg.label}
          </span>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {m.when}
          </span>
        </div>
        <span className="shrink-0 rounded-md bg-secondary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {m.product}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-5 text-[17px] font-semibold leading-snug tracking-tight text-foreground">
        {m.title}
      </h3>

      {/* Body */}
      <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">{m.body}</p>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap gap-2">
        {m.tags.map((t) => (
          <span
            key={t}
            className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
    </article>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Roadmap() {
  const [tab, setTab] = useState<"all" | Status>("all");

  const filtered = tab === "all" ? MILESTONES : MILESTONES.filter((m) => m.status === tab);

  const counts = {
    all: MILESTONES.length,
    completed: MILESTONES.filter((m) => m.status === "completed").length,
    "in-progress": MILESTONES.filter((m) => m.status === "in-progress").length,
    planned: MILESTONES.filter((m) => m.status === "planned").length,
  };

  return (
    <section id="roadmap" className="border-t border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Strategic Roadmap
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              Built step by step, for the long run.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Our roadmap follows the maturity of the platforms we operate, sequenced so each step
              builds on the last.
            </p>
          </div>
          <Link
            to="/contact"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary"
          >
            Partner with us
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </Link>
        </div>

        {/* Summary stats */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["completed", "in-progress", "planned"] as const).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div
                key={s}
                className="rounded-xl border border-border bg-background px-5 py-4"
                style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {cfg.label}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {counts[s]}
                </div>
              </div>
            );
          })}
          <div
            className="rounded-xl border border-border bg-background px-5 py-4"
            style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Total
              </span>
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              {counts.all}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex items-center gap-1 rounded-lg border border-border bg-secondary/60 p-1 sm:w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-[12px] font-semibold transition-all ${
                tab === t.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === t.key
                    ? "bg-primary/10 text-primary"
                    : "bg-transparent text-muted-foreground/60"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-2">
          {filtered.map((m) => (
            <MilestoneCard key={`${m.when}-${m.title}`} m={m} />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-border bg-secondary/40 py-16 text-center">
            <Circle className="h-8 w-8 text-muted-foreground/30" />
            <p className="mt-4 text-[14px] text-muted-foreground">
              No milestones in this category yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
