import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { admins, type RoleDescriptor } from "@/lib/cms/admin-client";
import { PERMISSIONS, permissionsByGroup, type Permission } from "@/lib/cms/permissions";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import {
  Card,
  CardHeader,
  ErrorState,
  PageHeader,
  SkeletonRows,
  StatusPill,
} from "@/components/admin/primitives";

/**
 * Roles and permissions — a read-only matrix.
 *
 * Renders the authoritative role→permission table straight from the server (`GET /roles`), so what
 * is shown is exactly what is enforced. Roles are intentionally not editable here: the permission
 * *sets* are defined in code (`ROLE_PERMISSIONS`) because they are a security surface, and the
 * design brief asks for an extensible system, not an in-product role editor that could silently
 * grant an Editor the deploy permission. What an administrator *does* is assign one of these roles
 * on the Administrators screen.
 */
function RolesScreen() {
  const [roles, setRoles] = useState<RoleDescriptor[]>([]);
  const [permissionMeta, setPermissionMeta] = useState<
    Record<string, { label: string; group: string; sensitive?: boolean }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    admins
      .roles()
      .then((result) => {
        setRoles(result.roles);
        setPermissionMeta(result.permissions);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  const groups = permissionsByGroup();
  const has = (role: RoleDescriptor, permission: Permission) =>
    role.permissions.includes(permission);

  return (
    <>
      <PageHeader
        title="Roles"
        description="What each administrator role is permitted to do. Assign a role to a person on the Administrators screen."
      />

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <SkeletonRows rows={5} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.role} className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <ShieldCheck className="text-primary h-4 w-4" aria-hidden="true" />
                  <h2 className="text-foreground text-[14px] font-semibold">{role.label}</h2>
                </div>
                <p className="text-muted-foreground text-[12px] leading-relaxed">
                  {role.description}
                </p>
                <p className="text-muted-foreground mt-3 text-[11px]">
                  {role.permissions.length} of {PERMISSIONS.length} permissions
                </p>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader
              title="Permission matrix"
              description="A tick means the role holds that permission."
            />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="bg-secondary text-muted-foreground border-border sticky left-0 border-b px-4 py-2.5 text-[10.5px] font-bold tracking-wider uppercase">
                      Permission
                    </th>
                    {roles.map((role) => (
                      <th
                        key={role.role}
                        className="bg-secondary text-muted-foreground border-border border-b px-4 py-2.5 text-center text-[10.5px] font-bold tracking-wider uppercase"
                      >
                        {role.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <Fragment key={group.group}>
                      <tr>
                        <td
                          colSpan={roles.length + 1}
                          className="bg-secondary/40 text-muted-foreground border-border border-b px-4 py-1.5 text-[10.5px] font-bold tracking-wider uppercase"
                        >
                          {group.group}
                        </td>
                      </tr>
                      {group.permissions.map((permission) => (
                        <tr key={permission} className="hover:bg-secondary/30">
                          <td className="border-border border-b px-4 py-2.5">
                            <span className="text-foreground flex items-center gap-2 text-[12.5px]">
                              {permissionMeta[permission]?.label ?? permission}
                              {permissionMeta[permission]?.sensitive && (
                                <StatusPill tone="warning" dot={false}>
                                  sensitive
                                </StatusPill>
                              )}
                            </span>
                          </td>
                          {roles.map((role) => (
                            <td
                              key={role.role}
                              className="border-border border-b px-4 py-2.5 text-center"
                            >
                              {has(role, permission) ? (
                                <Check
                                  className="text-primary mx-auto h-4 w-4"
                                  aria-label="Granted"
                                />
                              ) : (
                                <Minus
                                  className="text-muted-foreground/30 mx-auto h-4 w-4"
                                  aria-label="Not granted"
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute("/admin/administration/roles")({
  component: function RolesRoute() {
    return (
      <AdminShell requiredPermission="admins.read">
        <RolesScreen />
      </AdminShell>
    );
  },
});
