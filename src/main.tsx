import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./styles.css";
import { getRouter } from "./router";

/**
 * Removes the head tags baked in by `scripts/prerender.mjs`.
 *
 * They exist so crawlers that do not run JavaScript see page-specific previews. Once the app
 * boots, the router's <HeadContent /> owns the head, so leaving the static copies in place
 * would mean two of every title and description in the DOM.
 */
function dropPrerenderedHead() {
  for (const el of document.querySelectorAll("[data-prerendered]")) el.remove();
}
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";

// Bootstrap the router outside of React. If this throws (e.g. a config or
// module-load failure), the GlobalErrorBoundary cannot catch it because it
// hasn't mounted yet — so we catch it here and render the fallback manually.
let router: ReturnType<typeof getRouter>;
try {
  router = getRouter();
} catch (err) {
  console.error("[bootstrap] Router failed to initialise:", err);
  // Render the branded error boundary fallback directly into the root.
  // We import the fallback lazily as a plain DOM render so no router is needed.
  const rootElement = document.getElementById("root")!;
  rootElement.innerHTML = `
    <div style="background:#080810;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;font-family:system-ui,sans-serif;">
      <div style="text-align:center;max-width:28rem;">
        <div style="display:flex;align-items:center;justify-content:center;gap:0.75rem;margin-bottom:2rem;">
          <span style="font-family:monospace;font-size:1.25rem;font-weight:900;letter-spacing:0.12em;color:#fff;">
            <span style="color:#3b82f6;">E</span>NICE
          </span>
          <span style="width:1px;height:1.25rem;background:rgba(255,255,255,0.2);display:inline-block;"></span>
          <span style="font-size:0.6875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.28em;color:rgba(255,255,255,0.4);">Group</span>
        </div>
        <h1 style="font-size:1.75rem;font-weight:700;color:#fff;margin-bottom:1rem;line-height:1.2;">
          Something went wrong on our end.
        </h1>
        <p style="color:rgba(255,255,255,0.45);margin-bottom:2rem;line-height:1.7;">
          We are fixing it right now — please refresh the page or try again shortly.
        </p>
        <button onclick="location.reload()"
          style="background:#2563eb;color:#fff;border:none;border-radius:0.5rem;padding:0.75rem 1.5rem;font-size:0.875rem;font-weight:600;cursor:pointer;">
          Refresh page
        </button>
      </div>
    </div>`;
  // Stop further execution — nothing left to mount
  throw err;
}

dropPrerenderedHead();

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <RouterProvider router={router} />
    </GlobalErrorBoundary>
  </StrictMode>,
);
