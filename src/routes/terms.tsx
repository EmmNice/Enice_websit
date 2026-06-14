import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ENICE Group" },
      { name: "description", content: "Terms governing the use of ENICE Group platforms, APIs, and services." },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Legal · Service Agreement"
      title="Terms of Service"
      intro="These Terms govern your access to and use of platforms operated by ENICE Group, including PulsePay, PulseAssist, and ENICE Core infrastructure."
      sections={[
        { heading: "Acceptance of Terms", body: <p>By accessing any ENICE Group property or service, you agree to be bound by these Terms. If you are entering into this agreement on behalf of an organization, you represent that you have authority to bind that organization.</p> },
        { heading: "Permitted Use", body: <p>Services may be used only for lawful business purposes and in accordance with documented API limits, rate ceilings, and integration guidelines. Reverse engineering, abuse of infrastructure, or circumvention of security controls is prohibited.</p> },
        { heading: "Intellectual Property", body: <p>All software, designs, documentation, and platform assets remain the exclusive property of ENICE Group. No license is granted except as expressly stated in a signed enterprise agreement.</p> },
        { heading: "Limitation of Liability", body: <p>To the maximum extent permitted by law, ENICE Group shall not be liable for indirect, incidental, or consequential damages arising from the use of its services.</p> },
      ]}
    />
  ),
});
