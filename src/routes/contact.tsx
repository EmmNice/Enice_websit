import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Check, Mail, MapPin, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ENICE Group" },
      {
        name: "description",
        content:
          "Connect with the ENICE Group executive or engineering office regarding integration, enterprise licensing, or venture partnerships.",
      },
      { property: "og:title", content: "Contact ENICE Group" },
      {
        property: "og:description",
        content: "Enterprise engagement and corporate inquiries — ENICE Group.",
      },
    ],
  }),
  component: ContactPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

// ─── Inquiry options ──────────────────────────────────────────────────────────

const INQUIRY_OPTIONS = [
  "Fintech Infrastructure Integration (PulsePay)",
  "Telecom / Banking AI Deployment (PulseAssist)",
  "Venture Strategic Partnership",
  "General Corporate Inquiry",
];

// ─── Formspree endpoint ───────────────────────────────────────────────────────
// Register a free form at https://formspree.io and replace this with your
// unique form ID: https://formspree.io/f/<YOUR_FORM_ID>

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xzzpkrnj";

// ─── Component ────────────────────────────────────────────────────────────────

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    inquiry: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.company.trim() || !form.message.trim())
      return;

    setStatus("submitting");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          inquiry: form.inquiry || "–",
          message: form.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* Page header */}
      <section className="border-b border-border py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Corporate Engagement
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl">
            Get in Touch
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Connect with the ENICE Group executive or engineering office regarding
            integration, enterprise licensing, or venture partnerships.
          </p>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]">

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            <div
              className="rounded-xl border border-border bg-background p-8"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Direct Channels
              </div>
              <ul className="mt-6 space-y-5">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-primary" strokeWidth={2} />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Corporate
                    </div>
                    <a
                      href="mailto:corporate@enicegroup.com"
                      className="mt-1 block text-sm text-foreground hover:text-primary transition-colors"
                    >
                      corporate@enicegroup.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" strokeWidth={2} />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Offices
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      Abuja · Kaduna, Nigeria
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div
              className="rounded-xl border border-border bg-background p-8"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Response SLA
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Formal inquiries are reviewed by an ENICE partner and responded to
                within two business days.
              </p>
            </div>
          </aside>

          {/* Form card */}
          <div
            className="rounded-xl border border-border bg-background p-8 sm:p-10"
            style={{ boxShadow: SHADOW_CARD }}
          >
            {status === "success" ? (
              /* Success state */
              <div className="flex h-full flex-col items-start justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                  <Check className="h-3.5 w-3.5" />
                  Inquiry Received
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                  Thank you, {form.name.split(" ")[0] || "partner"}.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Your submission has been routed to the appropriate ENICE office. A
                  partner will respond within two business days.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>

                {/* Error banner */}
                {status === "error" && (
                  <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    Something went wrong. Please try again or email us directly at{" "}
                    <a href="mailto:corporate@enicegroup.com" className="underline">
                      corporate@enicegroup.com
                    </a>
                    .
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="Jane Doe"
                    required
                  />
                  <Field
                    label="Corporate Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    placeholder="jane@company.com"
                    required
                  />
                </div>

                <Field
                  label="Company / Institution"
                  value={form.company}
                  onChange={(v) => setForm({ ...form, company: v })}
                  placeholder="Acme Bank PLC"
                  required
                />

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Nature of Inquiry
                  </label>
                  <select
                    value={form.inquiry}
                    onChange={(e) => setForm({ ...form, inquiry: e.target.value })}
                    required
                    className="mt-2 block w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="" disabled>Select nature of inquiry…</option>
                    {INQUIRY_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value.slice(0, 2000) })
                    }
                    rows={6}
                    required
                    placeholder="Describe the integration, partnership, or operational scope you'd like to discuss."
                    className="mt-2 block w-full resize-none rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Submitting…" : "Submit Inquiry"}
                  {status !== "submitting" && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>

              </form>
            )}
          </div>

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ─── Reusable field ───────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        maxLength={200}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 block w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}
