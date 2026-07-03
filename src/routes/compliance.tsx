import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Regulatory Compliance — ENICE Group" },
      {
        name: "description",
        content:
          "Regulatory posture, registrations, and compliance program of ENICE Group.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Compliance · Regulatory Posture"
      title="Regulatory Compliance"
      intro="ENICE Group is committed to operating with transparency, integrity, and absolute adherence to global and local statutory frameworks. As a venture studio and commerce infrastructure holding firm, our compliance strategy covers three core areas."
      sections={[
        {
          heading: "Corporate & Enterprise Registration",
          body: (
            <p>
              ENICE Group is fully registered under the Small and Medium Enterprises
              Development Agency of Nigeria (SMEDAN) as a certified Nano Enterprise,
              fulfilling all localized operational, reporting, and statutory guidelines for
              enterprise businesses.
            </p>
          ),
        },
        {
          heading: "Commerce & Financial Infrastructure Compliance",
          body: (
            <div className="space-y-4">
              <p>
                <span className="font-medium text-foreground">
                  Anti-Money Laundering (AML) & KYC —
                </span>{" "}
                Our engineered platforms utilize rigorous Know Your Customer and Anti-Money
                Laundering verification frameworks to prevent illicit financial flows, identity
                theft, and commercial fraud.
              </p>
              <p>
                <span className="font-medium text-foreground">Data Security Standards —</span>{" "}
                Any financial processing built into our environments relies on
                industry-standard security architectures — including PCI-DSS compliant
                gateways — ensuring secure data handling pipelines end to end.
              </p>
            </div>
          ),
        },
        {
          heading: "Global Data Compliance Frameworks",
          body: (
            <div className="space-y-4">
              <p>
                We map our application data layouts to comply with leading privacy regulations
                based on user demographics:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">NDPA / NDPR —</span>{" "}
                  Compliant with the Nigerian Data Protection Act and Regulation regarding
                  consumer data privacy.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    GDPR / International Standards —
                  </span>{" "}
                  Adhering to strict data controllership regulations for cross-border data
                  transfers and user privacy consent in global commerce transactions.
                </li>
              </ul>
            </div>
          ),
        },
        {
          heading: "Security Architecture",
          body: (
            <p>
              Our systems implement SOC2-aligned controls, Row-Level Security across every
              multi-tenant database, encrypted-at-rest storage, zero-trust access
              architecture, and active-active disaster recovery posture.
            </p>
          ),
        },
        {
          heading: "Contact for Regulatory Matters",
          body: (
            <p>
              Regulators, auditors, and compliance partners may reach our office at{" "}
              <a
                href="mailto:compliance@enicegroup.com"
                className="font-medium text-primary hover:underline"
              >
                compliance@enicegroup.com
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  ),
});
