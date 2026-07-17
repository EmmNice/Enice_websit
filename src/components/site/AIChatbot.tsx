import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = { from: "bot" | "user"; text: string };

// ─── Seed message ─────────────────────────────────────────────────────────────

const SEED_MESSAGES: Message[] = [
  {
    from: "bot",
    text: "Welcome to ENICE Group. Ask about PulsePay, PulseAssist, or partnership opportunities, or reach us directly at corporate@enicehq.com.",
  },
];

// ─── Fallback (shown when the API is unavailable) ─────────────────────────────

const FALLBACK_TEXT =
  "Thanks for reaching out. A member of our team will follow up shortly. For urgent matters, write to corporate@enicehq.com.";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert internal Message[] → API role/content format, excluding seed message */
function toApiMessages(msgs: Message[], newText: string) {
  return [
    // History (skip the initial seed bot message — that's handled by system prompt)
    ...msgs.slice(1).map((m) => ({
      role: m.from === "bot" ? "assistant" : "user",
      content: m.text,
    })),
    // The new user turn
    { role: "user", content: newText },
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  async function handleSend() {
    const text = input.trim();
    if (!text || typing) return;

    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: toApiMessages(messages, text),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { from: "bot", text: data.ok ? data.text : FALLBACK_TEXT },
      ]);
    } catch {
      setMessages((prev) => [...prev, { from: "bot", text: FALLBACK_TEXT }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open ENICE Group chat"
        style={{ height: 52, width: 52 }}
        className="fixed bottom-5 right-5 z-40 grid place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-8px_rgba(30,58,138,0.55)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-20 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right transition-all duration-200 sm:bottom-24 sm:right-6 ${
          open
            ? "pointer-events-auto scale-100 translate-y-0 opacity-100"
            : "pointer-events-none scale-95 translate-y-2 opacity-0"
        }`}
      >
        <div
          className="overflow-hidden rounded-2xl border border-border bg-background"
          style={{ boxShadow: "0 30px 60px -20px rgba(17,24,39,0.35)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-4 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-foreground">
                ENICE Group
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Online · AI-powered assistant
              </div>
            </div>
          </div>

          {/* Message thread */}
          <div className="h-72 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.from === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 border-t border-border bg-background p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about our platforms…"
              disabled={typing}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={typing || !input.trim()}
              aria-label="Send message"
              className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
