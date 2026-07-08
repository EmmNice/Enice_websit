import { Activity, ShieldCheck, Gauge } from "lucide-react";

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

const items = [
  { icon: Gauge, label: "Global API Latency", value: "14ms", sub: "p50, multi-region" },
  { icon: Activity, label: "Cross-Platform Uptime", value: "99.99%", sub: "rolling 90 days" },
  { icon: ShieldCheck, label: "Data Encryption", value: "AES-256", sub: "in transit and at rest" },
];

export function NetworkMetrics() {
  return (
    <section className="border-y border-border bg-secondary/60 py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-8 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Live Network Health
          </span>
        </div>
        <div
          className="grid overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-3"
          style={{ boxShadow: SHADOW_CARD }}
        >
          {items.map((it, i) => (
            <div
              key={it.label}
              className={`flex items-center gap-5 p-7 ${
                i !== 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""
              }`}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                <it.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {it.label}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight text-foreground">
                    {it.value}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{it.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
