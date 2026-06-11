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
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ENICE Group — Architecting the next generation of digital infrastructure" },
      {
        name: "description",
        content:
          "ENICE Group is an enterprise venture ecosystem building high-performance fintech platforms and operational AI systems — home of PulsePay and PulseAssist.",
      },
      { property: "og:title", content: "ENICE Group" },
      {
        property: "og:description",
        content:
          "An institutional venture ecosystem building fintech and operational AI infrastructure.",
      },
    ],
  }),
  component: Landing,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const SHADOW_LIFT = "0 4px 6px -1px rgba(17,24,39,0.06), 0 10px 24px -8px rgba(17,24,39,0.08)";

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
        className={`${tag} font-semibold uppercase tracking-[0.32em] text-muted-foreground border-l border-border pl-2.5`}
      >
        Group
      </span>
    </div>
  );
}

function Landing() {
  const nav = [
    { label: "Ventures", href: "#ventures" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const verticals = [
    {
      icon: Boxes,
      kicker: "01 — Studio",
      title: "Software Venture Studio",
      desc: "We architect, capitalize, and operate category-defining software ventures from zero to scale.",
      bullets: ["Concept & Capitalization", "Product & Engineering", "Go-to-Market"],
    },
    {
      icon: Banknote,
      kicker: "02 — Fintech",
      title: "Financial Infrastructure",
      desc: "Programmable payment rails, virtual card issuance, and wallet primitives for the next financial era.",
      bullets: ["Issuing & Wallets", "Treasury & Ledger", "Compliance Tooling"],
    },
    {
      icon: BrainCircuit,
      kicker: "03 — AI",
      title: "Enterprise AI Systems",
      desc: "Production-grade AI systems that absorb operational load for banking, fintech, and telecommunications.",
      bullets: ["Autonomous Support", "Policy-Bound Agents", "Workflow Automation"],
    },
  ];

  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/15">
      {/* ============ NAV ============ */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8 lg:grid-cols-[auto_1fr_auto]">
          <Logo />
          <nav className="hidden justify-center lg:flex">
            <ul className="flex items-center gap-12 text-[12px] font-medium text-muted-foreground">
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
            className="group inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
          >
            Get in touch
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
          </a>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)",
          }}
        />
        <div className="mx-auto max-w-5xl px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-36 sm:pt-32">
          <div className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Enterprise Venture Ecosystem · Est. 2024
          </div>

          <h1 className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.5rem]">
            Architecting the next generation of{" "}
            <span className="text-primary">digital infrastructure.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            ENICE Group is an enterprise venture ecosystem building high-performance
            fintech platforms and operational AI systems — engineered for institutions,
            regulated industries, and category leaders.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#ventures"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto"
            >
              Explore Portfolio
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#about"
              className="inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              About ENICE Group
            </a>
          </div>

          {/* Metrics */}
          <div
            className="mt-20 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background md:grid-cols-4"
            style={{ boxShadow: SHADOW_CARD }}
          >
            {[
              ["02", "Active Ventures"],
              ["99.9%", "Infrastructure SLA"],
              ["3", "Core Verticals"],
              ["24/7", "Operational Posture"],
            ].map(([k, v], i) => (
              <div
                key={v}
                className={`p-6 text-left ${i !== 0 ? "border-t border-border md:border-l md:border-t-0" : ""} ${i === 1 ? "border-t md:border-t-0" : ""}`}
              >
                <div className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {k}
                </div>
                <div className="mt-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CORE VERTICALS ============ */}
      <section id="about" className="bg-secondary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Core Verticals
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
              Three disciplines. One operating system.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              The ENICE Group portfolio is organized around three deliberate
              competencies — each operated with institutional discipline.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {verticals.map((v) => (
              <article
                key={v.title}
                className="group relative flex flex-col rounded-xl border border-border bg-background p-8 transition-all hover:-translate-y-0.5"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15">
                    <v.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {v.kicker}
                  </span>
                </div>
                <h3 className="mt-8 text-xl font-semibold tracking-tight text-foreground">
                  {v.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
                <ul className="mt-7 space-y-2.5 border-t border-border pt-6">
                  {v.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-center gap-2.5 text-[13px] text-foreground/85"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                      {b}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PORTFOLIO ============ */}
      <section id="ventures" className="border-t border-border py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                Portfolio · Active Ventures
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
                Operating ventures with their own gravity.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Each ENICE venture is independently branded, fully capitalized, and
              built to lead its category.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {/* PulsePay */}
            <article
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:-translate-y-0.5"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative h-72 overflow-hidden border-b border-border bg-secondary">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.6]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="absolute left-1/2 top-1/2 w-[78%] max-w-sm -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] transition-transform duration-500 group-hover:rotate-[-3deg] group-hover:scale-[1.02]">
                  <div
                    className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl p-5 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.32 0.13 264) 0%, oklch(0.22 0.09 264) 60%, oklch(0.28 0.11 264) 100%)",
                      boxShadow: SHADOW_LIFT,
                    }}
                  >
                    <div
                      aria-hidden
                      className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-30 blur-2xl"
                      style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.6), transparent 70%)",
                      }}
                    />
                    <div className="flex items-start justify-between">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                        PulsePay
                      </div>
                      <Wifi className="h-4 w-4 rotate-90 text-white/80" />
                    </div>
                    <div className="mt-8 h-7 w-10 rounded-sm bg-gradient-to-br from-yellow-100 to-amber-300" />
                    <div className="mt-5 font-mono text-sm tracking-[0.18em] text-white/95">
                      4242 •••• •••• 0421
                    </div>
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <div className="text-[8px] uppercase tracking-[0.28em] text-white/60">
                          Cardholder
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.18em] text-white/95">
                          E. NICE GROUP
                        </div>
                      </div>
                      <CreditCard className="h-5 w-5 text-white/80" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  <span className="h-1 w-1 rounded-full bg-primary" /> Venture · Fintech
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  PulsePay
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  Next-generation virtual payment infrastructure and digital wallet
                  ecosystem — instant issuance, programmable controls, and embedded
                  treasury for modern businesses.
                </p>
                <a
                  href="#pulsepay"
                  className="group/btn mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Visit PulsePay
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" />
                </a>
              </div>
            </article>

            {/* PulseAssist */}
            <article
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:-translate-y-0.5"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="relative h-72 overflow-hidden border-b border-border bg-secondary">
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.6]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.05) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
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
                        className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                        style={{ boxShadow: "0 1px 2px rgba(17,24,39,0.04)" }}
                      >
                        <span
                          className={`relative flex h-1.5 w-1.5 shrink-0 ${
                            r.live ? "" : "opacity-50"
                          }`}
                        >
                          {r.live && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                          )}
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        </span>
                        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                          {r.id}
                        </span>
                        <div className="relative ml-1 h-1 flex-1 overflow-hidden rounded-full bg-border">
                          <div className={`h-full rounded-full bg-primary ${r.w}`} />
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          {r.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-8 sm:p-10">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  <span className="h-1 w-1 rounded-full bg-primary" /> Venture · Enterprise AI
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  PulseAssist
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  AI-driven operational support SaaS for banking, fintech, and
                  telecommunications — autonomous queue handling, escalation
                  intelligence, and policy-bound automations.
                </p>
                <a
                  href="#pulseassist"
                  className="group/btn mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  Explore PulseAssist
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" />
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ CREDIBILITY BAR ============ */}
      <section className="border-y border-border bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-border bg-background"
                style={{ boxShadow: SHADOW_CARD }}
              >
                <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Compliance
                </div>
                <div className="mt-0.5 text-sm font-semibold tracking-tight text-foreground">
                  Registered Nano Enterprise
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-4">
              {[
                { icon: Lock, label: "SOC2-Aligned" },
                { icon: ShieldCheck, label: "RLS Enforced" },
                { icon: Wifi, label: "Active-Active" },
                { icon: Check, label: "Audit Ready" },
              ].map((b) => (
                <div
                  key={b.label}
                  className="flex items-center gap-2.5 rounded-md border border-border bg-background px-4 py-2.5 text-[11px] font-semibold tracking-wide text-foreground/80"
                  style={{ boxShadow: SHADOW_CARD }}
                >
                  <b.icon className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CONTACT / FOOTER ============ */}
      <footer id="contact" className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="flex flex-col justify-between gap-12">
            <div>
              <Logo />
              <h3 className="mt-10 max-w-md text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground sm:text-4xl">
                Venture inquiries, partnerships, and corporate engagements.
              </h3>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                We work with a select number of operators, capital partners, and
                enterprise clients each year. Tell us what you're building.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 border-t border-border pt-10 sm:grid-cols-3">
              {[
                { title: "Ecosystem", links: ["Ventures", "Studio", "Capital"] },
                { title: "Ventures", links: ["PulsePay", "PulseAssist"] },
                { title: "Company", links: ["About", "Press", "Careers"] },
              ].map((col) => (
                <div key={col.title}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    {col.title}
                  </div>
                  <ul className="mt-4 space-y-2.5 text-sm text-foreground/80">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#" className="transition-colors hover:text-primary">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl border border-border bg-background p-8 sm:p-10"
            style={{ boxShadow: SHADOW_CARD }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Venture Inquiries
            </div>
            <h4 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
              Start a conversation
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              For corporate clients, partners, and institutional stakeholders.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-md border border-border bg-secondary p-6 text-sm">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  <Check className="h-3.5 w-3.5" /> Received
                </div>
                <p className="mt-3 text-muted-foreground">
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
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value.slice(0, 1000) })}
                    rows={4}
                    placeholder="Tell us about your venture, partnership, or inquiry."
                    className="mt-2 block w-full resize-none rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <button
                  type="submit"
                  className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90"
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
            <p className="text-[11px] font-medium text-muted-foreground">
              © {new Date().getFullYear()} ENICE Group — All rights reserved.
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Enterprise Infrastructure · Built with intent
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
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 block w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}
