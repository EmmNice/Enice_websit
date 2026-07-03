import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

// ─── Announcements ────────────────────────────────────────────────────────────
// Update these entries as ENICE Group publishes new milestones or press items.

const POSTS = [
  {
    tag: "Announcement",
    date: "Jun 2026",
    title: "ENICE Group establishes its Shared Ecosystem Infrastructure framework.",
    excerpt:
      "A unified AI pipeline, high-velocity ledger, and automated compliance backbone now underpins every venture within the ENICE Group ecosystem.",
  },
  {
    tag: "Product",
    date: "May 2026",
    title: "PulsePay advances to extended pilot phase with regional treasury partners.",
    excerpt:
      "Programmable wallets, instant virtual card issuance, and embedded compliance controls enter a broader pilot cohort across West Africa.",
  },
  {
    tag: "Engineering",
    date: "Apr 2026",
    title: "PulseAssist: how policy-bound agents operate inside regulated institutions.",
    excerpt:
      "An engineering overview of autonomous support workflows built with auditable, deterministic guardrails for banking and telecommunications.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PressSection() {
  return (
    <section className="border-t border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Press · Announcements
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
                Latest from ENICE Group.
              </h2>
            </div>
            <a
              href="mailto:corporate@enicegroup.com"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Press inquiries
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {POSTS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <article
                className="group flex h-full flex-col rounded-xl border border-border bg-background p-8 transition-all hover:-translate-y-0.5"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <span className="text-primary">{p.tag}</span>
                  <span>{p.date}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-snug tracking-tight text-foreground">
                  {p.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {p.excerpt}
                </p>
                <div className="mt-auto pt-8 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary">
                  Read brief
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
