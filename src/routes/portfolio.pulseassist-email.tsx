import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  BarChart3,
  Boxes,
  BrainCircuit,
  Code2,
  Globe2,
  Inbox,
  KeyRound,
  Layers,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Webhook,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import {
  CardIndex,
  Cta,
  Eyebrow,
  HairlineGrid,
  IconTile,
  Metric,
  Panel,
  Section,
  SectionIntro,
  Tag,
} from "@/components/site/primitives";
import { useSectionFields, fieldText, fieldItems } from "@/lib/cms/use-section";
import { CORPORATE_EMAIL, ORGANIZATION_REF, breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

/**
 * PulseAssist Email.
 *
 * ## Why this page exists
 *
 * PulseAssist Email is a real, shipping ENICE product that had no presence on the company's own
 * website — while the site's own transactional mail has been sent through it since #31
 * (`EMAIL_PROVIDER=pulseassist`, see `src/lib/email/provider-pulseassist.server.ts`). A product the
 * company runs, sells and depends on, absent from its own portfolio, is a gap rather than a
 * decision.
 *
 * ## Where the copy comes from
 *
 * Everything below is drawn from the product's own page at getpulseassist.com/email and condensed —
 * nothing here is invented, and no figure is quoted that the product does not state about itself.
 * That page presents it as "part of the PulseAssist platform", which is how it is framed here too:
 * a PulseAssist product, the same way DevaPay is a PulsePay product.
 *
 * Every band reads its own `portfolio.pulseassist-email.*` section and falls back to the copy here,
 * so the page is editable without a deploy and still renders during an outage.
 */

export const Route = createFileRoute("/portfolio/pulseassist-email")({
  head: () =>
    pageHead("/portfolio/pulseassist-email", [
      breadcrumbJsonLd([
        { name: "Products", path: "/portfolio" },
        { name: "PulseAssist Email", path: "/portfolio/pulseassist-email" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "PulseAssist Email",
        description:
          "Transactional and marketing email on your own domain: verified sending domains, inbound routing, templates, automations, suppression handling and delivery analytics, from a console and a REST API.",
        url: `${SITE_URL}/portfolio/pulseassist-email`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        author: ORGANIZATION_REF,
        isPartOf: {
          "@type": "SoftwareApplication",
          name: "PulseAssist",
          url: `${SITE_URL}/portfolio/pulseassist`,
        },
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          description: "Available today. Contact corporate@enicehq.com for access.",
        },
        featureList: [
          "Verified sending domains checked against live public DNS",
          "Transactional and bulk sending with per-message delivery status",
          "Inbound email with routing rules",
          "Templates with append-only version history",
          "Multi-step automations with consent re-checked at send time",
          "Delivery, bounce and complaint analytics",
          "Automatic, permanent suppression of hard bounces and complaints",
          "REST API with scoped, rotatable keys",
          "Signed, deduplicated delivery webhooks",
        ],
      },
    ]),
  component: PulseAssistEmailPage,
});

/** Icons an editor may name on a CMS-managed capability card. Curated, not all of lucide. */
const CARD_ICONS: Record<string, LucideIcon> = {
  AtSign,
  BarChart3,
  Boxes,
  BrainCircuit,
  Code2,
  Globe2,
  Inbox,
  KeyRound,
  Layers,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  Webhook,
};

function cardIcon(name: string): LucideIcon {
  return CARD_ICONS[name] ?? Boxes;
}

/** The four things the product leads with about itself. */
const FACTS = [
  { value: "Your domain", label: "Verified in live DNS" },
  { value: "Send + receive", label: "Inbound routing included" },
  { value: "REST API", label: "Scoped, rotatable keys" },
  { value: "Webhooks", label: "Signed delivery events" },
];

const CAPABILITIES = [
  {
    icon: Globe2,
    title: "Your own sending domain",
    desc: "Mail goes out from your domain, not ours. The DKIM, SPF and MAIL FROM records are generated for you, then checked against public DNS. A domain is only marked connected once those records genuinely resolve.",
  },
  {
    icon: Send,
    title: "Transactional and bulk sending",
    desc: "A single message and a campaign run through the same pipeline, each with its own delivery status. Sends are recorded with the idempotency key you supplied, so a retried request cannot become a duplicate email.",
  },
  {
    icon: Inbox,
    title: "Inbound email and routing",
    desc: "Receive mail on your own domain and route it by recipient, sender or subject: to a mailbox, a team, or your own webhook. Inbound is part of the product rather than a forwarding workaround.",
  },
  {
    icon: AtSign,
    title: "Mailboxes and sending addresses",
    desc: "Mailboxes that receive and addresses that send, each tied to a verified domain. An address is claimed once across the platform, so two workspaces cannot share an identity.",
  },
  {
    icon: Layers,
    title: "Templates with version history",
    desc: "Write a template once and use it from the console or the API. Versions are append-only, so a campaign keeps sending the wording it was reviewed with even after the template moves on.",
  },
  {
    icon: Sparkles,
    title: "Automations and sequences",
    desc: "Multi-step sequences with delays between steps. Consent is re-checked when each step sends rather than when someone was enrolled, so an unsubscribe takes effect mid-sequence.",
  },
  {
    icon: BarChart3,
    title: "Delivery analytics",
    desc: "Delivered, bounced and complained totals with the rates behind them, measured against what the provider accepted rather than what was attempted. Rates are withheld until the sample is large enough to mean anything.",
  },
  {
    icon: ShieldCheck,
    title: "Suppression and deliverability protection",
    desc: "Hard bounces and complaints are suppressed automatically and permanently, and a suppressed address is refused before it costs another bounce. The list is yours to inspect, search and export.",
  },
  {
    icon: KeyRound,
    title: "REST API with scoped keys",
    desc: "A documented API for sending, addresses, suppressions, analytics and events. Keys carry scopes, so a key that reads analytics cannot send mail, and any key can be rotated or revoked without downtime.",
  },
  {
    icon: Webhook,
    title: "Signed delivery webhooks",
    desc: "Register endpoints and receive delivery, bounce and complaint events as they happen, signed and deduplicated. Failed deliveries are retried and visible, so a broken endpoint does not fail quietly.",
  },
  {
    icon: BrainCircuit,
    title: "AI drafting and classification",
    desc: "Draft, rewrite, summarise and classify mail using the same AI that answers support in PulseAssist. It draws on its own credit pool, so ordinary sending never consumes it.",
  },
  {
    icon: Code2,
    title: "Usage you can see coming",
    desc: "Live usage against your plan's allowances (sent this month, addresses, domains, endpoints), read from your entitlements rather than estimated, so a limit is visible while there is still time to act.",
  },
];

/**
 * Getting connected.
 *
 * Kept because the third step is the product's actual differentiator: records are looked up in
 * public DNS rather than taken on the sending provider's word, which is where email setup usually
 * fails silently.
 */
const SETUP = [
  {
    title: "Add your domain",
    desc: "Enter the domain you want to send from. It is registered with the sending provider and the exact records it needs are generated for you.",
  },
  {
    title: "Publish the records",
    desc: "Add the DKIM, SPF and MAIL FROM records at your DNS provider. Each is shown with its host and value, and the console tells you which are still outstanding.",
  },
  {
    title: "Verification against real DNS",
    desc: "The records are looked up in public DNS, not just requested from the provider. A record that is published but wrong, whether a stale value, a proxied CNAME or a second SPF line, is reported as exactly that.",
  },
  {
    title: "Send, receive and watch it",
    desc: "Once the records agree, sending is live. Add mailboxes and routing rules for inbound, then follow delivery, bounces and complaints from the first message onward.",
  },
];

const ACCESS_MAILTO = `mailto:${CORPORATE_EMAIL}?subject=PulseAssist%20Email%20Access%20Request`;

function PulseAssistEmailPage() {
  const header = useSectionFields("portfolio.pulseassist-email");
  const capabilities = useSectionFields("portfolio.pulseassist-email.capabilities");
  const setup = useSectionFields("portfolio.pulseassist-email.setup");
  const facts = useSectionFields("portfolio.pulseassist-email.facts");

  const factList = fieldItems(facts, "items", FACTS, (row) => {
    const value = typeof row.value === "string" ? row.value.trim() : "";
    const label = typeof row.label === "string" ? row.label.trim() : "";
    return value ? { value, label } : null;
  });

  const capabilityList = fieldItems(capabilities, "items", CAPABILITIES, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return {
      icon: cardIcon(typeof row.icon === "string" ? row.icon.trim() : ""),
      title,
      desc: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  const setupSteps = fieldItems(setup, "items", SETUP, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return { title, desc: typeof row.description === "string" ? row.description.trim() : "" };
  });

  return (
    <SiteShell>
      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <Section spacing="loose" grid glow="spread" aria-labelledby="pae-heading">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Tag tone="positive">Available</Tag>
              <Tag>
                <Mail aria-hidden className="h-3 w-3 shrink-0" />
                Part of the PulseAssist platform
              </Tag>
            </div>

            <SectionIntro
              id="pae-heading"
              level={1}
              className="mt-8"
              eyebrow={fieldText(header, "eyebrow", "PulseAssist Email")}
              heading={fieldText(header, "heading", "Professional email, on your own domain.")}
              lead={fieldText(
                header,
                "subheading",
                "Send and receive email from the domain your customers already know. Mailboxes, templates, campaigns and automations in one console, with a REST API, signed webhooks and delivery analytics when you would rather run it from your own systems.",
              )}
            />

            <div className="btn-stack mt-9 flex flex-wrap gap-3">
              <Cta to={ACCESS_MAILTO} size="lg" icon="external">
                Request access
              </Cta>
              <Cta to="/portfolio/pulseassist" variant="secondary" size="lg">
                See PulseAssist
              </Cta>
            </div>
          </div>

          {/* Decorative: a domain-verification panel, which is the product's first real step.
              `aria-hidden`, nothing focusable — every fact it depicts is in the copy beside it. */}
          <Panel raised aria-hidden className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <span className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-gold" strokeWidth={1.75} />
                <span className="text-[12px] font-semibold text-bone-strong">Sending domain</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-positive">
                Verified
              </span>
            </div>

            <ul className="divide-y divide-border">
              {[
                { record: "DKIM", host: "pa._domainkey" },
                { record: "SPF", host: "@" },
                { record: "MAIL FROM", host: "mail" },
              ].map((r) => (
                <li key={r.record} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-bone-strong">
                    {r.record}
                  </span>
                  <span className="truncate font-mono text-[11px] text-bone-faint">{r.host}</span>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-positive">
                    Resolving
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border px-5 py-3">
              <p className="text-[11px] leading-relaxed text-bone-soft">
                Checked in public DNS, not taken on the provider&rsquo;s word.
              </p>
            </div>
          </Panel>
        </div>
      </Section>

      {/* ═══ FACTS ══════════════════════════════════════════════════════════ */}
      <Section spacing="tight" container="narrow" divider>
        <div className="flex flex-wrap justify-center gap-x-16 gap-y-8 sm:gap-x-20">
          {factList.map((f) => (
            <Metric key={f.label} value={f.value} label={f.label} align="center" />
          ))}
        </div>
      </Section>

      {/* ═══ CAPABILITIES ═══════════════════════════════════════════════════ */}
      <Section tone="recessed" divider aria-labelledby="pae-capabilities-heading">
        <Reveal>
          <SectionIntro
            id="pae-capabilities-heading"
            eyebrow={fieldText(capabilities, "eyebrow", "What you get")}
            heading={fieldText(capabilities, "heading", "Everything the product actually does.")}
            lead={fieldText(
              capabilities,
              "subheading",
              "This is the implementation rather than a roadmap. If something is missing from the list, it is because it has not been built yet.",
            )}
          />
        </Reveal>

        <HairlineGrid columns={3} className="mt-14">
          {capabilityList.map((c, i) => (
            <Reveal key={c.title} delay={i * 40} className="flex">
              <div className="panel-interactive flex h-full w-full flex-col p-7">
                <div className="flex items-start justify-between">
                  <IconTile icon={c.icon} size="sm" />
                  <CardIndex value={i + 1} />
                </div>
                <h3 className="mt-6 text-[15px] font-semibold text-foreground">{c.title}</h3>
                <p className="type-body mt-2 text-[13px]">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </HairlineGrid>
      </Section>

      {/* ═══ GETTING CONNECTED ══════════════════════════════════════════════ */}
      <Section container="narrow" divider glow="center" aria-labelledby="pae-setup-heading">
        <Reveal>
          <SectionIntro
            id="pae-setup-heading"
            eyebrow={fieldText(setup, "eyebrow", "Getting connected")}
            heading={fieldText(
              setup,
              "heading",
              "Four steps, and the hard one is checked for you.",
            )}
            lead={fieldText(
              setup,
              "subheading",
              "DNS is where email setup usually goes wrong, so the console names the records that are still outstanding and the ones that are published but wrong, which never fix themselves while you wait.",
            )}
          />
        </Reveal>

        <ol className="mt-12">
          {setupSteps.map((s, i) => (
            <Reveal key={s.title} delay={i * 50}>
              <li className="grid gap-4 border-t border-border py-7 sm:grid-cols-[auto_1fr] sm:gap-8">
                <span
                  aria-hidden
                  className="tnum font-mono text-[11px] font-semibold tracking-[0.22em] text-gold sm:pt-1"
                >
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="type-h3 text-foreground">{s.title}</h3>
                  <p className="type-body mt-2 max-w-2xl">{s.desc}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* ═══ CTA ════════════════════════════════════════════════════════════ */}
      <Section container="prose" divider glow="center" aria-labelledby="pae-cta-heading">
        <SectionIntro
          id="pae-cta-heading"
          align="center"
          eyebrow="Get started"
          heading="Put your email on your own domain."
          lead="Talk to the team about access, volumes, and what moving your transactional and marketing mail across would involve."
        />
        <div className="btn-stack mt-8 flex flex-wrap items-center justify-center gap-3">
          <Cta to={ACCESS_MAILTO} size="lg" icon="external">
            Request access
          </Cta>
          <Cta to="/portfolio" variant="secondary" size="lg">
            View all products
          </Cta>
        </div>

        {/*
          A first-party fact, not a testimonial: this website's own transactional email — contact
          replies, early-access confirmations — is sent through PulseAssist Email. It is stated
          because it is checkable in this repository (`EMAIL_PROVIDER=pulseassist`), which is more
          than most "trusted by" lines can say.
        */}
        <Reveal>
          <Panel tone="quiet" className="mt-12 px-6 py-5">
            <Eyebrow muted as="p" className="text-[10px]">
              In production
            </Eyebrow>
            <p className="type-body mt-2.5">
              This website sends its own transactional email through PulseAssist Email — every
              contact reply and early-access confirmation from enicehq.com goes out on it.
            </p>
          </Panel>
        </Reveal>
      </Section>
    </SiteShell>
  );
}
