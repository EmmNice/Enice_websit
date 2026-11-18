/**
 * Product imagery for the homepage.
 *
 * The product screens are full-size captures of PulsePay's web and mobile interfaces, rendered at
 * 2x and shipped as images from `public/home/`, so they read as real screenshots rather than
 * miniature illustrations. PRIDE has no interface to capture yet, so it gets a drawn market
 * panel instead. The hero photograph is ENICE's own. Figures inside the screens are sample data.
 *
 * Everything here is decorative to assistive technology except the hero photo, which carries a
 * real description.
 */

import { Bitcoin, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const SHOTS = {
  pulsepay: { src: "/home/pulsepay-dashboard.jpg", w: 2880, h: 1800 },
} as const;

export type ShotKey = keyof typeof SHOTS;

/**
 * PRIDE has no interface to photograph yet, so it gets a light-theme market panel rather than a
 * borrowed screenshot of another product. Symbols only: no prices, no percentages, nothing that
 * could be read as a quotation for a platform that has not launched.
 */
export function PrideShot({ className }: { className?: string }) {
  const rows = [
    { symbol: "BTC", name: "Bitcoin", width: "w-[72%]" },
    { symbol: "ETH", name: "Ethereum", width: "w-[58%]" },
    { symbol: "USDT", name: "Tether", width: "w-[44%]" },
  ];
  return (
    <div
      aria-hidden
      className={cn(
        "overflow-hidden rounded-xl border border-[#0b1220]/10 bg-white shadow-[0_2px_4px_rgb(11_18_32_/_0.04),0_32px_64px_-24px_rgb(11_18_32_/_0.35)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[#e6e9ef] bg-[#f5f7fb] px-4 py-3">
        <span className="flex items-center gap-2">
          <Bitcoin className="h-4 w-4 text-[#d0472f]" strokeWidth={1.75} />
          <span className="text-[12px] font-semibold text-[#0b1220]">PRIDE Markets</span>
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c8798]">
          Digital assets
        </span>
      </div>
      <ul className="divide-y divide-[#e6e9ef]">
        {rows.map((row) => (
          <li key={row.symbol} className="flex items-center gap-3 px-4 py-4">
            <span className="text-[12px] font-semibold text-[#0b1220]">{row.symbol}</span>
            <span className="min-w-0 flex-1 truncate text-[11px] text-[#7c8798]">{row.name}</span>
            <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-[#e6e9ef]">
              <span className={cn("block h-full rounded-full bg-[#d0472f]/70", row.width)} />
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-center gap-2 border-t border-[#e6e9ef] bg-[#f5f7fb] px-4 py-3">
        <TrendingUp className="h-3 w-3 text-[#7c8798]" strokeWidth={1.75} />
        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#7c8798]">
          Simulated preview
        </span>
      </div>
    </div>
  );
}

/** A desktop browser window around a product screenshot. */
export function BrowserShot({
  shot,
  className,
  eager = false,
}: {
  shot: ShotKey;
  className?: string;
  eager?: boolean;
}) {
  const s = SHOTS[shot];
  return (
    <div
      aria-hidden
      className={cn(
        "overflow-hidden rounded-xl border border-[#0b1220]/10 bg-white shadow-[0_2px_4px_rgb(11_18_32_/_0.04),0_32px_64px_-24px_rgb(11_18_32_/_0.35)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[#e6e9ef] bg-[#f5f7fb] px-3.5 py-2">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
      </div>
      <img
        src={s.src}
        alt=""
        width={s.w}
        height={s.h}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}

/** A phone with the PulsePay mobile app on screen. */
export function PhoneShot({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-[2.25rem] bg-[#0b1220] p-[7px] shadow-[0_40px_80px_-24px_rgb(0_0_0_/_0.6)] ring-1 ring-white/10",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.85rem] bg-white">
        <img
          src="/home/pulsepay-mobile.jpg"
          alt=""
          width={780}
          height={1688}
          decoding="async"
          className="block aspect-[390/780] h-auto w-full object-cover object-top"
        />
        <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#0b1220]" />
      </div>
    </div>
  );
}

/**
 * The hero composition: a photograph of a professional at work, with the products she is using
 * layered over it — the PulsePay app on a phone, a PRIDE custody notice and a settled-payment
 * receipt.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[600px] pb-10 lg:pb-0">
      <div className="relative overflow-hidden rounded-[1.75rem] ring-1 ring-white/10">
        <img
          src="/home/hero-professional.jpg"
          alt="A business owner checking payments on her phone at her desk"
          width={1400}
          height={934}
          fetchPriority="high"
          decoding="async"
          className="block aspect-[4/4.2] h-auto w-full object-cover object-[30%_50%] sm:aspect-[4/3.6]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#05070d]/55 via-transparent to-transparent"
        />
      </div>

      {/* PulsePay on a phone, breaking the frame bottom-left. */}
      <PhoneShot className="absolute -bottom-2 left-3 w-[38%] max-w-[210px] sm:-left-8 lg:-bottom-10" />

      {/* PRIDE notice, top-right. */}
      <div
        aria-hidden
        className="absolute right-3 top-5 w-[62%] max-w-[270px] rounded-2xl border border-[#0b1220]/5 bg-white/95 p-3.5 text-[#0b1220] shadow-[0_24px_48px_-16px_rgb(0_0_0_/_0.45)] backdrop-blur sm:-right-6"
      >
        <div className="flex items-center gap-2.5">
          <span className="app-icon h-8 w-8 rounded-lg">
            <Bitcoin className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold">PRIDE</div>
            <div className="text-[11px] text-[#5f6b7e]">Custody · just now</div>
          </div>
          <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-[#127a4f]" />
        </div>
        <p className="mt-2.5 text-[12px] leading-snug text-[#273249]">
          Digital assets settled to custody on the same ledger as her cards.
        </p>
      </div>

      {/* Settlement receipt, bottom-right. */}
      <div
        aria-hidden
        className="absolute bottom-6 right-3 hidden items-center gap-2.5 rounded-xl bg-white/95 px-3.5 py-2.5 text-[#0b1220] shadow-[0_24px_48px_-16px_rgb(0_0_0_/_0.45)] sm:flex sm:-right-4 lg:bottom-12"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e7f6ee] text-[#127a4f]">
          <CheckCircle2 className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <div className="text-[12px] font-semibold">Payment settled</div>
          <div className="text-[10.5px] text-[#5f6b7e]">via PulsePay · 0.8s</div>
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
        <span className="text-[#6b98ff]">curl</span> https://api.enicehq.com/v1/ledger/tx \{"\n"}
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
