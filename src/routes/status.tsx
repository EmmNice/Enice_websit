import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "System Status | ENICE Group" },
      {
        name: "description",
        content:
          "Live status for ENICE Group platforms, including PulsePay and PulseAssist.",
      },
    ],
  }),
  component: StatusPage,
});

const SERVICES = [
  { name: "PulsePay Network", status: "Operational", desc: "Card issuance, wallet, and transaction rails." },
  { name: "PulseAssist Engine", status: "Operational", desc: "Support routing and API layer." },
  { name: "ENICE Core APIs", status: "Operational", desc: "Ledger, KYC, and identity infrastructure." },
  { name: "Developer Sandbox", status: "Operational", desc: "Beta sandbox for integration partners." },
];

function StatusPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">

      <section className="border-b border-border bg-secondary/40 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            System Status
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-foreground sm:text-4xl md:text-5xl">
            All systems operational.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Live status for every ENICE Group platform. If you're having an
            issue that isn't reflected here, please contact our team.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            All Services Operational
          </div>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div
            className="overflow-hidden rounded-xl border border-border bg-background"
            style={{ boxShadow: "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)" }}
          >
            {SERVICES.map((s, i) => (
              <div
                key={s.name}
                className={`flex items-start justify-between gap-6 p-6 sm:p-7 ${
                  i !== 0 ? "border-t border-border" : ""
                }`}
              >
                <div>
                  <div className="text-[15px] font-semibold text-foreground">{s.name}</div>
                  <p className="mt-1 text-[13.5px] text-muted-foreground">{s.desc}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" strokeWidth={2.5} />
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-[12px] text-muted-foreground">
            Last checked: {new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
