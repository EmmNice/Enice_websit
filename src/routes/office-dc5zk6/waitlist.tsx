import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle2, Download, Search, Trash2, UserCheck, Users } from "lucide-react";
import {
  interestLabel,
  WAITLIST_INTERESTS,
  WAITLIST_SEGMENT_LABEL,
  WAITLIST_SEGMENTS,
  WAITLIST_STATUS_LABEL,
  WAITLIST_STATUSES,
  type WaitlistEntry,
  type WaitlistSegment,
  type WaitlistStats,
  type WaitlistStatus,
} from "@/lib/waitlist";
import { waitlist, CmsError, type WaitlistQuery } from "@/lib/cms/admin-client";
import { formatShortDate } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm, Modal } from "@/components/admin/Modal";
import {
  Button,
  Card,
  DetailRow,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Metric,
  NotConfiguredNotice,
  PageHeader,
  Select,
  SkeletonRows,
  StatusPill,
  Table,
  Td,
  Textarea,
  Th,
  Toolbar,
  Tr,
} from "@/components/admin/primitives";

const PAGE_SIZE = 25;

const STATUS_TONE: Record<WaitlistStatus, "neutral" | "info" | "success" | "warning" | "danger"> = {
  new: "info",
  contacted: "warning",
  qualified: "warning",
  invited: "info",
  onboarded: "success",
  not_interested: "neutral",
};

interface Filters {
  search: string;
  status: string;
  segment: string;
  interest: string;
  consent: string;
  sort: string;
}

const NO_FILTERS: Filters = {
  search: "",
  status: "",
  segment: "",
  interest: "",
  consent: "",
  sort: "newest",
};

function consentState(e: WaitlistEntry): { label: string; tone: "success" | "neutral" | "danger" } {
  if (e.unsubscribedAt) return { label: "Withdrawn", tone: "danger" };
  if (e.consent) return { label: "Consented", tone: "success" };
  return { label: "No consent", tone: "neutral" };
}

/**
 * The PulsePay waitlist.
 *
 * Everything here reads and writes the same `pulsepay_waitlist` table the public form posts to,
 * through the admin API, where each action is checked against the administrator's role. The
 * controls are hidden when a role lacks the permission, but that is a courtesy: the server is what
 * enforces it.
 */
function WaitlistScreen() {
  const { can, config } = useAdmin();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const canWrite = can("waitlist.write");
  const canExport = can("waitlist.export");

  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [page, setPage] = useState(0);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<WaitlistEntry | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyCount, setNotifyCount] = useState<number | null>(null);
  const [subject, setSubject] = useState("PulsePay is opening");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const params = (): WaitlistQuery => ({
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    segment: filters.segment || undefined,
    interest: filters.interest || undefined,
    consent: filters.consent || undefined,
    sort: filters.sort,
  });

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      waitlist.list({ ...params(), limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
      waitlist.stats(),
    ])
      .then(([list, s]) => {
        setEntries(list.entries);
        setTotal(list.total);
        setStats(s.stats);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  useEffect(() => {
    // Debounced only for typing; a dropdown change should feel immediate.
    const timer = setTimeout(load, filters.search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [load, filters.search]);

  const setFilter = (key: keyof Filters, value: string) => {
    setPage(0);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const open = (entry: WaitlistEntry) => {
    setSelected(entry);
    setNotes(entry.notes);
  };

  const apply = async (
    entry: WaitlistEntry,
    patch: Parameters<typeof waitlist.update>[1],
    done?: string,
  ) => {
    setSaving(true);
    try {
      const { entry: next } = await waitlist.update(entry.id, patch);
      setSelected(next);
      setNotes(next.notes);
      if (done) toast.success(done);
      load();
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: WaitlistEntry) => {
    const ok = await confirm({
      title: `Delete ${entry.name}?`,
      message:
        "This permanently erases the registration, including their contact details. Use it for an erasure request. To simply stop contacting someone, withdraw their consent instead.",
      confirmLabel: "Delete permanently",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await waitlist.remove(entry.id);
      toast.success("Deleted", entry.name);
      setSelected(null);
      load();
    } catch (caught) {
      toast.error("Could not delete", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  const openNotify = async () => {
    setNotifyOpen(true);
    setNotifyCount(null);
    try {
      setNotifyCount((await waitlist.notifyPreview()).count);
    } catch (caught) {
      toast.error("Could not check recipients", describeError(caught));
    }
  };

  const sendNotify = async () => {
    if (notifyCount === null) return;
    const ok = await confirm({
      title: `Email ${notifyCount} ${notifyCount === 1 ? "person" : "people"}?`,
      message:
        "Each person who agreed to hear about the launch will receive this message once. This cannot be undone.",
      confirmLabel: "Send now",
    });
    if (!ok) return;
    setSending(true);
    try {
      /*
       * One press, every recipient. The server sends a slice per call and reports what is left, so
       * this loop is what turns a long list into repeated batches instead of one request that would
       * time out halfway through.
       */
      let sent = 0;
      let failed = 0;
      let expected = notifyCount;
      for (;;) {
        const result = await waitlist.notify({ subject, message, expectedCount: expected });
        sent += result.sent;
        failed += result.failed;
        if (result.remaining <= 0) break;
        expected = result.remaining;
        setProgress(`Sending, ${sent} done, ${result.remaining} to go`);
      }
      toast.success(
        `Sent to ${sent}`,
        failed ? `${failed} could not be reached and can be retried.` : undefined,
      );
      setNotifyOpen(false);
      setProgress(null);
      load();
    } catch (caught) {
      toast.error("Not sent", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSending(false);
    }
  };

  if (!config.databaseConfigured) {
    return (
      <>
        <PageHeader
          title="PulsePay waitlist"
          description="People who registered for early access."
        />
        <NotConfiguredNotice title="A database is required">
          Registrations are stored in the Website Manager database. Set <code>DATABASE_URL</code>{" "}
          and redeploy, and the waitlist form and this screen will both start working.
        </NotConfiguredNotice>
      </>
    );
  }

  const pages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const filtered = Object.entries(filters).some(([k, v]) => k !== "sort" && v);

  return (
    <>
      <PageHeader
        title="PulsePay waitlist"
        description="Everyone who registered for early access, with what they are looking forward to."
        actions={
          <div className="flex gap-2">
            {canExport && (
              // A plain link: the browser sends the session cookie and downloads the file, and
              // the filters in force are the filters exported.
              <a href={waitlist.exportUrl(params())} download>
                <Button icon={Download}>Export CSV</Button>
              </a>
            )}
            {canWrite && (
              <Button variant="primary" icon={Bell} onClick={openNotify}>
                Notify launch
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Registered" value={stats?.total ?? "-"} icon={Users} />
        <Metric
          label="Consented"
          value={stats?.consented ?? "-"}
          icon={UserCheck}
          tone="success"
          hint="May be told about the launch"
        />
        <Metric
          label="Last 7 days"
          value={stats?.last7Days ?? "-"}
          icon={CheckCircle2}
          tone="info"
        />
        <Metric label="Withdrawn" value={stats?.unsubscribed ?? "-"} icon={Bell} tone="neutral" />
      </div>

      <Toolbar className="mb-4 flex-wrap">
        <div className="relative min-w-[220px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search name, email or phone"
            aria-label="Search registrations"
            className="pl-8"
          />
        </div>
        <Select
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
          placeholder="Any status"
          aria-label="Filter by status"
          className="w-36"
        >
          {WAITLIST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {WAITLIST_STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.segment}
          onChange={(e) => setFilter("segment", e.target.value)}
          placeholder="Any category"
          aria-label="Filter by category"
          className="w-36"
        >
          {WAITLIST_SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {WAITLIST_SEGMENT_LABEL[s]}
            </option>
          ))}
          <option value="none">Uncategorised</option>
        </Select>
        <Select
          value={filters.interest}
          onChange={(e) => setFilter("interest", e.target.value)}
          placeholder="Any interest"
          aria-label="Filter by interest"
          className="w-44"
        >
          {WAITLIST_INTERESTS.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </Select>
        <Select
          value={filters.consent}
          onChange={(e) => setFilter("consent", e.target.value)}
          placeholder="Any consent"
          aria-label="Filter by consent"
          className="w-36"
        >
          <option value="yes">Consented</option>
          <option value="no">No consent</option>
          <option value="unsubscribed">Withdrawn</option>
        </Select>
        <Select
          value={filters.sort}
          onChange={(e) => setFilter("sort", e.target.value)}
          aria-label="Sort"
          className="w-32"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </Select>
      </Toolbar>

      {loading && entries.length === 0 ? (
        <SkeletonRows rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Users}
          title={filtered ? "No registrations match" : "No registrations yet"}
          description={
            filtered
              ? "Try loosening the filters."
              : "People who join from the PulsePay page will appear here."
          }
          action={
            filtered ? (
              <Button onClick={() => setFilters(NO_FILTERS)}>Clear filters</Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Contact</Th>
                <Th>Interests</Th>
                <Th>Status</Th>
                <Th>Consent</Th>
                <Th>Registered</Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const c = consentState(e);
                return (
                  <Tr key={e.id} onClick={() => open(e)} className="cursor-pointer">
                    <Td>
                      <div className="font-semibold">{e.name}</div>
                      {e.segment && (
                        <div className="text-muted-foreground text-[11.5px]">
                          {WAITLIST_SEGMENT_LABEL[e.segment]}
                        </div>
                      )}
                    </Td>
                    <Td>
                      <div>{e.email}</div>
                      <div className="text-muted-foreground text-[11.5px]">
                        {e.phone || "No phone"}
                      </div>
                    </Td>
                    <Td className="max-w-[220px]">
                      <span className="text-[12px]">
                        {e.interests.length
                          ? e.interests.map(interestLabel).join(", ")
                          : "None selected"}
                      </span>
                    </Td>
                    <Td>
                      <StatusPill tone={STATUS_TONE[e.status]}>
                        {WAITLIST_STATUS_LABEL[e.status]}
                      </StatusPill>
                    </Td>
                    <Td>
                      <StatusPill tone={c.tone}>{c.label}</StatusPill>
                    </Td>
                    <Td className="whitespace-nowrap">{formatShortDate(e.createdAt)}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>

          <div className="text-muted-foreground mt-3 flex items-center justify-between text-[12.5px]">
            <span>
              {total.toLocaleString()} {total === 1 ? "registration" : "registrations"}
              {filtered ? " match" : ""}
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <span>
                Page {page + 1} of {pages}
              </span>
              <Button size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        description={selected?.email}
        size="lg"
        footer={
          selected && canWrite ? (
            <div className="flex w-full items-center justify-between">
              <Button variant="danger" icon={Trash2} onClick={() => remove(selected)}>
                Delete
              </Button>
              <Button
                variant="primary"
                loading={saving}
                disabled={notes === selected.notes}
                onClick={() => apply(selected, { notes }, "Notes saved")}
              >
                Save notes
              </Button>
            </div>
          ) : undefined
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="space-y-1">
              <DetailRow label="Phone">{selected.phone || "Not given"}</DetailRow>
              <DetailRow label="Registered">{formatShortDate(selected.createdAt)}</DetailRow>
              <DetailRow label="Joined from">{selected.source || "-"}</DetailRow>
              <DetailRow label="Last contacted">
                {selected.lastContactedAt ? formatShortDate(selected.lastContactedAt) : "Not yet"}
              </DetailRow>
              <DetailRow label="Launch notified">
                {selected.notifiedAt ? formatShortDate(selected.notifiedAt) : "Not yet"}
              </DetailRow>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
                Looking forward to
              </p>
              {selected.interests.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {selected.interests.map((i) => (
                    <StatusPill key={i} tone="info" dot={false}>
                      {interestLabel(i)}
                    </StatusPill>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-[13px]">Nothing selected.</p>
              )}
            </div>

            {canWrite ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Follow-up status">
                    {(p) => (
                      <Select
                        {...p}
                        value={selected.status}
                        disabled={saving}
                        onChange={(e) =>
                          apply(selected, { status: e.target.value }, "Status updated")
                        }
                      >
                        {WAITLIST_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {WAITLIST_STATUS_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                  <Field label="Category">
                    {(p) => (
                      <Select
                        {...p}
                        value={selected.segment ?? ""}
                        disabled={saving}
                        placeholder="Uncategorised"
                        onChange={(e) =>
                          apply(
                            selected,
                            { segment: (e.target.value || null) as WaitlistSegment | null },
                            "Category updated",
                          )
                        }
                      >
                        {WAITLIST_SEGMENTS.map((s) => (
                          <option key={s} value={s}>
                            {WAITLIST_SEGMENT_LABEL[s]}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </div>

                <Field label="Internal notes" hint="Only the team sees this.">
                  {(p) => (
                    <Textarea
                      {...p}
                      rows={3}
                      maxLength={2000}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  )}
                </Field>

                <Card className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <p className="text-[13px] font-semibold">
                      {consentState(selected).label} for launch emails
                    </p>
                    <p className="text-muted-foreground text-[12px]">
                      {selected.unsubscribedAt
                        ? `Withdrawn ${formatShortDate(selected.unsubscribedAt)}. They will not be emailed.`
                        : selected.consent
                          ? `Agreed ${selected.consentAt ? formatShortDate(selected.consentAt) : ""}.`
                          : "They did not agree to be contacted."}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      loading={saving}
                      onClick={() =>
                        apply(selected, { markContacted: true }, "Marked as contacted")
                      }
                    >
                      Mark contacted
                    </Button>
                    {selected.consent && !selected.unsubscribedAt ? (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={saving}
                        onClick={() => apply(selected, { consent: false }, "Consent withdrawn")}
                      >
                        Withdraw consent
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={saving}
                        onClick={() => apply(selected, { consent: true }, "Consent recorded")}
                      >
                        Record consent
                      </Button>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <p className="text-muted-foreground text-[13px]">
                Your role can view this registration but not change it.
              </p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={notifyOpen}
        onClose={() => !sending && setNotifyOpen(false)}
        title="Notify the waitlist"
        description="Sent once to each person who agreed to hear about the launch."
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <span className="text-muted-foreground text-[12.5px]">
              {progress
                ? progress
                : notifyCount === null
                  ? "Checking recipients…"
                  : `${notifyCount} ${notifyCount === 1 ? "person" : "people"} will receive this`}
            </span>
            <Button
              variant="primary"
              icon={Bell}
              loading={sending}
              disabled={!notifyCount || !subject.trim() || !message.trim()}
              onClick={sendNotify}
            >
              Review and send
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Subject" required>
            {(p) => (
              <Input
                {...p}
                value={subject}
                maxLength={200}
                onChange={(e) => setSubject(e.target.value)}
              />
            )}
          </Field>
          <Field
            label="Message"
            required
            hint="Plain text. Each person gets their own copy, greeted by first name, with a note on why they are receiving it."
          >
            {(p) => (
              <Textarea
                {...p}
                rows={8}
                maxLength={5000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            )}
          </Field>
          <p className="text-muted-foreground text-[12px]">
            People who withdrew consent, never gave it, were marked not interested, or were already
            notified are left out automatically.
          </p>
        </div>
      </Modal>

      {dialog}
    </>
  );
}

export const Route = createFileRoute("/office-dc5zk6/waitlist")({
  component: function WaitlistRoute() {
    return (
      <AdminShell requiredPermission="waitlist.read">
        <WaitlistScreen />
      </AdminShell>
    );
  },
});
