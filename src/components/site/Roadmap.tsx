// ─── Strategic Roadmap ────────────────────────────────────────────────────────
// Each milestone represents a confirmed execution phase. Update as timelines
// are confirmed or new phases are added.

const MILESTONES = [
  {
    when: "Q3 2026",
    title: "PulseAssist · Enterprise B2B Launch",
    body: "First-wave rollout of autonomous support modules to banking, fintech, and telecommunications partners across the region.",
  },
  {
    when: "Q4 2026",
    title: "PulsePay · Multi-Currency Expansion",
    body: "Scale the virtual payment infrastructure with multi-currency wallet rails, programmable spend controls, and embedded treasury operations.",
  },
  {
    when: "2027",
    title: "Universal Financial Hub",
    body: "Deploy a unified global virtual-dollar and asset-infrastructure layer connecting institutional liquidity across markets.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function Roadmap() {
  return (
    <section id="roadmap" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">

        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Strategic Roadmap
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
          A scaling trajectory built for global reach.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Our infrastructure roadmap mirrors the maturity curve of the platforms
          we operate — sequenced for compounding execution.
        </p>

        <ol className="relative mt-14 border-l border-border pl-8 sm:pl-10">
          {MILESTONES.map((m) => (
            <li key={m.when} className="relative pb-12 last:pb-0">
              <span className="absolute -left-[37px] top-1.5 grid h-4 w-4 place-items-center rounded-full border border-primary bg-background sm:-left-[45px]">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {m.when}
              </div>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {m.title}
              </h3>
              <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
                {m.body}
              </p>
            </li>
          ))}
        </ol>

      </div>
    </section>
  );
}
