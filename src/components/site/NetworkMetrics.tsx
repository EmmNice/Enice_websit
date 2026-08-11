import { Activity, ShieldCheck, Gauge, Zap, Lock } from "lucide-react";

const items = [
  {
    icon: Gauge,
    label: "Global API Latency",
    value: "14ms",
    sub: "p50, multi-region",
  },
  {
    icon: Activity,
    label: "Cross-Platform Uptime",
    value: "99.99%",
    sub: "rolling 90 days",
  },
  {
    icon: ShieldCheck,
    label: "Data Encryption",
    value: "AES-256",
    sub: "in transit and at rest",
  },
  {
    icon: Zap,
    label: "Card Issuance Speed",
    value: "< 5s",
    sub: "virtual card provisioning",
  },
  {
    icon: Lock,
    label: "KYC Verification",
    value: "Real-time",
    sub: "automated compliance checks",
  },
];

export function NetworkMetrics() {
  return (
    <section className="border-y border-border bg-secondary/50 py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        <div className="mb-10 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-muted-foreground">
            Live network health
          </span>
        </div>

        <div
          className="grid overflow-hidden rounded-2xl border border-border bg-background sm:grid-cols-2 lg:grid-cols-5"
          style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 6px rgba(17,24,39,0.05)" }}
        >
          {items.map((it, i) => (
            <div
              key={it.label}
              className={`flex flex-col justify-between gap-4 p-7 ${
                i !== 0 ? "border-t border-border sm:border-t-0 sm:border-l lg:border-l" : ""
              } ${i === 2 ? "sm:border-t sm:border-l-0 lg:border-t-0 lg:border-l" : ""}`}
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15">
                <it.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  {it.label}
                </div>
                <div className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">
                  {it.value}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{it.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
