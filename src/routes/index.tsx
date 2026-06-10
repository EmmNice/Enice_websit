import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  PhoneCall,
  Store,
  Zap,
  ShieldCheck,
  Receipt,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENice Group — PulseAssist Voice AI Infrastructure" },
      {
        name: "description",
        content:
          "PulseAssist by ENice Group: enterprise voice AI infrastructure with zero-latency streaming, native CRM sync, and isolated multi-tenant security.",
      },
      { property: "og:title", content: "ENice Group — PulseAssist" },
      {
        property: "og:description",
        content: "Next-generation voice AI infrastructure for enterprise scaling.",
      },
    ],
  }),
  component: Landing,
});

/* Palette tokens used in JSX:
   emerald   = primary  (#0d7a5f-ish, oklch 0.52 0.11 160)
   gold      = accent   (#c9a84c, oklch 0.78 0.12 85)
   cream     = foreground
   ink       = background (deep emerald-black)
*/

function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  const big = size === "md" ? "text-2xl" : "text-xl";
  const small = size === "md" ? "text-[10px]" : "text-[9px]";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex items-baseline ${big} font-display`}>
        <span className="font-bold tracking-tight text-primary">E</span>
        <span className="font-light tracking-[0.22em] text-foreground/90 -ml-px">
          NICE
        </span>
      </div>
      <span
        className={`${small} font-medium tracking-[0.3em] uppercase text-accent/80 border-l border-border pl-2.5`}
      >
        Group
      </span>
    </div>
  );
}

function Landing() {
  const nav = ["Solutions", "Infrastructure", "Pricing", "Documentation"];

  const cards = [
    {
      icon: Building2,
      title: "Luxury Real Estate",
      desc: "Qualify high-intent leads and automate private viewing bookings with concierge-grade voice agents trained on your inventory.",
      points: ["Lead scoring & routing", "Calendar-aware bookings", "Bilingual concierge tone"],
    },
    {
      icon: PhoneCall,
      title: "Telecom & Finance",
      desc: "Handle massive concurrent call volume with SOC-grade security and high-throughput line orchestration built for regulated industries.",
      points: ["10k+ concurrent calls", "PCI & SOC2 controls", "Sub-300ms latency"],
    },
    {
      icon: Store,
      title: "Commercial Growth",
      desc: "Scale retail and service operations across locations while eliminating wait times with always-on AI front-desk coverage.",
      points: ["24/7 omnichannel cover", "Multi-location routing", "Live CRM hand-off"],
    },
  ];

  const infra = [
    {
      icon: Zap,
      title: "99.9% Infrastructure Uptime SLA",
      desc: "Active-active regions, automated failover, and transparent status reporting backed by an enterprise SLA.",
    },
    {
      icon: ShieldCheck,
      title: "Isolated Multi-Tenant Sandboxing",
      desc: "Database-enforced row-level security with per-tenant key isolation. Your data never crosses a tenant boundary.",
    },
    {
      icon: Receipt,
      title: "Native Hybrid Billing & Metered Usage",
      desc: "Combine seats, minutes, and outcome-based pricing in a single contract — metered in real time, reconciled monthly.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-accent/30">
      {/* ============= HEADER ============= */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8 lg:grid-cols-[auto_1fr_auto]">
          <Logo />
          <nav className="hidden justify-center lg:flex">
            <ul className="flex items-center gap-10 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {nav.map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="transition-colors hover:text-accent"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href="#login"
            className="inline-flex items-center justify-center border border-accent/40 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent/10"
          >
            Client Login
          </a>
        </div>
      </header>

      {/* ============= HERO ============= */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px 480px at 50% 30%, oklch(0.45 0.11 160 / 0.22), transparent 65%), radial-gradient(500px 280px at 80% 10%, oklch(0.78 0.12 85 / 0.07), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-5 pb-28 pt-20 text-center sm:px-8 sm:pb-36 sm:pt-28">
          <div className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.28em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Introducing PulseAssist by ENice Group
          </div>

          <h1 className="text-balance text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[5rem]">
            Next-Generation{" "}
            <span className="italic text-primary">Voice AI Infrastructure</span>
            <br className="hidden sm:block" /> for Enterprise Scaling.
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            PulseAssist powers voice automation at planetary scale — zero-latency
            streaming, native CRM syncing, and a compliance-first control plane
            engineered for regulated industries.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#demo"
              className="inline-flex h-12 w-full items-center justify-center bg-primary px-7 text-sm font-semibold tracking-wide text-primary-foreground shadow-[0_0_40px_-12px_oklch(0.52_0.11_160/0.7)] transition-all hover:bg-primary/90 sm:w-auto"
            >
              Book an Enterprise Demo
            </a>
            <a
              href="#docs"
              className="inline-flex h-12 w-full items-center justify-center border border-accent/40 px-7 text-sm font-medium tracking-wide text-accent transition-colors hover:bg-accent/10 sm:w-auto"
            >
              Read the Docs
            </a>
          </div>

          <p className="mt-16 text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground/70">
            Trusted by Global Telecom, Finance &amp; Real Estate Leaders
          </p>
        </div>
      </section>

      {/* ============= CAPABILITIES ============= */}
      <section
        id="solutions"
        className="border-t border-border/40 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
              Enterprise Core Capabilities
            </div>
            <h2 className="mt-5 text-3xl font-medium leading-[1.15] sm:text-4xl md:text-[2.75rem]">
              Industry-tuned voice frameworks,
              <br className="hidden md:inline" /> deployed in days.
            </h2>
            <p className="mt-5 max-w-xl text-base font-light text-muted-foreground">
              Purpose-built playbooks combining models, tools, and integrations
              for the verticals where every conversation counts.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {cards.map((c) => (
              <article
                key={c.title}
                className="group relative flex flex-col border border-border bg-card/60 p-8 transition-colors hover:border-accent/50"
              >
                <div className="mb-7 flex h-11 w-11 items-center justify-center border border-accent/30 bg-accent/10 text-accent">
                  <c.icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  {c.desc}
                </p>
                <ul className="mt-7 space-y-3 border-t border-border/60 pt-6 text-[11px] uppercase tracking-[0.18em] text-foreground/80">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5">
                      <span className="h-1.5 w-1.5 bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============= INFRASTRUCTURE ============= */}
      <section
        id="infrastructure"
        className="border-t border-border/40 py-24 sm:py-32"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
              Security &amp; Infrastructure
            </div>
            <h2 className="mt-5 text-3xl font-medium leading-[1.15] sm:text-4xl">
              A control plane built for regulated scale.
            </h2>
            <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground">
              PulseAssist is engineered from the database up for tenant
              isolation, predictable performance, and transparent billing — so
              compliance teams ship as fast as product teams.
            </p>
            <a
              href="#architecture"
              className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent transition-colors hover:text-accent/80"
            >
              Review the architecture
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          </div>

          <div className="space-y-4">
            {infra.map((i) => (
              <div
                key={i.title}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-6 border border-border bg-card/40 p-6 sm:p-7"
              >
                <div className="shrink-0 text-primary">
                  <i.icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-medium tracking-tight">
                    {i.title}
                  </h3>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-muted-foreground">
                    {i.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============= FINAL CTA ============= */}
      <section className="border-t border-border/40 bg-[oklch(0.21_0.018_160)] py-24 text-center sm:py-32">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <h2 className="text-3xl font-medium leading-[1.15] sm:text-4xl md:text-[2.5rem]">
            Deploy enterprise voice AI in a single quarter.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base font-light text-muted-foreground">
            Talk to an ENice solutions engineer about your contact volume,
            integrations, and compliance footprint.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#demo"
              className="inline-flex h-12 w-full items-center justify-center bg-primary px-8 text-sm font-semibold tracking-wide text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto"
            >
              Book an Enterprise Demo
            </a>
            <a
              href="#sales"
              className="inline-flex h-12 w-full items-center justify-center border border-border px-8 text-sm font-medium tracking-wide text-foreground/80 transition-colors hover:text-accent sm:w-auto"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* ============= FOOTER ============= */}
      <footer className="border-t border-border/40 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <Logo size="sm" />
          <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70">
            © {new Date().getFullYear()} ENice Group · PulseAssist™ — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
