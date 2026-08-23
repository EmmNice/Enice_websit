import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { KeyRound, MoreHorizontal, Plus, ShieldOff, Trash2, UserPlus } from "lucide-react";
import type { AdminRole } from "@/lib/cms/permissions";
import { ROLE_META } from "@/lib/cms/permissions";
import { admins, CmsError, type AdminSummary } from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm, Modal, OneTimeSecretModal } from "@/components/admin/Modal";
import {
  Button,
  Card,
  Field,
  IconButton,
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
 * Administrator management.
 *
 * Invite, edit, suspend and remove administrators. Invitations produce a single-use link shown
 * once (via `OneTimeSecretModal`) — the system never emails a working credential; whoever invites
 * passes the link on. Every dangerous action (removing, suspending, demoting) is guarded
 * server-side, including the last-owner protection, so this UI can offer the actions freely and
 * trust the API to refuse the unsafe ones.
 */
function AdminsScreen() {
  const { can, identity } = useAdmin();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();

  const [rows, setRows] = useState<AdminSummary[]>([]);
  const [assignableRoles, setAssignableRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminSummary | null>(null);

  const canManage = can("admins.write");

  const load = useCallback(() => {
    setLoading(true);
    admins
      .list()
      .then((result) => {
        setRows(result.admins);
        setAssignableRoles(result.assignableRoles);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const showInviteLink = (token: string) => {
    setInviteLink(`${window.location.origin}/admin/invite?token=${token}`);
  };

  return (
    <>
      <PageHeader
        title="Administrators"
        description="Who can sign in to the Website Manager, and what they can do."
        actions={
          canManage && (
            <Button variant="primary" icon={UserPlus} onClick={() => setInviteOpen(true)}>
              Invite administrator
            </Button>
          )
        }
      />

      {error ? (
        <p className="text-destructive">{error}</p>
      ) : loading ? (
        <SkeletonRows rows={4} />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Administrator</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th className="hidden md:table-cell">2FA</Th>
                <Th className="hidden lg:table-cell">Last sign-in</Th>
                {canManage && <Th className="text-right">Manage</Th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((admin) => (
                <Tr key={admin.id}>
                  <Td>
                    <div className="min-w-0">
                      <span className="text-foreground block truncate font-medium">
                        {admin.name || "—"}
                        {admin.id === identity?.id && (
                          <span className="text-muted-foreground ml-1.5 text-[11px]">(you)</span>
                        )}
                      </span>
                      <span className="text-muted-foreground block truncate text-[11.5px]">
                        {admin.email}
                      </span>
                    </div>
                  </Td>
                  <Td>
                    <StatusPill tone="info" dot={false}>
                      {ROLE_META[admin.role].label}
                    </StatusPill>
                  </Td>
                  <Td>
                    <StatusPill
                      tone={
                        admin.status === "active"
                          ? "success"
                          : admin.status === "suspended"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {admin.status === "invited" ? "Invite pending" : admin.status}
                    </StatusPill>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <StatusPill tone={admin.twoFactorEnabled ? "success" : "neutral"} dot={false}>
                      {admin.twoFactorEnabled ? "On" : "Off"}
                    </StatusPill>
                  </Td>
                  <Td className="hidden lg:table-cell">
                    <span className="text-muted-foreground text-[12px]">
                      {admin.lastLoginAt ? formatRelativeTime(admin.lastLoginAt) : "Never"}
                    </span>
                  </Td>
                  {canManage && (
                    <Td className="text-right">
                      <AdminRowMenu
                        admin={admin}
                        isSelf={admin.id === identity?.id}
                        onEdit={() => setEditing(admin)}
                        onReissueInvite={async () => {
                          try {
                            const result = await admins.reissueInvite(admin.id);
                            showInviteLink(result.inviteToken);
                            load();
                          } catch (caught) {
                            toast.error(
                              "Could not reissue",
                              caught instanceof CmsError ? caught.message : undefined,
                            );
                          }
                        }}
                        onSuspend={async () => {
                          const ok = await confirm({
                            title:
                              admin.status === "suspended"
                                ? "Reactivate this administrator?"
                                : "Suspend this administrator?",
                            message:
                              admin.status === "suspended"
                                ? `${admin.name || admin.email} will be able to sign in again.`
                                : `${admin.name || admin.email} will be signed out of every device immediately and unable to sign in.`,
                            confirmLabel: admin.status === "suspended" ? "Reactivate" : "Suspend",
                            tone: admin.status === "suspended" ? "primary" : "danger",
                          });
                          if (!ok) return;
                          try {
                            await admins.update(admin.id, {
                              status: admin.status === "suspended" ? "active" : "suspended",
                            });
                            toast.success(
                              admin.status === "suspended" ? "Reactivated" : "Suspended",
                            );
                            load();
                          } catch (caught) {
                            toast.error(
                              "Could not update",
                              caught instanceof CmsError ? caught.message : undefined,
                            );
                          }
                        }}
                        onRemove={async () => {
                          const ok = await confirm({
                            title: "Remove this administrator?",
                            message: `${admin.name || admin.email} will lose all access. Content they authored is kept. This cannot be undone.`,
                            confirmLabel: "Remove",
                            requireTyped: admin.email,
                          });
                          if (!ok) return;
                          try {
                            await admins.remove(admin.id);
                            toast.success("Administrator removed");
                            load();
                          } catch (caught) {
                            toast.error(
                              "Could not remove",
                              caught instanceof CmsError ? caught.message : undefined,
                            );
                          }
                        }}
                      />
                    </Td>
                  )}
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <InviteDialog
        open={inviteOpen}
        assignableRoles={assignableRoles}
        onClose={() => setInviteOpen(false)}
        onInvited={(token) => {
          setInviteOpen(false);
          showInviteLink(token);
          load();
        }}
      />

      {editing && (
        <EditAdminDialog
          admin={editing}
          assignableRoles={assignableRoles}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            toast.success("Administrator updated");
            load();
          }}
        />
      )}

      <OneTimeSecretModal
        open={Boolean(inviteLink)}
        onClose={() => setInviteLink(null)}
        title="Invitation link"
        description="Send this single-use link to the administrator. It expires in 7 days and can only be used once. It is shown here only now."
        values={inviteLink ? [inviteLink] : []}
        copyLabel="Copy link"
        acknowledgeLabel="I have copied and sent this link"
      />

      {dialog}
    </>
  );
}

function AdminRowMenu({
  admin,
  isSelf,
  onEdit,
  onReissueInvite,
  onSuspend,
  onRemove,
}: {
  admin: AdminSummary;
  isSelf: boolean;
  onEdit: () => void;
  onReissueInvite: () => void;
  onSuspend: () => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex justify-end">
      <IconButton
        icon={MoreHorizontal}
        label="Manage"
        size="sm"
        onClick={() => setOpen((current) => !current)}
      />
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="border-border bg-popover absolute top-9 right-0 z-20 w-48 overflow-hidden rounded-lg border p-1 shadow-lg">
            <MenuItem
              icon={KeyRound}
              label="Edit role and details"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            />
            {(admin.status === "invited" || !admin.twoFactorEnabled) && (
              <MenuItem
                icon={Plus}
                label={admin.status === "invited" ? "Resend invitation" : "Reset password"}
                onClick={() => {
                  setOpen(false);
                  onReissueInvite();
                }}
              />
            )}
            {!isSelf && (
              <>
                <MenuItem
                  icon={ShieldOff}
                  label={admin.status === "suspended" ? "Reactivate" : "Suspend"}
                  onClick={() => {
                    setOpen(false);
                    onSuspend();
                  }}
                />
                <MenuItem
                  icon={Trash2}
                  label="Remove"
                  tone="danger"
                  onClick={() => {
                    setOpen(false);
                    onRemove();
                  }}
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: typeof KeyRound;
  label: string;
  onClick: () => void;
  tone?: "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] transition-colors",
        tone === "danger"
          ? "text-destructive hover:bg-destructive/5"
          : "text-foreground hover:bg-secondary",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

function InviteDialog({
  open,
  assignableRoles,
  onClose,
  onInvited,
}: {
  open: boolean;
  assignableRoles: AdminRole[];
  onClose: () => void;
  onInvited: (token: string) => void;
}) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>(
    assignableRoles[assignableRoles.length - 1] ?? "editor",
  );
  const [saving, setSaving] = useState(false);

  const invite = async () => {
    setSaving(true);
    try {
      const result = await admins.invite({ email: email.trim(), name: name.trim(), role });
      onInvited(result.inviteToken);
      setEmail("");
      setName("");
    } catch (caught) {
      toast.error("Could not invite", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Invite an administrator"
      description="They receive a single-use link to set their own password. No password is ever sent."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={UserPlus}
            loading={saving}
            disabled={!email.trim()}
            onClick={invite}
          >
            Create invitation
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Email address" required>
          {(props) => (
            <Input
              {...props}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="person@enicehq.com"
              autoFocus
            />
          )}
        </Field>
        <Field label="Name">
          {(props) => (
            <Input
              {...props}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
            />
          )}
        </Field>
        <Field label="Role" hint={ROLE_META[role]?.description}>
          {(props) => (
            <Select
              {...props}
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
            >
              {assignableRoles.map((option) => (
                <option key={option} value={option}>
                  {ROLE_META[option].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    </Modal>
  );
}

function EditAdminDialog({
  admin,
  assignableRoles,
  onClose,
  onSaved,
}: {
  admin: AdminSummary;
  assignableRoles: AdminRole[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(admin.name);
  const [title, setTitle] = useState(admin.title);
  const [role, setRole] = useState<AdminRole>(admin.role);
  const [saving, setSaving] = useState(false);

  // The current role stays selectable even if not otherwise assignable, so saving other fields
  // does not force a role change.
  const roleOptions = Array.from(new Set([admin.role, ...assignableRoles]));

  const save = async () => {
    setSaving(true);
    try {
      await admins.update(admin.id, { name, title, role });
      onSaved();
    } catch (caught) {
      toast.error("Could not save", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${admin.email}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={saving} onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name">
          {(props) => (
            <Input {...props} value={name} onChange={(event) => setName(event.target.value)} />
          )}
        </Field>
        <Field label="Title">
          {(props) => (
            <Input
              {...props}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Head of Marketing"
            />
          )}
        </Field>
        <Field label="Role" hint={ROLE_META[role]?.description}>
          {(props) => (
            <Select
              {...props}
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              disabled={roleOptions.length <= 1}
            >
              {roleOptions.map((option) => (
                <option key={option} value={option}>
                  {ROLE_META[option].label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    </Modal>
  );
}

export const Route = createFileRoute("/admin/administration/admins")({
  component: function AdminsRoute() {
    return (
      <AdminShell requiredPermission="admins.read">
        <AdminsScreen />
      </AdminShell>
    );
  },
});
