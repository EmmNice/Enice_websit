import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bitcoin, Lock, Globe, Layers } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/portfolio/pulsex")({
  head: () => ({
    meta: [
      { title: "PulseX | ENICE Group" },
      {
        name: "description",
        content:
          "PulseX is ENICE Group's next-generation digital asset platform, designed to make cryptocurrency simple, secure, and accessible. Launching Q3 2027.",
      },
    ],
  }),
  component: PulseXPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

const HIGHLIGHTS = [
  {
    icon: Bitcoin,
    title: "Multi-asset trading",
    desc: "Trade major digital assets with deep liquidity and institutional-grade execution.",
  },
  {
    icon: Lock,
    title: "Secure custody",
    desc: "Cold storage, multi-signature protection, and continuous monitoring for every asset.",
  },
  {
    icon: Layers,
    title: "Ecosystem-native",
    desc: "Move seamlessly between PulseX, PulsePay, and ePulse without leaving the ENICE stack.",
  },
  {
    icon: Globe,
    title: "Built for scale",
    desc: "Global access with compliance and reporting designed for regulated markets from day one.",
  },
];

function PulseXPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(37,99,235,0.10) 0%, transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 80%)",
          }}
        />

        <div className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-[11px] font-semibold tracking-[0.10em] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Coming Q3 2027
          </div>

          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-6xl md:text-7xl">
            Pulse<span className="text-primary">X</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The next-generation digital asset platform from ENICE Group.
            Designed to make cryptocurrency and digital finance simple, secure,
            and accessible for everyone.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:corporate@enicehq.com?subject=Join%20the%20PulseX%20waitlist"
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

          {/* Status meta */}
          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div
              className="rounded-lg border border-border bg-background p-4 text-left"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">Planned Project</div>
            </div>
            <div
              className="rounded-lg border border-border bg-background p-4 text-left"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Expected Launch
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">Q3 2027</div>
            </div>
            <div
              className="col-span-2 rounded-lg border border-border bg-background p-4 text-left sm:col-span-1"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Category
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground">Digital Assets</div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-secondary py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              What to Expect
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Digital assets, without the friction.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              PulseX will let users manage digital assets with a seamless
              experience, integrated across the broader ENICE ecosystem.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="flex gap-4 rounded-xl border border-border bg-background p-6"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                  <h.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-foreground">{h.title}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
