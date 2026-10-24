/**
 * Product interface illustrations for the homepage.
 *
 * These are drawn in HTML rather than shipped as screenshots, so they stay crisp at every
 * density, cost no image bytes, and can never drift out of the brand palette. They are product
 * *illustrations*, not live readings: every one is `aria-hidden` and contains nothing focusable,
 * and the figures in them are sample data in the shape of the real interface.
 */

import type { ReactNode } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  CreditCard,
  Globe,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Search,
  Send,
  Settings,
  Smartphone,
  Sparkles,
  Wallet,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared pieces ────────────────────────────────────────────────────────────

function Pill({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "grey";
}) {
  const tones = {
    blue: "bg-[#eaf0fd] text-[#0039c0]",
    green: "bg-[#e7f6ee] text-[#127a4f]",
    grey: "bg-[#f1f3f7] text-[#4a5568]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** The virtual card face, in the mark gradient. */
export function VirtualCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex aspect-[1.586/1] flex-col justify-between overflow-hidden rounded-2xl p-4 text-white",
        className,
      )}
      style={{
        backgroundImage:
          "radial-gradient(14rem 9rem at 100% 0%, rgb(107 152 255 / 0.65), transparent 70%), linear-gradient(135deg, #0048ed 0%, #0033b3 55%, #001f6b 100%)",
        boxShadow: "0 24px 48px -20px rgb(0 31 107 / 0.65)",
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em]">PulsePay</span>
        <Wifi className="h-4 w-4 rotate-90 opacity-80" />
      </div>
      <div className="h-6 w-9 rounded-md bg-gradient-to-br from-[#f7f8fa] to-[#a3bdf0] opacity-90" />
      <div className="flex items-end justify-between">
        <div>
          <div className="tnum font-mono text-[11px] tracking-[0.2em] opacity-90">
            •••• •••• •••• 4821
          </div>
          <div className="mt-1 text-[8px] uppercase tracking-[0.2em] opacity-70">Virtual · USD</div>
        </div>
        <span className="flex -space-x-2">
          <span className="h-5 w-5 rounded-full bg-white/70" />
          <span className="h-5 w-5 rounded-full bg-white/35" />
        </span>
      </div>
    </div>
  );
}

// ─── Hero: the ENICE console ──────────────────────────────────────────────────

const BARS = [38, 52, 44, 63, 58, 72, 66, 81, 74, 88, 79, 94];

const NAV = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Wallet, label: "PulsePay" },
  { icon: MessageCircle, label: "PulseAssist" },
  { icon: Mail, label: "Faga" },
  { icon: Settings, label: "Settings" },
];

/**
 * The hero device: one console that shows all three products at once, with two floating cards
 * breaking the frame. Floating cards are hidden on small screens, where they would cover the UI.
 */
export function HeroConsole() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[640px] select-none">
      {/* Browser window */}
      <div
        className="overflow-hidden rounded-2xl border border-white/15 bg-white"
        style={{ boxShadow: "0 40px 90px -30px rgb(0 0 0 / 0.75)" }}
      >
        <div className="flex items-center gap-3 border-b border-[#e6e9ef] bg-[#f5f7fb] px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6dbe4]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6dbe4]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6dbe4]" />
          </span>
          <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white px-3 py-1 text-[10px] text-[#5f6b7e] ring-1 ring-[#e6e9ef]">
            <Globe className="h-3 w-3" />
            console.enicehq.com
          </span>
        </div>

        <div className="flex text-[#0b1220]">
          {/* Sidebar */}
          <div className="hidden w-36 shrink-0 border-r border-[#eef0f4] bg-[#fafbfd] p-3 sm:block">
            <div className="mb-4 flex items-center gap-2 px-1.5">
              <span className="app-icon h-6 w-6 rounded-md text-[11px] font-bold">E</span>
              <span className="text-[11px] font-semibold">ENICE</span>
            </div>
            <ul className="space-y-0.5">
              {NAV.map((n) => (
                <li
                  key={n.label}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-[10.5px] font-medium",
                    n.active ? "bg-[#eaf0fd] text-[#0039c0]" : "text-[#4a5568]",
                  )}
                >
                  <n.icon className="h-3.5 w-3.5" strokeWidth={1.9} />
                  {n.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Main */}
          <div className="min-w-0 flex-1 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#5f6b7e]">Overview</div>
                <div className="text-[14px] font-semibold tracking-tight">This week</div>
              </div>
              <div className="flex items-center gap-1.5 rounded-md border border-[#e6e9ef] px-2 py-1 text-[10px] text-[#5f6b7e]">
                <Search className="h-3 w-3" />
                Search
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { k: "Wallet volume", v: "₦48.2M", d: "+12.4%" },
                { k: "Conversations", v: "3,184", d: "+8.1%" },
                { k: "Emails delivered", v: "99.2%", d: "+0.4%" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-[#eef0f4] p-2.5">
                  <div className="truncate text-[9px] text-[#5f6b7e]">{s.k}</div>
                  <div className="tnum mt-1 text-[13px] font-semibold tracking-tight">{s.v}</div>
                  <div className="mt-0.5 text-[9px] font-semibold text-[#127a4f]">{s.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-5 gap-2">
              <div className="col-span-3 rounded-lg border border-[#eef0f4] p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold">Transaction volume</span>
                  <span className="text-[9px] text-[#5f6b7e]">12 wks</span>
                </div>
                <div className="mt-2 flex h-20 items-end gap-1">
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-t-[3px]"
                      style={{
                        height: `${h}%`,
                        background:
                          i === BARS.length - 1
                            ? "#0048ed"
                            : `rgb(0 72 237 / ${0.18 + (i / BARS.length) * 0.4})`,
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="col-span-2 rounded-lg border border-[#eef0f4] p-2.5">
                <div className="text-[10px] font-semibold">Live inbox</div>
                <ul className="mt-2 space-y-1.5">
                  {[
                    { n: "Chidi O.", c: "WhatsApp", ai: true },
                    { n: "Amaka N.", c: "Web chat", ai: true },
                    { n: "Tunde A.", c: "SMS", ai: false },
                  ].map((r) => (
                    <li key={r.n} className="flex items-center gap-1.5">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eaf0fd] text-[8px] font-bold text-[#0039c0]">
                        {r.n[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[9.5px] font-medium">{r.n}</span>
                        <span className="block text-[8.5px] text-[#5f6b7e]">{r.c}</span>
                      </span>
                      {r.ai && <Sparkles className="h-3 w-3 shrink-0 text-[#0048ed]" />}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: the virtual card */}
      <div className="absolute -bottom-10 -left-10 hidden w-52 rotate-[-6deg] lg:block">
        <VirtualCard />
      </div>

      {/* Floating: an AI resolution */}
      <div className="mock-card absolute -right-4 -top-28 hidden w-56 p-3 lg:block">
        <div className="flex items-center gap-2">
          <span className="app-icon h-7 w-7 rounded-lg">
            <Bot className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold">PulseAssist</div>
            <div className="text-[9.5px] text-[#5f6b7e]">Replied on WhatsApp · 12s</div>
          </div>
        </div>
        <div className="mt-2.5 rounded-lg bg-[#f5f7fb] px-2.5 py-2 text-[10px] leading-snug text-[#273249]">
          Your transfer of ₦25,000 was completed. Anything else I can help with?
        </div>
      </div>
    </div>
  );
}

// ─── PulsePay ─────────────────────────────────────────────────────────────────

const TRANSACTIONS = [
  { name: "Card funding", meta: "From NGN wallet", amount: "+$250.00", inbound: true },
  { name: "Figma Inc.", meta: "Virtual card · 4821", amount: "−$45.00", inbound: false },
  { name: "Transfer to Bola", meta: "P2P transfer", amount: "−₦18,500", inbound: false },
  { name: "Salary credit", meta: "Bank transfer", amount: "+₦640,000", inbound: true },
];

export function PulsePayMock() {
  return (
    <div aria-hidden className="mock-frame select-none p-6 sm:p-10">
      <div className="mock-card mx-auto max-w-md p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#5f6b7e]">Total balance</div>
            <div className="tnum mt-1 text-[22px] font-semibold tracking-tight">₦1,284,450.00</div>
          </div>
          <div className="flex rounded-lg bg-[#f1f3f7] p-0.5 text-[10px] font-semibold">
            <span className="rounded-md bg-white px-2.5 py-1 text-[#0b1220] shadow-sm">NGN</span>
            <span className="px-2.5 py-1 text-[#5f6b7e]">USD</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] items-center gap-4">
          <VirtualCard className="max-w-[220px]" />
          <div className="space-y-2">
            {[
              { icon: Send, l: "Send" },
              { icon: ArrowDownLeft, l: "Fund" },
              { icon: CreditCard, l: "Cards" },
            ].map((a) => (
              <div key={a.l} className="flex flex-col items-center gap-1">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eaf0fd] text-[#0048ed]">
                  <a.icon className="h-4 w-4" />
                </span>
                <span className="text-[9.5px] font-medium text-[#4a5568]">{a.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[12px] font-semibold">Recent activity</span>
          <span className="text-[10px] font-semibold text-[#0048ed]">See all</span>
        </div>
        <ul className="mt-2 divide-y divide-[#eef0f4]">
          {TRANSACTIONS.map((t) => (
            <li key={t.name} className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                  t.inbound ? "bg-[#e7f6ee] text-[#127a4f]" : "bg-[#f1f3f7] text-[#4a5568]",
                )}
              >
                {t.inbound ? (
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11.5px] font-medium">{t.name}</span>
                <span className="block text-[10px] text-[#5f6b7e]">{t.meta}</span>
              </span>
              <span
                className={cn(
                  "tnum text-[11.5px] font-semibold",
                  t.inbound ? "text-[#127a4f]" : "text-[#0b1220]",
                )}
              >
                {t.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── PulseAssist ──────────────────────────────────────────────────────────────

const THREADS = [
  {
    n: "Chidi Okeke",
    c: "WhatsApp",
    icon: Smartphone,
    preview: "Where is my refund?",
    active: true,
  },
  { n: "Amaka Nwosu", c: "Web chat", icon: Globe, preview: "Thanks, that worked!" },
  { n: "Tunde Ade", c: "SMS", icon: MessageCircle, preview: "Please call me back" },
  { n: "Grace Bello", c: "Email", icon: Mail, preview: "Invoice for March" },
];

export function PulseAssistMock() {
  return (
    <div aria-hidden className="mock-frame select-none p-6 sm:p-10">
      <div className="mock-card mx-auto flex max-w-lg overflow-hidden">
        {/* Thread list */}
        <div className="hidden w-44 shrink-0 border-r border-[#eef0f4] sm:block">
          <div className="flex items-center gap-1.5 border-b border-[#eef0f4] px-3 py-2.5 text-[11px] font-semibold">
            <Inbox className="h-3.5 w-3.5 text-[#0048ed]" />
            Shared inbox
          </div>
          <ul>
            {THREADS.map((t) => (
              <li
                key={t.n}
                className={cn(
                  "border-b border-[#f3f4f7] px-3 py-2.5",
                  t.active && "bg-[#f5f8ff] shadow-[inset_2px_0_0_#0048ed]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[10.5px] font-semibold">{t.n}</span>
                  <t.icon className="h-3 w-3 shrink-0 text-[#5f6b7e]" />
                </div>
                <div className="mt-0.5 truncate text-[9.5px] text-[#5f6b7e]">{t.preview}</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-[#eef0f4] px-4 py-2.5">
            <div>
              <div className="text-[11.5px] font-semibold">Chidi Okeke</div>
              <div className="text-[9.5px] text-[#5f6b7e]">via WhatsApp</div>
            </div>
            <Pill tone="green">
              <CheckCircle2 className="h-3 w-3" />
              AI active
            </Pill>
          </div>

          <div className="flex-1 space-y-2.5 bg-[#fafbfd] px-4 py-4 text-[10.5px] leading-snug">
            <div className="max-w-[80%] rounded-xl rounded-tl-sm bg-white px-3 py-2 ring-1 ring-[#eef0f4]">
              Hi, I requested a refund on Monday. Where is it?
            </div>
            <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-[#0048ed] px-3 py-2 text-white">
              <div className="mb-1 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/75">
                <Sparkles className="h-3 w-3" />
                AI reply
              </div>
              Your refund of ₦12,000 was approved and will reach your account within 24 hours.
            </div>
            <div className="max-w-[80%] rounded-xl rounded-tl-sm bg-white px-3 py-2 ring-1 ring-[#eef0f4]">
              Can I speak to someone about my card limit?
            </div>
            <div className="flex justify-center">
              <Pill tone="grey">Handed off to an agent · Tobi</Pill>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-[#eef0f4] px-3 py-2.5">
            <span className="flex-1 rounded-lg bg-[#f5f7fb] px-3 py-1.5 text-[10px] text-[#8a94a6]">
              Type a reply…
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0048ed] text-white">
              <Send className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Faga ─────────────────────────────────────────────────────────────────────

const SERIES = [22, 30, 26, 38, 34, 46, 42, 55, 50, 63, 58, 70];

function linePath(points: number[], w: number, h: number) {
  const max = Math.max(...points) * 1.1;
  const step = w / (points.length - 1);
  return points
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - (p / max) * h).toFixed(1)}`,
    )
    .join(" ");
}

export function FagaMock() {
  const w = 320;
  const h = 90;
  const line = linePath(SERIES, w, h);

  return (
    <div aria-hidden className="mock-frame select-none p-6 sm:p-10">
      <div className="mock-card mx-auto max-w-md p-5">
        <div className="flex items-center justify-between">
          <div className="text-[12px] font-semibold">Email activity</div>
          <Pill>Last 30 days</Pill>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { k: "Sent", v: "1.24M" },
            { k: "Delivered", v: "99.1%" },
            { k: "Opened", v: "42.8%" },
          ].map((s) => (
            <div key={s.k} className="rounded-lg bg-[#f5f7fb] px-3 py-2.5">
              <div className="text-[9.5px] text-[#5f6b7e]">{s.k}</div>
              <div className="tnum mt-0.5 text-[15px] font-semibold tracking-tight">{s.v}</div>
            </div>
          ))}
        </div>

        <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 h-24 w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="faga-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0048ed" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0048ed" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${line} L${w},${h} L0,${h} Z`} fill="url(#faga-fill)" />
          <path
            d={line}
            fill="none"
            stroke="#0048ed"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="mt-4 rounded-lg border border-[#eef0f4]">
          <div className="flex items-center justify-between border-b border-[#eef0f4] px-3 py-2">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Mail className="h-3.5 w-3.5 text-[#0048ed]" />
              mail.yourbrand.com
            </span>
            <Pill tone="green">Verified</Pill>
          </div>
          <ul className="divide-y divide-[#f3f4f7]">
            {["DKIM", "SPF", "DMARC"].map((r) => (
              <li key={r} className="flex items-center justify-between px-3 py-1.5 text-[10px]">
                <span className="font-mono font-semibold tracking-[0.1em] text-[#273249]">{r}</span>
                <span className="flex items-center gap-1 font-medium text-[#127a4f]">
                  <CheckCircle2 className="h-3 w-3" />
                  Passing
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── ENICE Engine: the API ────────────────────────────────────────────────────

export function EngineConsole() {
  return (
    <div
      aria-hidden
      className="select-none overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e15]"
      style={{ boxShadow: "0 40px 80px -30px rgb(0 0 0 / 0.8)" }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="font-mono text-[10px] text-[#888f9c]">POST /v1/ledger/tx</span>
      </div>
      <pre className="overflow-hidden px-5 py-4 font-mono text-[11.5px] leading-[1.75] text-[#c6cad2]">
        <span className="text-[#888f9c]"># One API for every product</span>
        {"\n"}
        <span className="text-[#6b98ff]">curl</span> https://api.enice.group/v1/ledger/tx \{"\n"}
        {"  "}-H <span className="text-[#4ec08d]">"Authorization: Bearer $ENICE_KEY"</span> \{"\n"}
        {"  "}-d{" "}
        <span className="text-[#4ec08d]">
          '{"{"}"amount": 25000, "currency": "NGN"{"}"}'
        </span>
        {"\n\n"}
        <span className="text-[#888f9c]">{"// 200 OK"}</span>
        {"\n"}
        {"{"}
        {"\n"}
        {"  "}
        <span className="text-[#6b98ff]">"status"</span>:{" "}
        <span className="text-[#4ec08d]">"completed"</span>,{"\n"}
        {"  "}
        <span className="text-[#6b98ff]">"kyc"</span>:{" "}
        <span className="text-[#4ec08d]">"verified"</span>,{"\n"}
        {"  "}
        <span className="text-[#6b98ff]">"audit_id"</span>:{" "}
        <span className="text-[#4ec08d]">"aud_7Hq2…"</span>
        {"\n"}
        {"}"}
      </pre>
    </div>
  );
}
