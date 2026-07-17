import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, X, ChevronRight, MessageSquare } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Message = { from: "bot" | "user"; text: string };
type View    = "home" | "chat";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function callChat(messages: { role: string; content: string }[]) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  const rawText = await res.text();
  let data: { ok: boolean; text?: string; error?: string } | null = null;
  try { data = JSON.parse(rawText); } catch { /* not JSON */ }
  return {
    ok: res.ok && !!data?.ok,
    text: data?.text ?? null,
    error: data?.error ?? rawText.slice(0, 400),
    status: res.status,
  };
}

// ENICE "E" logomark — matches the favicon exactly
function ENiceLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: size * 0.1875, flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="12" fill="#1e3a8a" />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="ui-sans-serif,system-ui,-apple-system,sans-serif"
        fontWeight="700"
        fontSize="34"
        fill="#ffffff"
        letterSpacing="-1"
      >
        E
      </text>
    </svg>
  );
}

const QUICK_TOPICS = [
  "What is PulsePay?",
  "Tell me about PulseAssist",
  "How does ENICE's infrastructure work?",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AIChatbot() {
  const [open, setOpen]         = useState(false);
  const [view, setView]         = useState<View>("home");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const chattedRef              = useRef(false);
  const endRef                  = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Close resets to home
  function handleClose() {
    setOpen(false);
    setTimeout(() => setView("home"), 220);
  }

  // Enter chat — optionally with a prefilled starter message
  function enterChat(starter?: string) {
    setView("chat");

    // If already chatted this session, don't re-greet
    if (chattedRef.current) return;
    chattedRef.current = true;

    const firstUserMsg = starter ?? "__greet__";
    const seedMessages: { role: string; content: string }[] = [
      { role: "user", content: firstUserMsg },
    ];

    if (starter) {
      setMessages([{ from: "user", text: starter }]);
    }

    setTyping(true);
    callChat(seedMessages)
      .then(({ ok, text, error, status }) => {
        const reply = ok && text ? text : `[ERR ${status}] ${error}`;
        setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      })
      .catch((err: unknown) => {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: `[NET ERR] ${err instanceof Error ? err.message : String(err)}` },
        ]);
      })
      .finally(() => setTyping(false));
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || typing) return;
    setInput("");

    setMessages((prev) => [...prev, { from: "user", text }]);
    setTyping(true);

    try {
      const history = messages
        .map((m) => ({ role: m.from === "bot" ? "assistant" : "user", content: m.text }));
      history.push({ role: "user", content: text });

      const { ok, text: reply, error, status } = await callChat(history);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: ok && reply ? reply : `[ERR ${status}] ${error}` },
      ]);
    } catch (err: unknown) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: `[NET ERR] ${err instanceof Error ? err.message : String(err)}` },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      {/* ── Floating trigger ───────────────────────────────────────────────── */}
      <button
        onClick={() => (open ? handleClose() : setOpen(true))}
        aria-label="Open ENICE Group chat"
        className="fixed bottom-5 right-5 z-40 grid place-items-center rounded-full bg-[#1e3a8a] text-white shadow-[0_12px_32px_-8px_rgba(30,58,138,0.65)] transition-all duration-200 hover:scale-105 hover:shadow-[0_16px_40px_-8px_rgba(30,58,138,0.75)] sm:bottom-6 sm:right-6"
        style={{ width: 52, height: 52 }}
      >
        <span
          className={`absolute inset-0 grid place-items-center transition-all duration-200 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"}`}
        >
          <X className="h-5 w-5" />
        </span>
        <span
          className={`absolute inset-0 grid place-items-center transition-all duration-200 ${open ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
        >
          <MessageSquare className="h-6 w-6" fill="white" strokeWidth={0} />
        </span>
      </button>

      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-20 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right transition-all duration-220 sm:bottom-24 sm:right-6 ${
          open
            ? "pointer-events-auto scale-100 translate-y-0 opacity-100"
            : "pointer-events-none scale-95 translate-y-3 opacity-0"
        }`}
        style={{ filter: open ? "none" : "blur(4px)" }}
      >
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            boxShadow: "0 32px 72px -16px rgba(10,18,40,0.45), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* ── HOME SCREEN ──────────────────────────────────────────────── */}
          <div
            className={`transition-all duration-250 ${view === "home" ? "opacity-100" : "hidden opacity-0"}`}
          >
            {/* Hero header */}
            <div
              className="relative overflow-hidden px-5 pb-8 pt-7"
              style={{
                background: "linear-gradient(145deg, #0c1f5e 0%, #1e3a8a 55%, #1d4ed8 100%)",
              }}
            >
              {/* Subtle grid pattern */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              <div className="relative">
                <ENiceLogo size={44} />
                <h2 className="mt-4 text-[22px] font-bold leading-snug text-white">
                  Hi, how can we help?
                </h2>
                <p className="mt-1.5 text-[13px] leading-relaxed text-blue-200/80">
                  Ask anything about our platforms, infrastructure, or partnerships.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-4" style={{ background: "var(--background)" }}>
              {/* Start conversation CTA */}
              <button
                onClick={() => enterChat()}
                className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors duration-150"
                style={{
                  background: "var(--secondary)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--accent)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--accent-foreground)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)";
                  (e.currentTarget as HTMLButtonElement).style.color = "inherit";
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white"
                    style={{ background: "#1e3a8a" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold" style={{ color: "var(--foreground)" }}>
                      Start a conversation
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                      Online · usually replies in seconds
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--muted-foreground)" }} />
              </button>

              {/* Quick topics */}
              <p className="mb-2 mt-4 px-0.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                Common questions
              </p>
              <div className="flex flex-col gap-1.5">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => enterChat(topic)}
                    className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-[13px] transition-colors duration-150"
                    style={{
                      color: "var(--foreground)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--secondary)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <span>{topic}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--muted-foreground)" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-center gap-1 py-3 text-[10px]"
              style={{
                color: "var(--muted-foreground)",
                borderTop: "1px solid var(--border)",
              }}
            >
              <span>Powered by</span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>ENICE Group</span>
            </div>
          </div>

          {/* ── CHAT SCREEN ──────────────────────────────────────────────── */}
          <div className={view === "chat" ? "block" : "hidden"}>
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-3 py-3"
              style={{
                background: "linear-gradient(145deg, #0c1f5e 0%, #1e3a8a 55%, #1d4ed8 100%)",
              }}
            >
              <button
                onClick={() => setView("home")}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <ENiceLogo size={30} />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-white">
                  ENICE Group
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-blue-200/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Online · AI-powered assistant
                </div>
              </div>
              <button
                onClick={handleClose}
                className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              className="h-72 space-y-3 overflow-y-auto px-4 py-4"
              style={{ background: "var(--background)" }}
            >
              {messages.length === 0 && !typing && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                    Starting conversation…
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.from === "bot" && (
                    <div className="mr-2 mt-0.5 shrink-0">
                      <ENiceLogo size={22} />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={
                      m.from === "user"
                        ? { background: "#1e3a8a", color: "#ffffff", borderBottomRightRadius: 4 }
                        : { background: "var(--secondary)", color: "var(--foreground)", border: "1px solid var(--border)", borderBottomLeftRadius: 4 }
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex items-end gap-2">
                  <ENiceLogo size={22} />
                  <div
                    className="rounded-2xl px-3.5 py-3"
                    style={{ background: "var(--secondary)", border: "1px solid var(--border)", borderBottomLeftRadius: 4 }}
                  >
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50 [animation-delay:-0.3s]" style={{ color: "var(--muted-foreground)" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50 [animation-delay:-0.15s]" style={{ color: "var(--muted-foreground)" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-50" style={{ color: "var(--muted-foreground)" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex items-center gap-2 p-3"
              style={{
                background: "var(--background)",
                borderTop: "1px solid var(--border)",
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our platforms…"
                disabled={typing}
                className="flex-1 rounded-xl border px-3.5 py-2 text-[13px] outline-none transition-colors disabled:opacity-50"
                style={{
                  background: "var(--secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#1e3a8a"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white transition-all duration-150 disabled:opacity-35 hover:opacity-90"
                style={{ background: "#1e3a8a" }}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
