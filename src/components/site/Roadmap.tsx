import { useState, type ElementType } from "react";
import { Clock, CheckCircle2, Circle, Zap } from "lucide-react";
import {
  HairlineGrid,
  Panel,
  Section,
  SectionIntro,
  Tag,
  TextLink,
} from "@/components/site/primitives";
import { useSectionFields, fieldItems, fieldText } from "@/lib/cms/use-section";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Status = "completed" | "in-progress" | "planned";

interface Milestone {
  when: string;
  quarter: string;
  status: Status;
  product: string;
  title: string;
  body: string;
  tags: string[];
}

/**
 * The milestones, as the *fallback* for the `home.roadmap` section.
 *
 * The list is no longer the only source of the roadmap: the band overlays whatever an administrator
 * has published, so this copy is what paints before the CMS answers and what survives an outage —
 * `useSectionFields` treats a degraded bootstrap as "not loaded" on purpose. See
 * `src/lib/cms/use-section.ts`. A roadmap is the single most perishable thing on the site, so it is
 * also the last content that should need a deploy to change.
 */
const MILESTONES: Milestone[] = [
  {
    when: "Q1 2026",
    quarter: "Q1 2026",
    status: "completed",
    product: "ENICE Core",
    title: "Shared Ecosystem Framework",
    body: "The unified AI pipeline, ledger, and compliance backbone that now underpins every ENICE product.",
    tags: ["Infrastructure", "AI", "Compliance"],
  },
  {
    when: "Q3 2026",
    quarter: "Q3 2026",
    status: "completed",
    product: "PulsePay",
    title: "Extended Pilot with Regional Treasury Partners",
    body: "Programmable wallets, instant virtual card issuance, and embedded compliance controls, rolled out to a wider pilot group across West Africa.",
    tags: ["Fintech", "Wallets", "KYC"],
  },
  {
    when: "Q4 2026",
    quarter: "Q4 2026",
    status: "in-progress",
    product: "PulseAssist",
    title: "Enterprise B2B Launch",
    body: "First rollout of support automation to banking, fintech, and telecom partners, with policy-bound agents and live-agent failover.",
    tags: ["AI", "B2B", "Telecom"],
  },
  {
    when: "Q2 2026",
    quarter: "Q2 2026",
    status: "in-progress",
    product: "PulsePay",
    title: "Developer API Public Beta",
    body: "The ENICE Core API opens to verified integration partners, with wallet issuance, ledger, KYC, and Assist endpoints available in a sandbox.",
    tags: ["API", "Developer", "Fintech"],
  },
  {
    when: "Q3 2026",
    quarter: "Q3 2026",
    status: "planned",
    product: "PulsePay",
    title: "Multi-Currency Expansion",
    body: "Multi-currency wallet rails, programmable spend controls, and embedded treasury operations for the payment platform.",
    tags: ["Fintech", "Multi-Currency", "Treasury"],
  },
  {
    when: "Q1 2027",
    quarter: "Q1 2027",
    status: "planned",
    product: "PulsePay",
    title: "Payment Collection Launch",
    body: "PulsePay Payment Collection launches: a unified API for businesses to accept and manage customer payments, with real time status updates and webhook notifications.",
    tags: ["Fintech", "Payments", "API"],
  },
  {
    when: "Q3 2027",
    quarter: "Q3 2027",
    status: "planned",
    product: "PulseX",
    title: "Global Digital Asset Exchange Private Beta",
    body: "PulseX opens to institutional and qualified retail participants, with support for major digital asset pairs, custody, and compliance reporting.",
    tags: ["Crypto", "Exchange", "Global"],
  },
  {
    when: "Q4 2027",
    quarter: "Q4 2027",
    status: "planned",
    product: "ePulse",
    title: "Digital Banking Infrastructure Closed Alpha",
    body: "ePulse begins closed alpha with select institutional partners: digital banking core, account management, and statement APIs.",
    tags: ["Banking", "Alpha"],
  },
  {
    when: "2027",
    quarter: "2027",
    status: "planned",
    product: "ENICE Core",
    title: "Universal Financial Hub",
    body: "A global virtual-dollar and asset infrastructure layer connecting institutional liquidity across markets through a single API.",
    tags: ["Infrastructure", "Global", "Liquidity"],
  },
];

// ─── Status config ────────────────────────────────────────────────────────────

/**
 * How a milestone's state is expressed on the dark canvas.
 *
 * `tone` hands the pill to the shared `Tag` treatment rather than restating a palette per state:
 * shipped work is the one genuine positive signal, work in flight takes the warm accent, and
 * anything still planned stays deliberately quiet so a roadmap of nine cards does not read as
 * nine highlights. The old light-theme pills (`bg-emerald-50`, `bg-blue-50`) are gone with the
 * navy system they belonged to.
 */
const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    icon: ElementType;
    tone: "neutral" | "warm" | "positive";
    pillClassName?: string;
    dot: string;
  }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    tone: "positive",
    dot: "bg-positive",
  },
  "in-progress": {
    label: "In Progress",
    icon: Zap,
    tone: "warm",
    dot: "bg-gold",
  },
  planned: {
    label: "Planned",
    icon: Clock,
    tone: "neutral",
    pillClassName: "text-bone-faint",
    dot: "bg-bone-faint",
  },
};

// ─── CMS encoding ─────────────────────────────────────────────────────────────

/**
 * A milestone as a `steps` row.
 *
 * A `steps` row carries a title and a description and nothing else, while a milestone needs four
 * more things: when it lands, its status, the product it belongs to, and its tags. Rather than
 * invent a section type for one band, those four are written as `label: value` lines at the top of
 * the description, and the body is everything after them:
 *
 *     when: Q4 2026
 *     status: in-progress
 *     product: PulseAssist
 *     tags: AI, B2B, Telecom
 *
 *     First rollout of support automation to banking, fintech, and telecom partners.
 *
 * Only leading lines matching one of those four labels are read as metadata; the first line that
 * does not starts the body, so a description written with no header at all is simply all body.
 * `status` accepts `completed`, `in-progress` or `planned`; anything else — including a missing
 * status — resolves to `planned`, the quiet treatment, rather than throwing. A typo in a CMS field
 * must never take a page down.
 */
const META_KEYS = ["when", "status", "product", "tags"] as const;

function toStatus(value: string): Status {
  return value === "completed" || value === "in-progress" ? value : "planned";
}

function parseMilestone(title: string, description: string): Milestone {
  const meta = new Map<string, string>();
  const lines = description.split("\n");

  let cursor = 0;
  for (; cursor < lines.length; cursor++) {
    const line = lines[cursor].trim();
    // The blank line between the header and the body, or leading blank lines before either.
    if (!line) continue;
    const match = /^([a-z]+)\s*:\s*(.*)$/i.exec(line);
    const key = match?.[1].toLowerCase();
    if (!key || !(META_KEYS as readonly string[]).includes(key)) break;
    meta.set(key, (match?.[2] ?? "").trim());
  }

  const when = meta.get("when") ?? "";
  return {
    when,
    // `quarter` mirrors `when`: the timeframe is written once, and a CMS row has no second field
    // for it to drift from.
    quarter: when,
    status: toStatus(meta.get("status") ?? ""),
    product: meta.get("product") ?? "",
    title,
    body: lines.slice(cursor).join("\n").trim(),
    tags: (meta.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "in-progress", label: "In Progress" },
  { key: "planned", label: "Planned" },
];

// ─── Card ─────────────────────────────────────────────────────────────────────

function MilestoneCard({ m }: { m: Milestone }) {
  const cfg = STATUS_CONFIG[m.status];
  const Icon = cfg.icon;

  return (
    <Panel as="article" interactive className="flex h-full flex-col p-7">
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag tone={cfg.tone} className={cfg.pillClassName}>
            <Icon aria-hidden className="h-3 w-3 shrink-0" strokeWidth={2.5} />
            {cfg.label}
          </Tag>
          {/* The timeframe and the product pill are omitted when a row leaves them out, rather
              than rendering an empty chip beside the status. */}
          {m.when && (
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
              {m.when}
            </span>
          )}
        </div>
        {m.product && (
          <span className="shrink-0 rounded-md border border-border bg-surface-1 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone-faint">
            {m.product}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="type-h3 mt-5 text-foreground">{m.title}</h3>

      {/* Body */}
      <p className="type-body mt-3">{m.body}</p>

      {/* Tags */}
      {m.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {m.tags.map((t) => (
            <span
              key={t}
              className="rounded-md border border-border bg-surface-1 px-2 py-0.5 text-[11px] font-medium text-bone-soft"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Roadmap() {
  const [tab, setTab] = useState<"all" | Status>("all");
  const section = useSectionFields("home.roadmap");

  // Rows without a title are dropped; everything else is decoded by `parseMilestone`.
  const milestones = fieldItems(section, "items", MILESTONES, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return parseMilestone(title, typeof row.description === "string" ? row.description : "");
  });

  const filtered = tab === "all" ? milestones : milestones.filter((m) => m.status === tab);

  const counts = {
    all: milestones.length,
    completed: milestones.filter((m) => m.status === "completed").length,
    "in-progress": milestones.filter((m) => m.status === "in-progress").length,
    planned: milestones.filter((m) => m.status === "planned").length,
  };

  return (
    <Section id="roadmap" divider aria-labelledby="roadmap-strategic-heading">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        {/* The eyebrow stays in code: `steps` carries a heading and supporting copy, and adding a
            field to a shared schema for one band is not a trade worth making. */}
        <SectionIntro
          id="roadmap-strategic-heading"
          eyebrow="Strategic Roadmap"
          heading={fieldText(section, "heading", "Built step by step, for the long run.")}
          lead={fieldText(
            section,
            "subheading",
            "Our roadmap follows the maturity of the platforms we operate, sequenced so each step builds on the last.",
          )}
          className="max-w-2xl"
        />
        <TextLink to="/contact" className="shrink-0 pb-2">
          Partner with us
        </TextLink>
      </div>

      {/* Summary stats */}
      <HairlineGrid columns={4} className="mt-10">
        {(["completed", "in-progress", "planned"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="px-5 py-4">
              <div className="flex items-center gap-2">
                <span aria-hidden className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
                  {cfg.label}
                </span>
              </div>
              <div className="tnum mt-2 text-2xl font-semibold tracking-tight text-foreground">
                {counts[s]}
              </div>
            </div>
          );
        })}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2">
            <span aria-hidden className="h-2 w-2 rounded-full bg-bone-strong" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone-faint">
              Total
            </span>
          </div>
          <div className="tnum mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {counts.all}
          </div>
        </div>
      </HairlineGrid>

      {/*
        Filters, not tabs. They were unlabelled `<button>`s with no pressed state, so a screen
        reader announced four bare words and never which one was active — `aria-pressed` on a
        labelled group reports the filter that is on without pretending this is a tab set (there
        is no tabpanel to own).
      */}
      <div
        role="group"
        aria-label="Filter milestones by status"
        className="mt-10 flex items-center gap-1 rounded-lg border border-border bg-surface-1 p-1 sm:w-fit"
      >
        {TABS.map((t) => {
          const selected = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-[12px] font-semibold transition-colors ${
                selected
                  ? "bg-surface-3 text-foreground"
                  : "text-bone-soft hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {t.label}
              <span
                className={`tnum rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  selected ? "bg-gold/[0.12] text-gold" : "bg-transparent text-bone-faint"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {filtered.map((m) => (
          <MilestoneCard key={`${m.when}-${m.title}`} m={m} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="panel-quiet mt-8 flex flex-col items-center justify-center py-16 text-center">
          <Circle aria-hidden className="h-8 w-8 text-bone-faint" />
          <p className="mt-4 text-[14px] text-bone-soft">No milestones in this category yet.</p>
        </div>
      )}
    </Section>
  );
}
