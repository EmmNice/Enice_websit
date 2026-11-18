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

import { Bitcoin, TrendingUp } from "lucide-react";
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

/**
 * The hero visual: the platform itself, drawn rather than photographed.
 *
 * The previous version was a stock photograph of a professional with a phone, a custody notice
 * and a delivery chip floating over it. It read as a consumer fintech advert, which is the wrong
 * claim: ENICE sells infrastructure. This shows what a visitor is actually buying — one API, two
 * products and the shared ledger underneath them — as a console, with no invented figures.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div
        aria-hidden
        className="overflow-hidden rounded-xl border border-white/10 bg-[#070a12]/90 shadow-[0_40px_90px_-30px_rgb(0_0_0_/_0.85)] backdrop-blur"
      >
        {/* Console chrome */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-[#8a93a6]">
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
            </span>
            enice-core
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#8a93a6]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4ec08d]" />
            v1
          </span>
        </div>

        {/* System map */}
        <div className="grid gap-px bg-white/[0.06] sm:grid-cols-[1fr_1.15fr]">
          <div className="space-y-2 bg-[#070a12] p-4">
            {[
              { name: "PulsePay", meta: "cards · wallets · transfers", state: "PILOT" },
              { name: "PRIDE", meta: "trading · custody", state: "PREVIEW" },
            ].map((p) => (
              <div
                key={p.name}
                className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-white">{p.name}</span>
                  <span className="font-mono text-[9px] tracking-[0.16em] text-[#4ec08d]">
                    {p.state}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[10px] text-[#7b8497]">{p.meta}</div>
              </div>
            ))}

            <div className="flex items-center gap-2 pl-1 font-mono text-[9px] tracking-[0.16em] text-[#5b6376]">
              <span className="h-3 w-px bg-white/15" />
              shared ledger
            </div>

            <div className="rounded-md border border-[#6b98ff]/25 bg-[#6b98ff]/[0.07] px-3 py-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-white">ENICE Core</span>
                <span className="font-mono text-[9px] tracking-[0.16em] text-[#6b98ff]">API</span>
              </div>
              <div className="mt-1 font-mono text-[10px] text-[#7b8497]">
                ledger · kyc · webhooks
              </div>
            </div>
          </div>

          {/* Request trace */}
          <div className="bg-[#05070d] p-4">
            <div className="font-mono text-[10.5px] leading-[1.9] text-[#7b8497]">
              <div>
                <span className="text-[#4ec08d]">POST</span> /v1/ledger/tx
              </div>
              <div className="mt-1 text-[#c6cad2]">
                {"{"}
                <div className="pl-3">
                  <span className="text-[#6b98ff]">"amount"</span>: 25000,
                </div>
                <div className="pl-3">
                  <span className="text-[#6b98ff]">"currency"</span>:{" "}
                  <span className="text-[#4ec08d]">"NGN"</span>
                </div>
                {"}"}
              </div>
              <div className="mt-4 text-[#5b6376]"># 200 OK</div>
              <div className="text-[#c6cad2]">
                {"{"}
                <div className="pl-3">
                  <span className="text-[#6b98ff]">"status"</span>:{" "}
                  <span className="text-[#4ec08d]">"settled"</span>,
                </div>
                <div className="pl-3">
                  <span className="text-[#6b98ff]">"rail"</span>:{" "}
                  <span className="text-[#4ec08d]">"pulsepay"</span>
                </div>
                {"}"}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded border border-white/10 bg-white/10 text-center">
              {[
                ["Products", "2"],
                ["Ledger", "1"],
                ["API", "v1"],
              ].map(([label, value]) => (
                <div key={label} className="bg-[#070a12] px-2 py-2">
                  <div className="font-mono text-[13px] font-semibold text-white">{value}</div>
                  <div className="mt-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#5b6376]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[9.5px] tracking-[0.12em] text-[#5b6376]">
          <span>per-tenant isolation</span>
          <span>audit log</span>
          <span>encrypted at rest</span>
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
