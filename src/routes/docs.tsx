import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Documentation — ENICE Group" },
      { name: "description", content: "Technical overview of the ENICE Core API surface for partners and integrators." },
    ],
  }),
  component: () => (
    <LegalPage
      kicker="Developers · ENICE Core"
      title="API Documentation"
      intro="A high-level technical overview of the ENICE Core API surface. Full reference, sandbox keys, and partner onboarding are provided to verified integrators upon request."
      sections={[
        { heading: "Base URL & Authentication", body: <><p>All requests are made over HTTPS against <span className="text-foreground font-medium">https://api.enice.group/v1</span>. Authentication uses scoped, signed bearer tokens issued through the partner console.</p><pre className="overflow-x-auto rounded-md border border-border bg-secondary px-4 py-3 text-[12px] text-foreground">Authorization: Bearer ek_live_xxxxxxxxxxxxxxxxxxxx</pre></>},
        { heading: "Core Resources", body: <ul className="list-disc space-y-2 pl-5"><li><span className="text-foreground font-medium">/wallets</span> — programmable issuance and balance operations</li><li><span className="text-foreground font-medium">/ledger</span> — double-entry transaction posting and reconciliation</li><li><span className="text-foreground font-medium">/assist</span> — autonomous agent routing and conversation state</li><li><span className="text-foreground font-medium">/kyc</span> — identity verification and screening pipelines</li></ul> },
        { heading: "Rate Limits", body: <p>Production keys are provisioned at 1,000 requests per minute by default, burstable to 5,000. Higher tiers are available under enterprise agreements.</p> },
        { heading: "Webhooks", body: <p>All asynchronous events are delivered through HMAC-signed webhooks with at-least-once delivery semantics and configurable replay windows.</p> },
      ]}
    />
  ),
});
