import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as SiteHeader, a as SiteFooter } from "./SiteFooter-CcDohx4S.mjs";
import { R as Root2, I as Item, H as Header, T as Trigger2, C as Content2 } from "../_libs/radix-ui__react-accordion.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { c as ArrowRight, e as Banknote, B as BrainCircuit, f as Boxes, b as Check, g as Cpu, D as Database, F as FileCheckCorner, G as Globe, A as ArrowUpRight, S as ShieldCheck, L as Lock, W as Wifi, h as BookOpen, X, i as Gauge, j as Activity, k as ArrowDown, l as MessageCircle, m as Sparkles, n as Send, o as ChevronDown } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-direction.mjs";
const SHADOW_CARD$3 = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const terminalLines = [
  { t: "$ curl -X GET https://api.enice.group/v1/core", c: "text-emerald-400" },
  { t: "", c: "" },
  { t: "{", c: "text-slate-300" },
  { t: '  "ecosystem": "ENICE Core",', c: "text-slate-300" },
  { t: '  "status": "operational",', c: "text-slate-300" },
  { t: '  "infrastructure": {', c: "text-slate-300" },
  { t: '    "ledger": "high-velocity",', c: "text-slate-300" },
  { t: '    "ai_pipeline": "multi-tenant",', c: "text-slate-300" },
  { t: '    "compliance": "automated",', c: "text-slate-300" },
  { t: '    "cloud_grid": "global-edge"', c: "text-slate-300" },
  { t: "  },", c: "text-slate-300" },
  { t: '  "ventures": ["PulsePay", "PulseAssist"],', c: "text-slate-300" },
  { t: '  "uptime_sla": "99.99%"', c: "text-slate-300" },
  { t: "}", c: "text-slate-300" }
];
function AboutMatrix() {
  const [shown, setShown] = reactExports.useState(0);
  const [docsOpen, setDocsOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (shown >= terminalLines.length) return;
    const id = setTimeout(() => setShown((s) => s + 1), 180);
    return () => clearTimeout(id);
  }, [shown]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "about", className: "border-t border-border bg-background py-24 sm:py-32", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "About · Venture Matrix" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]", children: "Engineering the Systems That Power Tomorrow." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg", children: "ENICE Group is an elite technology venture studio and parent ecosystem. We design high-velocity infrastructure from the ground up — so every sub-platform we incubate scales seamlessly from day one." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-14 grid gap-8 lg:grid-cols-2 lg:gap-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          [
            {
              icon: Banknote,
              tag: "Fintech & Digital Rails",
              title: "PulsePay",
              desc: "Virtual card issuance, programmable wallets, multi-currency rails, and embedded treasury for modern commerce."
            },
            {
              icon: BrainCircuit,
              tag: "Enterprise AI & Telecom",
              title: "PulseAssist",
              desc: "Autonomous support agents, policy-bound automations, and AI-driven workflow orchestration for institutions."
            }
          ].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "article",
            {
              className: "rounded-xl border border-border bg-background p-7 transition-all hover:-translate-y-0.5",
              style: { boxShadow: SHADOW_CARD$3 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(v.icon, { className: "h-5 w-5", strokeWidth: 1.75 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: v.tag }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1.5 text-xl font-semibold tracking-tight text-foreground", children: v.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[14px] leading-relaxed text-muted-foreground", children: v.desc })
                ] })
              ] })
            },
            v.title
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setDocsOpen(true),
              className: "group mt-2 inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-secondary",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-4 w-4 text-primary" }),
                "Read API Docs",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "overflow-hidden rounded-xl border border-[#1f2937] bg-[#0b0f17] text-[13px]",
            style: { boxShadow: "0 20px 60px -20px rgba(17,24,39,0.45)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-[#1f2937] px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-[#ff5f57]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-[#febc2e]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-full bg-[#28c840]" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] tracking-[0.2em] text-slate-400", children: "ENICE-CORE · api.enice.group" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-mono text-slate-500", children: "v1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("pre", { className: "overflow-x-auto p-5 font-mono leading-[1.65]", children: [
                terminalLines.slice(0, shown).map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: l.c || "text-slate-300", children: l.t || " " }, i)),
                shown < terminalLines.length && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-3.5 w-1.5 animate-pulse bg-emerald-400 align-middle" })
              ] })
            ]
          }
        )
      ] })
    ] }),
    docsOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 bg-foreground/40 backdrop-blur-sm",
          onClick: () => setDocsOpen(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "relative w-full max-w-2xl rounded-xl border border-border bg-background p-8 sm:p-10",
          style: { boxShadow: "0 30px 80px -20px rgba(17,24,39,0.35)" },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setDocsOpen(false),
                className: "absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md border border-border text-foreground hover:bg-secondary",
                "aria-label": "Close",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.24em] text-primary", children: "API Documentation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-3 text-2xl font-semibold tracking-tight text-foreground", children: "ENICE Core · Developer Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-muted-foreground", children: "The complete developer reference is being finalized. The ENICE Core gateway exposes unified endpoints for ledger operations, AI orchestration, KYC/compliance, and edge delivery — accessible via REST and signed webhooks." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid gap-3 sm:grid-cols-2", children: [
              ["GET /v1/core", "Ecosystem health & topology"],
              ["POST /v1/ledger/tx", "Submit a ledger transaction"],
              ["POST /v1/ai/query", "Invoke a tenant AI agent"],
              ["POST /v1/kyc/verify", "Run KYC verification"]
            ].map(([m, d]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "rounded-md border border-border bg-secondary/60 p-4",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[12px] text-primary", children: m }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[12px] text-muted-foreground", children: d })
                ]
              },
              m
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-6 text-[12px] text-muted-foreground", children: "Request developer access via the Venture Inquiries form." })
          ]
        }
      )
    ] })
  ] });
}
const SHADOW_CARD$2 = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const items = [
  { icon: Gauge, label: "Global API Latency", value: "14ms", sub: "p50 · multi-region" },
  { icon: Activity, label: "Cross-Platform Uptime", value: "99.99%", sub: "rolling 90 days" },
  { icon: ShieldCheck, label: "Data Vectors", value: "AES-256", sub: "encrypted in transit & rest" }
];
function NetworkMetrics() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-y border-border bg-secondary/60 py-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8 flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground", children: "Live Network · Health Check" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-3",
        style: { boxShadow: SHADOW_CARD$2 },
        children: items.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `flex items-center gap-5 p-7 ${i !== 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "h-5 w-5", strokeWidth: 1.75 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: it.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-baseline gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-semibold tracking-tight text-foreground", children: it.value }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: it.sub })
                ] })
              ] })
            ]
          },
          it.label
        ))
      }
    )
  ] }) });
}
const milestones = [
  {
    when: "Q3 2026",
    title: "PulseAssist · Enterprise B2B Launch",
    body: "Roll out automated support modules to first-wave banking, fintech, and telecommunications partners."
  },
  {
    when: "Q4 2026",
    title: "PulsePay · Multi-Currency Expansion",
    body: "Scale the virtual payment infrastructure with multi-currency wallets, programmable controls, and embedded treasury."
  },
  {
    when: "2027 Horizon",
    title: "Universal Financial Hub",
    body: "Deploy a unified global virtual-dollar and asset-infrastructure layer connecting institutional liquidity worldwide."
  }
];
function Roadmap() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "roadmap", className: "bg-background py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-5 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Strategic Roadmap" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]", children: "A scaling trajectory built for global reach." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground", children: "Our infrastructure roadmap mirrors the maturity curve of the platforms we operate — sequenced for compounding execution." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "mt-14 relative border-l border-border pl-8 sm:pl-10", children: milestones.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative pb-12 last:pb-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[37px] sm:-left-[45px] top-1.5 grid h-4 w-4 place-items-center rounded-full border border-primary bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-mono font-semibold uppercase tracking-[0.22em] text-primary", children: m.when }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl", children: m.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground", children: m.body })
    ] }, m.when)) })
  ] }) });
}
function Careers() {
  const scrollToContact = () => {
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "careers", className: "border-t border-border bg-secondary/60 py-20 sm:py-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-5 text-center sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Join the Studio" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl", children: "Building the Future of Infrastructure?" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground", children: "We are always looking for visionary full-stack engineers, strategic business co-pilots, and innovators to scale our ecosystem." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: scrollToContact,
        className: "group mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90",
        children: [
          "Pitch Us / View Openings",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "h-4 w-4 transition-transform group-hover:translate-y-0.5" })
        ]
      }
    )
  ] }) });
}
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = reactExports.useRef(null);
  const [visible, setVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Component = Tag;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Component,
    {
      ref,
      style: {
        transition: "opacity 700ms cubic-bezier(0.16,1,0.3,1), transform 700ms cubic-bezier(0.16,1,0.3,1), filter 700ms cubic-bezier(0.16,1,0.3,1)",
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        filter: visible ? "blur(0)" : "blur(6px)"
      },
      className,
      children
    }
  );
}
const PARTNERS = [
  "SMEDAN",
  "PulsePay",
  "PulseAssist",
  "EPulse",
  "PulseX",
  "AWS Activate"
];
function PartnersStrip() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-b border-border bg-background py-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground", children: "Trusted across the ENICE ecosystem & institutional partners" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 80, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 md:grid-cols-6", children: PARTNERS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex items-center justify-center",
        title: p,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground/55 transition-colors hover:text-foreground", children: p })
      },
      p
    )) }) })
  ] }) });
}
const SHADOW_CARD$1 = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
const POSTS = [
  {
    tag: "Announcement",
    date: "Jun 2026",
    title: "ENICE Group formalizes its Shared Ecosystem Infrastructure thesis.",
    excerpt: "A look at the unified AI, ledger, and compliance backbone powering every ENICE venture."
  },
  {
    tag: "Product",
    date: "May 2026",
    title: "PulsePay enters extended pilot with regional treasury partners.",
    excerpt: "Programmable wallets, instant issuance, and embedded compliance reach a wider pilot cohort."
  },
  {
    tag: "Engineering",
    date: "Apr 2026",
    title: "Inside PulseAssist: policy-bound agents for regulated industries.",
    excerpt: "How we engineer autonomous support workflows with auditable, deterministic guardrails."
  }
];
function PressSection() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-t border-border bg-background py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start justify-between gap-6 md:flex-row md:items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Press · Announcements" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]", children: "Latest from ENICE Group." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "#",
          className: "group inline-flex items-center gap-2 text-sm font-semibold text-primary",
          children: [
            "View newsroom",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-14 grid gap-6 md:grid-cols-3", children: POSTS.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 80, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "article",
      {
        className: "group flex h-full flex-col rounded-xl border border-border bg-background p-8 transition-all hover:-translate-y-0.5",
        style: { boxShadow: SHADOW_CARD$1 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: p.tag }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.date })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-6 text-lg font-semibold leading-snug tracking-tight text-foreground", children: p.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[13.5px] leading-relaxed text-muted-foreground", children: p.excerpt }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary", children: [
            "Read brief",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" })
          ] })
        ]
      }
    ) }, p.title)) })
  ] }) });
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Accordion = Root2;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
const FAQS = [
  {
    q: "How does ENICE Group incubate ventures?",
    a: "Every venture begins inside our studio with shared access to the ENICE Core — the AI, ledger, and compliance backbone. From concept and capitalization to engineering and go-to-market, ventures graduate from incubation only after meeting institutional thresholds for security, reliability, and unit economics."
  },
  {
    q: "Which industries do you serve?",
    a: "Our primary verticals are financial services, telecommunications, and enterprise operations. PulsePay targets payment infrastructure; PulseAssist serves regulated support operations; EPulse and PulseX extend the ecosystem into digital banking and global digital asset trading."
  },
  {
    q: "What does the ENICE Core actually provide?",
    a: "A unified AI and automation pipeline, a high-velocity ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Each is shared infrastructure — ventures inherit enterprise-grade scale, security posture, and observability on day one."
  },
  {
    q: "How do you approach security and compliance?",
    a: "We operate a zero-trust architecture with per-tenant database isolation, row-level security, audit logging, and continuous controls monitoring. We align with SOC 2 control objectives and design every system for regulatory readiness from the start."
  },
  {
    q: "How can partners or institutions engage with ENICE Group?",
    a: "Institutional partners, regulators, and enterprise customers can reach our partnerships desk via the Get in Touch page. We respond to qualified inquiries within two business days."
  }
];
function FAQSection() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-t border-border bg-secondary py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-5 sm:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Frequently Asked" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]", children: "Questions, answered." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base leading-relaxed text-muted-foreground", children: "A precise look at how ENICE Group operates, builds, and partners." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 80, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 rounded-xl border border-border bg-background px-2 sm:px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "single", collapsible: true, className: "w-full", children: FAQS.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      AccordionItem,
      {
        value: `item-${i}`,
        className: i === FAQS.length - 1 ? "border-b-0" : "",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "px-3 py-5 text-left text-[15px] font-semibold tracking-tight text-foreground hover:no-underline sm:px-4", children: f.q }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "px-3 pb-6 text-[14px] leading-relaxed text-muted-foreground sm:px-4", children: f.a })
        ]
      },
      f.q
    )) }) }) })
  ] }) });
}
function ScrollProgress() {
  const [progress, setProgress] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? scrolled / total * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "aria-hidden": true,
      className: "fixed left-0 right-0 top-0 z-[60] h-[2px] bg-transparent",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "h-full bg-primary transition-[width] duration-75 ease-out",
          style: { width: `${progress}%` }
        }
      )
    }
  );
}
const seed = [
  {
    from: "bot",
    text: "Welcome to ENICE Core Intelligence. Ask me about PulsePay, PulseAssist, or partnership inquiries."
  }
];
function AIChatbot() {
  const [open, setOpen] = reactExports.useState(false);
  const [msgs, setMsgs] = reactExports.useState(seed);
  const [input, setInput] = reactExports.useState("");
  const [typing, setTyping] = reactExports.useState(false);
  const endRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing, open]);
  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        {
          from: "bot",
          text: "Thank you — an ENICE specialist will follow up. Meanwhile, you can submit a formal request via the Corporate Inquiries form below."
        }
      ]);
      setTyping(false);
    }, 1400);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        "aria-label": "Open ENICE Core chat",
        className: "fixed bottom-5 right-5 z-40 grid h-13 w-13 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_30px_-8px_rgba(30,58,138,0.55)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6",
        style: { height: 52, width: 52 },
        children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-5 w-5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `fixed bottom-20 right-4 z-40 w-[calc(100vw-2rem)] max-w-sm origin-bottom-right transition-all duration-200 sm:right-6 sm:bottom-24 ${open ? "pointer-events-auto translate-y-0 opacity-100 scale-100" : "pointer-events-none translate-y-2 opacity-0 scale-95"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "overflow-hidden rounded-2xl border border-border bg-background",
            style: { boxShadow: "0 30px 60px -20px rgba(17,24,39,0.35)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border bg-secondary/60 px-4 py-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4", strokeWidth: 1.75 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[13px] font-semibold text-foreground", children: "ENICE Core Intelligence" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" }),
                    "Online · typical reply < 1 min"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-72 space-y-3 overflow-y-auto px-4 py-4", children: [
                msgs.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `flex ${m.from === "user" ? "justify-end" : "justify-start"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`,
                        children: m.text
                      }
                    )
                  },
                  i
                )),
                typing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-secondary px-3.5 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" })
                ] }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "form",
                {
                  onSubmit: (e) => {
                    e.preventDefault();
                    send();
                  },
                  className: "flex items-center gap-2 border-t border-border bg-background p-3",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        value: input,
                        onChange: (e) => setInput(e.target.value),
                        placeholder: "Ask ENICE Core…",
                        className: "flex-1 rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground outline-none focus:border-primary"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "submit",
                        "aria-label": "Send",
                        className: "grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
                      }
                    )
                  ]
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
const SHADOW_CARD = "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";
function Landing() {
  const verticals = [{
    icon: Banknote,
    kicker: "01 — Fintech",
    title: "Financial Infrastructure Systems",
    desc: "Architecting high-throughput virtual transaction networks, secure ledger databases, and automated wallet infrastructures optimized for regional and cross-border payment deployment.",
    bullets: ["Issuing & Wallets", "Treasury & Ledger", "Compliance Tooling"]
  }, {
    icon: BrainCircuit,
    kicker: "02 — AI",
    title: "Autonomous Enterprise AI",
    desc: "Developing high-capacity, multi-tenant voice and digital conversational AI systems tailored to automate customer relations, compliance tracking, and operations within telecommunications and banking.",
    bullets: ["Autonomous Support", "Policy-Bound Agents", "Workflow Automation"]
  }, {
    icon: Boxes,
    kicker: "03 — Studio",
    title: "Venture Studio & Project Lab",
    desc: "Incubating, engineering, and launching highly disruptive full-stack SaaS applications, driving technology ventures from conceptual proof-of-concept to global market expansion.",
    bullets: ["Concept & Capitalization", "Product & Engineering", "Go-to-Market"]
  }];
  const core = [{
    icon: Cpu,
    label: "01",
    title: "Unified AI & Automation Pipeline",
    desc: "Centralized, secure LLM orchestration and vector search routing that powers predictive tools like PulseAssist."
  }, {
    icon: Database,
    label: "02",
    title: "High-Velocity Ledger & Payment Core",
    desc: "Our secure, low-latency transaction processing engine and virtual account infrastructure that anchors platforms like PulsePay."
  }, {
    icon: FileCheckCorner,
    label: "03",
    title: "Automated Compliance & KYC Layer",
    desc: "Built-in, real-time identity verification, fraud detection, and regulatory screening shared across all sub-platforms."
  }, {
    icon: Globe,
    label: "04",
    title: "Global Cloud Grid",
    desc: "Optimized database clustering and serverless edge delivery networks yielding 99.99% uptime and microsecond execution."
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground antialiased selection:bg-primary/15", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollProgress, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0 -z-10 opacity-[0.5]", style: {
        backgroundImage: "linear-gradient(to right, rgba(17,24,39,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(17,24,39,0.04) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 80%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-5xl px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-36 sm:pt-32", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }),
          "Enterprise Venture Ecosystem · Est. 2024"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-5xl md:text-6xl lg:text-[4.25rem]", children: [
          "Engineering the Infrastructure for the",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Future of Global Commerce." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg", children: "ENICE Group develops, scales, and deploys high-capacity full-stack software architectures, virtual payment systems, and autonomous enterprise AI ecosystems for modern industries." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/portfolio", className: "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-7 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:w-auto", children: [
            "Explore Portfolio",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4 transition-transform group-hover:translate-x-0.5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#verticals", className: "inline-flex h-12 w-full items-center justify-center rounded-md border border-border bg-background px-7 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:w-auto", children: "Corporate Overview" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-20 grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-background md:grid-cols-4", style: {
          boxShadow: SHADOW_CARD
        }, children: [["02", "Active Ventures"], ["99.99%", "Infrastructure SLA"], ["3", "Core Verticals"], ["24/7", "Operational Posture"]].map(([k, v], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-6 text-left ${i !== 0 ? "border-t border-border md:border-l md:border-t-0" : ""} ${i === 1 ? "border-t md:border-t-0" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-semibold tracking-tight text-foreground sm:text-3xl", children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground", children: v })
        ] }, v)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PartnersStrip, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "verticals", className: "bg-secondary py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Industrial Core Verticals" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]", children: "Three pillars. One operating standard." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base leading-relaxed text-muted-foreground", children: "The ENICE Group portfolio is organized around three deliberate competencies — each operated with institutional discipline." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-14 grid gap-6 md:grid-cols-3", children: verticals.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "group relative flex flex-col rounded-xl border border-border bg-background p-8 transition-all hover:-translate-y-0.5", style: {
        boxShadow: SHADOW_CARD
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(v.icon, { className: "h-5 w-5", strokeWidth: 1.75 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: v.kicker })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-8 text-xl font-semibold tracking-tight text-foreground", children: v.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm leading-relaxed text-muted-foreground", children: v.desc }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-7 space-y-2.5 border-t border-border pt-6", children: v.bullets.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2.5 text-[13px] text-foreground/85", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5 text-primary", strokeWidth: 2.5 }),
          b
        ] }, b)) })
      ] }, v.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-t border-border bg-background py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Shared Ecosystem Infrastructure" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]", children: "The ENICE Core" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-base leading-relaxed text-muted-foreground", children: "How we power our portfolio. Every venture under the ENICE Group ecosystem is built on top of our proprietary, high-performance core infrastructure, ensuring enterprise-grade scale from day one." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-14 grid overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-2 lg:grid-cols-4", style: {
        boxShadow: SHADOW_CARD
      }, children: core.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group relative flex flex-col p-8 transition-colors hover:bg-secondary/60 ${i !== 0 ? "border-t border-border sm:[&:nth-child(2)]:border-t-0 sm:[&:nth-child(2)]:border-l lg:[&:nth-child(n)]:border-t-0 lg:[&:not(:first-child)]:border-l" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-11 w-11 place-items-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "h-5 w-5", strokeWidth: 1.75 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-mono font-semibold tracking-[0.18em] text-muted-foreground", children: [
            "/",
            c.label
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-8 text-[17px] font-semibold leading-snug tracking-tight text-foreground", children: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[13.5px] leading-relaxed text-muted-foreground", children: c.desc })
      ] }, c.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-t border-border bg-secondary py-24 sm:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start justify-between gap-6 md:flex-row md:items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.24em] text-primary", children: "Portfolio · Active Ventures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]", children: "Operating ventures with their own gravity." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/portfolio", className: "group inline-flex items-center gap-2 text-sm font-semibold text-primary", children: [
          "View full portfolio",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-14 grid gap-6 lg:grid-cols-2", children: [{
        tag: "Venture · Fintech",
        name: "PulsePay",
        desc: "Next-generation virtual payment infrastructure and digital wallet ecosystem — instant issuance, programmable controls, and embedded treasury."
      }, {
        tag: "Venture · Enterprise AI",
        name: "PulseAssist",
        desc: "AI-driven operational support SaaS for banking, fintech, and telecommunications — autonomous queue handling and policy-bound automations."
      }].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "flex flex-col rounded-xl border border-border bg-background p-8 sm:p-10", style: {
        boxShadow: SHADOW_CARD
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1 w-1 rounded-full bg-primary" }),
          " ",
          p.tag
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl", children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[15px] leading-relaxed text-muted-foreground", children: p.desc }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/portfolio", className: "group/btn mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[12px] font-semibold text-primary-foreground transition-all hover:bg-primary/90", children: [
          "Learn more",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform group-hover/btn:-translate-y-px group-hover/btn:translate-x-px" })
        ] })
      ] }, p.name)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "border-y border-border bg-background py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-5 sm:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-border bg-background", style: {
          boxShadow: SHADOW_CARD
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 text-primary", strokeWidth: 1.75 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: "Compliance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-sm font-semibold tracking-tight text-foreground", children: "SMEDAN Registered Nano Enterprise" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-4", children: [{
        icon: Lock,
        label: "SOC2-Aligned"
      }, {
        icon: ShieldCheck,
        label: "RLS Enforced"
      }, {
        icon: Wifi,
        label: "Active-Active"
      }, {
        icon: Check,
        label: "Audit Ready"
      }].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 rounded-md border border-border bg-background px-4 py-2.5 text-[11px] font-semibold tracking-wide text-foreground/80", style: {
        boxShadow: SHADOW_CARD
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(b.icon, { className: "h-3.5 w-3.5 text-primary", strokeWidth: 2 }),
        b.label
      ] }, b.label)) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AboutMatrix, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NetworkMetrics, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Roadmap, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PressSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FAQSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Careers, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AIChatbot, {})
  ] });
}
export {
  Landing as component
};
