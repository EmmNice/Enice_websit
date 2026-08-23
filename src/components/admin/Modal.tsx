/**
 * Modals and confirmation dialogs.
 *
 * Built on Radix's Dialog, which the repository already vendors at `src/components/ui/dialog.tsx`
 * — so focus trapping, scroll locking, `Escape` handling and the `aria-modal` wiring are handled by
 * a well-tested implementation rather than by hand. Only the styling and the confirmation
 * behaviour are ours.
 *
 * ## The confirmation contract
 *
 * `ConfirmDialog` treats a destructive action as something to be *understood*, not merely clicked
 * through:
 *
 * - It names the thing being affected, so "Delete post" reads as "Delete 'Owning our platform'".
 * - It states the consequence, including whether the action is reversible.
 * - It can require the item's name to be typed, reserved for the genuinely irreversible.
 * - The confirm button carries its own loading state, so a slow delete cannot be double-submitted.
 */

import { useEffect, useState, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, Input } from "./primitives";
import { cn } from "@/lib/utils";

// ─── Generic modal ───────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const width = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  }[size];

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={cn(width, "max-h-[90dvh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold tracking-tight">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-[13px] leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {children}

        {footer && <DialogFooter className="gap-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirmation ────────────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: string;
  /** What will happen. Should state whether it can be undone. */
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  /**
   * When set, the confirm button stays disabled until this exact string is typed. Reserved for
   * irreversible actions — using it everywhere trains people to copy-paste past it.
   */
  requireTyped?: string;
}

export function ConfirmDialog({
  open,
  options,
  onConfirm,
  onCancel,
  loading = false,
}: {
  open: boolean;
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [typed, setTyped] = useState("");

  // Reset between openings, or the previous confirmation's text would still satisfy the gate.
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  if (!options) return null;

  const needsTyping = Boolean(options.requireTyped);
  const canConfirm = !needsTyping || typed.trim() === options.requireTyped;
  const danger = options.tone !== "primary";

  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      title={
        <span className="flex items-center gap-2">
          {danger && (
            <span className="text-destructive flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
          {options.title}
        </span>
      }
      description={options.message}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {options.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
            loading={loading}
            disabled={!canConfirm}
          >
            {options.confirmLabel ?? "Confirm"}
          </Button>
        </>
      }
    >
      {needsTyping && (
        <div className="space-y-1.5">
          <label
            htmlFor="confirm-typed"
            className="text-foreground block text-[12.5px] font-semibold"
          >
            Type <span className="font-mono">{options.requireTyped}</span> to confirm
          </label>
          <Input
            id="confirm-typed"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            autoComplete="off"
            // Autofocus is appropriate here: the field is the only thing standing between the
            // user and the action they already chose.
            autoFocus
          />
        </div>
      )}
    </Modal>
  );
}

/**
 * Imperative confirmation.
 *
 * Returns `confirm(options)` which resolves to a boolean, so a handler reads linearly:
 *
 * ```ts
 * if (!(await confirm({ title: "Delete post", message: "This cannot be undone." }))) return;
 * await content.remove(id);
 * ```
 *
 * The alternative — a `pendingAction` state plus a dialog wired to it — spreads one decision across
 * three places in a component and is where "the dialog confirms but nothing happens" bugs live.
 */
export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
    loading: boolean;
  }>({ open: false, options: null, resolve: null, loading: false });

  const confirm = (options: ConfirmOptions): Promise<boolean> =>
    new Promise((resolve) => setState({ open: true, options, resolve, loading: false }));

  const settle = (value: boolean) => {
    state.resolve?.(value);
    setState((current) => ({ ...current, open: false, resolve: null, loading: false }));
  };

  /**
   * Rendered by the caller. Kept as a returned element rather than a portal so the dialog lives
   * inside the component's own tree and inherits its context.
   */
  const dialog = (
    <ConfirmDialog
      open={state.open}
      options={state.options}
      loading={state.loading}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, dialog };
}

// ─── One-time secret display ─────────────────────────────────────────────────

/**
 * Shows a value that will never be shown again — recovery codes, an invitation link.
 *
 * The copy button and the explicit "I have saved these" acknowledgement exist because the failure
 * mode is severe and silent: dismissing this dialog without recording the value can mean losing
 * access to an account entirely. The acknowledgement is what turns that from an accident into a
 * decision.
 */
export function OneTimeSecretModal({
  open,
  onClose,
  title,
  description,
  values,
  copyLabel = "Copy",
  acknowledgeLabel = "I have saved these",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  values: string[];
  copyLabel?: string;
  acknowledgeLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (open) {
      setCopied(false);
      setAcknowledged(false);
    }
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(values.join("\n"));
      setCopied(true);
    } catch {
      // Clipboard access can be refused (insecure context, denied permission). The values are
      // on screen and selectable, so this is a degraded convenience, not a failure.
      setCopied(false);
    }
  };

  return (
    <Modal
      open={open}
      // The close affordance is withheld until acknowledged, so the value cannot be dismissed by
      // reflex. Radix's Escape and overlay handlers route here too.
      onClose={() => acknowledged && onClose()}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={copy} icon={undefined}>
            {copied ? "Copied" : copyLabel}
          </Button>
          <Button variant="primary" onClick={onClose} disabled={!acknowledged}>
            Done
          </Button>
        </>
      }
    >
      <div
        className="border-border bg-secondary grid gap-1.5 rounded-lg border p-4 font-mono text-[12.5px]"
        data-allow-select
      >
        {values.map((value) => (
          <code key={value} className="text-foreground select-all">
            {value}
          </code>
        ))}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2 text-[12.5px]">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          className="border-border accent-primary mt-0.5 h-3.5 w-3.5 rounded"
        />
        <span className="text-foreground">{acknowledgeLabel}</span>
      </label>
    </Modal>
  );
}
