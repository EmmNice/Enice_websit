import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · ENICE Group" },
      {
        name: "description",
        content:
          "How ENICE Group collects, processes, and protects personal and corporate data across its product ecosystem.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Legal · Data Protection"
      title="Privacy Policy"
      intro="ENICE Group is committed to the highest standards of data protection across our product ecosystem. This policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our commerce platforms, or interact with our infrastructure."
      sections={[
        {
          heading: "Information We Collect",
          body: (
            <div className="space-y-4">
              <p>
                <span className="font-medium text-foreground">Personal data.</span>{" "}
                Name, email address, phone number, shipping and billing addresses,
                and business registration details when you interact with our
                platforms or venture services.
              </p>
              <p>
                <span className="font-medium text-foreground">Financial data.</span>{" "}
                Payment details, bank account information, and transaction
                history processed through our commerce infrastructure. All
                financial transactions are encrypted and handled by secure
                third-party processors.
              </p>
              <p>
                <span className="font-medium text-foreground">Technical data.</span>{" "}
                IP address, browser type, operating system, and tracking data
                collected through cookies to help us maintain performance and
                service quality.
              </p>
            </div>
          ),
        },
        {
          heading: "How We Use Your Information",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide, maintain, and improve our full-stack commerce platforms.</li>
              <li>Manage venture applications, partnerships, and integrations.</li>
              <li>Comply with legal obligations, prevent fraud, and protect the network.</li>
            </ul>
          ),
        },
        {
          heading: "Data Sharing and Disclosure",
          body: (
            <div className="space-y-4">
              <p>We do not sell your personal data. We may share information with:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">Subsidiaries and affiliates.</span>{" "}
                  Companies operating under the ENICE Group umbrella.
                </li>
                <li>
                  <span className="font-medium text-foreground">Service providers.</span>{" "}
                  Third-party vendors that handle payment processing, data
                  analysis, hosting, and infrastructure delivery.
                </li>
                <li>
                  <span className="font-medium text-foreground">Legal authorities.</span>{" "}
                  When required by law to comply with regulatory audits or legal
                  processes.
                </li>
              </ul>
            </div>
          ),
        },
        {
          heading: "Security and International Transfers",
          body: (
            <p>
              We use industry-standard administrative, technical, and physical
              security measures, including zero-trust architecture and row-level
              security, to protect your data. Because we operate platforms for
              global commerce, your data may be transferred to and maintained on
              servers outside your country. We make sure every transfer complies
              with applicable data protection laws.
            </p>
          ),
        },
        {
          heading: "Your Rights",
          body: (
            <p>
              Depending on where you live, you may have the right to access,
              correct, delete, or restrict the processing of your personal data.
              To exercise any of these rights, write to{" "}
              <a
                href="mailto:privacy@enicehq.com"
                className="font-medium text-primary hover:underline"
              >
                privacy@enicehq.com
              </a>
              . We respond to verified requests within fifteen business days.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              For any privacy-related requests or questions, please write to{" "}
              <a
                href="mailto:privacy@enicehq.com"
                className="font-medium text-primary hover:underline"
              >
                privacy@enicehq.com
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  ),
});
