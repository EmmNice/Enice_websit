import { Reveal } from "./Reveal";

const PARTNERS = [
  "SMEDAN",
  "PulsePay",
  "PulseAssist",
  "EPulse",
  "PulseX",
  "AWS Activate",
];

export function PartnersStrip() {
  return (
    <section className="border-b border-border bg-background py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Trusted across the ENICE ecosystem &amp; institutional partners
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-6">
            {PARTNERS.map((p) => (
              <div
                key={p}
                className="flex items-center justify-center"
                title={p}
              >
                <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground">
                  {p}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
