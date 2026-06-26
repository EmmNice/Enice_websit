import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as SiteHeader, a as SiteFooter } from "./SiteFooter-CcDohx4S.mjs";
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
const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
function AboutPage() {
  const columns = [{
    label: "01",
    title: "Corporate Thesis",
    body: "ENICE Group operates as a specialized technology venture studio and infrastructure holding firm. We design, engineer, and deploy high-capacity software ecosystems that power modern digital commerce and institutional automation. Our mission is to bridge operational gaps for enterprises through robust financial transaction architecture and advanced autonomous AI systems."
  }, {
    label: "02",
    title: "Operational Excellence & Security Standards",
    body: "At ENICE Group, infrastructure integrity is paramount. Our proprietary software platforms are engineered on foundations of zero-trust security architectures, absolute multi-tenant database isolation, and real-time algorithmic guardrails. We build to satisfy rigorous compliance frameworks, ensuring that our corporate partners in banking, financial technology, and telecommunications can scale their operations with zero structural risk."
  }, {
    label: "03",
    title: "Ecosystem Strategy",
    body: "We do not merely build software; we incubate market-defining platforms. By controlling the entire development lifecycle — from low-level database schemas to high-throughput external API integration gateways — ENICE Group ensures every venture in our ecosystem operates with institutional-grade speed, premium usability, and flawless data isolation."
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground antialiased", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-b border-border py-20 sm:py-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-5 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "About ENICE Group" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl", children: "A venture studio engineered for institutional scale." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg", children: "We architect, capitalize, and operate full-stack software ventures — building the financial and AI infrastructure that powers modern industry." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-secondary py-20 sm:py-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-6 lg:grid-cols-3", children: columns.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex flex-col rounded-xl border border-border bg-background p-8 sm:p-10", style: {
      boxShadow: SHADOW_CARD
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[11px] font-semibold tracking-[0.2em] text-muted-foreground", children: [
        "/",
        c.label
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-6 text-2xl font-semibold leading-snug tracking-tight text-foreground", children: c.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-[14.5px] leading-relaxed text-muted-foreground", children: c.body })
    ] }, c.title)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  AboutPage as component
};
