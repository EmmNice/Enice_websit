import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Loader2 } from "lucide-react";
import {
  BUSINESS_TYPES,
  EMPTY_FIELDS,
  FIELD_LIMITS,
  submitEarlyAccess,
  validateEarlyAccess,
  type EarlyAccessFields,
  type FieldErrors,
} from "@/lib/early-access";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isPulseAssistEarlyAccessActive } from "@/lib/beta-announcement";

const inputClass =
  "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus:ring-destructive/15";
const labelClass = "text-[12px] font-semibold text-foreground";
const errorClass = "mt-1.5 text-[12px] text-destructive";

type Phase = "form" | "submitting" | "done";

/** Field order drives which input receives focus when validation fails. */
const FIELD_ORDER: (keyof EarlyAccessFields)[] = [
  "fullName",
  "email",
  "businessName",
  "businessType",
  "businessNeed",
];

export function PulseAssistEarlyAccessModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<EarlyAccessFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [honeypot, setHoneypot] = useState("");

  const submitting = phase === "submitting";

  const reset = useCallback(() => {
    setValues(EMPTY_FIELDS);
    setErrors({});
    setFormError(null);
    setPhase("form");
    setHoneypot("");
  }, []);

  // Clear state after the close animation so reopening never flashes stale content.
  useEffect(() => {
    if (open) return;
    const timer = setTimeout(reset, 220);
    return () => clearTimeout(timer);
  }, [open, reset]);

  function set<K extends keyof EarlyAccessFields>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear the field error as soon as the user starts correcting it.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function focusFirstError(nextErrors: FieldErrors) {
    const first = FIELD_ORDER.find((key) => nextErrors[key]);
    if (!first) return;
    formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
  }

  function requestClose(next: boolean) {
    // Never discard a submission that is already in flight.
    if (submitting) return;
    onOpenChange(next);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // guards double-submit via Enter + click

    const nextErrors = validateEarlyAccess(values);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }
    setErrors({});
    setPhase("submitting");

    const outcome = await submitEarlyAccess(values, honeypot);

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

  const needRemaining = FIELD_LIMITS.businessNeed - values.businessNeed.length;

  return (
    <Dialog open={open} onOpenChange={requestClose}>
      <DialogContent
        // `dvh` keeps the sheet inside the visual viewport when a mobile keyboard opens.
        // `gap-0` / `p-0` neutralise the shared DialogContent grid padding so the header
        // can carry its own divider and the body can scroll independently.
        className="flex max-h-[92dvh] w-[calc(100vw-2rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-xl border-border bg-background p-0 sm:w-full sm:rounded-xl"
        onEscapeKeyDown={(e) => submitting && e.preventDefault()}
        onInteractOutside={(e) => submitting && e.preventDefault()}
        onCloseAutoFocus={(e) => {
          // Let the triggering button reclaim focus naturally.
          if (submitting) e.preventDefault();
        }}
      >
        {phase === "done" ? (
          <div className="overflow-y-auto px-6 py-10 text-center sm:px-8">
            <div
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20"
              aria-hidden="true"
            >
              <Check className="h-6 w-6 text-primary" strokeWidth={2.25} />
            </div>
            <DialogHeader className="mt-5">
              <DialogTitle className="text-center text-2xl font-semibold tracking-tight text-foreground">
                You&apos;re on the list.
              </DialogTitle>
              <DialogDescription className="mt-3 text-center text-[14px] leading-relaxed text-muted-foreground">
                Thank you for your interest in PulseAssist. We&apos;ve received your request and
                will contact you by email when you&apos;re eligible for early access.
              </DialogDescription>
            </DialogHeader>
            {/* Announced to screen readers without stealing focus from the close button. */}
            <p role="status" className="sr-only">
              Your early-access request was received.
            </p>
            <button
              type="button"
              onClick={() => requestClose(false)}
              autoFocus
              className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* `pr-14` reserves room for the shared DialogContent close button. */}
            <DialogHeader className="shrink-0 border-b border-border px-6 pt-5 pr-14 pb-4 text-left sm:px-8 sm:pt-6 sm:pr-14 sm:pb-5">
              <div className="text-[11px] font-semibold tracking-[0.24em] text-primary uppercase">
                PulseAssist
              </div>
              <DialogTitle className="mt-1.5 text-xl font-semibold tracking-tight text-foreground sm:mt-2 sm:text-2xl">
                Get Early Access to PulseAssist
              </DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground sm:text-[14px]">
                PulseAssist is preparing for its next stage. Join the early-access list and be among
                the first businesses to experience it.
              </DialogDescription>
            </DialogHeader>

            <form
              ref={formRef}
              onSubmit={onSubmit}
              noValidate
              aria-busy={submitting}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-6 sm:px-8"
            >
              <div>
                <label className={labelClass} htmlFor={`${id}-name`}>
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  id={`${id}-name`}
                  data-field="fullName"
                  className={inputClass}
                  value={values.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={FIELD_LIMITS.fullName}
                  required
                  aria-required="true"
                  disabled={submitting}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? `${id}-name-err` : undefined}
                />
                {errors.fullName && (
                  <p id={`${id}-name-err`} className={errorClass}>
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor={`${id}-email`}>
                  Work Email <span className="text-destructive">*</span>
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

              <div>
                <label className={labelClass} htmlFor={`${id}-business`}>
                  Business Name <span className="text-destructive">*</span>
                </label>
                <input
                  id={`${id}-business`}
                  data-field="businessName"
                  className={inputClass}
                  value={values.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  placeholder="Company or organisation"
                  autoComplete="organization"
                  maxLength={FIELD_LIMITS.businessName}
                  required
                  aria-required="true"
                  disabled={submitting}
                  aria-invalid={!!errors.businessName}
                  aria-describedby={errors.businessName ? `${id}-business-err` : undefined}
                />
                {errors.businessName && (
                  <p id={`${id}-business-err`} className={errorClass}>
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor={`${id}-type`}>
                  Business Type <span className="text-destructive">*</span>
                </label>
                {/* Native select: fastest and most accessible option on mobile. */}
                <div className="relative">
                  <select
                    id={`${id}-type`}
                    data-field="businessType"
                    className={`${inputClass} cursor-pointer appearance-none pr-10`}
                    value={values.businessType}
                    onChange={(e) => set("businessType", e.target.value)}
                    required
                    aria-required="true"
                    disabled={submitting}
                    aria-invalid={!!errors.businessType}
                    aria-describedby={errors.businessType ? `${id}-type-err` : undefined}
                  >
                    <option value="">Select business type</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute top-1/2 right-3 mt-[3px] h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                {errors.businessType && (
                  <p id={`${id}-type-err`} className={errorClass}>
                    {errors.businessType}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor={`${id}-need`}>
                  What do you want PulseAssist to help your business with?{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  id={`${id}-need`}
                  data-field="businessNeed"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={values.businessNeed}
                  onChange={(e) => set("businessNeed", e.target.value)}
                  placeholder="Customer support automation, account queries, agent handoff..."
                  maxLength={FIELD_LIMITS.businessNeed}
                  disabled={submitting}
                  aria-invalid={!!errors.businessNeed}
                  aria-describedby={errors.businessNeed ? `${id}-need-err` : undefined}
                />
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {errors.businessNeed ? (
                    <p id={`${id}-need-err`} className="text-[12px] text-destructive">
                      {errors.businessNeed}
                    </p>
                  ) : (
                    <span />
                  )}
                  {needRemaining <= 120 && (
                    <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                      {needRemaining} characters left
                    </span>
                  )}
                </div>
              </div>

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
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[13px] break-words text-destructive"
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Sending request
                  </>
                ) : (
                  "Request Early Access"
                )}
              </button>

              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                We use your details only to review early-access requests for PulseAssist. Submitting
                this form does not grant product access.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Single shared entry point for every PulseAssist early-access CTA on the site. Renders a
 * button that opens the modal in place — it never navigates.
 *
 * Tied to the same beta launch window as the announcement modal: once that window closes, this
 * disappears from every page it's rendered on (product pages, the beta announcement, the beta
 * detail page) without needing to touch each call site individually.
 */
export function PulseAssistEarlyAccessButton({
  className,
  label = "Get Early Access",
  showIcon = true,
}: {
  className?: string;
  label?: string;
  showIcon?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!isPulseAssistEarlyAccessActive()) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
        {showIcon && (
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
            aria-hidden="true"
          />
        )}
      </button>
      {/* Kept mounted so Radix can run its close transition; the portal contents are only
          rendered while `open` is true. */}
      <PulseAssistEarlyAccessModal open={open} onOpenChange={setOpen} />
    </>
  );
}
