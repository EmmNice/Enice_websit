import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Building2,
  PhoneCall,
  Store,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENice Group — PulseAssist Voice AI Infrastructure" },
      {
        name: "description",
        content:
          "PulseAssist by ENice Group: enterprise-grade voice AI infrastructure with zero-latency streaming, CRM sync, and isolated multi-tenant security.",
      },
      { property: "og:title", content: "ENice Group — PulseAssist Voice AI" },
      {
        property: "og:description",
        content:
          "Next-generation voice AI infrastructure for enterprise scaling.",
      },
    ],
  }),
  component: Landing,
});

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-baseline">
        <span className="text-3xl font-black tracking-tighter text-primary leading-none">
          E
        </span>
        <span className="text-2xl font-extralight tracking-[0.18em] text-foreground leading-none -ml-0.5">
          NICE
        </span>
      </div>
      <span className="text-[9px] font-semibold tracking-[0.25em] text-muted-foreground border-l border-border pl-2">
        GROUP
      </span>
    </div>
  );
}

function Landing() {
  const navLinks = ["Solutions", "Infrastructure", "Pricing", "Documentation"];

  const capabilities = [
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
      title: "Commercial Growth Workspaces",
      desc: "Scale retail and service operations across locations while eliminating wait times with always-on AI front-desk coverage.",
      points: ["24/7 omnichannel cover", "Multi-location routing", "Live CRM hand-off"],
    },
  ];

  const infra = [
    {
      icon: Activity,
      title: "99.9% Infrastructure Uptime SLA",
      desc: "Active-active regions, automated failover, and transparent status reporting backed by an enterprise SLA.",
    },
    {
      icon: ShieldCheck,
      title: "Isolated Multi-Tenant Sandboxing",
      desc: "Database-enforced row-level security with per-tenant key isolation. Your data never crosses a tenant boundary.",
    },
    {
      icon: Layers,
      title: "Native Hybrid Billing & Metered Usage",
      desc: "Combine seats, minutes, and outcome-based pricing in a single contract — metered in real time, reconciled monthly.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hidden text-foreground hover:bg-secondary sm:inline-flex"
            >
              Client Login
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 sm:hidden"
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(800px 400px at 50% -10%, oklch(0.85 0.16 200 / 0.15), transparent 70%), radial-gradient(600px 300px at 80% 20%, oklch(0.6 0.18 260 / 0.12), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-5 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
              Introducing PulseAssist by ENice Group
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Next-Generation{" "}
              <span className="bg-gradient-to-r from-primary to-[oklch(0.7_0.15_220)] bg-clip-text text-transparent">
                Voice AI Infrastructure
              </span>{" "}
              for Enterprise Scaling.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              PulseAssist powers voice automation at planetary scale —
              zero-latency streaming, native CRM syncing, and a compliance-first
              control plane engineered for regulated industries.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-12 w-full bg-primary px-6 text-primary-foreground shadow-[0_0_40px_-10px_oklch(0.85_0.16_200/0.6)] hover:bg-primary/90 sm:w-auto"
              >
                Book an Enterprise Demo
                <ArrowRight className="ml-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full border-border bg-transparent px-6 text-foreground hover:bg-secondary hover:text-foreground sm:w-auto"
              >
                Read the Docs
              </Button>
            </div>
            <p className="mt-8 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Trusted by global telecom, finance & real estate leaders
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="solutions" className="border-t border-border/60 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Enterprise Core Capabilities
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Industry-tuned voice frameworks, deployed in days.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Purpose-built playbooks combining models, tools, and integrations
              for the verticals where every conversation counts.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {capabilities.map((c) => (
              <div
                key={c.title}
                className="group relative flex flex-col rounded-xl border border-border bg-card p-7 transition-colors hover:border-primary/40"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {c.desc}
                </p>
                <ul className="mt-6 space-y-2 border-t border-border/60 pt-5 text-sm">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section
        id="infrastructure"
        className="relative border-t border-border/60 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Security & Infrastructure
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                A control plane built for regulated scale.
              </h2>
              <p className="mt-4 text-muted-foreground">
                PulseAssist is engineered from the database up for tenant
                isolation, predictable performance, and transparent billing —
                so compliance teams ship as fast as product teams.
              </p>
              <Button
                variant="ghost"
                className="mt-6 px-0 text-primary hover:bg-transparent hover:text-primary"
              >
                Review the architecture <ArrowRight className="ml-1" />
              </Button>
            </div>

            <div className="space-y-4">
              {infra.map((i) => (
                <div
                  key={i.title}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 rounded-xl border border-border bg-card p-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                    <i.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-foreground">
                      {i.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {i.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Deploy enterprise voice AI in a single quarter.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Talk to an ENice solutions engineer about your contact volume,
            integrations, and compliance footprint.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 w-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:w-auto"
            >
              Book an Enterprise Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full border-border bg-transparent px-6 hover:bg-secondary hover:text-foreground sm:w-auto"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ENice Group. PulseAssist™ — All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
