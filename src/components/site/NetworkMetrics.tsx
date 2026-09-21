import type { LucideIcon } from "lucide-react";
import { Activity, Boxes, ShieldCheck, Gauge, Zap, Lock } from "lucide-react";
import { Reveal } from "./Reveal";
import { CardIndex, Eyebrow, HairlineGrid, Section } from "./primitives";
import { useSectionFields, fieldItems, fieldText } from "@/lib/cms/use-section";

/**
 * Platform capabilities — what the systems do, stated in terms that can be checked.
 *
 * The band was previously headed "Live network health" beside a pulsing green dot, which framed
 * five static strings as telemetry. Nothing on this page measures anything; /status is the only
 * surface that runs checks. The heading and the dot are gone, and the figures that were invented
 * ("99.99% rolling 90 days", "14ms p50") were already replaced with the mechanism actually in
 * place. What remains is a capability list, presented as one.
 *
 * The list below is now the *fallback* for the `home.capabilities` section rather than the only
 * source of it: the band overlays whatever an administrator has published, so this copy is what
 * paints before the CMS answers and what survives an outage — `useSectionFields` treats a degraded
 * bootstrap as "not loaded" on purpose. See `src/lib/cms/use-section.ts`.
 *
 * Mapped onto the `featureGrid` row shape: `kicker` is the small uppercase label, `title` is the
 * figure beneath it, and `description` is the supporting line.
 */
const CAPABILITIES = [
  {
    icon: Gauge,
    label: "API delivery",
    value: "Edge",
    sub: "Multi-region, served from the nearest edge",
  },
  {
    icon: Activity,
    label: "Tenant isolation",
    value: "Row-level",
    sub: "Enforced in the database, not the application",
  },
  {
    icon: ShieldCheck,
    label: "Data encryption",
    value: "TLS + at rest",
    sub: "Managed database and object storage",
  },
  {
    icon: Zap,
    label: "Card issuance",
    value: "< 5s",
    sub: "Virtual card provisioning",
  },
  {
    icon: Lock,
    label: "KYC verification",
    value: "Real-time",
    sub: "Automated compliance checks",
  },
];

/**
 * Icons an editor may name on a CMS-managed capability tile.
 *
 * A curated map rather than importing all of lucide, which would add a large amount of JavaScript
 * to the public bundle for the sake of a handful of names. Anything unrecognised falls back to a
 * neutral icon, so a typo degrades instead of leaving an empty tile. Same approach as `CARD_ICONS`
 * in src/routes/index.tsx.
 */
const CARD_ICONS: Record<string, LucideIcon> = {
  Activity,
  Boxes,
  Gauge,
  Lock,
  ShieldCheck,
  Zap,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

export function NetworkMetrics() {
  const section = useSectionFields("home.capabilities");

  // Rows without a figure are skipped rather than rendered as an empty tile.
  const capabilities = fieldItems(section, "items", CAPABILITIES, (row) => {
    const value = typeof row.title === "string" ? row.title.trim() : "";
    if (!value) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      label: typeof row.kicker === "string" ? row.kicker.trim() : "",
      value,
      sub: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  return (
    <Section spacing="tight" tone="recessed" divider aria-labelledby="capabilities-heading">
      <Reveal>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>{fieldText(section, "eyebrow", "Platform capabilities")}</Eyebrow>
            <h2
              id="capabilities-heading"
              className="mt-4 text-[1.375rem] font-semibold tracking-[-0.02em] text-foreground sm:text-2xl"
            >
              {fieldText(section, "heading", "How the platform is built.")}
            </h2>
          </div>
          <p className="max-w-sm text-[12px] leading-relaxed text-bone-faint">
            {fieldText(
              section,
              "subheading",
              "Mechanisms in place across every product. Current availability is reported on the status page.",
            )}
          </p>
        </div>
      </Reveal>

      <HairlineGrid columns={4} className="mt-10 lg:grid-cols-5">
        {capabilities.map((it, i) => (
          <Reveal key={`${it.label}-${i}`} delay={i * 50} className="flex">
            <div className="flex h-full w-full flex-col justify-between gap-6 bg-background p-6">
              <div className="flex items-start justify-between">
                <it.icon aria-hidden className="h-4 w-4 text-gold" strokeWidth={1.75} />
                <CardIndex value={i + 1} />
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bone-faint">
                  {it.label}
                </div>
                <div className="tnum mt-2 text-xl font-semibold tracking-tight text-foreground">
                  {it.value}
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-bone-soft">{it.sub}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </HairlineGrid>
    </Section>
  );
}
