const milestones = [
  {
    when: "Q3 2026",
    title: "PulseAssist · Enterprise B2B Launch",
    body: "Roll out automated support modules to first-wave banking, fintech, and telecommunications partners.",
  },
  {
    when: "Q4 2026",
    title: "PulsePay · Multi-Currency Expansion",
    body: "Scale the virtual payment infrastructure with multi-currency wallets, programmable controls, and embedded treasury.",
  },
  {
    when: "2027 Horizon",
    title: "Universal Financial Hub",
    body: "Deploy a unified global virtual-dollar and asset-infrastructure layer connecting institutional liquidity worldwide.",
  },
];

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

        <ol className="mt-14 relative border-l border-border pl-8 sm:pl-10">
          {milestones.map((m) => (
            <li key={m.when} className="relative pb-12 last:pb-0">
              <span className="absolute -left-[37px] sm:-left-[45px] top-1.5 grid h-4 w-4 place-items-center rounded-full border border-primary bg-background">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-primary">
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
