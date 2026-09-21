import type { ReactNode } from "react";
import { SiteShell } from "./SiteShell";
import { Container, Eyebrow, Section } from "./primitives";

/**
 * The shared layout for the privacy, terms and compliance pages.
 *
 * Legal copy is read, not skimmed, so the body runs at the prose measure (~46rem) rather than the
 * full page grid, and the section bodies are marked `data-allow-select` — the site disables text
 * selection globally, which for a policy page means a visitor cannot copy the clause they want to
 * ask a question about.
 */
export function LegalPage({
  kicker,
  title,
  intro,
  /** Each policy is revised independently, so the date is supplied per page. */
  lastUpdated,
  sections,
}: {
  kicker: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: { heading: string; body: ReactNode }[];
}) {
  return (
    <SiteShell>
      <Section spacing="tight" container={null} glow="center">
        <Container width="prose">
          <Eyebrow>{kicker}</Eyebrow>
          <h1 className="type-display mt-5 text-foreground">{title}</h1>
          <p className="type-lead mt-6">{intro}</p>
          <p className="type-meta mt-7 uppercase tracking-[0.18em]">Last updated · {lastUpdated}</p>
        </Container>
      </Section>

      <Section spacing="tight" container="prose" divider>
        <ol className="space-y-12">
          {sections.map((s, i) => (
            <li key={s.heading}>
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden
                  className="font-mono text-[11px] font-semibold tracking-[0.18em] text-gold"
                >
                  /{String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
                  {s.heading}
                </h2>
              </div>
              <div
                data-allow-select
                className="mt-4 space-y-4 text-[15px] leading-[1.75] text-bone-strong [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_li]:mt-1.5 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
              >
                {s.body}
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </SiteShell>
  );
}
