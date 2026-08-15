/**
 * GlobalErrorBoundary — class-based React Error Boundary.
 *
 * Wraps the entire application in main.tsx. Catches any crash that TanStack
 * Router's own errorComponent cannot (e.g. the router itself failing, errors
 * in providers, or any component outside the router tree).
 *
 * Must be a class component — React's Error Boundary API requires lifecycle
 * methods that are not available in function components.
 */
import { Component, type ReactNode, type ErrorInfo } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log privately — never exposed to the user
    console.error("[GlobalErrorBoundary] Uncaught error:", error);
    console.error("[GlobalErrorBoundary] Component stack:", info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return <GlobalErrorFallback onRetry={this.handleRetry} />;
    }
    return this.props.children;
  }
}

// ─── Branded fallback screen ──────────────────────────────────────────────────

function GlobalErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5"
      style={{ background: "#080810" }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: "radial-gradient(ellipse, #1d4ed8 0%, transparent 70%)" }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#080810] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center">
        {/* Wordmark */}
        <div className="mb-10 flex items-center gap-3">
          <span className="font-mono text-xl font-black tracking-[0.12em] text-white">
            <span className="text-blue-500">E</span>NICE
          </span>
          <span className="h-5 w-px bg-white/20" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
            Group
          </span>
        </div>

        {/* Status pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
            System Notice
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-5 text-3xl font-bold leading-[1.15] tracking-[-0.03em] text-white sm:text-4xl">
          Something went wrong
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            on our end.
          </span>
        </h1>

        {/* Body copy — exact text requested */}
        <p className="mb-10 max-w-sm text-[15px] leading-relaxed text-white/45">
          We are fixing it right now — please refresh the page or try again shortly.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-95"
          >
            <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
            Refresh page
          </button>
          <button
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Try again
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-[11px] text-white/20">
          If this keeps happening, contact us at{" "}
          <a href="mailto:corporate@enicehq.com" className="transition-colors hover:text-white/50">
            corporate@enicehq.com
          </a>
        </p>
      </div>
    </div>
  );
}
