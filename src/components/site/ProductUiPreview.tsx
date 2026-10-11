import type { ReactNode } from "react";
import {
  ArrowRight,
  Bitcoin,
  Bot,
  Check,
  CreditCard,
  Globe2,
  Inbox,
  Mail,
  MessageSquare,
  ReceiptText,
  Repeat2,
  Send,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

function PreviewShell({
  product,
  context,
  status,
  children,
}: {
  product: string;
  context: string;
  status: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      className="relative min-h-[15rem] overflow-hidden rounded-xl border border-border bg-background shadow-[0_22px_55px_-34px_rgb(0_0_0/0.9)]"
    >
      <div className="tech-grid tech-grid-flat opacity-35" />
      <div className="relative flex items-center justify-between gap-3 border-b border-border bg-surface-1/90 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
            {product}
          </p>
          <p className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-[0.14em] text-bone-faint">
            {context}
          </p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-electric/25 bg-electric/[0.08] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-electric">
          {status}
        </span>
      </div>
      <div className="relative p-4 sm:p-5">{children}</div>
    </div>
  );
}

const ACTION_CLASS =
  "flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface-1 px-3 py-2.5";
const ICON_CLASS =
  "grid h-7 w-7 shrink-0 place-items-center rounded-md border border-electric/20 bg-electric/[0.08] text-electric";
const META_CLASS = "text-[8px] font-semibold uppercase tracking-[0.14em] text-bone-faint";

function PulsePayPreview() {
  const actions = [
    { label: "Send", Icon: Send },
    { label: "Cards", Icon: CreditCard },
    { label: "Bills", Icon: ReceiptText },
  ];

  return (
    <PreviewShell product="PulsePay" context="Wallet overview" status="Sample interface">
      <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-electric/25 bg-electric/[0.09] p-4">
          <p className={META_CLASS}>Wallet balance</p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.04em] text-foreground">
            ₦ ••••••
          </p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-md bg-electric px-3 py-1.5 text-[9px] font-bold text-background">
              Add money
            </span>
            <span className="rounded-md border border-electric/30 px-3 py-1.5 text-[9px] font-semibold text-electric">
              Transfer
            </span>
          </div>
        </div>
        <div className="flex min-h-28 flex-col justify-between rounded-xl border border-border bg-surface-2 p-4">
          <div className="flex items-start justify-between">
            <WalletCards className="h-4 w-4 text-electric" />
            <span className={META_CLASS}>Virtual card</span>
          </div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-bone-strong">•••• •••• ••••</p>
          <p className="text-[9px] text-bone-faint">Naira &amp; USD</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {actions.map(({ label, Icon }) => (
          <div key={label} className={ACTION_CLASS}>
            <Icon className="h-3.5 w-3.5 shrink-0 text-electric" />
            <span className="truncate text-[9px] font-semibold text-bone-strong">{label}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function PulseAssistPreview() {
  const conversations = [
    { label: "Account access", state: "AI route", Icon: Bot },
    { label: "Payment question", state: "Human route", Icon: UserRound },
    { label: "Delivery update", state: "Queue route", Icon: MessageSquare },
  ];

  return (
    <PreviewShell
      product="PulseAssist"
      context="Customer support console"
      status="Sample interface"
    >
      <div className="grid min-h-40 grid-cols-[2.2rem_1fr] overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex flex-col items-center gap-3 border-r border-border bg-background py-3">
          {[Inbox, MessageSquare, Bot].map((Icon, index) => (
            <span
              key={index}
              className={
                index === 0 ? ICON_CLASS : "grid h-7 w-7 place-items-center text-bone-faint"
              }
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
          ))}
        </div>
        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <div>
              <p className="text-[10px] font-semibold text-foreground">Support inbox</p>
              <p className="mt-0.5 text-[8px] text-bone-faint">WhatsApp · Web · Telegram</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-electric" />
          </div>
          <ul className="divide-y divide-border">
            {conversations.map(({ label, state, Icon }) => (
              <li key={label} className="flex items-center gap-3 px-3 py-2.5">
                <span className={ICON_CLASS}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-semibold text-bone-strong">{label}</p>
                  <p className="mt-0.5 text-[8px] text-bone-faint">Context retained</p>
                </div>
                <span className="shrink-0 text-[8px] font-semibold text-electric">{state}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PreviewShell>
  );
}

function FagaPreview() {
  const records = [
    { name: "DKIM", state: "Record ready" },
    { name: "SPF", state: "Record ready" },
    { name: "MAIL FROM", state: "DNS check" },
  ];

  return (
    <PreviewShell product="Faga" context="Email delivery console" status="Sample interface">
      <div className="overflow-hidden rounded-xl border border-border bg-surface-1">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="flex items-center gap-2 text-[10px] font-semibold text-foreground">
            <Globe2 className="h-3.5 w-3.5 text-electric" />
            Sending domain
          </span>
          <span className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-electric">
            <Check className="h-3 w-3" /> Configured
          </span>
        </div>
        <ul className="divide-y divide-border">
          {records.map((record) => (
            <li key={record.name} className="flex items-center justify-between px-4 py-2.5">
              <span className="font-mono text-[9px] font-semibold tracking-[0.12em] text-bone-strong">
                {record.name}
              </span>
              <span className="text-[8px] font-semibold text-electric">{record.state}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 rounded-xl border border-border bg-surface-1 px-3 py-3">
        {[
          { label: "Queued", Icon: Mail },
          { label: "Sent", Icon: Send },
          { label: "Delivered", Icon: ShieldCheck },
        ].map(({ label, Icon }, index) => (
          <div key={label} className="contents">
            {index > 0 && <ArrowRight className="h-3 w-3 text-bone-faint" />}
            <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <Icon className="h-3.5 w-3.5 text-electric" />
              <span className="truncate text-[8px] font-semibold text-bone-soft">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function PridePreview() {
  const assets = [
    { symbol: "BTC", name: "Bitcoin", Icon: Bitcoin },
    { symbol: "ETH", name: "Ethereum", Icon: Repeat2 },
    { symbol: "SOL", name: "Solana", Icon: Repeat2 },
  ];

  return (
    <PreviewShell product="PRIDE" context="Digital asset portfolio" status="Simulated preview">
      <div className="rounded-xl border border-electric/25 bg-electric/[0.06] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={META_CLASS}>Portfolio value</p>
            <p className="mt-2 font-mono text-2xl font-semibold tracking-[-0.04em] text-foreground">
              $ ••••••
            </p>
          </div>
          <span className={ICON_CLASS}>
            <WalletCards className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Deposit", "Swap", "Withdraw"].map((label) => (
            <span
              key={label}
              className="rounded-md border border-electric/25 bg-background/40 px-2 py-1.5 text-center text-[8px] font-semibold text-electric"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface-1">
        {assets.map(({ symbol, name, Icon }) => (
          <li key={symbol} className="flex items-center gap-3 px-3 py-2">
            <span className={ICON_CLASS}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-[9px] font-semibold text-foreground">{symbol}</span>
            <span className="min-w-0 flex-1 truncate text-[8px] text-bone-faint">{name}</span>
            <span className="text-[8px] font-semibold text-electric">At launch</span>
          </li>
        ))}
      </ul>
    </PreviewShell>
  );
}

function GenericPreview() {
  return (
    <PreviewShell product="ENICE" context="Product platform" status="Product view">
      <div className="space-y-3 rounded-xl border border-border bg-surface-1 p-4">
        {["Workspace", "Operations", "Reporting"].map((label) => (
          <div
            key={label}
            className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
          >
            <span className={ICON_CLASS}>
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <span className="text-[9px] font-semibold text-bone-strong">{label}</span>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

export function ProductUiPreview({ to }: { to: string }) {
  switch (to) {
    case "/portfolio/pulsepay":
      return <PulsePayPreview />;
    case "/portfolio/pulseassist":
      return <PulseAssistPreview />;
    case "/portfolio/faga":
      return <FagaPreview />;
    case "/portfolio/pride":
      return <PridePreview />;
    default:
      return <GenericPreview />;
  }
}
