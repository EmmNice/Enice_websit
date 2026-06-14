import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: "Regulatory Compliance — ENICE Group" },
      { name: "description", content: "Regulatory posture, registrations, and compliance program of ENICE Group." },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Compliance · Regulatory Posture"
      title="Regulatory Compliance"
      intro="ENICE Group operates an institutional compliance program covering registration, financial integrity, data protection, and operational security across all venture platforms."
      sections={[
        { heading: "Corporate Registration", body: <p>ENICE Group is a registered Nano Enterprise with the Small and Medium Enterprises Development Agency of Nigeria (SMEDAN). All corporate filings are maintained in good standing.</p> },
        { heading: "Financial Infrastructure", body: <p>PulsePay operates as part of a regulated payment infrastructure layer with KYC, AML screening, and transaction monitoring integrated at the core. All movement of value is logged and auditable.</p> },
        { heading: "Data & Security Standards", body: <p>Our systems implement SOC2-aligned controls, Row-Level Security across every multi-tenant database, encrypted-at-rest storage, and active-active disaster recovery.</p> },
        { heading: "Contact for Regulatory Matters", body: <p>Regulators, auditors, and compliance partners may reach our office at <span className="text-foreground font-medium">compliance@enicegroup.com</span>.</p> },
      ]}
    />
  ),
});
