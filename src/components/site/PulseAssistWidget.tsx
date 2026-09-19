import { useEffect } from "react";

/**
 * The PulseAssist chat widget, loaded from the platform.
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
 * ═══ Notes for whoever changes this next ════════════════════════════════════
 *
 * - Chatbot 33 is ENICE's, in workspace 63. `enicehq.com` must stay in the widget deployment's
 *   allowlist or the chat endpoint answers 403 — the launcher will open and then fail to send.
 * - Answers come from the FAQs and knowledge attached to that workspace, editable in the console.
 * - The workspace's conversation mode must not be `human`, or every message is handed to a person
 *   instead of answered. That is the platform default for a new workspace, deliberately.
 */
const WIDGET_SRC = "https://getpulseassist.com/api/widget/33/widget.js";

export function PulseAssistWidget() {
  useEffect(() => {
    // Guard against a double mount in development's strict mode. The loader has its own
    // `window.__PA_WIDGET_33` guard, so this is belt-and-braces rather than load-bearing.
    if (document.querySelector(`script[src="${WIDGET_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);

    /*
     * Deliberately not removed on unmount.
     *
     * This component mounts once per page load and lives for the session. Removing the tag would
     * not unload the widget anyway — the loader has already attached its shadow host and its
     * listeners to the document — so a cleanup here would only guarantee a second copy if the
     * component ever remounted.
     */
  }, []);

  return null;
}
