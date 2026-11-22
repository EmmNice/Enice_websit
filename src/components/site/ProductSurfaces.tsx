import { ArrowDownLeft, ArrowUpRight, Banknote, CreditCard, Gift, Smartphone } from "lucide-react";
import { Panel } from "./primitives";

/**
 * Product surfaces: what the products actually look like, built in HTML and CSS.
 *
 * ## Why this exists
 *
 * The pages used to carry decorative panels — a card graphic on PulsePay, a candlestick chart and
 * sparklines on PrideTrade. Those are the two things a reader discounts immediately: invented charts and
 * a render of a card. They also say nothing about whether the product works.
 *
 * These are drawn from the real screens instead: the actions PulsePay offers (transfer, airtime,
 * data, cards, gift cards), the fees it shows before you confirm, and the exchange surfaces PrideTrade
 * uses (naira funding by bank transfer, market pairs, withdrawal address allowlisting, a payment PIN
 * separate from the password). Text and borders only — no images, no canvas, nothing to download,
 * sharp on any screen.
 *
 * ## Illustrative, and labelled as such
 *
 * The balances and rates below are plausible, not live. The footnote says so, the figures are
 * `aria-hidden` so a screen reader is not read invented money, and nothing here claims to be a
 * measurement.
 */

const naira = (value: number) =>
  `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PULSEPAY_ACTIONS = [
  { label: "Send", icon: ArrowUpRight },
  { label: "Airtime", icon: Smartphone },
  { label: "Data", icon: ArrowDownLeft },
  { label: "Cards", icon: CreditCard },
];

const PULSEPAY_ACTIVITY = [
  { title: "Ada Obi · GTBank", detail: "Transfer", amount: 25000, fee: 10, status: "Done" },
  { title: "MTN airtime", detail: "Top-up", amount: 2000, fee: 0, status: "Done" },
  { title: "Gift card", detail: "Purchase", amount: 15000, fee: 75, status: "Done" },
];

const PRIDE_MARKETS = [
  { pair: "BTC/NGN", price: 152_400_000, change: "+1.24%", up: true },
  { pair: "ETH/NGN", price: 5_180_000, change: "-0.42%", up: false },
  { pair: "USDT/NGN", price: 1_585, change: "+0.08%", up: true },
];

export function PulsePaySurface({ className }: { className?: string }) {
  return (
    <Panel raised aria-hidden className={className}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-[12.5px] font-semibold text-bone-strong">PulsePay</span>
        <span className="font-mono text-[10px] tracking-[0.18em] text-bone-faint">NGN</span>
      </div>

      <div className="border-b border-border px-5 py-5">
        <p className="text-[10.5px] font-semibold tracking-[0.16em] text-bone-faint uppercase">
          Available balance
        </p>
        <p className="tnum mt-2 font-mono text-[26px] leading-none font-semibold text-bone-strong">
          {naira(248500)}
        </p>
        <p className="mt-2 text-[11px] text-bone-faint">Updated just now</p>
      </div>

      <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
        {PULSEPAY_ACTIONS.map((action) => (
          <div key={action.label} className="flex flex-col items-center gap-1.5 py-3.5">
            <action.icon className="h-4 w-4 text-electric" strokeWidth={1.5} />
            <span className="text-[10.5px] font-medium text-bone-faint">{action.label}</span>
          </div>
        ))}
      </div>

      <ul className="divide-y divide-border">
        {PULSEPAY_ACTIVITY.map((row) => (
          <li key={row.title} className="flex items-center gap-3 px-5 py-3">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12.5px] font-medium text-bone-strong">
                {row.title}
              </span>
              <span className="block text-[10.5px] text-bone-faint">
                {row.detail} · fee {naira(row.fee)}
              </span>
            </span>
            <span className="tnum font-mono text-[12px] text-bone-strong">
              −{naira(row.amount)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 border-t border-border px-5 py-3">
        <Banknote className="h-3.5 w-3.5 shrink-0 text-electric" strokeWidth={1.5} />
        <span className="text-[10.5px] leading-relaxed text-bone-faint">
          Every fee is shown before you confirm.
        </span>
      </div>
    </Panel>
  );
}

export function PrideSurface({ className }: { className?: string }) {
  return (
    <Panel raised aria-hidden className={className}>
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-[12.5px] font-semibold text-bone-strong">PrideTrade</span>
        <span className="font-mono text-[10px] tracking-[0.18em] text-bone-faint">
          Multi-currency
        </span>
      </div>

      {/* Accounts and assets in one switcher: fiat on the left, crypto on the right, so the shape of
          the product reads before a single number does. */}
      <div className="flex gap-1.5 overflow-hidden border-b border-border px-4 py-3">
        {["USD", "EUR", "GBP", "NGN", "USDT", "BTC"].map((code) => {
          const active = code === "USD";
          return (
            <span
              key={code}
              className={`flex-1 border py-1.5 text-center font-mono text-[10px] ${
                active
                  ? "border-[color:var(--pride-accent)]/60 text-[color:var(--pride-accent)]"
                  : "border-border text-bone-faint"
              }`}
            >
              {code}
            </span>
          );
        })}
      </div>

      <div className="border-b border-border px-5 py-5">
        <p className="text-[10.5px] font-semibold tracking-[0.16em] text-bone-faint uppercase">
          USD account
        </p>
        <p className="tnum mt-2 font-mono text-[26px] leading-none font-semibold text-bone-strong">
          $12,480.00
        </p>
        <p className="tnum mt-2 text-[11px] text-bone-faint">≈ {naira(18_720_000)}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <span className="flex items-center justify-center gap-1.5 border border-[color:var(--pride-accent)]/40 py-2 text-[11px] font-semibold text-[color:var(--pride-accent)]">
            <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Add money
          </span>
          <span className="flex items-center justify-center gap-1.5 border border-border py-2 text-[11px] font-semibold text-bone-strong">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            Send abroad
          </span>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {PRIDE_MARKETS.map((market) => (
          <li key={market.pair} className="flex items-center gap-3 px-5 py-3">
            <span className="flex-1 text-[12.5px] font-medium text-bone-strong">{market.pair}</span>
            <span className="tnum font-mono text-[11.5px] text-bone-faint">
              {naira(market.price)}
            </span>
            <span
              className={`tnum w-14 text-right font-mono text-[11.5px] ${
                market.up ? "text-[color:var(--pride-accent)]" : "text-bone-faint"
              }`}
            >
              {market.change}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-1.5 border-t border-border px-5 py-3">
        <p className="flex items-center gap-2 text-[10.5px] text-bone-faint">
          <Gift
            className="h-3.5 w-3.5 shrink-0 text-[color:var(--pride-accent)]"
            strokeWidth={1.5}
          />
          Gift cards bought and redeemed with instant wallet payout.
        </p>
        <p className="flex items-center gap-2 text-[10.5px] text-bone-faint">
          <Smartphone
            className="h-3.5 w-3.5 shrink-0 text-[color:var(--pride-accent)]"
            strokeWidth={1.5}
          />
          Travel eSIMs in 150+ countries. Allowlisted withdrawals, separate payment PIN.
        </p>
      </div>
    </Panel>
  );
}

/** The honest footnote both surfaces carry. */
export function SurfaceNote() {
  return (
    <p className="type-meta mt-3 text-center text-[10px]">
      Product preview · Figures shown are examples
    </p>
  );
}
