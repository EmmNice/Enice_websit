import { Reveal } from "./Reveal";

// ─── Stack items ──────────────────────────────────────────────────────────────

const STACK = [
  {
    name: "Amazon Web Services",
    abbr: "AWS",
    provider: null,
    label: "Cloud Infrastructure and Security Architecture",
    index: "01",
  },
  {
    name: "Google Cloud",
    provider: "and Gemini AI",
    label: "Core AI Engine and Computational Intelligence",
    sub: "Powering PulseAssist",
    index: "02",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function InfraStack() {
  return (
    <section className="border-t border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Header */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Technology Foundation
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              Core infrastructure and technology stack.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Every ENICE Group venture runs on the same institutional-grade
              backbone, chosen for reliability, compliance, and global scale.
            </p>
          </div>
        </Reveal>

        {/* Stack grid */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s, i) => (
            <Reveal key={s.name} delay={i * 70}>
              <div className="group flex h-full flex-col bg-background p-8 transition-colors hover:bg-secondary/60">

                {/* Index */}
                <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/50">
                  /{s.index}
                </span>

                {/* Name block */}
                <div className="mt-6 flex-1">
                  <p className="text-[22px] font-semibold leading-tight tracking-tight text-foreground">
                    {s.name}
                  </p>
                  {s.provider && (
                    <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                      {s.provider}
                    </p>
                  )}
                  {"abbr" in s && s.abbr && (
                    <p className="mt-1 font-mono text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/60">
                      {s.abbr}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 h-px w-full bg-border" />

                {/* Label */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </p>
                  {"sub" in s && s.sub && (
                    <p className="mt-2 text-[11px] font-medium text-primary/70">
                      {s.sub}
                    </p>
                  )}
                </div>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
