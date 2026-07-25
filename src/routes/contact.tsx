import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { useState } from "react";
import { ArrowRight, Check, Mail, MapPin, AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ENICE Group | Enterprise Inquiries & Partnerships" },
      {
        name: "description",
        content:
          "Contact the ENICE Group executive and engineering office. Reach us about platform integration, enterprise licensing, venture partnerships, or general inquiries at corporate@enicehq.com.",
      },
      { property: "og:title", content: "Contact ENICE Group — Enterprise Inquiries & Partnerships" },
      {
        property: "og:description",
        content:
          "Enterprise integration, licensing, and partnership inquiries for ENICE Group. Contact us at corporate@enicehq.com.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { property: "og:image", content: `${SITE_URL}/og.png` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Contact ENICE Group" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      { name: "twitter:image", content: `${SITE_URL}/og.png` },
      { name: "twitter:title", content: "Contact ENICE Group" },
      {
        name: "twitter:description",
        content:
          "Enterprise integration, licensing, and partnership inquiries. Contact us at corporate@enicehq.com.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact ENICE Group",
          description:
            "Enterprise engagement and corporate inquiries for ENICE Group — platform integration, licensing, and venture partnerships.",
          url: `${SITE_URL}/contact`,
          publisher: {
            "@type": "Organization",
            name: "ENICE Group",
            url: SITE_URL,
            email: "corporate@enicehq.com",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Abuja",
              addressCountry: "NG",
            },
          },
        }),
      },
    ],
  }),
  component: ContactPage,
});

const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

// ─── Inquiry options ──────────────────────────────────────────────────────────

const INQUIRY_OPTIONS = [
  "Fintech Infrastructure Integration (PulsePay)",
  "Telecom or Banking AI Deployment (PulseAssist)",
  "Strategic Venture Partnership",
  "General Corporate Inquiry",
];

// ─── Contact endpoint ─────────────────────────────────────────────────────────
// Server-side Vercel function that forwards submissions to corporate@enicehq.com
// via Resend. See api/contact.ts.

const CONTACT_ENDPOINT = "/api/contact";

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
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.company.trim() || !form.message.trim())
      return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          inquiry: form.inquiry,
          message: form.message,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("success");
      } else {
        setErrorMessage(data?.error || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }


  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* Page header */}
      <section className="border-b border-border bg-[#060912] py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-400">
            Corporate Engagement
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
            Get in Touch
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
            Reach the ENICE Group executive and engineering office about
            integration, enterprise licensing, or venture partnerships.
          </p>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="bg-secondary py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]">

          {/* Sidebar */}
          <aside className="flex flex-col gap-6">
            {/* Direct channels */}
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
                      href="mailto:corporate@enicehq.com"
                      className="mt-1 block text-sm text-foreground hover:text-primary transition-colors"
                    >
                      corporate@enicehq.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-primary" strokeWidth={2} />
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Headquarters
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      Abuja, Nigeria
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      WAT — UTC+1 · Business hours 9am–6pm
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* What to expect */}
            <div
              className="rounded-xl border border-border bg-background p-8"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                What to Expect
              </div>
              <ol className="mt-6 space-y-5">
                {[
                  { step: "01", title: "Review", body: "A partner reviews your inquiry within one business day." },
                  { step: "02", title: "Routing", body: "Your message is routed to the most relevant team — engineering, commercial, or executive." },
                  { step: "03", title: "Response", body: "You receive a substantive reply within two business days — no auto-responses." },
                ].map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary/60 mt-0.5 shrink-0">{s.step}</span>
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">{s.title}</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Compliance note */}
            <div
              className="rounded-xl border border-border bg-secondary/60 px-6 py-5"
              style={{ boxShadow: SHADOW_CARD }}
            >
              <div className="flex items-start gap-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
                <p className="text-[12px] leading-relaxed text-muted-foreground">
                  All inquiries are handled under ENICE Group's privacy policy.
                  Data is never shared with third parties without explicit consent.
                </p>
              </div>
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
                  Your message has been routed to the right team. A partner will
                  respond within two business days.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>

                {/* Error banner */}
                {status === "error" && (
                  <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="min-w-0 flex-1 break-words">
                      {errorMessage || "Something went wrong."} You can also email us directly at{" "}
                      <a href="mailto:corporate@enicehq.com" className="break-all underline">
                        corporate@enicehq.com
                      </a>
                      .
                    </p>
                  </div>
                )}


                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full Name"
                    value={form.name}
                    onChange={(v) => setForm({ ...form, name: v })}
                    placeholder="Your full name"
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
                  placeholder="Your company or institution"
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
                    placeholder="Tell us about the integration, partnership, or project you'd like to discuss."
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
