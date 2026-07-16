import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

export function LegalPage({
  kicker,
  title,
  intro,
  sections,
}: {
  kicker: string;
  title: string;
  intro: string;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />
      <section className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {kicker}
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro}
          </p>
          <div className="mt-6 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Last updated · July 16, 2026
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div
            className="rounded-xl border border-border bg-background p-8 sm:p-12"
            style={{ boxShadow: SHADOW_CARD }}
          >
            <div className="space-y-10">
              {sections.map((s, i) => (
                <div key={s.heading}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-mono font-semibold tracking-[0.18em] text-muted-foreground">
                      /{String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {s.heading}
                    </h2>
                  </div>
                  <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                    {s.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
