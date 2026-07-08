import { Reveal } from "./Reveal";

// ─── Milestone data ───────────────────────────────────────────────────────────

const MILESTONES = [
  {
    status: "upcoming" as const,
    quarter: "Q3 2026",
    product: "PulsePay",
    headline: "Launching Q3 2026",
    desc: "Our flagship high-volume transaction and digital wallet platform.",
    index: "01",
  },
  {
    status: "upcoming" as const,
    quarter: "Q3 2026",
    product: "PulseAssist",
    headline: "Launching Q3 2026",
    desc: "A B2B SaaS platform for automated financial operations and AI-driven micro-transactions.",
    index: "02",
  },
  {
    status: "upcoming" as const,
    quarter: "Q3 2027",
    product: "PulseX",
    headline: "Launching Q3 2027",
    desc: "Next-generation multi-asset value processing and enterprise billing rails.",
    index: "03",
  },
] as const;

const NODE_SIZE = "h-[1.875rem] w-[1.875rem]"; // 30 px — keep in sync with connector top

// ─── Component ────────────────────────────────────────────────────────────────

export function EcosystemRoadmap() {
  return (
    <section className="border-b border-border bg-secondary py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Header */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Product Roadmap
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              The ENICE Group ecosystem roadmap.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              A phased rollout of the platforms we are building, each one
              engineered for institutional scale from day one.
            </p>
          </div>
        </Reveal>

        {/* ── Desktop timeline (md+) ─────────────────────────────────────── */}
        {/*
            Layout:
              [col 1 center]──────[col 2 center]──────[col 3 center]
            Each column owns two half-lines: left and right.
            The outer columns suppress their outer half so the line starts/ends
            exactly at the node edge, with no overflow.
        */}
        <div className="mt-16 hidden md:block">
          <div className="grid grid-cols-3">
            {MILESTONES.map((m, i) => {
              const isLive = (m.status as string) === "live";
              const isFirst = i === 0;
              const isLast = i === MILESTONES.length - 1;

              return (
                <div key={m.product} className="relative flex flex-col items-center">

                  {/* Left half-connector (suppressed on first node) */}
                  {!isFirst && (
                    <div className="absolute left-0 right-1/2 top-[0.9375rem] h-px -translate-y-1/2 bg-border" />
                  )}

                  {/* Right half-connector (suppressed on last node) */}
                  {!isLast && (
                    <div className="absolute left-1/2 right-0 top-[0.9375rem] h-px -translate-y-1/2 bg-border" />
                  )}

                  {/* Node ring */}
                  <div
                    className={`relative z-10 flex ${NODE_SIZE} items-center justify-center rounded-full border-2 ${
                      isLive
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border bg-secondary"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isLive ? "bg-emerald-500" : "bg-muted-foreground/35"
                      }`}
                    />
                  </div>

                  {/* Status label */}
                  <span
                    className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      isLive ? "text-emerald-500" : "text-muted-foreground"
                    }`}
                  >
                    {isLive ? "Live Now" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Cards row — aligned beneath each node */}
          <div className="mt-8 grid grid-cols-3 gap-8">
            {MILESTONES.map((m, i) => (
              <Reveal key={m.product} delay={i * 100}>
                <MilestoneCard m={m} />
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── Mobile timeline (< md) ─────────────────────────────────────── */}
        {/* Node + label inline above each card, no connector line */}
        <div className="mt-10 flex flex-col gap-8 md:hidden">
          {MILESTONES.map((m, i) => {
            const isLive = (m.status as string) === "live";
            return (
              <Reveal key={m.product} delay={i * 80}>
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex ${NODE_SIZE} items-center justify-center rounded-full border-2 ${
                        isLive
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-border bg-secondary"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isLive ? "bg-emerald-500" : "bg-muted-foreground/35"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                        isLive ? "text-emerald-500" : "text-muted-foreground"
                      }`}
                    >
                      {isLive ? "Live Now" : "Upcoming"}
                    </span>
                  </div>
                  <MilestoneCard m={m} />
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ─── Shared card ──────────────────────────────────────────────────────────────

function MilestoneCard({
  m,
}: {
  m: (typeof MILESTONES)[number];
}) {
  return (
    <div
      className="flex h-full flex-col rounded-xl border border-border bg-background p-8"
      style={{
        boxShadow:
          "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)",
      }}
    >
      {/* Index + quarter */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
          /{m.index}
        </span>
        <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground">
          {m.quarter}
        </span>
      </div>

      {/* Product name */}
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        {m.product}
      </h3>

      {/* Headline */}
      <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.16em] text-primary">
        {m.headline}
      </p>

      {/* Description */}
      <p className="mt-5 text-[13.5px] leading-relaxed text-muted-foreground">
        {m.desc}
      </p>
    </div>
  );
}
