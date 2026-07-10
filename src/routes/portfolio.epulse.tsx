import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Wallet, Send, Gift, Plane, Globe2, Building2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/epulse")({
  head: () => ({
    meta: [
      { title: "ePulse | ENICE Group" },
      {
        name: "description",
        content:
          "ePulse is ENICE Group's upcoming global financial platform for people who earn, send, and spend money across borders.",
      },
    ],
  }),
  component: EPulsePage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

const VISION = [
  { icon: Wallet, title: "Multi-currency accounts", desc: "Hold and manage balances in the currencies that matter to you." },
  { icon: Building2, title: "Dedicated receiving accounts", desc: "Local account details for supported countries, including the US, UK, and Europe." },
  { icon: Send, title: "Fast international transfers", desc: "Send money across borders with predictable timing and clear pricing." },
  { icon: Globe2, title: "Global payment solutions", desc: "Pay and get paid anywhere your work takes you." },
  { icon: Gift, title: "Gift card marketplace", desc: "Buy and redeem gift cards from trusted brands." },
  { icon: Plane, title: "Lifestyle services", desc: "Book hotels, plan travel, and access experiences from one app." },
];

function EPulsePage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-[11px] font-semibold tracking-[0.10em] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Coming Soon
          </div>

          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl md:text-7xl">
            e<span className="text-primary">Pulse</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A global financial platform for people who earn, send, and spend
            money across borders. Built for freelancers, remote workers,
            creators, and global businesses.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:corporate@enicehq.com?subject=Join%20the%20ePulse%20waitlist"
              className="group inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Join the Waitlist
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </a>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-6 py-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              Back to Portfolio
            </Link>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-3">
            <div
              className="rounded-lg border border-border bg-background p-4 text-left"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">In Development</div>
            </div>
            <div
              className="rounded-lg border border-border bg-background p-4 text-left"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Expected Launch
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">To Be Announced</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              The Vision
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              International finance, made simple.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VISION.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-border bg-background p-6"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                  <v.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-[16px] font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
