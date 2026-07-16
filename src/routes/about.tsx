import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ENICE Group | Venture Studio & Infrastructure Firm" },
      {
        name: "description",
        content:
          "ENICE Group is a technology venture studio and infrastructure holding firm. We design, engineer, and operate the software systems that power modern digital commerce, financial infrastructure, and enterprise AI.",
      },
      { property: "og:title", content: "About ENICE Group — Venture Studio & Infrastructure Firm" },
      {
        property: "og:description",
        content:
          "ENICE Group's corporate thesis, operating standards, and ecosystem strategy. A venture studio building the next generation of financial and AI infrastructure.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "ENICE Group" },
      { property: "og:url", content: "https://enicegroup.com/about" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ENICEHQ" },
      { name: "twitter:title", content: "About ENICE Group" },
      {
        name: "twitter:description",
        content:
          "Corporate thesis, operating standards, and ecosystem strategy of ENICE Group — a technology venture studio building financial and AI infrastructure.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://enicegroup.com/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About ENICE Group",
          description:
            "ENICE Group is a technology venture studio and infrastructure holding firm. We design, engineer, and operate software systems for financial infrastructure, enterprise AI, and digital commerce.",
          url: "https://enicegroup.com/about",
          publisher: {
            "@type": "Organization",
            name: "ENICE Group",
            url: "https://enicegroup.com",
            logo: "https://enicegroup.com/favicon.svg",
            foundingDate: "2026",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Abuja",
              addressCountry: "NG",
            },
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRINCIPLES = [
  {
    index: "01",
    title: "Long-Term Thinking",
    body: "Every architectural decision, every partnership, every product roadmap is evaluated against a horizon of decades — not quarters. We build companies that are meant to outlast trends, survive economic cycles, and compound in value over time. Short-term convenience that compromises long-term integrity is never an acceptable trade.",
  },
  {
    index: "02",
    title: "Engineering Excellence",
    body: "We hold our engineering to the same standards expected of the most demanding regulated industries. Our codebases are rigorously documented, our APIs are versioned and backward-compatible, and our system designs prioritise resilience over novelty. Mediocre software cannot power institutional-grade infrastructure.",
  },
  {
    index: "03",
    title: "Security by Design",
    body: "Security is not a layer added after a product ships — it is the foundation on which every system is built. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard practice across every venture in our ecosystem. We treat the protection of our partners' data as a fiduciary obligation.",
  },
  {
    index: "04",
    title: "Customer Obsession",
    body: "We measure ourselves against the outcomes of those we serve. Not feature counts, not uptime logs in isolation — actual, measurable improvement in the operational capability of our customers. Every product decision is traced back to a specific constraint facing a specific class of business, and our success is defined by how completely we remove it.",
  },
  {
    index: "05",
    title: "Institutional Quality",
    body: "We build for the sophistication of enterprise, not the tolerance of the early adopter. Our documentation, onboarding, support posture, and SLA commitments are structured to satisfy the expectations of legal, compliance, and procurement teams at serious organisations. We do not compromise on presentation, precision, or professionalism.",
  },
  {
    index: "06",
    title: "Responsible AI",
    body: "Artificial intelligence carries the potential for both extraordinary benefit and significant harm. At ENICE Group, AI systems are deployed with explicit guardrails, full auditability, and ongoing human oversight. We do not release AI-driven capabilities until they meet a threshold of reliability and interpretability we are prepared to defend publicly.",
  },
  {
    index: "07",
    title: "Continuous Innovation",
    body: "Staying relevant in technology requires disciplined, sustained investment in research and experimentation. Our innovation mandate is not delegated to a single team — it is embedded in the operating rhythm of every venture. We allocate engineering cycles to exploratory work deliberately, because the products we build in five years do not yet have names.",
  },
  {
    index: "08",
    title: "Ownership Mentality",
    body: "Everyone inside the ENICE ecosystem — from our engineers to our operations leads — is expected to think like an owner. This means proactive accountability, deep domain mastery, and a bias toward action. We do not build cultures of deference. We build cultures of excellence, where talent is trusted to lead and held to the standard that trust demands.",
  },
];

const VERTICALS = [
  { label: "Financial Infrastructure", description: "Core transaction rails, digital banking architecture, and payment processing systems." },
  { label: "Enterprise AI", description: "Autonomous communication, intelligent process automation, and adaptive enterprise intelligence." },
  { label: "Developer Infrastructure", description: "APIs, SDKs, and tooling that give builders a reliable foundation to scale on." },
  { label: "Digital Commerce", description: "End-to-end commerce platforms engineered for high-volume, institutional-grade operations." },
  { label: "Cloud Infrastructure", description: "Scalable, region-aware deployment systems with security and compliance baked in at the architecture layer." },
  { label: "Future Technology", description: "Long-horizon research and build programmes in areas that will define the next generation of global technology." },
];

// ─── Component ────────────────────────────────────────────────────────────────

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <SiteHeader />

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-[#060912] pb-16 pt-16 sm:pb-36 sm:pt-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            About ENICE Group
          </div>
          <h1 className="mt-6 max-w-4xl text-[2rem] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl md:text-7xl">
            We are not building a startup.{" "}
            <span className="text-blue-400">We are building the infrastructure.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 sm:mt-8 sm:text-xl">
            ENICE Group is a technology venture studio and infrastructure holding company. We design, fund, engineer, and operate a compounding ecosystem of software platforms — each one purpose-built to close a critical gap in financial infrastructure, enterprise intelligence, or digital commerce.
          </p>
        </div>
      </section>

      {/* ── 2. OUR STORY ────────────────────────────────────────────────── */}
      <section className="border-b border-border py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">/02</span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                Our Story
              </h2>
            </div>
            <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                ENICE Group was founded on a single, deliberate observation: the most consequential problems facing African businesses and institutions are not problems of ambition — they are problems of infrastructure. The software systems, financial rails, and enterprise tooling that global-scale organisations depend on have historically been inaccessible, prohibitively expensive, or simply absent for businesses operating in emerging markets.
              </p>
              <p>
                We chose the venture studio model over a single-product company because the problem set is too broad, and the compounding effect too valuable, to address through any single lens. A studio allows us to apply the same rigorous engineering standards, the same institutional design philosophy, and the same infrastructure backbone across multiple purpose-built ventures — each one serving a distinct market, each one reinforcing the others.
              </p>
              <p>
                This is not diversification for its own sake. It is a deliberate structural decision: to build a holding company where the whole is engineered to be worth more than the sum of its parts. Where shared infrastructure compounds in value. Where one venture's excellence sets the standard every subsequent venture is held to.
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
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">/03</span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                Our Mission
              </h2>
            </div>
            <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                We exist to build the foundational technology layer that enables businesses, institutions, and developers across Africa — and eventually the world — to operate at genuine scale. Not software that works well enough, but software that works with the reliability, security, and performance that institutional operations demand.
              </p>
              <p>
                Our customers are not test users or beta participants. They are financial service providers, enterprise operations teams, and technology builders who need infrastructure they can stake their business on. We serve them by delivering platforms that are robust by default, secure by design, and built to perform under the weight of real commercial volume.
              </p>
              <p>
                Our intended impact is structural. We are not interested in building features — we are interested in building the underlying systems that make entire categories of business possible. When payment infrastructure is reliable, commerce expands. When enterprise AI is accessible and trustworthy, operational capacity scales. When developer tools are professional-grade, the next generation of companies can be built faster and better. That is the impact we are here to create.
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
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">/04</span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                Our Vision
              </h2>
            </div>
            <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                Over the next ten to twenty years, we intend to build what Africa does not yet have: a home-grown, globally competitive technology infrastructure group. Not a company that processes technology trends, but one that defines them. An organisation capable of sitting at the same table as the world's most consequential technology companies — and holding its position there.
              </p>
              <p>
                We are building toward a future in which African-originated financial infrastructure is trusted by institutions across multiple continents. Where the enterprise AI systems powering African businesses set the regional standard for reliability and capability. Where the developer infrastructure coming out of our ecosystem is chosen by builders globally because it is, simply, the best available option.
              </p>
              <p>
                That is a ten-to-twenty year project. It requires a standard of discipline, patience, and engineering rigour that most organisations are not structured to sustain. ENICE Group is. Our model is designed for compounding — not for the short cycle of a venture-backed startup, but for the long arc of an institution building something that will last.
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
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400/70">/05</span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
                What We Build
              </h2>
            </div>
            <div className="space-y-6 text-[16px] leading-relaxed text-white/60">
              <p>
                Our model spans five stages: we identify a structural gap in a market, design a venture around the most rigorous interpretation of what solving that gap requires, fund and staff it with precision, engineer the product to institutional standards, launch it, and then operate it with the same discipline we applied in building it. We do not hand off. We do not outsource. We own the full lifecycle.
              </p>
              <p>
                Across our portfolio, we operate in domains that sit at the intersection of high technical complexity and high real-world consequence: financial infrastructure and digital banking; AI-powered enterprise communication and operational automation; developer tools and API infrastructure; digital commerce systems; cloud and deployment infrastructure; and long-horizon emerging technology research.
              </p>
              <p>
                Our two current ventures represent the foundation of this ecosystem. <strong className="text-white font-semibold">PulsePay</strong> is our financial infrastructure platform — a Naira-native payment processing and digital banking system built for the operational demands of Nigerian businesses, from high-frequency transaction processing to institutional-grade compliance. <strong className="text-white font-semibold">PulseAssist</strong> is our enterprise AI platform — an intelligent communication and automation layer that augments the operational capacity of enterprise teams, replacing procedural overhead with adaptive, context-aware intelligence.
              </p>
              <p>
                These are not the only ventures we will build. They are the first two in a portfolio we intend to expand with the same deliberate, standards-driven approach across every vertical we enter.
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
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. OUR PRINCIPLES ───────────────────────────────────────────── */}
      <section className="border-b border-border py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-10 sm:mb-16">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">/06</span>
            <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
              Our Principles
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              These are not aspirational values written for a careers page. They are operational constraints — the standards we hold every decision, every system, and every member of our team to.
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
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
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
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">/07</span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-foreground sm:text-4xl">
                Our Ecosystem
              </h2>
            </div>
            <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                The most important feature of the ENICE Group model is not any individual venture — it is the infrastructure they share. Every company we build operates on a common engineering foundation: the same security architecture, the same zero-trust access model, the same data isolation standards, the same deployment infrastructure, the same quality gates in the engineering pipeline.
              </p>
              <p>
                This shared foundation creates compounding value in two directions. For each new venture, it significantly reduces the time and cost of reaching production-grade reliability — because the hard problems of infrastructure have already been solved at the group level and do not need to be re-solved in isolation. For every existing venture, the addition of a new platform strengthens the collective infrastructure through shared investment, shared learnings, and shared operational standards.
              </p>
              <p>
                The result is an ecosystem that becomes more valuable, more resilient, and more capable with every venture we add. Our companies are not simply co-located under a holding entity — they are architecturally integrated. Security improvements propagate across the portfolio. Infrastructure advances lift every platform. Compliance work done once serves every venture that operates in a regulated domain.
              </p>
              <p>
                This is why we describe what we are building as an ecosystem rather than a portfolio. A portfolio is a collection. An ecosystem compounds.
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
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-400/70">/08</span>
              <h2 className="mt-4 text-3xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
                Looking Ahead
              </h2>
            </div>
            <div className="space-y-6 text-[16px] leading-relaxed text-white/60">
              <p>
                The infrastructure that African businesses depend on — financial, technological, operational — is still largely being built. That is not a criticism. It is an observation about where the opportunity sits, and a statement about the responsibility that comes with being positioned to address it.
              </p>
              <p>
                ENICE Group intends to build the foundational systems that businesses on this continent will run on for the next generation. Not as an act of charity or corporate social responsibility, but as a hard commercial thesis: the demand for institutional-quality infrastructure is large, growing, and significantly underserved. We are building the supply side.
              </p>
              <p>
                We are equally clear about the global dimension of this work. The systems we build will not be confined to a single market. They will be engineered to scale across regions, to meet international compliance standards, and to compete with any equivalent platform in the world. We have no interest in building the best option available in Nigeria, or in Africa. We are building to be the best option available — full stop.
              </p>
              <p>
                For the businesses that partner with us, the investors who back our ecosystem, and the engineers and operators who choose to build their careers with us: we offer something rarer than a product roadmap. We offer a structural commitment — to build something that matters, to the standard that matters, over the time horizon that it actually takes to build it properly.
              </p>
            </div>
          </div>

          {/* Closing statement */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-7 sm:mt-20 sm:p-16 text-center">
            <p className="mx-auto max-w-3xl text-xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
              "The infrastructure a society depends on is the most durable thing it can build. We are here to build it."
            </p>
            <div className="mt-6 text-sm font-medium text-white/40">
              — The Founders, ENICE Group
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
