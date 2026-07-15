import { useEffect, useState } from "react";
import { Banknote, BrainCircuit, BookOpen, X, ArrowUpRight } from "lucide-react";

const TERMINAL_LINES = [
  { text: "$ curl -X GET https://api.enice.group/v1/core", color: "text-emerald-400" },
  { text: "", color: "" },
  { text: "{", color: "text-slate-300" },
  { text: '  "ecosystem": "ENICE Core",', color: "text-slate-300" },
  { text: '  "status": "operational",', color: "text-slate-300" },
  { text: '  "infrastructure": {', color: "text-slate-300" },
  { text: '    "ledger": "high-velocity",', color: "text-slate-300" },
  { text: '    "ai_pipeline": "multi-tenant",', color: "text-slate-300" },
  { text: '    "compliance": "automated",', color: "text-slate-300" },
  { text: '    "cloud_grid": "global-edge"', color: "text-slate-300" },
  { text: "  },", color: "text-slate-300" },
  { text: '  "ventures": ["PulsePay", "PulseAssist"],', color: "text-slate-300" },
  { text: '  "uptime_sla": "99.99%"', color: "text-slate-300" },
  { text: "}", color: "text-slate-300" },
];

const VENTURES = [
  {
    icon: Banknote,
    tag: "Fintech and Digital Payment Infrastructure",
    title: "PulsePay",
    desc: "Virtual card issuance, programmable wallets, peer-to-peer transfers, and embedded treasury for modern Nigerian commerce.",
  },
  {
    icon: BrainCircuit,
    tag: "Enterprise AI and Telecom",
    title: "PulseAssist",
    desc: "Autonomous support agents, policy-bound automations, and AI-driven workflow orchestration for banks and telecoms.",
  },
];

export function AboutMatrix() {
  const [shownLines, setShownLines] = useState(0);
  const [docsOpen, setDocsOpen] = useState(false);

  useEffect(() => {
    if (shownLines >= TERMINAL_LINES.length) return;
    const id = setTimeout(() => setShownLines((n) => n + 1), 180);
    return () => clearTimeout(id);
  }, [shownLines]);

  return (
    <section id="about" className="border-t border-border bg-background py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* Section header */}
        <div className="mb-14 max-w-3xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary">
            About · Venture Matrix
          </div>
          <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl">
            Building the systems
            <br />
            that power what's next.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            ENICE Group is a technology venture studio and parent ecosystem. We
            design our infrastructure from the ground up so every platform we
            incubate inherits institutional-grade scale, compliance, and
            reliability from day one.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">

          {/* Left: venture cards + docs link */}
          <div className="space-y-4">
            {VENTURES.map((v) => (
              <article
                key={v.title}
                className="rounded-xl border border-border bg-background p-7 transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 6px rgba(17,24,39,0.05)" }}
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary ring-1 ring-primary/15">
                    <v.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                      {v.tag}
                    </div>
                    <h3 className="mt-1.5 text-xl font-bold tracking-tight text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                      {v.desc}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            <button
              onClick={() => setDocsOpen(true)}
              className="group mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              Read API Docs
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
            </button>
          </div>

          {/* Right: animated terminal */}
          <div
            className="overflow-hidden rounded-xl border border-[#1f2937] bg-[#0b0f17] text-[13px]"
            style={{ boxShadow: "0 20px 60px -20px rgba(17,24,39,0.45)" }}
          >
            <div className="flex items-center justify-between border-b border-[#1f2937] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-slate-400">
                ENICE-CORE · api.enice.group
              </div>
              <span className="font-mono text-[10px] text-slate-500">v1</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono leading-[1.65]">
              {TERMINAL_LINES.slice(0, shownLines).map((line, i) => (
                <div key={i} className={line.color || "text-slate-300"}>
                  {line.text || "\u00A0"}
                </div>
              ))}
              {shownLines < TERMINAL_LINES.length && (
                <span className="inline-block h-3.5 w-1.5 animate-pulse bg-emerald-400 align-middle" />
              )}
            </pre>
          </div>

        </div>
      </div>

      {/* API Docs modal */}
      {docsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setDocsOpen(false)}
          />
          <div
            className="relative w-full max-w-2xl rounded-2xl border border-border bg-background p-8 sm:p-10"
            style={{ boxShadow: "0 30px 80px -20px rgba(17,24,39,0.35)" }}
          >
            <button
              onClick={() => setDocsOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md border border-border text-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="text-[10px] font-bold uppercase tracking-[0.26em] text-primary">
              API Documentation
            </div>
            <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              ENICE Core · Developer Reference
            </h3>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              The full developer reference is being finalized. The ENICE Core
              gateway exposes unified endpoints for ledger operations, AI
              orchestration, KYC and compliance, and edge delivery — accessible
              via REST and signed webhooks.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["GET /v1/core", "Ecosystem health and topology"],
                ["POST /v1/ledger/tx", "Submit a ledger transaction"],
                ["POST /v1/ai/query", "Invoke a tenant AI agent"],
                ["POST /v1/kyc/verify", "Run KYC verification"],
              ].map(([method, description]) => (
                <div key={method} className="rounded-lg border border-border bg-secondary/60 p-4">
                  <div className="font-mono text-[12px] text-primary">{method}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{description}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[12px] text-muted-foreground">
              Request developer access through the Corporate Inquiries form.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
