import { Cta, Eyebrow, Section } from "./primitives";
import { StyledText } from "./StyledText";
import { useSectionFields, fieldText } from "@/lib/cms/use-section";

/**
 * The closing hiring band, editable through the `home.careers` section.
 *
 * Centred and deliberately sparse — it is the one place on the page that asks for nothing but
 * attention, and the ambient light is what separates it from the contact form beneath rather than
 * a background colour change.
 */
export function Careers() {
  const careers = useSectionFields("home.careers");

  return (
    <Section
      id="careers"
      spacing="tight"
      glow="center"
      divider
      container="narrow"
      aria-labelledby="careers-heading"
    >
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow className="justify-center">
          {fieldText(careers, "eyebrow", "Work with us")}
        </Eyebrow>
        <h2 id="careers-heading" className="type-h2 mt-5 text-foreground">
          <StyledText
            text={fieldText(careers, "heading", "Build useful products.")}
            accentClassName="text-electric"
          />
        </h2>
        <p className="type-lead mx-auto mt-5">
          <StyledText
            text={fieldText(
              careers,
              "subheading",
              "We work with engineers and product builders who care about clear thinking, solid work, and reliable software.",
            )}
            accentClassName="text-electric"
          />
        </p>
        <Cta
          to={fieldText(careers, "ctaUrl", "/contact")}
          icon="external"
          className="mt-9"
          data-cta="careers"
        >
          {fieldText(careers, "ctaLabel", "Contact the team")}
        </Cta>
      </div>
    </Section>
  );
}
