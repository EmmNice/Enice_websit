import { Reveal } from "./Reveal";
import { StyledText } from "./StyledText";
import { CardIndex, HairlineGrid, Section, SectionIntro } from "./primitives";
import { useSectionFields, fieldText, fieldItems } from "@/lib/cms/use-section";

/**
 * The infrastructure the products are built on.
 *
 * Named providers, each with what it is actually used for. Editable through the
 * `home.infrastructure` section — this list changes as the architecture does, and needing a deploy
 * to correct which database backs which product is how a page like this goes stale.
 */
const STACK = [
  {
    name: "Amazon Web Services",
    abbr: "AWS",
    label: "Cloud infrastructure and security",
    detail:
      "Our main cloud backbone. It handles compute, storage, and edge delivery across every ENICE Group platform.",
  },
  {
    name: "Google Cloud",
    abbr: "GCP",
    label: "Core AI engine and computational intelligence",
    detail:
      "Runs PulseAssist's AI pipeline: LLM orchestration and workflow automation across tenants, with Gemini as the model layer.",
  },
  {
    name: "Supabase",
    abbr: "PG",
    label: "Database infrastructure and auth",
    detail:
      "Row-level security, real-time data streams, and managed Postgres for PulsePay's transaction systems.",
  },
];

export function InfraStack() {
  const infra = useSectionFields("home.infrastructure");

  const stack = fieldItems(infra, "items", STACK, (row) => {
    const name = typeof row.title === "string" ? row.title.trim() : "";
    if (!name) return null;
    return {
      name,
      abbr: typeof row.kicker === "string" ? row.kicker.trim() : "",
      label: typeof row.bullets === "string" ? row.bullets.split("\n")[0].trim() : "",
      detail: typeof row.description === "string" ? row.description.trim() : "",
    };
  });

  return (
    <Section divider aria-labelledby="infra-heading">
      <Reveal>
        <SectionIntro
          id="infra-heading"
          eyebrow={fieldText(infra, "eyebrow", "Technology foundation")}
          heading={fieldText(infra, "heading", "The stack underneath.")}
          lead={fieldText(
            infra,
            "subheading",
            "Every ENICE Group product runs on the same backbone. We chose it for reliability, compliance, and scale, not because it was the easy option.",
          )}
        />
      </Reveal>

      <HairlineGrid columns={3} className="mt-14">
        {stack.map((s, i) => (
          <Reveal key={s.name} delay={i * 60} className="flex">
            <div className="panel-interactive flex h-full w-full flex-col p-8 xl:p-10">
              <div className="flex items-start justify-between">
                {s.abbr && (
                  <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-gold">
                    {s.abbr}
                  </span>
                )}
                <CardIndex value={i + 1} />
              </div>

              <p className="mt-10 text-xl font-semibold leading-tight tracking-[-0.02em] text-foreground">
                <StyledText text={s.name} accentClassName="text-gold" />
              </p>

              <span aria-hidden className="rule-fade my-6" />

              <div className="mt-auto">
                {s.label && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-bone-strong">
                    {s.label}
                  </p>
                )}
                <p className="mt-2.5 text-[12px] leading-relaxed text-bone-soft">
                  <StyledText text={s.detail} accentClassName="text-gold" />
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </HairlineGrid>
    </Section>
  );
}
