import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PublishingQueue } from "@/components/admin/PublishingQueue";

export const Route = createFileRoute("/admin/publishing/published")({
  component: () => (
    <AdminShell requiredPermission="content.read">
      <PublishingQueue status="published" />
    </AdminShell>
  ),
});
