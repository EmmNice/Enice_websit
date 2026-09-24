import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { SiteShell } from "@/components/site/SiteShell";
import { StyledText } from "@/components/site/StyledText";
import { Reveal } from "@/components/site/Reveal";
import { PRODUCTS } from "@/components/site/navigation";
import {
  CardIndex,
  Eyebrow,
  HairlineGrid,
  Panel,
  Section,
  SectionIntro,
} from "@/components/site/primitives";
import { useSectionFields, fieldText, fieldItems, fieldParagraphs } from "@/lib/cms/use-section";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead("/about", [
      breadcrumbJsonLd([{ name: "About", path: "/about" }]),
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About ENICE Group",
        description:
          "ENICE Group builds and operates software platforms for financial services, enterprise AI, and digital commerce.",
        url: `${SITE_URL}/about`,
        publisher: {
          "@type": "Organization",
          name: "ENICE Group",
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.png`,
          foundingDate: "2026",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Abuja",
            addressCountry: "NG",
          },
        },
      },
    ]),
  component: AboutPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    index: "01",
    title: "Long-Term Thinking",
    body: "We evaluate decisions against decades, not quarters. We want companies that outlast trends and survive economic cycles. We won't trade long-term integrity for short-term convenience.",
  },
  {
    index: "02",
    title: "Engineering Excellence",
    body: "We hold our engineering to the standards of regulated industries. Our codebases are documented, our APIs are versioned and backward-compatible, and our system designs favour resilience over novelty.",
  },
  {
    index: "03",
    title: "Security by Design",
    body: "Security isn't added after a product ships. It's built in from the start. Per-tenant data isolation with row-level security, encryption in transit and at rest, and audit logging of privileged actions are standard across every product we run. We treat our partners' data as our responsibility.",
  },
  {
    index: "04",
    title: "Customer Obsession",
    body: "We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it.",
  },
  {
    index: "05",
    title: "Responsible AI",
    body: "AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don't release a capability until we're confident in its reliability and we can explain how it works.",
  },
];

/**
 * The sector tiles under "What We Build".
 *
 * Mapped onto the `featureGrid` row shape: `title` is the small uppercase label, `description` the
 * line beneath it. The grid renders no heading of its own, so `about.verticals` seeds one for the
 * admin list only — nothing on the page reads it.
 */
const VERTICALS = [
  {
    label: "Financial Infrastructure",
    description:
      "Core transaction rails, digital banking architecture, and payment processing systems.",
  },
  {
    label: "Enterprise AI",
    description: "Automated communication and process automation for enterprise teams.",
  },
  {
    label: "Developer Infrastructure",
    description: "APIs, SDKs, and tooling that give builders a reliable foundation to scale on.",
  },
  {
    label: "Digital Commerce",
    description:
      "Commerce platforms built for high transaction volume and institutional standards.",
  },
  {
    label: "Cloud Infrastructure",
    description:
      "Region-aware deployment systems with security and compliance built into the architecture.",
  },
  {
    label: "Future Technology",
    description:
      "Long-horizon research programmes exploring what comes after our current products.",
  },
];

/**
 * The founding team cards.
 *
 * Mapped onto the `featureGrid` row shape: `title` is the role, `description` the scope, and
 * `kicker` the three letters in the avatar tile.
 */
const LEADERSHIP = [
  {
    role: "Founder & Chief Executive Officer",
    scope: "Corporate strategy, venture direction, and ecosystem growth.",
    initial: "CEO",
  },
  {
    role: "Chief Technology Officer",
    scope: "Platform architecture, engineering standards, and infrastructure design.",
    initial: "CTO",
  },
  {
    role: "Chief Operations Officer",
    scope: "Product delivery, partner operations, and compliance execution.",
    initial: "COO",
  },
];

/** Where executive contact goes. The address is code, not copy — the link has to keep working. */
const CORPORATE_EMAIL = "corporate@enicehq.com";

/**
 * The note under the founding team cards, carried on `about.leadership`'s `subheading`.
 *
 * It contains a link, and no CMS text field can carry markup — `StyledText` deliberately
 * interprets no HTML. So the anchor stays in code: the sentence is editable, and whichever part of
 * it happens to be the email address is rendered as the `mailto:` link. An edit that drops the
 * address simply renders as plain text rather than breaking.
 */
const LEADERSHIP_NOTE = `Our founding team prefers to let the work speak. Executive contact is available through ${CORPORATE_EMAIL} for qualified enterprise and partnership inquiries.`;

/**
 * The "What We Build" band's paragraphs.
 *
 * Two things this copy has to keep doing, now that it lives in the CMS:
 *
 *   * `{liveProducts}` is replaced at render with the number of products whose stage is
 *     `available`, read from the shared registry in `navigation.ts`. The figure used to be written
 *     by hand, which is exactly how it goes stale the day a product ships.
 *   * `**PulsePay**` and `**PulseAssist**` are `StyledText`'s bold marker. A plain text field
 *     cannot carry a `<strong>`, and it should not be able to; the marker renders one with the
 *     same classes the band has always used.
 */
const PRODUCT_COUNT_TOKEN = "{liveProducts}";

const BUILD_COPY = [
  "We find a real gap, design a product around what it takes to close it, build it to a high standard, launch it, and then operate it with the same discipline we used to build it. We don't hand products off. We own the full lifecycle.",
  "We work across areas where technical complexity meets real-world consequence: financial infrastructure and digital banking, AI-powered enterprise communication and automation, developer tools and API infrastructure, digital commerce systems, cloud infrastructure, and longer-horizon research.",
  `Our current products are the foundation of this. **PulsePay** is our financial infrastructure platform, a Naira-native payment processing and digital banking system built for Nigerian businesses, from high-frequency transactions to compliance. **PulseAssist** is our enterprise AI platform, a communication and automation layer that helps enterprise teams cut down on procedural overhead.`,
  "These are the first two products in a lineup we plan to grow the same way: deliberately, and to a high standard.",
];

/** How the band's `<strong>` runs have always been styled. Passed to `StyledText` explicitly. */
const BUILD_BOLD_CLASS = "font-semibold text-foreground";

/**
 * The closing statement and its attribution.
 *
 * A `prose` section carries a heading and a body and nothing else, so the quote is the body and
 * the attribution is the heading — it is the one remaining string in the band, and leaving it in
 * code would mean the sentence is editable and the signature under it is not.
 */
const CLOSING_QUOTE = `"The infrastructure a society depends on is the most durable thing it can build. That's what we're here to build."`;
const CLOSING_ATTRIBUTION = "— The Founders, ENICE Group";

/**
 * What the name stands for.
 *
 * Only the five words, with no gloss under any of them. The acronym is the company's own, and a
 * sentence invented here to pad each letter would be marketing copy passing itself off as meaning.
 * The `description` field is wired through regardless, so whoever owns the brand can add a line per
 * letter from the Website Manager without a deploy — and until they do, the words stand alone.
 */
const ACRONYM: { word: string; description: string }[] = [
  { word: "Enabling", description: "" },
  { word: "Next-Generation", description: "" },
  { word: "Innovations", description: "" },
  { word: "Customer", description: "" },
  { word: "Experience", description: "" },
];

/**
 * The name read as one line, connective "in" included. The list drops it — a per-letter column
 * cannot carry a linking word — so the full phrase is shown once, above the breakdown, and is the
 * only place a reader sees the acronym as the sentence it actually forms.
 */
const ACRONYM_PHRASE = "Enabling Next-Generation Innovations in Customer Experience.";

/** The band number, at the one size and weight every band uses. */
function BandNumber({ children }: { children: string }) {
  return (
    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-bone-faint">
      {children}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * One of the About page's numbered prose bands.
 *
 * The bands are structurally identical — a number, a heading, and a few paragraphs — so they
 * share this component rather than repeating the markup. The `dark` variant this used to carry is
 * gone: the site is one continuous near-black environment, so there is no longer a light band for
 * a dark band to contrast with, and every copy of the component now renders identically.
 *
 * Paragraphs come from the section's `body`, separated by blank lines. The built-in copy is used
 * until the section is edited.
 */
function ProseBand({
  number,
  sectionKey,
  heading,
  headingId,
  paragraphs,
}: {
  number: string;
  sectionKey: string;
  heading: string;
  headingId: string;
  paragraphs: string[];
}) {
  const fields = useSectionFields(sectionKey);
  const body = fieldText(fields, "body", paragraphs.join("\n\n"));
  const rendered = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
      <div>
        <BandNumber>{number}</BandNumber>
        <h2 id={headingId} className="type-h2 mt-4 text-foreground">
          <StyledText text={fieldText(fields, "heading", heading)} accentClassName="text-gold" />
        </h2>
      </div>
      {/* Long-form copy stays selectable — selection is disabled globally on the site. */}
      <div data-allow-select className="space-y-6">
        {rendered.map((paragraph, i) => (
          <p key={i} className="type-body">
            <StyledText text={paragraph} accentClassName="text-gold" />
          </p>
        ))}
      </div>
    </div>
  );
}

function AboutPage() {
  // Editable bands, each falling back to the copy below until the section is edited.
  const hero = useSectionFields("about.hero");
  const acronym = useSectionFields("about.acronym");
  const values = useSectionFields("about.values");
  const build = useSectionFields("about.build");
  const verticalsSection = useSectionFields("about.verticals");
  const leadership = useSectionFields("about.leadership");
  const closing = useSectionFields("about.closing");

  /**
   * The five words the name is built from.
   *
   * The initial shown against each word is taken from the word itself rather than stored, so the
   * column of letters always spells whatever the words actually spell. Hardcoding "E N I C E" beside
   * editable text would let the two drift until the page claimed an acronym it no longer formed.
   */
  const acronymEntries = fieldItems(acronym, "items", ACRONYM, (row) => {
    const word = typeof row.title === "string" ? row.title.trim() : "";
    if (!word) return null;
    return {
      word,
      description: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  // The principles cards. Numbering is positional, so nobody maintains /01, /02 by hand.
  const principles = fieldItems(values, "items", PRINCIPLES, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return {
      title,
      body: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  /**
   * How many products are actually live, read from the shared product registry.
   *
   * The prose below used to say "our two current products" with the count written by hand, which
   * is the same failure the homepage hit: the registry in `navigation.ts` is the only thing that
   * knows what has shipped, and a hardcoded count silently goes stale the day one does. The named
   * products stay in the copy — only the figure is derived.
   */
  const liveProducts = PRODUCTS.filter((p) => p.stage === "available").length;

  // "What We Build". The count is substituted into whichever paragraph names it, so the figure
  // stays derived whether the copy comes from the CMS or from `BUILD_COPY`.
  const buildParagraphs = fieldParagraphs(build, "body", BUILD_COPY).map((paragraph) =>
    paragraph.split(PRODUCT_COUNT_TOKEN).join(String(liveProducts)),
  );

  // The sector tiles. `title` is the label; rows without one are skipped.
  const verticals = fieldItems(verticalsSection, "items", VERTICALS, (row) => {
    const label = typeof row.title === "string" ? row.title.trim() : "";
    if (!label) return null;
    return {
      label,
      description: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  // The founding team cards: role, scope, and the three letters in the avatar tile.
  const team = fieldItems(leadership, "items", LEADERSHIP, (row) => {
    const role = typeof row.title === "string" ? row.title.trim() : "";
    if (!role) return null;
    return {
      role,
      scope: typeof row.description === "string" ? row.description.trim() : "",
      initial: typeof row.kicker === "string" ? row.kicker.trim() : "",
    };
  });

  // The executive-contact note, with the anchor rebuilt around the address. See `LEADERSHIP_NOTE`.
  const note = fieldText(leadership, "subheading", LEADERSHIP_NOTE);
  const noteEmailAt = note.indexOf(CORPORATE_EMAIL);

  return (
    <SiteShell>
      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <Section
        spacing="loose"
        container="narrow"
        grid
        glow="spread"
        aria-labelledby="about-heading"
      >
        {/*
          No [[highlight]] in the default heading.

          The highlight put a full line of ~56px gold at the top of the page. Gold is the small
          accent — at display size it stops reading as an accent and starts reading as a gold
          website. The capability is still there for an editor emphasising a short phrase.
        */}
        <SectionIntro
          level={1}
          id="about-heading"
          eyebrow={fieldText(hero, "eyebrow", "About ENICE Group")}
          heading={fieldText(
            hero,
            "heading",
            "We build technology products. Then we operate them.",
          )}
          lead={fieldText(
            hero,
            "subheading",
            "ENICE Group is the parent company behind a growing set of software products. We find real problems in financial services, commerce, and business communication, then build and run the platforms that solve them.",
          )}
        />
      </Section>

      {/* ── 1. WHAT THE NAME STANDS FOR ───────────────────────────────────── */}
      <Section container="narrow" divider aria-labelledby="about-acronym-heading">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <BandNumber>/01</BandNumber>
              <h2 id="about-acronym-heading" className="type-h2 mt-4 text-foreground">
                <StyledText
                  text={fieldText(acronym, "heading", "What the name stands for")}
                  accentClassName="text-gold"
                />
              </h2>
              <p className="type-lead mt-5">
                <StyledText
                  text={fieldText(acronym, "subheading", ACRONYM_PHRASE)}
                  accentClassName="text-gold"
                />
              </p>
            </div>

            {/*
              A list, not a grid. `HairlineGrid` tops out at four columns, so five letters would
              wrap three-then-two and the acronym would stop reading in order. Stacked, the initials
              form a single column that spells the name top to bottom, which is the one arrangement
              that makes the point without a caption explaining it.
            */}
            <ol className="-mt-1">
              {acronymEntries.map(({ word, description }) => (
                <li
                  key={word}
                  className="flex items-baseline gap-6 border-t border-border py-5 first:border-t-0 first:pt-0 sm:gap-8"
                >
                  {/*
                    Decorative: the initial is the first letter of the word beside it, so a screen
                    reader announcing both would read "E, Empower". Fixed width and tabular figures
                    keep the letters on one axis regardless of how wide each glyph is.
                  */}
                  <span
                    aria-hidden
                    className="w-7 shrink-0 text-center font-mono text-2xl font-semibold leading-none text-gold sm:w-8 sm:text-[1.75rem]"
                  >
                    {word.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="type-h3 block text-foreground">{word}</span>
                    {description && <span className="type-body mt-2 block">{description}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </Section>

      {/* ── 2. OUR STORY ──────────────────────────────────────────────────── */}
      <Section container="narrow" divider aria-labelledby="about-story-heading">
        <Reveal>
          <ProseBand
            number="/02"
            sectionKey="about.story"
            heading="Our Story"
            headingId="about-story-heading"
            paragraphs={[
              "ENICE Group started from one observation: the biggest problems facing African businesses aren't problems of ambition, they're problems of infrastructure. The software systems and financial rails that large organisations rely on elsewhere have historically been too expensive, too inaccessible, or simply missing for businesses in emerging markets.",
              "We're building more than one product on the same foundation. The same engineering standards and shared infrastructure can support multiple purpose-built platforms, each serving a distinct need and strengthening the system around it.",
              "This isn't a collection of separate experiments. It's a deliberate approach: shared infrastructure compounds in value, and the quality of one product raises the bar for whatever we build next.",
            ]}
          />
        </Reveal>
      </Section>

      {/* ── 3. OUR MISSION ────────────────────────────────────────────────── */}
      <Section container="narrow" divider aria-labelledby="about-mission-heading">
        <Reveal>
          <ProseBand
            number="/03"
            sectionKey="about.mission"
            heading="Our Mission"
            headingId="about-mission-heading"
            paragraphs={[
              "We want to build the technology layer that lets businesses, institutions, and developers across Africa, and eventually beyond, operate at real scale. Not software that works well enough, but software built with the reliability, security, and performance that institutional operations require.",
              "Our customers aren't test users. They're financial service providers, enterprise operations teams, and technology builders who need infrastructure they can stake their business on. We serve them with platforms that are secure by design and built to hold up under real commercial volume.",
              "We're aiming for structural impact, not just features. When payment infrastructure is reliable, commerce expands. When enterprise AI is trustworthy, teams get more done. When developer tools are solid, the next generation of companies gets built faster. That's the impact we're here for.",
            ]}
          />
        </Reveal>
      </Section>

      {/* ── 4. WHAT WE BUILD ──────────────────────────────────────────────── */}
      <Section
        container="narrow"
        tone="recessed"
        divider
        aria-labelledby="about-what-we-build-heading"
      >
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <div>
              <BandNumber>/04</BandNumber>
              <h2 id="about-what-we-build-heading" className="type-h2 mt-4 text-foreground">
                <StyledText
                  text={fieldText(build, "heading", "What We Build")}
                  accentClassName="text-gold"
                />
              </h2>
            </div>
            <div data-allow-select className="space-y-6">
              {buildParagraphs.map((paragraph, i) => (
                <p key={i} className="type-body">
                  <StyledText
                    text={paragraph}
                    accentClassName="text-gold"
                    boldClassName={BUILD_BOLD_CLASS}
                  />
                </p>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Verticals grid */}
        <HairlineGrid columns={3} className="mt-14">
          {verticals.map((v, i) => (
            <Reveal key={v.label} delay={i * 50} className="flex">
              {/* Cells keep the grid's default `bg-background`, so inside this one recessed band
                  they read as wells cut into the surface rather than as another colour block. */}
              <div className="flex h-full flex-col p-8">
                <Eyebrow className="text-[10px] tracking-[0.2em]">{v.label}</Eyebrow>
                <p className="type-body mt-3">{v.description}</p>
              </div>
            </Reveal>
          ))}
        </HairlineGrid>
      </Section>

      {/* ── 5. LEADERSHIP ─────────────────────────────────────────────────── */}
      <Section container="narrow" divider aria-labelledby="about-team-heading">
        <Reveal>
          <div className="max-w-2xl">
            <BandNumber>/05</BandNumber>
            <h2 id="about-team-heading" className="type-h2 mt-4 text-foreground">
              <StyledText
                text={fieldText(leadership, "heading", "The Founding Team")}
                accentClassName="text-gold"
              />
            </h2>
            {/* This lead stays in code. `featureGrid` carries one `subheading`, and the note under
                the cards claimed it because that sentence is the one an editor actually changes —
                it carries the contact address. A second prose field would mean editing the shared
                schema, which is a wider change than this band deserves. */}
            <p className="type-lead mt-5">
              ENICE Group was founded by operators and engineers who spent years inside the problems
              they now build solutions for.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m, i) => (
            <Reveal key={m.role} delay={i * 60} className="flex">
              <Panel className="flex h-full flex-col gap-5 p-7">
                {/* Avatar placeholder */}
                <span
                  aria-hidden
                  className="grid h-14 w-14 place-items-center rounded-xl border border-gold/20 bg-gold/[0.07]"
                >
                  <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-gold">
                    {m.initial}
                  </span>
                </span>
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bone-strong">
                    {m.role}
                  </h3>
                  <p className="type-body mt-2">{m.scope}</p>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <Panel tone="quiet" className="mt-8 px-6 py-5">
            <p className="type-body">
              {noteEmailAt === -1 ? (
                note
              ) : (
                <>
                  {note.slice(0, noteEmailAt)}
                  <a
                    href={`mailto:${CORPORATE_EMAIL}`}
                    className="tap font-medium text-foreground underline-offset-2 transition-colors hover:text-gold hover:underline"
                  >
                    {CORPORATE_EMAIL}
                  </a>
                  {note.slice(noteEmailAt + CORPORATE_EMAIL.length)}
                </>
              )}
            </p>
          </Panel>
        </Reveal>
      </Section>

      {/* ── 6. OUR PRINCIPLES ─────────────────────────────────────────────── */}
      <Section container="narrow" divider aria-labelledby="about-principles-heading">
        <Reveal>
          <div className="max-w-2xl">
            <BandNumber>/06</BandNumber>
            <h2 id="about-principles-heading" className="type-h2 mt-4 text-foreground">
              <StyledText
                text={fieldText(values, "heading", "Our Principles")}
                accentClassName="text-gold"
              />
            </h2>
            <p className="type-lead mt-5">
              <StyledText
                text={fieldText(
                  values,
                  "subheading",
                  "These aren't aspirational values written for a careers page. They're the standards we hold every decision, every system, and every person on the team to.",
                )}
                accentClassName="text-gold"
              />
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 50} className="flex">
              <Panel as="article" className="h-full p-8">
                <div className="flex items-start gap-4">
                  <span className="mt-1 shrink-0">
                    <CardIndex value={i + 1} />
                  </span>
                  <div>
                    <h3 className="type-h3 text-foreground">{p.title}</h3>
                    <p className="type-body mt-3">{p.body}</p>
                  </div>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── 7. LOOKING AHEAD ──────────────────────────────────────────────── */}
      <Section container="narrow" divider glow="center" aria-labelledby="about-outlook-heading">
        <Reveal>
          <ProseBand
            number="/07"
            sectionKey="about.outlook"
            heading="Looking Ahead"
            headingId="about-outlook-heading"
            paragraphs={[
              "The infrastructure African businesses depend on is still largely being built, and that gap is what we're focused on — over a ten-to-twenty-year horizon most organisations aren't structured to sustain. We're building a home-grown technology group that competes globally, not one that follows trends.",
              "This isn't charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it — with systems businesses on this continent can run on for the next generation.",
              "What we build is made for a global market: it scales across regions, meets international compliance standards, and is built to compete with any equivalent platform anywhere. To the businesses and builders who rely on us — we're committed to technology that matters, to a standard that matters, and to taking the time to do it properly.",
            ]}
          />
        </Reveal>

        {/* Closing statement */}
        <Reveal>
          <blockquote
            data-allow-select
            className="mt-14 text-center sm:mt-20"
            aria-label="Closing statement from the founders"
          >
            {fieldParagraphs(closing, "body", [CLOSING_QUOTE]).map((paragraph, i) => (
              <p key={i} className="type-h3 mx-auto max-w-3xl text-foreground">
                <StyledText text={paragraph} accentClassName="text-gold" />
              </p>
            ))}
            <div className="mt-8 flex items-center gap-5">
              <span aria-hidden className="rule-fade h-px flex-1" />
              <footer className="font-mono text-[12px] tracking-[0.14em] text-bone-faint">
                {fieldText(closing, "heading", CLOSING_ATTRIBUTION)}
              </footer>
              <span aria-hidden className="rule-fade h-px flex-1" />
            </div>
          </blockquote>
        </Reveal>
      </Section>
    </SiteShell>
  );
}
