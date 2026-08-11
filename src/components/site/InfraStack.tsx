import { Reveal } from "./Reveal";

const STACK = [
  {
    name: "Amazon Web Services",
    abbr: "AWS",
    label: "Cloud Infrastructure and Security Architecture",
    detail: "Primary cloud backbone powering compute, storage, and global edge delivery across ENICE Group platforms.",
    index: "01",
  },
  {
    name: "Google Cloud",
    abbr: "GCP",
    provider: "and Gemini AI",
    label: "Core AI Engine and Computational Intelligence",
    detail: "Powers PulseAssist's multi-tenant AI pipeline, LLM orchestration, and enterprise workflow automation.",
    index: "02",
  },
  {
    name: "Supabase",
    abbr: "PG",
    label: "Database Infrastructure and Auth Layer",
    detail: "Row-level security, real-time data streams, and managed Postgres for PulsePay's transactional systems.",
    index: "03",
  },
] as const;

export function InfraStack() {
  return (
    <section className="border-t border-border bg-background py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        <Reveal>
          <div className="mb-16 max-w-3xl">
            <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary">
              Technology Foundation
            </div>
            <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
              Core infrastructure
              <br />
              and technology stack.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
               Every ENICE Group product runs on the same institutional-grade
              backbone — chosen for reliability, compliance, and global scale,
              not convenience.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((s, i) => (
            <Reveal key={s.name} delay={i * 70}>
              <div className="group flex h-full flex-col bg-background p-8 transition-colors hover:bg-secondary/50 xl:p-10">

                <span className="font-mono text-[10px] font-bold tracking-[0.22em] text-muted-foreground/40">
                  /{s.index}
                </span>

                <div className="mt-6 flex-1">
                  <p className="text-[1.35rem] font-bold leading-tight tracking-tight text-foreground">
                    {s.name}
                  </p>
                  {"provider" in s && s.provider && (
                    <p className="mt-1 text-[13px] font-medium text-muted-foreground">
                      {s.provider}
                    </p>
                  )}
                  <p className="mt-1 font-mono text-[11px] font-bold tracking-[0.20em] text-muted-foreground/50">
                    {s.abbr}
                  </p>
                </div>

                <div className="my-6 h-px w-full bg-border" />

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground/70">
                    {s.detail}
                  </p>
                </div>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
