import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Copy, Mail, Plus, RefreshCw, Trash2, UserPlus, Users } from "lucide-react";
import { ADMIN_ROLES, ROLE_META, type AdminRole } from "@/lib/cms/permissions";
import { administrators, CmsError, type AdminSummary } from "@/lib/cms/admin-client";
import { formatShortDate } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm, Modal } from "@/components/admin/Modal";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  PageHeader,
  Select,
  SkeletonRows,
  StatusPill,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/admin/primitives";

/**
 * The team.
 *
 * An invitation creates the account in `invited` state and returns a single-use token. The token is
 * emailed, and also shown once on screen, because the only copy stored server-side is its digest:
 * if the email does not arrive there is no way to recover it, only to reissue.
 */
function TeamScreen() {
  const { identity } = useAdmin();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [admins, setAdmins] = useState<AdminSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState<AdminRole>("administrator");
  const [busy, setBusy] = useState(false);

  const [link, setLink] = useState<{ url: string; emailed: boolean; to: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    administrators
      .list()
      .then((r) => setAdmins(r.admins))
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const invite = async () => {
    setBusy(true);
    try {
      const result = await administrators.invite({
        email: email.trim(),
        name: name.trim() || undefined,
        title: title.trim() || undefined,
        role,
      });
      if (result.inviteToken) {
        setLink({
          url: `${window.location.origin}/admin/invite?token=${encodeURIComponent(result.inviteToken)}`,
          emailed: Boolean(result.emailed),
          to: result.admin.email,
        });
      }
      setInviteOpen(false);
      setEmail("");
      setName("");
      setTitle("");
      toast.success("Invitation created", result.admin.email);
      load();
    } catch (caught) {
      toast.error("Could not invite", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  const reissue = async (admin: AdminSummary) => {
    try {
      const result = await administrators.reissue(admin.id);
      if (result.inviteToken) {
        setLink({
          url: `${window.location.origin}/admin/invite?token=${encodeURIComponent(result.inviteToken)}`,
          emailed: false,
          to: admin.email,
        });
      }
      toast.success("New link created", "The previous link no longer works.");
      load();
    } catch (caught) {
      toast.error("Could not reissue", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  const changeRole = async (admin: AdminSummary, next: AdminRole) => {
    try {
      await administrators.update(admin.id, { role: next });
      toast.success("Role updated", `${admin.email} is now ${ROLE_META[next].label}.`);
      load();
    } catch (caught) {
      toast.error("Could not change role", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  const remove = async (admin: AdminSummary) => {
    const ok = await confirm({
      title: `Remove ${admin.email}?`,
      message: "They will lose access immediately. Their activity log entries are kept.",
      confirmLabel: "Remove access",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await administrators.remove(admin.id);
      toast.success("Access removed", admin.email);
      load();
    } catch (caught) {
      toast.error("Could not remove", caught instanceof CmsError ? caught.message : undefined);
    }
  };

  return (
    <>
      <PageHeader
        title="Team"
        description="Who can sign in to the Website Manager, and what each of them can do."
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setInviteOpen(true)}>
            Invite someone
          </Button>
        }
      />

      {loading ? (
        <SkeletonRows rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : admins.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No administrators"
          description="Invite your first colleague."
        />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Person</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last signed in</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const self = a.id === identity?.id;
              return (
                <Tr key={a.id}>
                  <Td>
                    <div className="font-semibold">{a.name || a.email}</div>
                    <div className="text-muted-foreground text-[11.5px]">
                      {a.email}
                      {self ? " (you)" : ""}
                    </div>
                  </Td>
                  <Td>
                    {self ? (
                      <StatusPill tone="neutral" dot={false}>
                        {ROLE_META[a.role].label}
                      </StatusPill>
                    ) : (
                      <Select
                        value={a.role}
                        aria-label={`Role for ${a.email}`}
                        onChange={(e) => changeRole(a, e.target.value as AdminRole)}
                        className="w-40"
                      >
                        {ADMIN_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_META[r].label}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Td>
                  <Td>
                    <StatusPill
                      tone={
                        a.status === "active"
                          ? "success"
                          : a.status === "invited"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {a.status === "active"
                        ? "Active"
                        : a.status === "invited"
                          ? "Invited"
                          : "Suspended"}
                    </StatusPill>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {a.lastLoginAt ? formatShortDate(a.lastLoginAt) : "Never"}
                  </Td>
                  <Td>
                    <div className="flex justify-end gap-1">
                      {a.status === "invited" && (
                        <Button size="sm" icon={RefreshCw} onClick={() => reissue(a)}>
                          New link
                        </Button>
                      )}
                      {!self && (
                        <Button size="sm" variant="danger" icon={Trash2} onClick={() => remove(a)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => !busy && setInviteOpen(false)}
        title="Invite an administrator"
        description="They receive a link to set a password. Nothing is shared until they use it."
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button onClick={() => setInviteOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Mail}
              loading={busy}
              disabled={!email.trim()}
              onClick={invite}
            >
              Send invitation
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="Email address" required>
            {(p) => (
              <Input
                {...p}
                type="email"
                value={email}
                placeholder="colleague@enicehq.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </Field>
          <Field label="Name">
            {(p) => <Input {...p} value={name} onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Job title">
            {(p) => <Input {...p} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
          <Field label="Role" hint={ROLE_META[role].description}>
            {(p) => (
              <Select {...p} value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_META[r].label}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </Modal>

      <Modal
        open={link !== null}
        onClose={() => setLink(null)}
        title="Invitation link"
        description={link ? `For ${link.to}. Shown once.` : undefined}
        footer={
          <Button variant="primary" onClick={() => setLink(null)}>
            Done
          </Button>
        }
      >
        {link && (
          <div className="space-y-3">
            <p className="text-[13px] text-bone-soft">
              {link.emailed
                ? "We emailed this link to them. Keep a copy in case it does not arrive."
                : "The email could not be sent, so send this link to them yourself."}
            </p>
            <div className="flex items-center gap-2">
              <code className="border-border bg-secondary min-w-0 flex-1 truncate rounded-md border px-2.5 py-2 text-[12px]">
                {link.url}
              </code>
              <Button
                icon={Copy}
                onClick={() => {
                  navigator.clipboard?.writeText(link.url);
                  toast.success("Copied");
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {dialog}
    </>
  );
}

export const Route = createFileRoute("/admin/administration/team")({
  component: function TeamRoute() {
    return (
      <AdminShell requiredPermission="team.manage">
        <TeamScreen />
      </AdminShell>
    );
  },
});
