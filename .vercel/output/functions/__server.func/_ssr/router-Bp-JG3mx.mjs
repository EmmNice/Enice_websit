import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "../_libs/isbot.mjs";
const appCss = "/assets/styles-DGWMG3t2.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$9 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$9.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
const $$splitComponentImporter$8 = () => import("./terms-B0zTMJRS.mjs");
const Route$8 = createFileRoute("/terms")({
  head: () => ({
    meta: [{
      title: "Terms of Service — ENICE Group"
    }, {
      name: "description",
      content: "Terms governing the use of ENICE Group platforms, APIs, and services."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./privacy-pz_2qwWb.mjs");
const Route$7 = createFileRoute("/privacy")({
  head: () => ({
    meta: [{
      title: "Privacy Policy — ENICE Group"
    }, {
      name: "description",
      content: "How ENICE Group collects, processes, and protects personal and corporate data across its ecosystem."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./portfolio-D7lo6LFl.mjs");
const Route$6 = createFileRoute("/portfolio")({
  head: () => ({
    meta: [{
      title: "Portfolio — ENICE Group Ecosystem"
    }, {
      name: "description",
      content: "Explore the ENICE Group portfolio of active, proprietary software products and infrastructure networks running live operations — PulsePay and PulseAssist."
    }, {
      property: "og:title",
      content: "ENICE Group Portfolio"
    }, {
      property: "og:description",
      content: "Active proprietary software products and infrastructure networks built by ENICE Group."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./docs-DFcu1nAe.mjs");
const Route$5 = createFileRoute("/docs")({
  head: () => ({
    meta: [{
      title: "API Documentation — ENICE Group"
    }, {
      name: "description",
      content: "Technical overview of the ENICE Core API surface for partners and integrators."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./contact-Bon8Owtd.mjs");
const Route$4 = createFileRoute("/contact")({
  head: () => ({
    meta: [{
      title: "Contact — ENICE Group"
    }, {
      name: "description",
      content: "Connect with the ENICE Group executive or engineering office regarding integration, enterprise licensing, or venture partnerships."
    }, {
      property: "og:title",
      content: "Contact ENICE Group"
    }, {
      property: "og:description",
      content: "Enterprise engagement and corporate inquiries — ENICE Group."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./compliance-Cz8xIVrb.mjs");
const Route$3 = createFileRoute("/compliance")({
  head: () => ({
    meta: [{
      title: "Regulatory Compliance — ENICE Group"
    }, {
      name: "description",
      content: "Regulatory posture, registrations, and compliance program of ENICE Group."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./about-lnVmDNDT.mjs");
const Route$2 = createFileRoute("/about")({
  head: () => ({
    meta: [{
      title: "About — ENICE Group"
    }, {
      name: "description",
      content: "ENICE Group operates as a specialized technology venture studio and infrastructure holding firm — engineering software ecosystems that power modern digital commerce."
    }, {
      property: "og:title",
      content: "About ENICE Group"
    }, {
      property: "og:description",
      content: "Corporate thesis, operational standards, and ecosystem strategy of ENICE Group."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("../_-DanAW-8P.mjs");
const Route$1 = createFileRoute("/$")({
  head: () => ({
    meta: [{
      title: "Lost in the grid — ENICE Group"
    }, {
      name: "description",
      content: "The page you requested could not be located in the ENICE Group grid."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-D_U-raR8.mjs");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "ENICE Group — Engineering the Infrastructure for Global Commerce"
    }, {
      name: "description",
      content: "ENICE Group is a technology venture studio and infrastructure holding firm building fintech platforms and enterprise AI systems — home of PulsePay and PulseAssist."
    }, {
      property: "og:title",
      content: "ENICE Group"
    }, {
      property: "og:description",
      content: "An institutional venture ecosystem building fintech and operational AI infrastructure."
    }, {
      property: "og:url",
      content: "/"
    }],
    links: [{
      rel: "canonical",
      href: "/"
    }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "ENICE Group",
        url: "https://enicegroup.com",
        logo: "/logo.png",
        founder: {
          "@type": "Person",
          name: "Godson Chukwukemeka",
          jobTitle: "Founder & CEO"
        },
        subOrganization: [{
          "@type": "FinancialProduct",
          name: "PulsePay",
          description: "Premium fintech utility payment and digital wallet platform."
        }, {
          "@type": "Organization",
          name: "PulseAssist",
          description: "Multi-tenant, AI-driven omnichannel helpdesk SaaS solutions."
        }, {
          "@type": "FinancialProduct",
          name: "EPulse",
          description: "Standard premium digital banking infrastructure."
        }, {
          "@type": "FinancialProduct",
          name: "PulseX",
          description: "Elite global cryptocurrency asset trading exchange."
        }]
      })
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TermsRoute = Route$8.update({
  id: "/terms",
  path: "/terms",
  getParentRoute: () => Route$9
});
const PrivacyRoute = Route$7.update({
  id: "/privacy",
  path: "/privacy",
  getParentRoute: () => Route$9
});
const PortfolioRoute = Route$6.update({
  id: "/portfolio",
  path: "/portfolio",
  getParentRoute: () => Route$9
});
const DocsRoute = Route$5.update({
  id: "/docs",
  path: "/docs",
  getParentRoute: () => Route$9
});
const ContactRoute = Route$4.update({
  id: "/contact",
  path: "/contact",
  getParentRoute: () => Route$9
});
const ComplianceRoute = Route$3.update({
  id: "/compliance",
  path: "/compliance",
  getParentRoute: () => Route$9
});
const AboutRoute = Route$2.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => Route$9
});
const SplatRoute = Route$1.update({
  id: "/$",
  path: "/$",
  getParentRoute: () => Route$9
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$9
});
const rootRouteChildren = {
  IndexRoute,
  SplatRoute,
  AboutRoute,
  ComplianceRoute,
  ContactRoute,
  DocsRoute,
  PortfolioRoute,
  PrivacyRoute,
  TermsRoute
};
const routeTree = Route$9._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
