import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { S as SiteHeader, a as SiteFooter } from "./SiteFooter-CcDohx4S.mjs";
import { M as Mail, a as MapPin, b as Check, c as ArrowRight } from "../_libs/lucide-react.mjs";
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
const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const INQUIRY_OPTIONS = ["Fintech Infrastructure Integration (PulsePay)", "Telecom/Banking AI Deployment (PulseAssist)", "Venture Strategic Partnership", "General Corporate Inquiry"];
function ContactPage() {
  const [form, setForm] = reactExports.useState({
    name: "",
    email: "",
    company: "",
    inquiry: "",
    message: ""
  });
  const [submitted, setSubmitted] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground antialiased", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-b border-border py-20 sm:py-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-5 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Corporate Engagement" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl", children: "Initialize Corporate Engagement" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg", children: "Connect with the ENICE Group executive or engineering office regarding integration, enterprise licensing, or venture partnerships." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-secondary py-20 sm:py-28", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background p-8", style: {
          boxShadow: SHADOW_CARD
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: "Direct Channels" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-6 space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mt-0.5 h-4 w-4 text-primary", strokeWidth: 2 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Corporate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm text-foreground", children: "corporate@enicegroup.com" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "mt-0.5 h-4 w-4 text-primary", strokeWidth: 2 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Offices" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm text-foreground", children: "Abuja · Kaduna, Nigeria" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background p-8", style: {
          boxShadow: SHADOW_CARD
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: "Response SLA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-muted-foreground", children: "Formal inquiries are reviewed by an ENICE partner and responded to within two business days." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-background p-8 sm:p-10", style: {
        boxShadow: SHADOW_CARD
      }, children: submitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-start justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
          " Inquiry Received"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mt-6 text-2xl font-semibold tracking-tight text-foreground", children: [
          "Thank you, ",
          form.name.split(" ")[0] || "partner",
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-md text-sm leading-relaxed text-muted-foreground", children: "Your submission has been routed to the appropriate ENICE office. A partner will respond within two business days." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.company.trim() || !form.message.trim()) return;
        setSubmitted(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full Name", value: form.name, onChange: (v) => setForm({
            ...form,
            name: v
          }), placeholder: "Jane Doe", required: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Corporate Email Address", type: "email", value: form.email, onChange: (v) => setForm({
            ...form,
            email: v
          }), placeholder: "jane@company.com", required: true })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Company / Institution Name", value: form.company, onChange: (v) => setForm({
          ...form,
          company: v
        }), placeholder: "Acme Bank PLC", required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Nature of Inquiry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: form.inquiry, onChange: (e) => setForm({
            ...form,
            inquiry: e.target.value
          }), required: true, className: "mt-2 block w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: "Select Nature of Inquiry…" }),
            INQUIRY_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o, children: o }, o))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Operational Scope / Message" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.message, onChange: (e) => setForm({
            ...form,
            message: e.target.value.slice(0, 2e3)
          }), rows: 6, placeholder: "Describe the integration, partnership, or operational scope you'd like to discuss.", className: "mt-2 block w-full resize-none rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "group inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-[13px] font-semibold text-primary-foreground transition-all hover:bg-primary/90", children: [
          "Submit Formal Inquiry",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
        ] })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, required, maxLength: 200, onChange: (e) => onChange(e.target.value), placeholder, className: "mt-2 block w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15" })
  ] });
}
export {
  ContactPage as component
};
