import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

// ─── Component ────────────────────────────────────────────────────────────────

export function Careers() {
  return (
    <section id="careers" className="border-t border-border bg-secondary/60 py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Join the builders
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          Build products that matter.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          We work with people who care about product quality, solid engineering, and technology that
          holds up at real scale. If that sounds like you, we want to hear from you.
        </p>
        <Link
          to="/contact"
          className="group mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          Meet the team
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        </Link>
      </div>
    </section>
  );
}
