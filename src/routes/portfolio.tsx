import { createFileRoute, Outlet } from "@tanstack/react-router";

// This file is a transparent layout route.
// It renders <Outlet /> so that both:
//   /portfolio        → portfolio.index.tsx (the products listing page)
//   /portfolio/pulsepay → portfolio.pulsepay.tsx (the product page)
// work correctly without double-wrapping headers or footers.

export const Route = createFileRoute("/portfolio")({
  component: () => <Outlet />,
});
