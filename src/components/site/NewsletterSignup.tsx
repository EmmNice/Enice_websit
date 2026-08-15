import { useCallback, useState } from "react";
import { ArrowRight, Check, Loader2, Mail } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

const FRIENDLY_FALLBACK = "Something went wrong on our end. Please try again in a moment.";

/**
 * Email capture block for the homepage. Posts to the same /api/watchlist
 * endpoint used by the product waitlists.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || state === "loading" || state === "success") return;
      setState("loading");
      setErrorMsg("");

      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        let json: { ok: boolean; code?: string; error?: string } | null = null;
        try {
          json = (await res.json()) as { ok: boolean; code?: string; error?: string };
        } catch {
          setState("error");
          setErrorMsg(FRIENDLY_FALLBACK);
          return;
        }

        if (res.status === 409 || json.code === "DUPLICATE") {
          setState("duplicate");
          return;
        }
        if (!res.ok || !json.ok) {
          setState("error");
          setErrorMsg(json.error ?? FRIENDLY_FALLBACK);
          return;
        }
        setState("success");
      } catch {
        setState("error");
        setErrorMsg(FRIENDLY_FALLBACK);
      }
    },
    [email, state],
  );

  const done = state === "success" || state === "duplicate";

  return (
    <section className="border-b border-border bg-secondary/50 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div
          className="rounded-2xl border border-border bg-background p-6 sm:p-12"
          style={{
            boxShadow: "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)",
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.26em] text-primary">
                Stay Updated
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
                Product news, straight from the team
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                Launch dates, platform updates, and early access to what we release next. No noise,
                and you can leave any time.
              </p>
            </div>

            <div>
              {done ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-start gap-3 rounded-xl border border-border bg-secondary/70 p-5"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />
                  </span>
                  <p className="min-w-0 break-words text-[14px] leading-relaxed text-foreground">
                    {state === "duplicate"
                      ? "You are already on the list. We will be in touch."
                      : "You are on the list. Watch your inbox for our next update."}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="w-full">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                      <Mail
                        aria-hidden
                        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        strokeWidth={1.75}
                      />
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        aria-describedby={state === "error" ? "newsletter-error" : undefined}
                        className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-[15px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={state === "loading"}
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:opacity-60"
                    >
                      {state === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Joining
                        </>
                      ) : (
                        <>
                          Subscribe
                          <ArrowRight className="h-4 w-4" aria-hidden strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </div>

                  {state === "error" && (
                    <p
                      id="newsletter-error"
                      role="alert"
                      className="mt-3 break-words text-[13px] leading-relaxed text-destructive"
                    >
                      {errorMsg}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
