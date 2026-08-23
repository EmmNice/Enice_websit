import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { kindFromSegment } from "@/lib/cms/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentList } from "@/components/admin/content/ContentList";

/**
 * Content list route: `/admin/content/:kind`.
 *
 * `:kind` is the URL segment (`announcements`), which `kindFromSegment` maps to the model kind
 * (`announcement`). An unrecognised segment redirects to the blog list rather than rendering a
 * broken screen — a mistyped URL should land somewhere sensible.
 */
function ContentListRoute() {
  const { kind: segment } = Route.useParams();
  const navigate = useNavigate();
  const kind = kindFromSegment(segment);

  useEffect(() => {
    if (!kind) void navigate({ to: "/admin/content/blog", replace: true });
  }, [kind, navigate]);

  if (!kind) return null;

  return (
    <AdminShell requiredPermission="content.read">
      <ContentList kind={kind} />
    </AdminShell>
  );
}

export const Route = createFileRoute("/admin/content/$kind/")({
  component: ContentListRoute,
});
