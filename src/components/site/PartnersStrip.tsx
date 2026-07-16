/**
 * PartnersStrip — infinite marquee of ecosystem & infrastructure partners.
 * Duplicates the list so the scroll loops seamlessly.
 */

import { Cpu, Cloud, Database, Zap, ShieldCheck, Globe, Building2, Layers } from "lucide-react";

const PARTNERS = [
  { icon: Cloud,       label: "Amazon Web Services", sub: "Cloud Infrastructure" },
  { icon: Cpu,         label: "Google Cloud",         sub: "AI & Compute"        },
  { icon: Database,    label: "Supabase",              sub: "Database & Auth"     },
  { icon: Globe,       label: "Vercel",                sub: "Edge Delivery"       },
  { icon: ShieldCheck, label: "SMEDAN",                sub: "Institutional"       },
  { icon: Building2,   label: "AWS Activate",          sub: "Startup Program"     },
  { icon: Layers,      label: "NDPC",                  sub: "Data Compliance"     },
  { icon: Zap,         label: "Resend",                sub: "Transactional Email" },
] as const;

// Duplicate for seamless loop
const TRACK = [...PARTNERS, ...PARTNERS];

export function PartnersStrip() {
  return (
    <section className="overflow-hidden border-b border-border bg-background py-12">
      {/* Heading */}
      <p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/60">
        Ecosystem &amp; Infrastructure Partners
      </p>

      {/* Marquee — fade edges with mask */}
      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div className="flex animate-marquee gap-4 whitespace-nowrap">
          {TRACK.map((p, i) => (
            <div
              key={i}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-secondary/60 px-5 py-3 transition-colors hover:border-primary/20 hover:bg-secondary"
            >
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/10">
                <p.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-none tracking-tight text-foreground">
                  {p.label}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
                  {p.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
