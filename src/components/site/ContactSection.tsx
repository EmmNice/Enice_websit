import { useId, useRef, useState } from "react";
import { ArrowRight, Check, Clock, Loader2, Mail } from "lucide-react";
import {
  EMPTY_CONTACT,
  FIELD_LIMITS,
  submitContact,
  validateContact,
  type ContactFieldErrors,
  type ContactFields,
} from "@/lib/contact";
import { Eyebrow, Panel, Section } from "./primitives";

const CORPORATE_EMAIL = "corporate@enicehq.com";

/*
 * One spelling of each form treatment.
 *
 * Inputs sit on `surface-1` — a small lift of the near-black canvas — behind a hairline border,
 * which is what makes a field legible on a dark page without painting a white box on it. The
 * bespoke focus ring is gone: `:focus-visible` is defined once globally in `styles.css`.
 */
const inputClass =
  "mt-1.5 w-full rounded-md border border-border bg-surface-1 px-3.5 py-2.5 text-[14px] text-foreground transition-colors placeholder:text-bone-faint hover:border-hairline-strong disabled:opacity-60 aria-[invalid=true]:border-destructive";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-soft";
const errorClass = "mt-1.5 text-[12px] text-destructive";

/** Field order drives which input receives focus when validation fails. */
const FIELD_ORDER: (keyof ContactFields)[] = ["name", "email", "company", "message"];

/**
 * Compact contact form for the homepage.
 *
 * Asks only what is needed to reply, so anyone can reach the team without first declaring a
 * company. Submissions go to `POST /api/contact`, which emails corporate@enicehq.com with
 * the sender as `Reply-To`. The dedicated /contact page uses the same endpoint and the same
 * validation rules with its `full` variant.
 */
export function ContactSection() {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  // Captured on first render so the server can reject submissions completed impossibly fast.
  const startedAtRef = useRef(Date.now());

  const [values, setValues] = useState<ContactFields>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"form" | "submitting" | "done">("form");
  const [honeypot, setHoneypot] = useState("");

  const submitting = phase === "submitting";

  function set<K extends keyof ContactFields>(key: K, value: ContactFields[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function focusFirstError(nextErrors: ContactFieldErrors) {
    const first = FIELD_ORDER.find((key) => nextErrors[key]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
  }

  function reset() {
    setValues(EMPTY_CONTACT);
    setErrors({});
    setFormError(null);
    setHoneypot("");
    startedAtRef.current = Date.now();
    setPhase("form");
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return; // guards double-submit via Enter + click

    const nextErrors = validateContact(values, "compact");
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});
    setPhase("submitting");

    const outcome = await submitContact(values, {
      honeypot,
      startedAt: startedAtRef.current,
      source: "homepage",
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

  const messageRemaining = FIELD_LIMITS.message - values.message.length;

  return (
    <Section
      id="contact"
      container="narrow"
      divider
      glow="center"
      aria-labelledby="contact-heading"
    >
      <Panel raised className="p-6 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-start">
          {/* ── Left: pitch and direct channel ── */}
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 id="contact-heading" className="type-h2 mt-4 text-foreground">
              Talk to the team building it.
            </h2>
            <p className="type-body mt-3 max-w-md">
              Whether you are looking at product access, an integration, a partnership, or just have
              a question — send us a message and it reaches us directly.
            </p>

            <dl className="mt-8 space-y-5">
              <div className="flex items-start gap-3">
                <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
                <div>
                  <dt className={labelClass}>Email us directly</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${CORPORATE_EMAIL}`}
                      className="tap text-[14px] break-all text-foreground transition-colors hover:text-gold"
                    >
                      {CORPORATE_EMAIL}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={2} />
                <div>
                  <dt className={labelClass}>Response time</dt>
                  <dd className="mt-1 text-[14px] text-foreground">
                    Within one business day
                    <span className="type-meta mt-0.5 block">
                      Abuja &amp; Kaduna, Nigeria &middot; WAT (UTC+1)
                    </span>
                  </dd>
                </div>
              </div>
            </dl>
          </div>

          {/* ── Right: the form ── */}
          {phase === "done" ? (
            /* Success state — the one sanctioned use of the positive accent. */
            <div
              className="panel-quiet flex min-h-[340px] flex-col items-start justify-center p-8"
              role="status"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full border border-positive/25 bg-positive/[0.08]">
                <Check className="h-6 w-6 text-positive" strokeWidth={2.25} aria-hidden="true" />
              </div>
              <h3 className="type-h3 mt-6 text-foreground">Message sent.</h3>
              <p className="type-body mt-3 max-w-sm">
                Thanks{values.name.trim() ? `, ${values.name.trim().split(/\s+/)[0]}` : ""}. It has
                landed in our inbox and we will reply within one business day. Check your email for
                a confirmation.
              </p>
              <button type="button" onClick={reset} className="btn btn-secondary btn-sm mt-7">
                Send another message
              </button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={submitting}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor={`${id}-name`}>
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id={`${id}-name`}
                    data-field="name"
                    className={inputClass}
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    maxLength={FIELD_LIMITS.name}
                    required
                    aria-required="true"
                    disabled={submitting}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? `${id}-name-err` : undefined}
                  />
                  {errors.name && (
                    <p id={`${id}-name-err`} className={errorClass}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass} htmlFor={`${id}-email`}>
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id={`${id}-email`}
                    data-field="email"
                    type="email"
                    inputMode="email"
                    className={inputClass}
                    value={values.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    maxLength={FIELD_LIMITS.email}
                    required
                    aria-required="true"
                    disabled={submitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? `${id}-email-err` : undefined}
                  />
                  {errors.email && (
                    <p id={`${id}-email-err`} className={errorClass}>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass} htmlFor={`${id}-company`}>
                  Company{" "}
                  <span className="font-normal normal-case tracking-normal">(optional)</span>
                </label>
                <input
                  id={`${id}-company`}
                  data-field="company"
                  className={inputClass}
                  value={values.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Company or institution"
                  autoComplete="organization"
                  maxLength={FIELD_LIMITS.company}
                  disabled={submitting}
                  aria-invalid={!!errors.company}
                  aria-describedby={errors.company ? `${id}-company-err` : undefined}
                />
                {errors.company && (
                  <p id={`${id}-company-err`} className={errorClass}>
                    {errors.company}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <label className={labelClass} htmlFor={`${id}-message`}>
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id={`${id}-message`}
                  data-field="message"
                  rows={5}
                  className={`${inputClass} resize-none`}
                  value={values.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Tell us what you need — product access, an integration, a partnership, or a question."
                  maxLength={FIELD_LIMITS.message}
                  required
                  aria-required="true"
                  disabled={submitting}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? `${id}-message-err` : undefined}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {errors.message ? (
                    <p id={`${id}-message-err`} className="text-[12px] text-destructive">
                      {errors.message}
                    </p>
                  ) : (
                    <span />
                  )}
                  {messageRemaining <= 200 && (
                    <span className="tnum type-meta shrink-0">
                      {messageRemaining} characters left
                    </span>
                  )}
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={values.updates}
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

              {formError && (
                <p
                  role="alert"
                  className="mt-4 rounded-md border border-destructive/30 bg-destructive/[0.08] px-3 py-2.5 text-[13px] break-words text-destructive"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg group mt-5 w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Sending
                  </>
                ) : (
                  <>
                    Send message
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>

              <p className="type-meta mt-3 text-center">
                We only use your details to reply to you. Nothing is shared with third parties.
              </p>
            </form>
          )}
        </div>
      </Panel>
    </Section>
  );
}
