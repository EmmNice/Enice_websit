import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { kindFromSegment } from "@/lib/cms/types";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentEditor } from "@/components/admin/content/ContentEditor";

/**
 * Content editor route: `/admin/content/:kind/:itemId`.
 *
 * `:itemId` of `new` is the create form; any other value edits that item. Handling both here — one
 * route rather than a separate `/new` route — means the editor swaps from create to edit in place
 * after the first save, without a navigation that would remount and lose focus.
 */
function ContentEditorRoute() {
  const { kind: segment, itemId } = Route.useParams();
  const navigate = useNavigate();
  const kind = kindFromSegment(segment);

  useEffect(() => {
    if (!kind) void navigate({ to: "/admin/content/blog", replace: true });
  }, [kind, navigate]);

  if (!kind) return null;

  return (
    <AdminShell requiredPermission="content.read">
      <ContentEditor kind={kind} itemId={itemId === "new" ? null : itemId} />
    </AdminShell>
  );
}

export const Route = createFileRoute("/admin/content/$kind/$itemId")({
  component: ContentEditorRoute,
});
