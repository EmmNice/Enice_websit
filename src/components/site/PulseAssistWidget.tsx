import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, X } from "lucide-react";

/**
 * The PulseAssist chat widget, loaded from the platform, with a visible fallback launcher.
 *
 * ═══ What this replaced ═════════════════════════════════════════════════════
 *
 * `AIChatbot.tsx` plus `api-src/chat.ts` plus `src/lib/ai/system-prompt.ts`: a complete second AI
 * stack living in the website repo, with its own provider selection, its own retrieval and its own
 * hardcoded persona. ENICE owns PulseAssist. Running a separate assistant on the company's own
 * marketing site meant maintaining the competitor of your own product.
 *
 * Two concrete things were wrong with the old arrangement, not just the duplication:
 *
 *   It did not work. The endpoint answered `provider: "fallback"` in production — no AI provider
 *   was configured there — so every visitor received a canned "a member of our team will follow
 *   up" reply. The assistant had not answered a question in production at all.
 *
 *   The persona was a source file. The SOC 2 / NDPC / 99.99% SLA claims removed in #35 had been
 *   asserted to visitors by that prompt, and correcting them required a deploy. Knowledge now
 *   lives in the PulseAssist console as data, so a wrong answer is an edit rather than a release,
 *   and there is no prompt in this repo to drift out of date.
 *
 * ═══ Why a script tag and not a fetch client ═════════════════════════════════
 *
 * `/api/widget/:id/widget.js` is the platform's own loader: Shadow DOM so this site's CSS cannot
 * leak into it, a visitor id persisted in `localStorage`, the SSE reply stream, and the 6-second
 * poll that delivers replies from a human agent once someone takes the conversation over. Writing
 * our own client would mean reimplementing all of that and then maintaining it against a contract
 * we do not control from here.
 *
 * It also keeps the browser as the caller, which matters: `POST /api/widget/:id/chat` requires an
 * `Origin` header and checks it against the domains allowlisted on the deployment. A browser sends
 * that automatically. A server-side proxy would have to forge it, and forging an origin check is
 * not a thing to build on purpose.
 *
 * ═══ Why there is a fallback launcher ════════════════════════════════════════
 *
 * Because the widget silently did not exist on the site, and nothing said so.
 *
 * `GET /api/widget/33/widget.js` answers **404** with a body of
 * `console.error("Widget: chatbot not found or inactive")` — the platform's way of saying that
 * chatbot 33 is not currently active in its workspace. The route itself is fine (a wrong path
 * answers with a JSON `NOT_FOUND` envelope instead), and the CSP already allows the origin, so
 * this is a configuration state on the platform rather than a bug here.
 *
 * The old failure mode was the problem: the component returned `null`, the script 404'd, and the
 * only symptom anywhere was the complete absence of an assistant. No launcher, no error, nothing
 * in the page's own logs. A visitor looking for help found nothing, and nobody operating the site
 * had any signal that the assistant was down.
 *
 * So the component now tracks whether the loader actually loaded, and if it did not, renders a
 * plain launcher of our own that routes to /contact. It does not imitate a chat and it does not
 * answer anything — pretending to be an AI that is not there would be worse than the silence it
 * replaces. As soon as the chatbot is activated (or `VITE_PULSEASSIST_WIDGET_ID` points at a live
 * one) the real widget loads, `status` becomes `"ready"`, and this fallback removes itself so the
 * two launchers never both appear.
 *
 * ═══ Notes for whoever changes this next ════════════════════════════════════
 *
 * - Chatbot 33 is ENICE's, in workspace 63. `enicehq.com` must stay in the widget deployment's
 *   allowlist or the chat endpoint answers 403 — the launcher will open and then fail to send.
 * - Answers come from the FAQs and knowledge attached to that workspace, editable in the console.
 * - The workspace's conversation mode must not be `human`, or every message is handed to a person
 *   instead of answered. That is the platform default for a new workspace, deliberately.
 * - The loader's origin must stay in `script-src` in vercel.json's Content-Security-Policy. This
 *   site sends a real `default-src 'self'` header, so a third-party script is refused silently
 *   unless its origin is listed. `connect-src` currently allows `https:`, which covers the
 *   widget's own calls home; if that is ever tightened to an enumerated list,
 *   `https://getpulseassist.com` has to be added there too.
 */

/**
 * The chatbot this site embeds.
 *
 * Overridable without a deploy, because the id is deployment configuration rather than source: it
 * changes when the chatbot is recreated, when a staging workspace is pointed at, or — as now —
 * when the live one needs replacing because the hardcoded one went inactive. There is nothing
 * secret in a public widget id, so it is safe in the client bundle.
 */
const WIDGET_ID = import.meta.env.VITE_PULSEASSIST_WIDGET_ID?.trim() || "33";
const WIDGET_SRC = `https://getpulseassist.com/api/widget/${WIDGET_ID}/widget.js`;

/** How long to wait for the loader before deciding it is not coming. */
const LOAD_TIMEOUT_MS = 8000;

type Status = "loading" | "ready" | "unavailable";

export function PulseAssistWidget() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    // The loader has its own `window.__PA_WIDGET_<id>` guard, so this is belt-and-braces against
    // a double mount in development's strict mode rather than load-bearing.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    if (existing) {
      setStatus(existing.dataset.paLoaded === "true" ? "ready" : "unavailable");
      return;
    }

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;

    // A 4xx/5xx on a script fires `error`, which is exactly the 404 case above.
    const onLoad = () => {
      script.dataset.paLoaded = "true";
      setStatus("ready");
    };
    const onError = () => setStatus("unavailable");

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.body.appendChild(script);

    // Belt for the case where neither event fires — a hung request, or a proxy holding the
    // connection open. Without this the launcher would stay hidden forever on a slow failure.
    const timer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "unavailable" : current));
    }, LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timer);
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      /*
       * The tag itself is deliberately left in place.
       *
       * This component mounts once per page load and lives for the session. Removing the tag would
       * not unload the widget anyway — the loader has already attached its shadow host and its
       * listeners to the document — so removing it here would only guarantee a second copy if the
       * component ever remounted.
       */
    };
  }, []);

  if (status !== "unavailable") return null;
  return <AssistFallback />;
}

/**
 * The launcher shown when the platform widget is unavailable.
 *
 * Deliberately modest. It opens a small card that says what it is and sends the visitor to the
 * places that can actually help — the contact form and the FAQ — rather than presenting an input
 * box that would take a question nothing is listening for.
 *
 * Positioned to match where the real widget sits, so the page's reserved space (the footer's extra
 * bottom-right padding) is correct either way, and inset for the iOS home indicator.
 */
function AssistFallback() {
  const [open, setOpen] = useState(false);

  // Escape closes the card, matching every other dismissible surface on the site.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="safe-bottom fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
      style={{ ["--safe-pad" as string]: "0px" }}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Contact ENICE Group"
          className="panel-raised animate-hero-up w-[min(20rem,calc(100vw-2rem))] p-5"
          style={{ animationDuration: "200ms" }}
        >
          <p className="eyebrow">Need a hand?</p>
          <p className="type-body mt-3">
            Our assistant is offline at the moment. Send us a message and a person will reply within
            one business day.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <Link to="/contact" onClick={() => setOpen(false)} className="btn btn-primary btn-sm">
              Contact the team
            </Link>
            <Link to="/" hash="faq" onClick={() => setOpen(false)} className="btn btn-ghost btn-sm">
              Read the FAQ
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Open contact options"}
        className="grid h-14 w-14 place-items-center rounded-full border border-gold/25 bg-surface-2 text-gold shadow-[0_18px_40px_-16px_rgb(0_0_0/0.8)] transition-colors hover:border-gold/45 hover:bg-surface-3"
      >
        {open ? (
          <X aria-hidden className="h-5 w-5" />
        ) : (
          <MessageSquare aria-hidden className="h-5 w-5" strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}
