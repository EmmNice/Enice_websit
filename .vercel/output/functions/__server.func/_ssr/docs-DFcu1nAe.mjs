import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as LegalPage } from "./LegalPage-Cd_gb067.mjs";
import "./SiteFooter-CcDohx4S.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/lucide-react.mjs";
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(LegalPage, { kicker: "Developers · ENICE Core", title: "API Documentation", intro: "A high-level technical overview of the ENICE Core API surface. Full reference, sandbox keys, and partner onboarding are provided to verified integrators upon request.", sections: [{
  heading: "Base URL & Authentication",
  body: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
      "All requests are made over HTTPS against ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "https://api.enice.group/v1" }),
      ". Authentication uses scoped, signed bearer tokens issued through the partner console."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "overflow-x-auto rounded-md border border-border bg-secondary px-4 py-3 text-[12px] text-foreground", children: "Authorization: Bearer ek_live_xxxxxxxxxxxxxxxxxxxx" })
  ] })
}, {
  heading: "Core Resources",
  body: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc space-y-2 pl-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "/wallets" }),
      " — programmable issuance and balance operations"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "/ledger" }),
      " — double-entry transaction posting and reconciliation"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "/assist" }),
      " — autonomous agent routing and conversation state"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "/kyc" }),
      " — identity verification and screening pipelines"
    ] })
  ] })
}, {
  heading: "Rate Limits",
  body: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Production keys are provisioned at 1,000 requests per minute by default, burstable to 5,000. Higher tiers are available under enterprise agreements." })
}, {
  heading: "Webhooks",
  body: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "All asynchronous events are delivered through HMAC-signed webhooks with at-least-once delivery semantics and configurable replay windows." })
}] });
export {
  SplitComponent as component
};
