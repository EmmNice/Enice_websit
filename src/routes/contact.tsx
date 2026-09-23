import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { useId, useRef, useState } from "react";
import { AlertCircle, ArrowRight, Check, Loader2, Mail, MapPin } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Eyebrow, Panel, Section, SectionIntro } from "@/components/site/primitives";
import { useSectionFields, fieldText } from "@/lib/cms/use-section";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
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
  head: () =>
    pageHead("/contact", [
      breadcrumbJsonLd([{ name: "Contact", path: "/contact" }]),
      {
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
      },
    ]),
  component: ContactPage,
});

// ─── Form treatments ──────────────────────────────────────────────────────────
//
// One spelling of each, shared by the fields below. Inputs sit on `surface-1` — a small lift of
// the canvas — with a hairline border, which is what makes a field legible on a near-black page
// without painting a white box on it. There is no bespoke focus ring: `:focus-visible` is defined
// once globally in `styles.css`.

const LABEL_CLASS = "block text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-soft";
const INPUT_CLASS =
  "mt-2 block w-full rounded-md border border-border bg-surface-1 px-3.5 py-2.5 text-sm text-foreground transition-colors placeholder:text-bone-faint hover:border-hairline-strong disabled:opacity-60 aria-[invalid=true]:border-destructive";
const ERROR_CLASS = "mt-1.5 text-[12px] text-destructive";

const EXPECTATIONS = [
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
];

function ContactPage() {
  // The page header, editable through the `contact.details` section.
  const details = useSectionFields("contact.details");

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
    <SiteShell>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <Section
        spacing="tight"
        container="narrow"
        grid
        glow="spread"
        aria-labelledby="contact-heading"
      >
        <SectionIntro
          level={1}
          id="contact-heading"
          eyebrow={fieldText(details, "eyebrow", "Corporate Engagement")}
          heading={fieldText(details, "heading", "Get in Touch")}
          lead={fieldText(
            details,
            "subheading",
            "Reach the ENICE Group team about product access, platform integration, enterprise licensing, or technology partnerships.",
          )}
        />
      </Section>

      {/* ── Form + sidebar ──────────────────────────────────────────────── */}
      <Section divider containerClassName="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          {/* Direct channels */}
          <Panel className="p-8">
            <Eyebrow as="h2">Direct Channels</Eyebrow>
            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                    Corporate
                  </div>
                  <a
                    href="mailto:corporate@enicehq.com"
                    className="tap mt-1 block text-sm break-all text-foreground transition-colors hover:text-gold"
                  >
                    corporate@enicehq.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                    Based in
                  </div>
                  <div className="mt-1 text-sm text-foreground">Abuja and Kaduna, Nigeria</div>
                  <div className="type-meta mt-0.5">WAT, UTC+1. Business hours 9am to 6pm</div>
                </div>
              </li>
            </ul>
          </Panel>

          {/* What to expect */}
          <Panel className="p-8">
            <Eyebrow as="h2">What to Expect</Eyebrow>
            <ol className="mt-6 space-y-5">
              {EXPECTATIONS.map((s) => (
                <li key={s.step} className="flex gap-4">
                  <span className="mt-0.5 shrink-0 font-mono text-[10px] font-semibold tracking-[0.18em] text-gold">
                    {s.step}
                  </span>
                  <div>
                    <div className="text-[12px] font-semibold text-foreground">{s.title}</div>
                    <p className="mt-1 text-[12px] leading-relaxed text-bone-soft">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>

          {/* Compliance note */}
          <Panel tone="quiet" className="px-6 py-5">
            <div className="flex items-start gap-3">
              <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2.5} />
              <p className="text-[12px] leading-relaxed text-bone-soft">
                All inquiries are handled under ENICE Group's privacy policy. We don't share your
                data with third parties without your consent.
              </p>
            </div>
          </Panel>
        </aside>

        {/* Form card */}
        <Panel raised className="p-8 sm:p-10">
          {phase === "done" ? (
            /* Success state — the one sanctioned use of the positive accent. */
            <div
              className="flex min-h-[420px] w-full max-w-full flex-col items-start justify-center overflow-hidden"
              role="status"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-positive/25 bg-positive/[0.08] text-positive">
                <Check aria-hidden className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h2 className="type-h3 mt-6 break-words text-foreground">Message received</h2>
              <p className="type-body mt-3 max-w-md break-words">
                Thanks, {form.name.trim().split(/\s+/)[0] || "there"}. Our team replies within one
                business day to{" "}
                <span className="font-medium break-all text-foreground">
                  {form.email || "the email you entered"}
                </span>
                .
              </p>
              <button type="button" onClick={resetForm} className="btn btn-secondary mt-8">
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
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/[0.08] px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
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
                <label className={LABEL_CLASS} htmlFor={`${id}-inquiry`}>
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
                  className={INPUT_CLASS}
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
                  <p id={`${id}-inquiry-err`} className={ERROR_CLASS}>
                    {errors.inquiry}
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor={`${id}-message`}>
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
                  className={`${INPUT_CLASS} resize-none`}
                />
                {errors.message && (
                  <p id={`${id}-message-err`} className={ERROR_CLASS}>
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
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-gold"
                />
                <span className="text-[13px] leading-relaxed text-bone-soft">
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
                className="btn btn-primary btn-lg group w-full"
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
        </Panel>
      </Section>
    </SiteShell>
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
      <label className={LABEL_CLASS} htmlFor={id}>
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
        className={INPUT_CLASS}
      />
      {error && (
        <p id={`${id}-err`} className={ERROR_CLASS}>
          {error}
        </p>
      )}
    </div>
  );
}
