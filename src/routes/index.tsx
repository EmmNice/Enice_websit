import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Banknote,
  BrainCircuit,
  ShieldCheck,
  Wifi,
  Lock,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENICE Group — Architecting the next generation of digital infrastructure" },
      {
        name: "description",
        content:
          "ENICE Group is a venture studio building high-performance fintech and enterprise AI infrastructure — home of PulsePay and PulseAssist.",
      },
      { property: "og:title", content: "ENICE Group" },
      {
        property: "og:description",
        content: "A stealth-grade venture ecosystem building fintech and enterprise AI.",
      },
    ],
  }),
  component: Landing,
});

function Logo({ size = "md" }: { size?: "md" | "sm" }) {
  const big = size === "md" ? "text-[1.35rem]" : "text-base";
  const tag = size === "md" ? "text-[9px]" : "text-[8px]";
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex items-baseline ${big} tracking-tight`}>
        <span className="font-extrabold text-foreground">E</span>
        <span className="font-light tracking-[0.28em] text-foreground/85 -ml-px">NICE</span>
      </div>
      <span
        className={`${tag} font-medium uppercase tracking-[0.32em] text-muted-foreground border-l border-border pl-2.5`}
      >
        Group
      </span>
    </div>
  );
}

function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage:
          "radial-gradient(ellipse 70% 60% at 50% 35%, black 40%, transparent 80%)",
      }}
    />
  );
}

function Landing() {
  const nav = [
    { label: "Ventures", href: "#ventures" },
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Contact", href: "#contact" },
  ];

  const verticals = [
    {
      icon: Boxes,
      kicker: "01",
      title: "Software Venture Studio",
      desc: "We architect, capitalize, and operate category-defining software ventures from zero to scale.",
    },
    {
      icon: Banknote,
      kicker: "02",
      title: "Financial Infrastructure",
      desc: "Programmable payment rails, virtual card issuance, and wallet primitives for the next financial era.",
    },
    {
      icon: BrainCircuit,
      kicker: "03",
      title: "Enterprise AI Automation",
      desc: "Production-grade AI systems that absorb operational load for banking, fintech, and telecommunications.",
    },
  ];

  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground/15">
      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8 lg:grid-cols-[auto_1fr_auto]">
          <Logo />
          <nav className="hidden justify-center lg:flex">
            <ul className="flex items-center gap-12 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {nav.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="transition-colors hover:text-foreground">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href="#contact"
            className="group inline-flex items-center gap-1.5 border border-border bg-foreground px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-all hover:bg-accent"
          >
            Get in touch
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <GridBackdrop />
        <div className="mx-auto max-w-6xl px-5 pb-28 pt-24 sm:px-8 sm:pb-40 sm:pt-32">
          <div className="mx-auto mb-10 inline-flex items-center gap-2.5 border border-border bg-card/60 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
            <span className="h-1 w-1 bg-foreground" />
            Stealth Venture Ecosystem · Est. 2024
          </div>

          <h1 className="max-w-5xl text-balance text-4xl font-medium leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Architecting the next generation of{" "}
            <span className="text-muted-foreground">digital infrastructure.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-pretty text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
            ENICE Group is a venture studio building, capitalizing, and operating
            high-performance fintech platforms and enterprise AI systems —
            engineered for regulated scale.
          </p>

          <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
            <a
              href="#ventures"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 bg-foreground px-7 text-sm font-semibold uppercase tracking-[0.18em] text-background transition-all hover:bg-accent sm:w-auto"
            >
              Explore Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#ecosystem"
              className="inline-flex h-12 w-full items-center justify-center border border-border px-7 text-sm font-medium uppercase tracking-[0.18em] text-foreground/85 transition-colors hover:bg-card sm:w-auto"
            >
              The Ecosystem
            </a>
          </div>

          {/* metrics strip */}
          <div className="mt-24 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
            {[
              ["02", "Active Ventures"],
              ["99.9%", "Infra Uptime SLA"],
              ["3", "Core Verticals"],
              ["24/7", "Operational Posture"],
            ].map(([k, v]) => (
              <div key={v} className="bg-background p-6">
                <div className="text-2xl font-semibold tracking-tight sm:text-3xl">{k}</div>
                <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CORE FOCUS ============ */}
      <section id="ecosystem" className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-end justify-between gap-8 border-b border-border pb-8">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                Ecosystem · Core Focus
              </div>
              <h2 className="mt-4 max-w-2xl text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl md:text-5xl">
                Three disciplines. One operating system.
              </h2>
            </div>
            <a
              href="#ventures"
              className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground transition-colors hover:text-foreground md:inline-flex"
            >
              View ventures
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid gap-px overflow-hidden bg-border md:grid-cols-3">
            {verticals.map((v) => (
              <article
                key={v.title}
                className="group relative flex flex-col bg-background p-8 transition-colors hover:bg-card sm:p-10"
              >
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
                  <span>{v.kicker}</span>
                  <v.icon className="h-4 w-4 text-foreground/70" strokeWidth={1.5} />
                </div>
                <h3 className="mt-12 text-xl font-medium tracking-tight sm:text-2xl">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
                <div className="mt-10 h-px w-full bg-border" />
                <div className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/70 transition-colors group-hover:text-foreground">
                  Learn more
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PORTFOLIO BENTO ============ */}
      <section id="ventures" className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Portfolio · Active Ventures
            </div>
            <h2 className="mt-4 text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl md:text-5xl">
              Operating ventures with their own gravity.
            </h2>
            <p className="mt-5 text-base font-light text-muted-foreground">
              Each ENICE venture is independently branded, fully capitalized, and
              built to lead its category.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* PulsePay */}
            <article className="group relative flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40">
              <div className="relative h-72 overflow-hidden border-b border-border bg-[oklch(0.09_0_0)]">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* virtual card mock */}
                <div className="absolute left-1/2 top-1/2 w-[78%] max-w-sm -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] transition-transform duration-500 group-hover:rotate-[-3deg] group-hover:scale-[1.02]">
                  <div
                    className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl border border-white/15 p-5 shadow-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.22 0 0) 0%, oklch(0.1 0 0) 60%, oklch(0.16 0 0) 100%)",
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-2xl"
                      style={{ background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)" }}
                    />
                    <div className="flex items-start justify-between text-foreground">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/80">
                        PulsePay
                      </div>
                      <Wifi className="h-4 w-4 rotate-90 text-foreground/70" />
                    </div>
                    <div className="mt-8 h-7 w-10 rounded-sm bg-gradient-to-br from-[#d8d8d8] to-[#8a8a8a]" />
                    <div className="mt-5 font-mono text-sm tracking-[0.18em] text-foreground/90">
                      4242 •••• •••• 0421
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.28em] text-foreground/50">
                          Cardholder
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-foreground/90">
                          E. NICE GROUP
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold italic tracking-tight text-foreground/80">
                        VIRTUAL
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  <span className="h-1 w-1 bg-foreground" /> Venture · Fintech
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  PulsePay
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  Next-generation virtual payment infrastructure and digital wallet
                  ecosystem — instant issuance, programmable controls, and embedded
                  treasury for modern businesses.
                </p>
                <a
                  href="#pulsepay"
                  className="group/btn mt-8 inline-flex w-fit items-center gap-2 border border-border bg-foreground px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-background transition-all hover:bg-accent"
                >
                  Visit PulsePay
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" />
                </a>
              </div>
            </article>

            {/* PulseAssist */}
            <article className="group relative flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-foreground/40">
              <div className="relative h-72 overflow-hidden border-b border-border bg-[oklch(0.09_0_0)]">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* AI queue visualization */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="w-full max-w-sm space-y-2.5">
                    {[
                      { id: "REQ_0421", state: "Resolved", w: "w-full", live: false },
                      { id: "REQ_0422", state: "Routing", w: "w-[82%]", live: false },
                      { id: "REQ_0423", state: "Processing", w: "w-[64%]", live: true },
                      { id: "REQ_0424", state: "Queued", w: "w-[46%]", live: false },
                      { id: "REQ_0425", state: "Queued", w: "w-[28%]", live: false },
                    ].map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center gap-3 border border-border/80 bg-background/60 px-3 py-2 backdrop-blur-sm"
                      >
                        <span
                          className={`relative flex h-1.5 w-1.5 shrink-0 ${
                            r.live ? "" : "opacity-50"
                          }`}
                        >
                          {r.live && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75" />
                          )}
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground" />
                        </span>
                        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                          {r.id}
                        </span>
                        <div className="relative ml-1 h-1 flex-1 overflow-hidden bg-border">
                          <div className={`h-full bg-foreground ${r.w}`} />
                        </div>
                        <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          {r.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  <span className="h-1 w-1 bg-foreground" /> Venture · Enterprise AI
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  PulseAssist
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted-foreground">
                  AI-driven operational support SaaS for banking, fintech, and
                  telecommunications — autonomous queue handling, escalation
                  intelligence, and policy-bound automations.
                </p>
                <a
                  href="#pulseassist"
                  className="group/btn mt-8 inline-flex w-fit items-center gap-2 border border-border bg-foreground px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-background transition-all hover:bg-accent"
                >
                  Explore PulseAssist
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ CREDIBILITY BANNER ============ */}
      <section className="border-t border-border bg-[oklch(0.09_0_0)] py-14">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center border border-border bg-background">
                <ShieldCheck className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Compliance
                </div>
                <div className="mt-1 text-sm font-medium tracking-tight text-foreground">
                  Registered Nano Enterprise
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-px overflow-hidden border border-border bg-border md:w-auto md:grid-cols-4">
              {[
                { icon: Lock, label: "SOC2-Aligned" },
                { icon: ShieldCheck, label: "RLS Enforced" },
                { icon: Wifi, label: "Active-Active" },
                { icon: Check, label: "Audit Ready" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2.5 bg-background px-5 py-3.5 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground"
                >
                  <b.icon className="h-3.5 w-3.5 text-foreground/80" strokeWidth={1.5} />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT / FOOTER ============ */}
      <footer id="contact" className="border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          {/* left: brand + links */}
          <div className="flex flex-col justify-between gap-12">
            <div>
              <Logo />
              <h3 className="mt-10 max-w-md text-3xl font-medium leading-[1.1] tracking-[-0.02em] sm:text-4xl">
                Venture inquiries, partnerships, and co-founders.
              </h3>
              <p className="mt-5 max-w-md text-sm font-light text-muted-foreground">
                We work with a select number of operators, capital partners, and
                enterprise clients each year. Tell us what you're building.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 border-t border-border pt-10 sm:grid-cols-3">
              {[
                {
                  title: "Ecosystem",
                  links: ["Ventures", "Studio", "Capital"],
                },
                {
                  title: "Ventures",
                  links: ["PulsePay", "PulseAssist"],
                },
                {
                  title: "Company",
                  links: ["About", "Press", "Careers"],
                },
              ].map((col) => (
                <div key={col.title}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    {col.title}
                  </div>
                  <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#" className="transition-colors hover:text-foreground">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* right: form */}
          <div className="border border-border bg-card p-8 sm:p-10">
            <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
              Venture Inquiries
            </div>
            <h4 className="mt-3 text-xl font-medium tracking-tight">
              Start a conversation
            </h4>

            {submitted ? (
              <div className="mt-8 border border-border bg-background p-6 text-sm text-foreground">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  <Check className="h-3.5 w-3.5" /> Received
                </div>
                <p className="mt-3 font-light text-muted-foreground">
                  Thank you. An ENICE partner will respond within two business days.
                </p>
              </div>
            ) : (
              <form
                className="mt-8 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
                  setSubmitted(true);
                }}
              >
                <Field
                  label="Full Name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="Jane Doe"
                  maxLength={100}
                />
                <Field
                  label="Work Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="jane@company.com"
                  maxLength={200}
                />
                <Field
                  label="Company"
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                  placeholder="Optional"
                  maxLength={120}
                />
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 1000) })}
                    rows={4}
                    placeholder="Tell us about your venture, partnership, or inquiry."
                    className="mt-2 block w-full resize-none border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="group mt-2 inline-flex w-full items-center justify-center gap-2 bg-foreground px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-background transition-all hover:bg-accent"
                >
                  Submit Inquiry
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 sm:flex-row sm:items-center sm:px-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              © {new Date().getFullYear()} ENICE Group — All rights reserved.
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Stealth Infrastructure · Built with intent
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 block w-full border-0 border-b border-border bg-transparent px-0 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-foreground focus:outline-none"
      />
    </div>
  );
}
