import { useId, useState } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BUSINESS_TYPES = [
  "Bank or financial institution",
  "Fintech",
  "Telecom",
  "Insurance",
  "E-commerce or retail",
  "Healthcare",
  "Logistics",
  "Government or public sector",
  "Startup",
  "Other",
];

type Fields = {
  fullName: string;
  email: string;
  businessName: string;
  businessType: string;
  businessNeed: string;
};

const EMPTY: Fields = {
  fullName: "",
  email: "",
  businessName: "",
  businessType: "",
  businessNeed: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: Fields) {
  const errors: Partial<Record<keyof Fields, string>> = {};
  if (values.fullName.trim().length < 2) errors.fullName = "Please enter your full name.";
  if (!EMAIL_RE.test(values.email.trim()))
    errors.email = "Please enter a valid work email address.";
  if (values.businessName.trim().length < 2)
    errors.businessName = "Please enter your business name.";
  if (!values.businessType) errors.businessType = "Please select your business type.";
  if (values.businessNeed.length > 1000)
    errors.businessNeed = "Please keep this under 1000 characters.";
  return errors;
}

const inputClass =
  "mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15";
const labelClass = "text-[12px] font-semibold text-foreground";

export function PulseAssistEarlyAccessModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const id = useId();
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  function set<K extends keyof Fields>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      // Reset after the close transition so the user does not see it flash.
      setTimeout(() => {
        setValues(EMPTY);
        setErrors({});
        setFormError(null);
        setDone(false);
        setHoneypot("");
      }, 200);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "pulseassist-early-access",
        {
          body: {
            fullName: values.fullName.trim(),
            email: values.email.trim().toLowerCase(),
            businessName: values.businessName.trim(),
            businessType: values.businessType,
            businessNeed: values.businessNeed.trim(),
            website: honeypot,
          },
        },
      );

      if (error) {
        let message = "Something went wrong. Please try again.";
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.text === "function") {
          try {
            const body = JSON.parse(await ctx.text());
            if (body?.code === "DUPLICATE" || body?.error) {
              message = body.error ?? message;
            }
            if (body?.fieldErrors) {
              const fieldErrors: Partial<Record<keyof Fields, string>> = {};
              for (const [key, list] of Object.entries(body.fieldErrors)) {
                if (Array.isArray(list) && list[0]) {
                  fieldErrors[key as keyof Fields] = String(list[0]);
                }
              }
              setErrors(fieldErrors);
              message = "Please correct the highlighted fields.";
            }
          } catch {
            /* keep the default message */
          }
        }
        setFormError(message);
        return;
      }

      if (data && data.ok === false) {
        setFormError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setDone(true);
    } catch {
      setFormError("We could not reach our servers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-lg overflow-y-auto rounded-xl border-border bg-background p-6 sm:p-8">
        {done ? (
          <div className="py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-6 w-6 text-primary" />
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
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="mt-7 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                PulseAssist
              </div>
              <DialogTitle className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Get Early Access to PulseAssist
              </DialogTitle>
              <DialogDescription className="text-[14px] leading-relaxed text-muted-foreground">
                PulseAssist is preparing for its next stage. Join the early-access list and be
                among the first businesses to experience it.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label className={labelClass} htmlFor={`${id}-name`}>
                  Full Name
                </label>
                <input
                  id={`${id}-name`}
                  className={inputClass}
                  value={values.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={120}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? `${id}-name-err` : undefined}
                />
                {errors.fullName && (
                  <p id={`${id}-name-err`} className="mt-1.5 text-[12px] text-destructive">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor={`${id}-email`}>
                  Work Email
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  className={inputClass}
                  value={values.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  maxLength={254}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${id}-email-err` : undefined}
                />
                {errors.email && (
                  <p id={`${id}-email-err`} className="mt-1.5 text-[12px] text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor={`${id}-business`}>
                  Business Name
                </label>
                <input
                  id={`${id}-business`}
                  className={inputClass}
                  value={values.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  placeholder="Company or organisation"
                  autoComplete="organization"
                  maxLength={160}
                  aria-invalid={!!errors.businessName}
                  aria-describedby={errors.businessName ? `${id}-business-err` : undefined}
                />
                {errors.businessName && (
                  <p id={`${id}-business-err`} className="mt-1.5 text-[12px] text-destructive">
                    {errors.businessName}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass} htmlFor={`${id}-type`}>
                  Business Type
                </label>
                <select
                  id={`${id}-type`}
                  className={inputClass}
                  value={values.businessType}
                  onChange={(e) => set("businessType", e.target.value)}
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
                {errors.businessType && (
                  <p id={`${id}-type-err`} className="mt-1.5 text-[12px] text-destructive">
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
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={values.businessNeed}
                  onChange={(e) => set("businessNeed", e.target.value)}
                  placeholder="Customer support automation, account queries, agent handoff..."
                  maxLength={1000}
                />
                {errors.businessNeed && (
                  <p className="mt-1.5 text-[12px] text-destructive">{errors.businessNeed}</p>
                )}
              </div>

              {/* Honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />

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
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending request
                  </>
                ) : (
                  "Request Early Access"
                )}
              </button>

              <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                We use your details only to review early-access requests for PulseAssist.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
        {showIcon && (
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        )}
      </button>
      <PulseAssistEarlyAccessModal open={open} onOpenChange={setOpen} />
    </>
  );
}
