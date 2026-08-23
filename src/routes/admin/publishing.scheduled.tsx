import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PublishingQueue } from "@/components/admin/PublishingQueue";

export const Route = createFileRoute("/admin/publishing/scheduled")({
  component: () => (
    <AdminShell requiredPermission="content.read">
      <PublishingQueue status="scheduled" />
    </AdminShell>
  ),
});
