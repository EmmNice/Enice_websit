import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";

type Msg = { from: "bot" | "user"; text: string };

const seed: Msg[] = [
  {
    from: "bot",
    text: "Welcome to ENICE Core Intelligence. Ask me about PulsePay, PulseAssist, or partnership inquiries.",
  },
];

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          from: "bot",
          text: "Thank you — an ENICE specialist will follow up. Meanwhile, you can submit a formal request via the Corporate Inquiries form below.",
        },
      ]);
      setTyping(false);
    }, 1400);
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open ENICE Core chat"
        className="fixed bottom-5 right-5 z-40 grid h-13 w-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-8px_rgba(30,58,138,0.55)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6"
        style={{ height: 52, width: 52 }}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-20 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right transition-all duration-200 sm:right-6 sm:bottom-24 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100 scale-100"
            : "pointer-events-none translate-y-2 opacity-0 scale-95"
        }`}
      >
        <div
          className="overflow-hidden rounded-2xl border border-border bg-background"
          style={{ boxShadow: "0 30px 60px -20px rgba(17,24,39,0.35)" }}
        >
          <div className="flex items-center gap-3 border-b border-border bg-secondary/60 px-4 py-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-foreground">
                ENICE Core Intelligence
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Online · typical reply &lt; 1 min
              </div>
            </div>
          </div>

          <div className="h-72 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) => (
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border bg-background p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ENICE Core…"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Send"
              className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
