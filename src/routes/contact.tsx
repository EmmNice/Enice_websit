import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { useId, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, Loader2, Mail, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SHADOW_CARD } from "@/lib/design";
import {
  EMPTY_CONTACT,
  FIELD_LIMITS,
  INQUIRY_OPTIONS,
  submitContact,
  validateContact,
  type ContactFieldErrors,
  type ContactFields,
} from "@/lib/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact ENICE Group" },
      {
        name: "description",
        content:
          "Reach ENICE Group about product access, platform integration, enterprise licensing, partnerships, or general inquiries at corporate@enicehq.com.",
      },
      { property: "og:title", content: "Contact ENICE Group" },
      {
        property: "og:description",
        content: "Get in touch about product access, integration, licensing, or partnerships.",
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
        content: "Get in touch about product access, integration, licensing, or partnerships.",
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
            "Reach ENICE Group about product access, platform integration, licensing, and partnerships.",
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

function ContactPage() {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  // Captured on first render so the server can reject submissions completed impossibly fast.
  const startedAtRef = useRef(Date.now());

  const [form, setForm] = useState<ContactFields>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | "submitting" | "done">("form");
  const [honeypot, setHoneypot] = useState("");

  const submitting = phase === "submitting";

  function set<K extends keyof ContactFields>(key: K, value: ContactFields[K]) {
    setForm((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function focusFirstError(nextErrors: ContactFieldErrors) {
    const order: (keyof ContactFields)[] = ["name", "email", "company", "inquiry", "message"];
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
  }

  function resetForm() {
    setForm(EMPTY_CONTACT);
    setErrors({});
    setFormError(null);
    setHoneypot("");
    startedAtRef.current = Date.now();
    setPhase("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    // The `full` variant additionally requires company and the inquiry category.
    const nextErrors = validateContact(form, "full");
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});
    setPhase("submitting");

    const outcome = await submitContact(form, {
      honeypot,
      startedAt: startedAtRef.current,
      source: "contact-page",
    });

    if (outcome.status === "ok") {
      setPhase("done");
      return;
    }

    setPhase("form");
    if (outcome.status === "invalid") {
      setErrors(outcome.fieldErrors);
      setFormError(outcome.message);
      focusFirstError(outcome.fieldErrors);
      return;
    }
    setFormError(outcome.message);
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
            Reach the ENICE Group team about product access, platform integration, enterprise
            licensing, or technology partnerships.
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
                    <div className="mt-1 text-sm text-foreground">Abuja, Nigeria</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      WAT, UTC+1. Business hours 9am to 6pm
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
                  {
                    step: "01",
                    title: "Review",
                    body: "We review your inquiry within one business day.",
                  },
                  {
                    step: "02",
                    title: "Routing",
                    body: "Your message goes to whoever is best placed to answer: engineering, commercial, or leadership.",
                  },
                  {
                    step: "03",
                    title: "Response",
                    body: "You get a real reply within two business days, not an auto-response.",
                  },
                ].map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary/60 mt-0.5 shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <div className="text-[12px] font-semibold text-foreground">{s.title}</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                        {s.body}
                      </p>
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
                  All inquiries are handled under ENICE Group's privacy policy. We don't share your
                  data with third parties without your consent.
                </p>
              </div>
            </div>
          </aside>

          {/* Form card */}
          <div
            className="rounded-xl border border-border bg-background p-8 sm:p-10"
            style={{ boxShadow: SHADOW_CARD }}
          >
            {phase === "done" ? (
              /* Success state */
              <div className="flex min-h-[420px] w-full max-w-full flex-col items-start justify-center overflow-hidden">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <h3 className="mt-6 break-words text-2xl font-semibold tracking-tight text-foreground">
                  Message received
                </h3>
                <p className="mt-3 max-w-md break-words text-sm leading-relaxed text-muted-foreground">
                  Thanks, {form.name.trim().split(/\s+/)[0] || "there"}. Our team replies within one
                  business day to{" "}
                  <span className="break-all font-medium text-foreground">
                    {form.email || "the email you entered"}
                  </span>
                  .
                </p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-5 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                ref={formRef}
                className="space-y-6"
                onSubmit={handleSubmit}
                noValidate
                aria-busy={submitting}
              >
                {/* Error banner */}
                {formError && (
                  <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p className="min-w-0 flex-1 break-words">
                      {formError} You can also email us directly at{" "}
                      <a href="mailto:corporate@enicehq.com" className="break-all underline">
                        corporate@enicehq.com
                      </a>
                      .
                    </p>
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id={`${id}-name`}
                    name="name"
                    label="Full Name"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    placeholder="Your full name"
                    maxLength={FIELD_LIMITS.name}
                    disabled={submitting}
                    error={errors.name}
                    required
                  />
                  <Field
                    id={`${id}-email`}
                    name="email"
                    label="Corporate Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    placeholder="jane@company.com"
                    maxLength={FIELD_LIMITS.email}
                    disabled={submitting}
                    error={errors.email}
                    required
                  />
                </div>

                <Field
                  id={`${id}-company`}
                  name="company"
                  label="Company / Institution"
                  value={form.company}
                  onChange={(v) => set("company", v)}
                  placeholder="Your company or institution"
                  maxLength={FIELD_LIMITS.company}
                  disabled={submitting}
                  error={errors.company}
                  required
                />

                <div>
                  <label
                    className="block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                    htmlFor={`${id}-inquiry`}
                  >
                    Nature of Inquiry
                  </label>
                  <select
                    id={`${id}-inquiry`}
                    data-field="inquiry"
                    value={form.inquiry}
                    onChange={(e) => set("inquiry", e.target.value)}
                    required
                    aria-required="true"
                    disabled={submitting}
                    aria-invalid={!!errors.inquiry}
                    aria-describedby={errors.inquiry ? `${id}-inquiry-err` : undefined}
                    className="mt-2 block w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none disabled:opacity-60 aria-[invalid=true]:border-destructive"
                  >
                    <option value="" disabled>
                      Select nature of inquiry…
                    </option>
                    {INQUIRY_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {errors.inquiry && (
                    <p id={`${id}-inquiry-err`} className="mt-1.5 text-[12px] text-destructive">
                      {errors.inquiry}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
                    htmlFor={`${id}-message`}
                  >
                    Message
                  </label>
                  <textarea
                    id={`${id}-message`}
                    data-field="message"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                    rows={6}
                    required
                    aria-required="true"
                    maxLength={FIELD_LIMITS.message}
                    disabled={submitting}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? `${id}-message-err` : undefined}
                    placeholder="Tell us about the product, integration, partnership, or access request."
                    className="mt-2 block w-full resize-none rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none disabled:opacity-60 aria-[invalid=true]:border-destructive"
                  />
                  {errors.message && (
                    <p id={`${id}-message-err`} className="mt-1.5 text-[12px] text-destructive">
                      {errors.message}
                    </p>
                  )}
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.updates}
                    onChange={(e) => set("updates", e.target.checked)}
                    disabled={submitting}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-input accent-primary"
                  />
                  <span className="text-[13px] leading-relaxed text-muted-foreground">
                    Also keep me updated on ENICE Group products and launches.
                  </span>
                </label>

                {/* Honeypot: hidden from users and assistive tech, irresistible to bots. */}
                <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px]">
                  <label htmlFor={`${id}-website`}>Website</label>
                  <input
                    id={`${id}-website`}
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Submitting
                    </>
                  ) : (
                    <>
                      Submit Inquiry
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </>
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
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  disabled,
  maxLength,
  error,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  error?: string;
}) {
  return (
    <div>
      <label
        className="block text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        data-field={name}
        type={type}
        value={value}
        required={required}
        aria-required={required}
        disabled={disabled}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 block w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none disabled:opacity-60 aria-[invalid=true]:border-destructive"
      />
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[12px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
