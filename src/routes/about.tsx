import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { StyledText } from "@/components/site/StyledText";
import { useSectionFields, fieldText, fieldItems } from "@/lib/cms/use-section";
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
    body: "Security isn't added after a product ships. It's built in from the start. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard across every product we run. We treat our partners' data as our responsibility.",
  },
  {
    index: "04",
    title: "Customer Obsession",
    body: "We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it.",
  },
  {
    index: "05",
    title: "Institutional Quality",
    body: "We build for enterprise, not for early adopters willing to tolerate rough edges. Our documentation, onboarding, support, and SLA commitments are built to satisfy legal, compliance, and procurement teams at serious organisations.",
  },
  {
    index: "06",
    title: "Responsible AI",
    body: "AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don't release a capability until we're confident in its reliability and we can explain how it works.",
  },
  {
    index: "07",
    title: "Continuous Innovation",
    body: "Staying relevant takes sustained investment in research and experimentation. It isn't one team's job, it's built into how every product team works. We set aside engineering time for exploratory work because what we build in five years doesn't have a name yet.",
  },
  {
    index: "08",
    title: "Ownership Mentality",
    body: "Everyone at ENICE, from engineers to operations leads, is expected to think like an owner: accountable, deeply knowledgeable in their domain, and biased toward action. We trust people to lead, and we hold them to that standard.",
  },
];

/**
 * The "What We Build" paragraphs, as the band's `body` field would hold them.
 *
 * The product names carry `**…**` rather than a hard-coded `<strong>` so they stay part of the
 * editable text; `ProseBandBody` renders them with this band's own emphasis style, which is what
 * the markup used before.
 */
const BUILD_PARAGRAPHS = [
  "We find a real gap, design a product around what it takes to close it, build it to a high standard, launch it, and then operate it with the same discipline we used to build it. We don't hand products off. We own the full lifecycle.",
  "We work across areas where technical complexity meets real-world consequence: financial infrastructure and digital banking, AI-powered enterprise communication and automation, developer tools and API infrastructure, digital commerce systems, cloud infrastructure, and longer-horizon research.",
  "Our two current products are the foundation of this. **PulsePay** is our financial infrastructure platform, a Naira-native payment processing and digital banking system built for Nigerian businesses, from high-frequency transactions to compliance. **PulseAssist** is our enterprise AI platform, a communication and automation layer that helps enterprise teams cut down on procedural overhead.",
  "These are the first two products in a lineup we plan to grow the same way: deliberately, and to a high standard.",
];

const FOUNDING_TEAM = [
  {
    initial: "CEO",
    role: "Founder & Chief Executive Officer",
    scope: "Corporate strategy, venture direction, and ecosystem growth.",
  },
  {
    initial: "CTO",
    role: "Chief Technology Officer",
    scope: "Platform architecture, engineering standards, and infrastructure design.",
  },
  {
    initial: "COO",
    role: "Chief Operations Officer",
    scope: "Product delivery, partner operations, and compliance execution.",
  },
];

/** The email link is expressed as `[label](mailto:…)` so the address stays editable. */
const TEAM_FOOTNOTE =
  "Our founding team prefers to let the work speak. Executive contact is available through [corporate@enicehq.com](mailto:corporate@enicehq.com) for qualified enterprise and partnership inquiries.";

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

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Initials for a leadership badge, used only when the badge text is left blank.
 *
 * The badge is a fixed-size ring and an empty one reads as a rendering fault, so a member added
 * without one still gets something legible derived from their role.
 */
function badgeFor(role: string): string {
  const initials = role
    .split(/[^A-Za-z]+/)
    .filter((word) => word.length > 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return initials.slice(0, 3) || role.slice(0, 3).toUpperCase();
}

/** Splits a body field into paragraphs on blank lines, the way every band on this page reads it. */
function paragraphsOf(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * The two-column layout every prose band on this page uses: a number and heading on the left,
 * paragraphs on the right.
 *
 * Separate from `ProseBand` because "What We Build" needs this exact markup but reads its heading
 * and body from a section that also carries a grid of focus areas — so it resolves its own fields
 * and passes the resulting strings in, rather than having this component fetch them again.
 *
 * `boldClassName` matters: the dark bands emphasise with `text-white font-semibold`, and the
 * default `font-bold` would visibly change them.
 */
function ProseBandBody({
  number,
  heading,
  body,
  dark = false,
}: {
  number: string;
  heading: string;
  body: string;
  dark?: boolean;
}) {
  const accentClassName = dark ? "text-blue-400" : "text-primary";
  const boldClassName = dark ? "text-white font-semibold" : "font-bold";

  return (
    <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
      <div>
        <span
          className={`font-mono text-[11px] font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-blue-400/70" : "text-muted-foreground"
          }`}
        >
          {number}
        </span>
        <h2
          className={`mt-4 text-3xl font-bold leading-snug tracking-tight sm:text-4xl ${
            dark ? "text-white" : "text-foreground"
          }`}
        >
          <StyledText
            text={heading}
            accentClassName={accentClassName}
            boldClassName={boldClassName}
          />
        </h2>
      </div>
      <div
        className={`space-y-6 text-[16px] leading-relaxed ${
          dark ? "text-white/60" : "text-muted-foreground"
        }`}
      >
        {paragraphsOf(body).map((paragraph, i) => (
          <p key={i}>
            <StyledText
              text={paragraph}
              accentClassName={accentClassName}
              boldClassName={boldClassName}
            />
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * One of the About page's numbered prose bands.
 *
 * The bands are structurally identical — a number, a heading, and a few paragraphs — so they share
 * this component rather than repeating the markup. Paragraphs come from the section's `body`,
 * separated by blank lines. The built-in copy is used until the section is edited, so the page is
 * unchanged in the meantime.
 */
function ProseBand({
  number,
  sectionKey,
  heading,
  paragraphs,
  dark = false,
}: {
  number: string;
  sectionKey: string;
  heading: string;
  paragraphs: string[];
  dark?: boolean;
}) {
  const fields = useSectionFields(sectionKey);

  return (
    <ProseBandBody
      number={number}
      heading={fieldText(fields, "heading", heading)}
      body={fieldText(fields, "body", paragraphs.join("\n\n"))}
      dark={dark}
    />
  );
}

function AboutPage() {
  // Editable bands, each falling back to the copy below until the section is edited.
  const hero = useSectionFields("about.hero");
  const values = useSectionFields("about.values");
  const build = useSectionFields("about.build");
  const team = useSectionFields("about.team");

  // The principles cards. Numbering is positional, so nobody maintains /01, /02 by hand.
  const principles = fieldItems(values, "items", PRINCIPLES, (row) => {
    const title = typeof row.title === "string" ? row.title.trim() : "";
    if (!title) return null;
    return {
      title,
      body: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  // The focus areas under "What We Build". A row without a label is skipped rather than rendered
  // as an empty tile.
  const focusAreas = fieldItems(build, "items", VERTICALS, (row) => {
    const label = typeof row.label === "string" ? row.label.trim() : "";
    if (!label) return null;
    return {
      label,
      description: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  // The leadership cards. The badge falls back to the role's first letters when left blank, so a
  // new member never renders an empty badge.
  const members = fieldItems(team, "items", FOUNDING_TEAM, (row) => {
    const role = typeof row.role === "string" ? row.role.trim() : "";
    if (!role) return null;
    return {
      role,
      scope: typeof row.remit === "string" ? row.remit.trim() : "",
      initial: typeof row.initials === "string" ? row.initials.trim() : "",
    };
  });

  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">
        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <section className="border-b border-border bg-[#060912] pb-16 pt-16 sm:pb-36 sm:pt-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              {fieldText(hero, "eyebrow", "About ENICE Group")}
            </div>
            <h1 className="mt-6 max-w-4xl text-[2rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl">
              <StyledText
                text={fieldText(
                  hero,
                  "heading",
                  "We build technology products. [[Then we operate them.]]",
                )}
                accentClassName="text-blue-400"
              />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:mt-8 sm:text-xl">
              <StyledText
                text={fieldText(
                  hero,
                  "subheading",
                  "ENICE Group is the parent company behind a growing set of software products. We find real problems in financial services, commerce, and business communication, then build and run the platforms that solve them.",
                )}
                accentClassName="text-blue-400"
              />
            </p>
          </div>
        </section>

        {/* ── 2. OUR STORY ────────────────────────────────────────────────── */}
        <section className="border-b border-border py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ProseBand
              number="/02"
              sectionKey="about.story"
              heading={"Our Story"}
              paragraphs={[
                "ENICE Group started from one observation: the biggest problems facing African businesses aren't problems of ambition, they're problems of infrastructure. The software systems and financial rails that large organisations rely on elsewhere have historically been too expensive, too inaccessible, or simply missing for businesses in emerging markets.",
                "We're building more than one product on the same foundation. The same engineering standards and shared infrastructure can support multiple purpose-built platforms, each serving a distinct need and strengthening the system around it.",
                "This isn't a collection of separate experiments. It's a deliberate approach: shared infrastructure compounds in value, and the quality of one product raises the bar for whatever we build next.",
              ]}
            />
          </div>
        </section>

        {/* ── 3. OUR MISSION ──────────────────────────────────────────────── */}
        <section className="border-b border-border bg-secondary py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ProseBand
              number="/03"
              sectionKey="about.mission"
              heading={"Our Mission"}
              paragraphs={[
                "We want to build the technology layer that lets businesses, institutions, and developers across Africa, and eventually beyond, operate at real scale. Not software that works well enough, but software built with the reliability, security, and performance that institutional operations require.",
                "Our customers aren't test users. They're financial service providers, enterprise operations teams, and technology builders who need infrastructure they can stake their business on. We serve them with platforms that are secure by design and built to hold up under real commercial volume.",
                "We're aiming for structural impact, not just features. When payment infrastructure is reliable, commerce expands. When enterprise AI is trustworthy, teams get more done. When developer tools are solid, the next generation of companies gets built faster. That's the impact we're here for.",
              ]}
            />
          </div>
        </section>

        {/* ── 4. OUR VISION ───────────────────────────────────────────────── */}
        <section className="border-b border-border py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ProseBand
              number="/04"
              sectionKey="about.vision"
              heading={"Our Vision"}
              paragraphs={[
                "Over the next ten to twenty years, we want to build what Africa doesn't yet have: a home-grown technology infrastructure group that competes globally, not one that just follows trends.",
                "We're building toward a future where African-originated financial infrastructure is trusted across multiple continents, where enterprise AI built here sets the regional standard for reliability, and where developer tools from our ecosystem are chosen by builders worldwide because they're simply good.",
                "That's a ten-to-twenty-year project. It takes discipline and patience most organisations aren't built to sustain. We're structured for the long run, not the short cycle of a typical startup.",
              ]}
            />
          </div>
        </section>

        {/* ── 5. WHAT WE BUILD ────────────────────────────────────────────── */}
        <section className="border-b border-border bg-[#060912] py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ProseBandBody
              number="/05"
              heading={fieldText(build, "heading", "What We Build")}
              body={fieldText(build, "body", BUILD_PARAGRAPHS.join("\n\n"))}
              dark
            />

            {/* Focus areas grid */}
            <div className="mt-16 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3 rounded-xl overflow-hidden">
              {focusAreas.map((v) => (
                <div key={v.label} className="bg-[#060912] p-8">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                    <StyledText text={v.label} accentClassName="text-white" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">
                    <StyledText
                      text={v.description}
                      accentClassName="text-blue-400"
                      boldClassName="text-white font-semibold"
                    />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LEADERSHIP ──────────────────────────────────────────────────── */}
        <section className="border-b border-border py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="mb-12">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                /05b
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                <StyledText text={fieldText(team, "heading", "The Founding Team")} />
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                <StyledText
                  text={fieldText(
                    team,
                    "subheading",
                    "ENICE Group was founded by operators and engineers who spent years inside the problems they now build solutions for.",
                  )}
                />
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <div
                  key={m.role}
                  className="flex flex-col gap-5 rounded-xl border border-border bg-background p-7"
                  style={{
                    boxShadow: "0 1px 2px rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)",
                  }}
                >
                  {/* Avatar placeholder */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/8 ring-1 ring-primary/15">
                    <span className="font-mono text-[11px] font-bold tracking-[0.18em] text-primary">
                      {m.initial || badgeFor(m.role)}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                      <StyledText text={m.role} accentClassName="text-foreground" />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      <StyledText text={m.scope} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-secondary/60 px-6 py-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <StyledText text={fieldText(team, "footnote", TEAM_FOOTNOTE)} />
              </p>
            </div>
          </div>
        </section>

        {/* ── 6. OUR PRINCIPLES ───────────────────────────────────────────── */}
        <section className="border-b border-border py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="mb-10 sm:mb-16">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                /06
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                <StyledText text={fieldText(values, "heading", "Our Principles")} />
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                <StyledText
                  text={fieldText(
                    values,
                    "subheading",
                    "These aren't aspirational values written for a careers page. They're the standards we hold every decision, every system, and every person on the team to.",
                  )}
                />
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {principles.map((p, i) => (
                <article
                  key={p.title}
                  className="rounded-xl border border-border bg-background p-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-muted-foreground shrink-0 mt-0.5">
                      /{String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">
                        {p.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. OUR ECOSYSTEM ────────────────────────────────────────────── */}
        <section className="border-b border-border bg-secondary py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ProseBand
              number="/07"
              sectionKey="about.ecosystem"
              heading={"Our Ecosystem"}
              paragraphs={[
                "The most important part of the ENICE Group model isn't any single product, it's the infrastructure they share. Every product we build runs on the same engineering foundation: the same security architecture, the same zero-trust access model, the same data isolation standards, and the same deployment pipeline.",
                "That shared foundation pays off twice. Each new product reaches production-grade reliability faster, because the hard infrastructure problems are already solved at the group level. And each existing product gets stronger as we add new ones, through shared investment and shared operational standards.",
                "The result is a set of products that gets more capable with each addition. Security improvements spread across the ecosystem. Infrastructure work lifts every product. Compliance work done once serves every regulated platform.",
                "That's why we call it an ecosystem rather than a collection of products. They're built to compound.",
              ]}
            />
          </div>
        </section>

        {/* ── 8. LOOKING AHEAD ────────────────────────────────────────────── */}
        <section className="border-b border-border bg-[#060912] py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <ProseBand
              number="/09"
              sectionKey="about.outlook"
              heading={"Looking Ahead"}
              paragraphs={[
                "The financial and technological infrastructure African businesses depend on is still largely being built. That's not a criticism, it's just where things stand, and it's the opportunity we're focused on.",
                "We want to build the systems businesses on this continent will run on for the next generation. This isn't charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it.",
                "We're also building for a global market. What we build will scale across regions, meet international compliance standards, and compete with any equivalent platform anywhere. We're not trying to be the best option in Nigeria or in Africa. We're trying to be the best option, period.",
                "To the businesses that use our products, and the engineers and operators who build with us: we're committed to building technology that matters, to a standard that matters, and taking the time it takes to do it properly.",
              ]}
              dark
            />

            {/* Closing statement */}
            <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:mt-20 sm:p-16 text-center">
              <p className="mx-auto max-w-3xl text-xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
                "The infrastructure a society depends on is the most durable thing it can build.
                That's what we're here to build."
              </p>
              <div className="mt-6 text-sm font-medium text-white/40">
                — The Founders, ENICE Group
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
