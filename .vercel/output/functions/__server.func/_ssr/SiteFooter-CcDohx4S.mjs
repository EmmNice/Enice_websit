import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { p as Menu, A as ArrowUpRight, X } from "../_libs/lucide-react.mjs";
function Logo({ size = "md" }) {
  const big = size === "md" ? "text-[1.35rem]" : "text-base";
  const tag = size === "md" ? "text-[9px]" : "text-[8px]";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const handleClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", onClick: handleClick, className: "flex items-center gap-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-baseline ${big} tracking-tight`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-foreground", children: "E" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-light tracking-[0.28em] text-foreground/85 -ml-px", children: "NICE" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: `${tag} font-semibold uppercase tracking-[0.32em] text-muted-foreground border-l border-border pl-2.5`,
        children: "Group"
      }
    )
  ] });
}
const drawerLinks = [
  { label: "Home", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "About Us", to: "/about" }
];
function scrollToHash(hash) {
  if (typeof window === "undefined") return;
  const id = hash.replace("#", "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function SiteHeader() {
  const [open, setOpen] = reactExports.useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  reactExports.useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);
  const goToHash = (hash) => {
    setOpen(false);
    if (pathname === "/") {
      setTimeout(() => scrollToHash(hash), 180);
    } else {
      navigate({ to: "/", hash: hash.replace("#", "") }).then(() => {
        setTimeout(() => scrollToHash(hash), 220);
      });
    }
  };
  const goToRoute = (to) => {
    setOpen(false);
    setTimeout(() => {
      if (pathname === to && to === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        navigate({ to });
      }
    }, 140);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-4 sm:px-8 sm:py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          "aria-label": "Open navigation",
          onClick: () => setOpen(true),
          className: "grid h-10 w-10 place-items-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-4 w-4", strokeWidth: 2 })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center sm:justify-start sm:pl-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/contact",
          className: "group inline-flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3.5 py-2 text-[11px] font-semibold text-primary-foreground transition-all hover:bg-primary/90 sm:px-4 sm:text-[12px]",
          children: [
            "Get in Touch",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "aria-hidden": !open,
        className: `fixed inset-0 z-50 transition-opacity duration-300 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute inset-0 bg-foreground/30 backdrop-blur-sm",
              onClick: () => setOpen(false)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "aside",
            {
              className: `absolute left-0 top-0 h-full w-[88%] max-w-sm border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      "aria-label": "Close navigation",
                      onClick: () => setOpen(false),
                      className: "grid h-9 w-9 place-items-center rounded-md border border-border text-foreground transition-colors hover:bg-secondary",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "px-3 py-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground", children: "Navigate" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: drawerLinks.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => l.to ? goToRoute(l.to) : goToHash(l.hash),
                      className: "flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-[15px] font-medium text-foreground transition-colors hover:bg-secondary",
                      children: [
                        l.label,
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4 text-muted-foreground" })
                      ]
                    }
                  ) }, l.label)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-0 left-0 right-0 border-t border-border px-6 py-5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground", children: "ENICE Group" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[12px] text-muted-foreground", children: "Engineering the infrastructure for tomorrow." })
                ] })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function XIcon({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": true, className, fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M18.244 2H21.5l-7.5 8.57L23 22h-6.844l-5.36-6.99L4.6 22H1.34l8.02-9.16L1 2h6.99l4.85 6.41L18.24 2Zm-2.4 18h1.9L7.24 4H5.26l10.58 16Z" }) });
}
function InstagramIcon({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": true, className, fill: "none", stroke: "currentColor", strokeWidth: "1.6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "17.5", cy: "6.5", r: "1", fill: "currentColor", stroke: "none" })
  ] });
}
function FacebookIcon({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": true, className, fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.93.26-1.56 1.6-1.56h1.7V4.25C16.5 4.18 15.48 4 14.27 4 11.74 4 10 5.54 10 8.36V10.8H7.3V14H10v8h3.5Z" }) });
}
function SiteFooter() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "border-t border-border bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border bg-secondary/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-medium text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex h-2 w-2 rounded-full bg-emerald-500" })
          ] }),
          "PulsePay Network: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-semibold", children: "Operational (99.9%)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 rounded-full bg-emerald-500" }),
          "PulseAssist Engine: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-semibold", children: "Operational" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: "status.enice.group" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-xs text-[13px] leading-relaxed text-muted-foreground", children: "ENICE Group — a technology venture studio and infrastructure holding firm, engineering full-stack platforms for global commerce." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary" }),
          "SMEDAN Registered · Nano Enterprise"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex items-center gap-2", children: [
          { href: "https://x.com", label: "X", Icon: XIcon },
          { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
          { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon }
        ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: s.href,
            target: "_blank",
            rel: "noreferrer noopener",
            "aria-label": s.label,
            className: "grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-foreground/70 transition-colors hover:border-primary hover:text-primary",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.Icon, { className: "h-3.5 w-3.5" })
          },
          s.label
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", children: "Legal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "mt-4 space-y-2.5 text-sm text-foreground/80", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "hover:text-primary", children: "Privacy Policy" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "hover:text-primary", children: "Terms of Service" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/compliance", className: "hover:text-primary", children: "Regulatory Compliance" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-5 py-6 sm:flex-row sm:items-center sm:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-medium text-muted-foreground", children: [
        "© ",
        year,
        " ENICE Group. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium text-muted-foreground", children: "Enterprise Infrastructure · Built with intent" })
    ] }) })
  ] });
}
export {
  SiteHeader as S,
  SiteFooter as a
};
