import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service · ENICE Group" },
      {
        name: "description",
        content:
          "Terms governing access to and use of ENICE Group platforms, APIs, and infrastructure services.",
      },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Legal · Service Agreement"
      title="Terms of Service"
      intro="By accessing or using the websites, infrastructure, or commerce platforms operated by ENICE Group, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately."
      sections={[
        {
          heading: "Eligibility and Accounts",
          body: (
            <p>
              To use certain enterprise or platform features, you may be required to register an
              account. You agree to provide accurate information and maintain the security of your
              credentials. You are solely responsible for all activities that occur under your
              account.
            </p>
          ),
        },
        {
          heading: "Intellectual Property Rights",
          body: (
            <p>
              Unless otherwise indicated, all platforms, software builds, architecture, code,
              designs, text, and trademarks on our services are the proprietary property of ENICE
              Group and are protected by applicable intellectual property laws. No license is
              granted except as expressly stated in a signed enterprise agreement.
            </p>
          ),
        },
        {
          heading: "Prohibited Activities",
          body: (
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Reverse engineer, decompile, or disrupt any full-stack infrastructure or networks
                managed by ENICE Group.
              </li>
              <li>
                Use our commerce platforms for fraudulent, unlawful, or unauthorized financial
                transactions.
              </li>
              <li>
                Circumvent any security protocols, access controls, or rate limits established on
                our web servers.
              </li>
            </ul>
          ),
        },
        {
          heading: "Limitation of Liability",
          body: (
            <p>
              To the maximum extent permitted by law, ENICE Group, its subsidiaries, and its
              directors shall not be liable for any indirect, incidental, special, or consequential
              damages arising out of your use or inability to use our infrastructure platforms.
              Services are provided on an "AS IS" and "AS AVAILABLE" basis.
            </p>
          ),
        },
        {
          heading: "Governing Law",
          body: (
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              Federal Republic of Nigeria, without regard to its conflict of law principles.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions regarding these Terms may be directed to{" "}
              <a
                href="mailto:corporate@enicehq.com"
                className="font-medium text-primary hover:underline"
              >
                corporate@enicehq.com
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  ),
});
