import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ENICE Group" },
      { name: "description", content: "How ENICE Group collects, processes, and protects personal and corporate data across its ecosystem." },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Legal · Data Protection"
      title="Privacy Policy"
      intro="ENICE Group is committed to the highest standards of data protection across its venture ecosystem. This policy outlines how we collect, use, and safeguard information."
      sections={[
        { heading: "Information We Collect", body: <p>We collect identifying information you voluntarily submit through corporate inquiry forms, partnership channels, and platform onboarding. This includes name, corporate email, organization, and the substance of your inquiry. Operational telemetry (anonymized request metadata) is also captured to maintain service quality.</p> },
        { heading: "How We Use Information", body: <p>Information is used solely to facilitate corporate engagement, technical onboarding, compliance verification, and the operation of our platforms (PulsePay, PulseAssist, and ENICE Core). We do not sell or rent personal data to third parties.</p> },
        { heading: "Data Retention & Security", body: <p>All data is stored on encrypted, role-isolated databases enforced by zero-trust access controls and Row-Level Security policies. Retention follows applicable regulatory requirements and is purged on documented schedules.</p> },
        { heading: "Your Rights", body: <p>You may request access, correction, or deletion of your personal data by contacting <span className="text-foreground font-medium">privacy@enicegroup.com</span>. We respond to verified requests within fifteen business days.</p> },
      ]}
    />
  ),
});
