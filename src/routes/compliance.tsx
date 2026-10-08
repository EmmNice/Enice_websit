import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/compliance")({
  head: () => pageHead("/compliance"),
  component: () => (
    <LegalPage
      lastUpdated="October 8, 2026"
      kicker="Compliance · Regulatory Posture"
      title="Regulatory Compliance"
      intro="ENICE Technology Limited operates publicly as ENICE Group with transparency, integrity, and full adherence to applicable global and local statutory frameworks. As a product-driven technology company, our compliance program covers the platforms we build and operate."
      sections={[
        {
          // Deliberately no RC number and no entity class ("Business Name", "Limited by Shares").
          // A regulator reading this page looks for exactly those, so they are worth adding — but
          // they are worth adding *correctly*, from the certificate, rather than inferred. Same
          // discipline as the Security Architecture section below, which states plainly what we do
          // not hold rather than implying it.
          heading: "Corporate and Enterprise Registration",
          body: (
            <p>
              ENICE Technology Limited is registered with the Corporate Affairs Commission (CAC) of
              Nigeria and operates publicly under the ENICE Group brand. The company meets all local
              operational, reporting, and statutory requirements that apply to registered Nigerian
              businesses.
            </p>
          ),
        },
        {
          heading: "Commerce and Financial Infrastructure Compliance",
          body: (
            <div className="space-y-4">
              <p>
                <span className="font-medium text-foreground">
                  Anti-Money Laundering (AML) and KYC.
                </span>{" "}
                Our platforms rely on rigorous Know Your Customer and Anti-Money Laundering
                verification frameworks to prevent illicit financial flows, identity theft, and
                commercial fraud.
              </p>
              <p>
                <span className="font-medium text-foreground">Data security standards.</span> Any
                financial processing that runs in our environments uses industry-standard security
                architectures, including PCI-DSS compliant gateways, so data pipelines stay secure
                end to end.
              </p>
            </div>
          ),
        },
        {
          heading: "Global Data Compliance Frameworks",
          body: (
            <div className="space-y-4">
              <p>
                We map our application data models to comply with leading privacy regulations based
                on user demographics:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">NDPA and NDPR.</span> Compliant with
                  the Nigerian Data Protection Act and Regulation on consumer data privacy.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    GDPR and international standards.
                  </span>{" "}
                  Adhering to strict data-controllership rules for cross-border data transfers and
                  user consent in global commerce.
                </li>
              </ul>
            </div>
          ),
        },
        {
          heading: "Security Architecture",
          body: (
            <p>
              Our systems apply row-level security on every multi-tenant database, encryption in
              transit and at rest, and audit logging of privileged actions. We hold no third-party
              security certification at this time and do not claim one.
            </p>
          ),
        },
        {
          heading: "Contact for Regulatory Matters",
          body: (
            <p>
              Regulators, auditors, and compliance partners can reach our compliance team at{" "}
              <a
                href="mailto:compliance@enicehq.com"
                className="font-medium text-primary hover:underline"
              >
                compliance@enicehq.com
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  ),
});
