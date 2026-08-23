/**
 * Toast notifications.
 *
 * Every write in the Website Manager confirms itself here, because a save that produces no visible
 * change is indistinguishable from a save that failed silently.
 *
 * ## Two decisions worth noting
 *
 * - **Errors do not auto-dismiss.** A success message can disappear; a failure the user has not
 *   read yet must not. Anything with `tone: "error"` stays until dismissed.
 * - **An `action` is supported**, which is what makes destructive operations comfortable: "Post
 *   deleted — Undo" is a better interaction than a confirmation dialog on every delete.
 *
 * The container is `aria-live="polite"`, so a screen reader announces each toast without
 * interrupting whatever the user is doing.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Milliseconds before auto-dismiss. Errors default to never. */
  durationMs?: number;
}

interface ToastContextValue {
  show: (toast: Omit<Toast, "id">) => string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Access the toast API.
 *
 * Returns a no-op implementation outside a provider rather than throwing. A component that
 * reports a background failure should not itself crash because it was rendered somewhere without
 * a provider — losing the message is the lesser fault.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context) return context;

  const noop = () => "";
  return {
    show: noop,
    success: noop,
    error: noop,
    info: noop,
    warning: noop,
    dismiss: () => {},
  };
}

const DEFAULT_DURATION: Record<ToastTone, number> = {
  success: 4_000,
  info: 5_000,
  warning: 7_000,
  // Zero means "stay". An error the user has not acknowledged must not vanish.
  error: 0,
};

const TONE_STYLES: Record<ToastTone, { frame: string; icon: typeof Info; iconClass: string }> = {
  success: {
    frame: "border-emerald-200 bg-white",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  error: { frame: "border-red-200 bg-white", icon: AlertCircle, iconClass: "text-red-600" },
  warning: { frame: "border-amber-200 bg-white", icon: TriangleAlert, iconClass: "text-amber-600" },
  info: { frame: "border-border bg-white", icon: Info, iconClass: "text-primary" },
};

const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Timers are tracked so a manual dismiss can cancel the pending auto-dismiss, and so every
  // outstanding timer is cleared on unmount.
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (input: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const toast: Toast = { ...input, id };

      setToasts((current) => {
        // Oldest are dropped rather than newest rejected: the most recent message is the one that
        // relates to what the user just did.
        const next = [...current, toast];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });

      const duration = input.durationMs ?? DEFAULT_DURATION[input.tone];
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }

      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      dismiss,
      success: (title, description) => show({ tone: "success", title, description }),
      error: (title, description) => show({ tone: "error", title, description }),
      info: (title, description) => show({ tone: "info", title, description }),
      warning: (title, description) => show({ tone: "warning", title, description }),
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:bottom-0 sm:items-end"
      >
        {toasts.map((toast) => {
          const { frame, icon: Icon, iconClass } = TONE_STYLES[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className={cn(
                "animate-hero-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3",
                "shadow-[0_8px_24px_-6px_rgba(17,24,39,0.18)]",
                frame,
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)} aria-hidden="true" />

              <div className="min-w-0 flex-1">
                <p className="text-foreground text-[13px] font-semibold">{toast.title}</p>
                {toast.description && (
                  <p className="text-muted-foreground mt-0.5 text-[12px] leading-relaxed">
                    {toast.description}
                  </p>
                )}
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      dismiss(toast.id);
                    }}
                    className="text-primary mt-2 text-[12px] font-semibold hover:underline"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss"
                className="text-muted-foreground hover:text-foreground -mt-0.5 -mr-1 shrink-0 rounded p-1 transition-colors"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
