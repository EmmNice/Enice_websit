import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminProvider } from "@/components/admin/AdminContext";
import { ToastProvider } from "@/components/admin/Toaster";

/**
 * Layout route for everything under `/admin`.
 *
 * ## Deliberately thin
 *
 * It provides the session context and the toast host, then renders `<Outlet />`. It does **not**
 * gate access, and it does not impose the shell.
 *
 * Each screen opts in by wrapping itself in `<AdminShell>`, which is what performs the
 * authentication and permission checks — so the guard sits next to the screen it protects, and a
 * screen cannot be added under this prefix and accidentally inherit someone else's access rules.
 *
 * This layout used to be thin for a second reason: `/admin/early-access` was an unrelated screen
 * with its own shared-password gate, which CMS authentication here would have broken. That screen
 * is gone, so the layout *could* now hold the gate — it is left as it is because per-screen
 * `requiredPermission` still has to live on `<AdminShell>` regardless, and one place to look for
 * "what protects this screen" is better than two.
 *
 * ## Not indexable, not linked
 *
 * `noindex, nofollow` is set here so it applies to every child without each one repeating it, and
 * `public/robots.txt` disallows `/admin`. Nothing on the public site links here: the entry point is
 * the URL itself, or the `admin.` subdomain if one is configured (see the README).
 */
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ENICE Website Manager" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      // The panel is private; a preview card would only leak that it exists.
      { name: "referrer", content: "no-referrer" },
    ],
  }),

  component: function AdminLayout() {
    return (
      <AdminProvider>
        <ToastProvider>
          <Outlet />
        </ToastProvider>
      </AdminProvider>
    );
  },
});
