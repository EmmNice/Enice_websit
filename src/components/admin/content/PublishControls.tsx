/**
 * The publishing workflow controls for a content item.
 *
 * Encapsulates the Draft → Scheduled → Published → Archived state machine as buttons that reflect
 * what the item can actually do next, rather than showing every transition and rejecting the
 * invalid ones. A published item offers "Unpublish" and "Archive"; a draft offers "Publish" and
 * "Schedule".
 *
 * Scheduling opens a datetime picker that will not accept a past time — the same rule the server
 * enforces, applied here so the feedback is immediate.
 */

import { useState } from "react";
import { Archive, ArchiveRestore, CalendarClock, Send, Undo2 } from "lucide-react";
import type { ContentItem, ContentStatus } from "@/lib/cms/types";
import { CONTENT_STATUS_META } from "@/lib/cms/types";
import { Button, StatusPill } from "../primitives";
import { Modal as DialogModal } from "../Modal";

export interface PublishControlsProps {
  item: ContentItem;
  canPublish: boolean;
  /** True while a save or transition is in flight. */
  busy: boolean;
  /** True when the editor has unsaved changes — publishing saves first. */
  dirty: boolean;
  onTransition: (status: ContentStatus, scheduledFor?: string | null) => void;
}

export function PublishControls({
  item,
  canPublish,
  busy,
  dirty,
  onTransition,
}: PublishControlsProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const status = CONTENT_STATUS_META[item.status];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-[12px] font-semibold">Status</span>
        <StatusPill tone={status.tone}>{status.label}</StatusPill>
      </div>
      <p className="text-muted-foreground text-[11.5px] leading-relaxed">{status.description}</p>

      {item.status === "scheduled" && item.scheduledFor && (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[11.5px] text-blue-800">
          Publishes{" "}
          {new Date(item.scheduledFor).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      )}

      {canPublish ? (
        <div className="space-y-2">
          {item.status !== "published" && (
            <Button
              variant="primary"
              icon={Send}
              loading={busy}
              className="w-full justify-center"
              onClick={() => onTransition("published")}
            >
              {dirty ? "Save and publish" : "Publish now"}
            </Button>
          )}

          {item.status === "published" && (
            <Button
              variant="outline"
              icon={Undo2}
              loading={busy}
              className="w-full justify-center"
              onClick={() => onTransition("draft")}
            >
              Unpublish (move to draft)
            </Button>
          )}

          <div className="flex gap-2">
            {item.status !== "scheduled" && item.status !== "published" && (
              <Button
                variant="secondary"
                icon={CalendarClock}
                className="flex-1 justify-center"
                onClick={() => setScheduleOpen(true)}
                disabled={busy}
              >
                Schedule
              </Button>
            )}
            {item.status === "scheduled" && (
              <Button
                variant="outline"
                icon={Undo2}
                className="flex-1 justify-center"
                loading={busy}
                onClick={() => onTransition("draft")}
              >
                Cancel schedule
              </Button>
            )}
            {item.status !== "archived" ? (
              <Button
                variant="ghost"
                icon={Archive}
                className="flex-1 justify-center"
                onClick={() => onTransition("archived")}
                disabled={busy}
              >
                Archive
              </Button>
            ) : (
              <Button
                variant="secondary"
                icon={ArchiveRestore}
                className="flex-1 justify-center"
                loading={busy}
                onClick={() => onTransition("draft")}
              >
                Restore
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground rounded-md border border-dashed border-border px-3 py-2 text-[11.5px]">
          Your role can edit and save this, but publishing is reserved for administrators with the
          publish permission.
        </p>
      )}

      <ScheduleDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onConfirm={(when) => {
          setScheduleOpen(false);
          onTransition("scheduled", when);
        }}
      />
    </div>
  );
}

function ScheduleDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (isoString: string) => void;
}) {
  // Default to one hour out, rounded to the next quarter hour — a sensible "soon".
  const [value, setValue] = useState(() => defaultScheduleValue());
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const chosen = new Date(value);
    if (Number.isNaN(chosen.getTime())) {
      setError("Choose a valid date and time.");
      return;
    }
    if (chosen.getTime() < Date.now()) {
      setError("Choose a time in the future, or publish now instead.");
      return;
    }
    onConfirm(chosen.toISOString());
  };

  return (
    <DialogModal
      open={open}
      onClose={onClose}
      size="sm"
      title="Schedule publication"
      description="The item will publish automatically at this time. Until then it stays hidden."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={CalendarClock} onClick={submit}>
            Schedule
          </Button>
        </>
      }
    >
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
        }}
        className="border-border bg-background focus:border-primary h-9 w-full rounded-md border px-3 text-[13px] outline-none"
      />
      {error && (
        <p role="alert" className="text-destructive mt-2 text-[12px]">
          {error}
        </p>
      )}
    </DialogModal>
  );
}

/** `datetime-local` wants a `YYYY-MM-DDTHH:mm` string in local time. */
function defaultScheduleValue(): string {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 15) * 15, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
