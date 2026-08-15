import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
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

function AboutPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground antialiased">
      <SiteHeader />
      <main id="main">
        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        <section className="border-b border-border bg-[#060912] pb-16 pt-16 sm:pb-36 sm:pt-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              About ENICE Group
            </div>
            <h1 className="mt-6 max-w-4xl text-[2rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl">
              We build technology products.{" "}
              <span className="text-blue-400">Then we operate them.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:mt-8 sm:text-xl">
              ENICE Group is the parent company behind a growing set of software products. We find
              real problems in financial services, commerce, and business communication, then build
              and run the platforms that solve them.
            </p>
          </div>
        </section>

        {/* ── 2. OUR STORY ────────────────────────────────────────────────── */}
        <section className="border-b border-border py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  /02
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                  Our Story
                </h2>
              </div>
              <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
                <p>
                  ENICE Group started from one observation: the biggest problems facing African
                  businesses aren't problems of ambition, they're problems of infrastructure. The
                  software systems and financial rails that large organisations rely on elsewhere
                  have historically been too expensive, too inaccessible, or simply missing for
                  businesses in emerging markets.
                </p>
                <p>
                  We're building more than one product on the same foundation. The same engineering
                  standards and shared infrastructure can support multiple purpose-built platforms,
                  each serving a distinct need and strengthening the system around it.
                </p>
                <p>
                  This isn't a collection of separate experiments. It's a deliberate approach:
                  shared infrastructure compounds in value, and the quality of one product raises
                  the bar for whatever we build next.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. OUR MISSION ──────────────────────────────────────────────── */}
        <section className="border-b border-border bg-secondary py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  /03
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                  Our Mission
                </h2>
              </div>
              <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
                <p>
                  We want to build the technology layer that lets businesses, institutions, and
                  developers across Africa, and eventually beyond, operate at real scale. Not
                  software that works well enough, but software built with the reliability,
                  security, and performance that institutional operations require.
                </p>
                <p>
                  Our customers aren't test users. They're financial service providers, enterprise
                  operations teams, and technology builders who need infrastructure they can stake
                  their business on. We serve them with platforms that are secure by design and
                  built to hold up under real commercial volume.
                </p>
                <p>
                  We're aiming for structural impact, not just features. When payment infrastructure
                  is reliable, commerce expands. When enterprise AI is trustworthy, teams get more
                  done. When developer tools are solid, the next generation of companies gets built
                  faster. That's the impact we're here for.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. OUR VISION ───────────────────────────────────────────────── */}
        <section className="border-b border-border py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  /04
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                  Our Vision
                </h2>
              </div>
              <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
                <p>
                  Over the next ten to twenty years, we want to build what Africa doesn't yet have:
                  a home-grown technology infrastructure group that competes globally, not one that
                  just follows trends.
                </p>
                <p>
                  We're building toward a future where African-originated financial infrastructure
                  is trusted across multiple continents, where enterprise AI built here sets the
                  regional standard for reliability, and where developer tools from our ecosystem
                  are chosen by builders worldwide because they're simply good.
                </p>
                <p>
                  That's a ten-to-twenty-year project. It takes discipline and patience most
                  organisations aren't built to sustain. We're structured for the long run, not the
                  short cycle of a typical startup.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. WHAT WE BUILD ────────────────────────────────────────────── */}
        <section className="border-b border-border bg-[#060912] py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400/70">
                  /05
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
                  What We Build
                </h2>
              </div>
              <div className="space-y-6 text-[16px] leading-relaxed text-white/60">
                <p>
                  We find a real gap, design a product around what it takes to close it, build it to
                  a high standard, launch it, and then operate it with the same discipline we used
                  to build it. We don't hand products off. We own the full lifecycle.
                </p>
                <p>
                  We work across areas where technical complexity meets real-world consequence:
                  financial infrastructure and digital banking, AI-powered enterprise communication
                  and automation, developer tools and API infrastructure, digital commerce systems,
                  cloud infrastructure, and longer-horizon research.
                </p>
                <p>
                  Our two current products are the foundation of this.{" "}
                  <strong className="text-white font-semibold">PulsePay</strong> is our financial
                  infrastructure platform, a Naira-native payment processing and digital banking
                  system built for Nigerian businesses, from high-frequency transactions to
                  compliance. <strong className="text-white font-semibold">PulseAssist</strong> is
                  our enterprise AI platform, a communication and automation layer that helps
                  enterprise teams cut down on procedural overhead.
                </p>
                <p>
                  These are the first two products in a lineup we plan to grow the same way:
                  deliberately, and to a high standard.
                </p>
              </div>
            </div>

            {/* Verticals grid */}
            <div className="mt-16 grid gap-px border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3 rounded-xl overflow-hidden">
              {VERTICALS.map((v) => (
                <div key={v.label} className="bg-[#060912] p-8">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                    {v.label}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{v.description}</p>
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
                The Founding Team
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                ENICE Group was founded by operators and engineers who spent years inside the
                problems they now build solutions for.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
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
              ].map((m) => (
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
                      {m.initial}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                      {m.role}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.scope}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-secondary/60 px-6 py-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Our founding team prefers to let the work speak. Executive contact is available
                through{" "}
                <a
                  href="mailto:corporate@enicehq.com"
                  className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                  corporate@enicehq.com
                </a>{" "}
                for qualified enterprise and partnership inquiries.
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
                Our Principles
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                These aren't aspirational values written for a careers page. They're the standards
                we hold every decision, every system, and every person on the team to.
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <article
                  key={p.index}
                  className="rounded-xl border border-border bg-background p-8"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-muted-foreground shrink-0 mt-0.5">
                      /{p.index}
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
            <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  /07
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                  Our Ecosystem
                </h2>
              </div>
              <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
                <p>
                  The most important part of the ENICE Group model isn't any single product, it's
                  the infrastructure they share. Every product we build runs on the same engineering
                  foundation: the same security architecture, the same zero-trust access model, the
                  same data isolation standards, and the same deployment pipeline.
                </p>
                <p>
                  That shared foundation pays off twice. Each new product reaches production-grade
                  reliability faster, because the hard infrastructure problems are already solved at
                  the group level. And each existing product gets stronger as we add new ones,
                  through shared investment and shared operational standards.
                </p>
                <p>
                  The result is a set of products that gets more capable with each addition.
                  Security improvements spread across the ecosystem. Infrastructure work lifts every
                  product. Compliance work done once serves every regulated platform.
                </p>
                <p>
                  That's why we call it an ecosystem rather than a collection of products. They're
                  built to compound.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. LOOKING AHEAD ────────────────────────────────────────────── */}
        <section className="border-b border-border bg-[#060912] py-24 sm:py-32">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
              <div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400/70">
                  /09
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
                  Looking Ahead
                </h2>
              </div>
              <div className="space-y-6 text-[16px] leading-relaxed text-white/60">
                <p>
                  The financial and technological infrastructure African businesses depend on is
                  still largely being built. That's not a criticism, it's just where things stand,
                  and it's the opportunity we're focused on.
                </p>
                <p>
                  We want to build the systems businesses on this continent will run on for the next
                  generation. This isn't charity. Demand for institutional-quality infrastructure is
                  large, growing, and underserved, and we intend to supply it.
                </p>
                <p>
                  We're also building for a global market. What we build will scale across regions,
                  meet international compliance standards, and compete with any equivalent platform
                  anywhere. We're not trying to be the best option in Nigeria or in Africa. We're
                  trying to be the best option, period.
                </p>
                <p>
                  To the businesses that use our products, and the engineers and operators who build
                  with us: we're committed to building technology that matters, to a standard that
                  matters, and taking the time it takes to do it properly.
                </p>
              </div>
            </div>

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
