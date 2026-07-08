import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { LAUNCH_DATE } from "@/lib/launch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

type FormState = "idle" | "loading" | "success" | "error" | "duplicate";

// ─── Countdown logic ──────────────────────────────────────────────────────────

function calcTimeLeft(): TimeLeft {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    expired: false,
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

// ─── Digit tile ──────────────────────────────────────────────────────────────

function DigitTile({ value, label }: { value: string; label: string }) {
  const prevRef = useRef(value);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlip(true);
      const t = setTimeout(() => setFlip(false), 180);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm sm:h-20 sm:w-20 md:h-24 md:w-24"
        style={{
          boxShadow: "0 0 0 1px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Subtle top shine */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {/* Digit */}
        <span
          className={`font-mono text-2xl font-bold tabular-nums text-white transition-all duration-[180ms] sm:text-3xl md:text-4xl ${
            flip ? "scale-90 opacity-60" : "scale-100 opacity-100"
          }`}
        >
          {value}
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 sm:text-[11px]">
        {label}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ComingSoonProps {
  /** Called by the parent when the timer expires so it can swap to the real page. */
  onLaunched: () => void;
}

export function ComingSoon({ onLaunched }: ComingSoonProps) {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft);
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Live countdown tick
  useEffect(() => {
    const id = setInterval(() => {
      const next = calcTimeLeft();
      setTime(next);
      if (next.expired) {
        clearInterval(id);
        onLaunched();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onLaunched]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || formState === "loading" || formState === "success") return;
      setFormState("loading");
      setErrorMsg("");
      const FRIENDLY_FALLBACK =
        "Oops! Something went wrong on our end. Please try again in a moment.";
      try {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        // Guard: the server is contractually expected to always return JSON.
        // If a platform-level failure (e.g. a crashed function, a proxy error
        // page, or a network edge case) returns HTML/plain text instead, we
        // must never surface that raw payload to the user — fail closed with
        // a friendly message instead of letting `JSON.parse` throw upward.
        let json: { ok: boolean; code?: string; error?: string } | null = null;
        try {
          json = (await res.json()) as { ok: boolean; code?: string; error?: string };
        } catch (parseErr) {
          console.error("[watchlist] Non-JSON response from server:", parseErr);
          setFormState("error");
          setErrorMsg(FRIENDLY_FALLBACK);
          return;
        }

        if (res.status === 409 || json.code === "DUPLICATE") {
          setFormState("duplicate");
          return;
        }
        if (!res.ok || !json.ok) {
          setFormState("error");
          setErrorMsg(json.error ?? FRIENDLY_FALLBACK);
          return;
        }
        setFormState("success");
      } catch (err) {
        // Network failure or any other unexpected client-side error.
        console.error("[watchlist] Request failed:", err);
        setFormState("error");
        setErrorMsg(FRIENDLY_FALLBACK);
      }
    },
    [email, formState]
  );

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#080810] px-5"
      aria-label="Coming soon"
    >
      {/* ── Background layer ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Radial glow — top centre */}
        <div
          className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, #1d4ed8 0%, transparent 70%)" }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Bottom vignette */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#080810] to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center">

        {/* Wordmark */}
        <div className="mb-10 flex items-center gap-3 sm:mb-12">
          <span
            className="font-mono text-xl font-black tracking-[0.12em] text-white sm:text-2xl"
            aria-label="ENICE"
          >
            <span className="text-blue-500">E</span>NICE
          </span>
          <span className="h-5 w-px bg-white/20" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Group
          </span>
        </div>

        {/* Kicker */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
            Platform Launching Soon
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-5 text-4xl font-bold leading-[1.1] tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
          Building the
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            future of commerce.
          </span>
        </h1>

        {/* Sub-copy */}
        <p className="mb-12 max-w-lg text-base leading-relaxed text-white/45 sm:mb-14 sm:text-lg">
          A venture-grade technology ecosystem for the next era of global
          commerce. Four platforms, three verticals, one infrastructure stack.
        </p>

        {/* ── Countdown ── */}
        {!time.expired && (
          <div className="mb-12 flex items-start gap-3 sm:gap-5 sm:mb-14">
            <DigitTile value={pad(time.days)} label="Days" />
            <span className="mt-4 text-2xl font-light text-white/20 sm:mt-5 sm:text-3xl">:</span>
            <DigitTile value={pad(time.hours)} label="Hours" />
            <span className="mt-4 text-2xl font-light text-white/20 sm:mt-5 sm:text-3xl">:</span>
            <DigitTile value={pad(time.minutes)} label="Min" />
            <span className="mt-4 text-2xl font-light text-white/20 sm:mt-5 sm:text-3xl">:</span>
            <DigitTile value={pad(time.seconds)} label="Sec" />
          </div>
        )}

        {/* ── Watchlist form ── */}
        <div className="w-full max-w-md">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Join the Watchlist
          </p>

          {formState === "success" ? (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-6 py-5">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="text-left">
                <p className="text-sm font-semibold text-emerald-300">You're on the list.</p>
                <p className="text-xs text-emerald-500/80">
                  Confirmation sent. We'll notify you at launch.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="group relative flex overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors duration-200 focus-within:border-blue-500/50 focus-within:bg-white/[0.07] hover:border-white/15">
                <input
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formState === "error" || formState === "duplicate") setFormState("idle");
                  }}
                  placeholder="you@company.com"
                  disabled={formState === "loading"}
                  aria-label="Your email address"
                  className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white placeholder:text-white/25 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={formState === "loading" || !email.trim()}
                  className="flex shrink-0 items-center gap-2 bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Join watchlist"
                >
                  {formState === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Notify Me
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>

              {formState === "duplicate" && (
                <p className="mt-3 text-xs text-white/60">
                  You're already on the watchlist.
                </p>
              )}

              {formState === "error" && (
                <div className="mt-3 flex items-center gap-2 text-left">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                  <p className="text-xs text-red-400">{errorMsg}</p>
                </div>
              )}

              <p className="mt-3 text-[11px] text-white/25">
                No spam. You'll receive four emails in total: a confirmation, two
                reminders, and the launch announcement.
              </p>
            </form>
          )}
        </div>

        {/* Bottom meta */}
        <div className="mt-14 flex items-center gap-5 text-[11px] font-medium text-white/20 sm:mt-16">
          <span>Abuja and Kaduna, Nigeria</span>
          <span className="h-3 w-px bg-white/10" />
          <span>Est. 2026</span>
          <span className="h-3 w-px bg-white/10" />
          <a
            href="mailto:corporate@enicehq.com"
            className="transition-colors hover:text-white/50"
          >
            corporate@enicehq.com
          </a>
        </div>
      </div>
    </div>
  );
}
