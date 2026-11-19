import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/site/primitives";
import { pageHead } from "@/lib/seo";
import {
  EMPTY_WAITLIST,
  submitWaitlist,
  validateWaitlist,
  WAITLIST_INTERESTS,
  WAITLIST_LIMITS,
  type WaitlistFields,
} from "@/lib/waitlist";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/waitlist")({
  head: () => pageHead("/waitlist"),
  component: WaitlistPage,
});

const LABEL_CLASS = "block text-[12px] font-semibold text-bone-strong";
const INPUT_CLASS =
  "mt-2 block w-full rounded-md border border-border bg-surface-1 px-3.5 py-3 text-[15px] text-foreground transition-colors placeholder:text-bone-faint hover:border-hairline-strong focus:border-[var(--pulsepay-accent)] focus:outline-none disabled:opacity-60 aria-[invalid=true]:border-destructive";
const ERROR_CLASS = "mt-1.5 text-[12px] text-destructive";

/**
 * The PulsePay early-access page.
 *
 * Two steps on one page: an email-first sign-up and the features the person is looking forward to.
 * Consent to be contacted is a separate, unticked box rather than an implication of signing up,
 * because the list is later used to announce the launch.
 */
function WaitlistPage() {
  const [fields, setFields] = useState<WaitlistFields>(EMPTY_WAITLIST);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "already">("idle");
  const [formError, setFormError] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    document.title = "Join the PulsePay waitlist | ENICE Group";
  }, []);

  const clear = (key: string) =>
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });

  const set = (key: "name" | "email" | "phone") => (value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    clear(key);
  };

  const toggleInterest = (id: string) => {
    setFields((current) => ({
      ...current,
      interests: current.interests.includes(id)
        ? current.interests.filter((i) => i !== id)
        : [...current.interests, id],
    }));
    clear("interests");
  };

  const sending = state === "sending";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    const found = validateWaitlist(fields);
    if (Object.keys(found).length > 0) {
      setErrors(found as Record<string, string>);
      setFormError("");
      document.querySelector<HTMLElement>(`[data-field="${Object.keys(found)[0]}"]`)?.focus();
      return;
    }

    setState("sending");
    setFormError("");
    const result = await submitWaitlist({
      fields,
      source: "/waitlist",
      website: honeypot,
      startedAt,
    });

    if (result.ok) {
      setState(result.status === "already_joined" ? "already" : "done");
      return;
    }
    setState("idle");
    setFormError(result.error);
  };

  if (state === "done" || state === "already") {
    return (
      <SiteShell>
        <section className="py-20 sm:py-28">
          <Container className="max-w-xl text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[var(--pulsepay-accent)]/40 text-[var(--pulsepay-accent)]">
              <Check aria-hidden className="h-6 w-6" strokeWidth={2} />
            </span>
            <h1 className="mt-6 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              {state === "already" ? "You are already on the list." : "You are on the list."}
            </h1>
            <p className="mt-4 text-[1.0625rem] leading-relaxed text-bone-strong">
              {state === "already"
                ? "We already have these details, so there is nothing more to do. We will be in touch when PulsePay opens."
                : "Thank you. We will write to you when PulsePay opens, with early access details. There is nothing to pay and nothing more you need to do."}
            </p>
          </Container>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <section className="py-14 sm:py-20" aria-labelledby="waitlist-heading">
        <Container className="max-w-2xl">
          <img
            src="/brand/pulsepay-mark.png"
            alt=""
            aria-hidden
            width={56}
            height={65}
            className="h-14 w-auto"
          />

          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--pulsepay-accent)]/40 px-3 py-1 text-[11px] font-semibold tracking-wide text-[var(--pulsepay-accent)]">
            Coming soon
          </p>

          <h1
            id="waitlist-heading"
            className="mt-5 text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl"
          >
            Your money. Your way. Your PulsePay.
          </h1>
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-bone-strong">
            We are building a better way to manage everyday payments. Be among the first to
            experience PulsePay.
          </p>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-10 rounded-xl border border-border bg-surface-1/60 p-5 sm:p-7"
          >
            <h2 className="text-lg font-semibold text-white">Get early access</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="wl-name">
                  Full name
                </label>
                <input
                  id="wl-name"
                  data-field="name"
                  autoComplete="name"
                  value={fields.name}
                  maxLength={WAITLIST_LIMITS.name}
                  disabled={sending}
                  aria-invalid={!!errors.name}
                  onChange={(e) => set("name")(e.target.value)}
                  className={INPUT_CLASS}
                />
                {errors.name && <p className={ERROR_CLASS}>{errors.name}</p>}
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="wl-email">
                  Email address
                </label>
                <input
                  id="wl-email"
                  data-field="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={fields.email}
                  maxLength={WAITLIST_LIMITS.email}
                  disabled={sending}
                  aria-invalid={!!errors.email}
                  onChange={(e) => set("email")(e.target.value)}
                  className={INPUT_CLASS}
                />
                {errors.email && <p className={ERROR_CLASS}>{errors.email}</p>}
              </div>

              <div>
                <label className={LABEL_CLASS} htmlFor="wl-phone">
                  Phone number <span className="font-normal text-bone-soft">(optional)</span>
                </label>
                <input
                  id="wl-phone"
                  data-field="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0803 123 4567"
                  value={fields.phone}
                  maxLength={WAITLIST_LIMITS.phone}
                  disabled={sending}
                  aria-invalid={!!errors.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  className={INPUT_CLASS}
                />
                {errors.phone && <p className={ERROR_CLASS}>{errors.phone}</p>}
              </div>
            </div>

            <fieldset className="mt-8" data-field="interests">
              <legend className="text-lg font-semibold text-white">
                What are you looking forward to?
              </legend>
              <p className="mt-1 text-[13px] text-bone-soft">
                Select the features that interest you most.
              </p>
              <ul className="mt-4 space-y-2.5">
                {WAITLIST_INTERESTS.map((item) => {
                  const on = fields.interests.includes(item.id);
                  return (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-center gap-3">
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={sending}
                          onChange={() => toggleInterest(item.id)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--pulsepay-accent)]",
                            on
                              ? "border-[var(--pulsepay-accent)] bg-[var(--pulsepay-accent)] text-black"
                              : "border-[var(--pulsepay-accent)]/60",
                          )}
                        >
                          {on && <Check className="h-3 w-3" strokeWidth={3} />}
                        </span>
                        <span className="text-[15px] font-medium text-bone-strong">
                          {item.label}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {errors.interests && <p className={ERROR_CLASS}>{errors.interests}</p>}
            </fieldset>

            <div className="mt-8">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  data-field="consent"
                  type="checkbox"
                  checked={fields.consent}
                  disabled={sending}
                  aria-invalid={!!errors.consent}
                  onChange={(e) => {
                    setFields((c) => ({ ...c, consent: e.target.checked }));
                    clear("consent");
                  }}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--pulsepay-accent)]"
                />
                <span className="text-[13px] leading-relaxed text-bone-soft">
                  I agree that ENICE Group may contact me about the PulsePay launch using the
                  details above. I can withdraw this at any time by replying to any message.
                </span>
              </label>
              {errors.consent && <p className={ERROR_CLASS}>{errors.consent}</p>}
            </div>

            {/* Honeypot: invisible to people, tempting to scripts. */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="wl-website">Website</label>
              <input
                id="wl-website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="mt-5 rounded-md border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-[13px] text-destructive"
              >
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--pulsepay-accent)] px-5 py-3.5 text-[15px] font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {sending ? (
                <>
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                  Joining…
                </>
              ) : (
                <>Join the waitlist &rarr;</>
              )}
            </button>

            <p className="mt-4 text-[12.5px] text-bone-soft">
              No payment required. We will notify you when access opens.
            </p>
          </form>
        </Container>
      </section>
    </SiteShell>
  );
}
