import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Lock, Plus } from "lucide-react";
import type { ManagedPage } from "@/lib/cms/types";
import { CONTENT_STATUS_META } from "@/lib/cms/types";
import { website, CmsError } from "@/lib/cms/admin-client";
import { normalizePath, slugify } from "@/lib/cms/doc";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { Modal } from "@/components/admin/Modal";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Field,
  Input,
  PageHeader,
  SkeletonRows,
  StatusPill,
  Table,
  Td,
  Th,
  Tr,
} from "@/components/admin/primitives";

/**
 * The Page Manager.
 *
 * Lists both the site's built-in routes (marked with a lock — their content and SEO are editable
 * but their address is fixed) and any pages created here. New pages are assembled from the same
 * structured sections as everything else, so they inherit the design system.
 */
function PagesScreen() {
  const { can } = useAdmin();
  const toast = useToast();
  const navigate = useNavigate();

  const [pages, setPages] = useState<ManagedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    website
      .pages()
      .then((result) => setPages(result.pages))
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <>
      <PageHeader
        title="Pages"
        description="Manage the pages of the ENICE website. Built-in pages have a fixed address but editable content and SEO."
        actions={
          can("pages.write") && (
            <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
              New page
            </Button>
          )
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={8} />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Page</Th>
                <Th className="hidden md:table-cell">Address</Th>
                <Th className="hidden lg:table-cell">Sections</Th>
                <Th>Status</Th>
                <Th className="hidden lg:table-cell">Updated</Th>
                <Th className="text-right">Open</Th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <Tr key={page.id}>
                  <Td>
                    <Link
                      to="/admin/website/pages/$pageId"
                      params={{ pageId: page.id }}
                      className="group block min-w-0"
                    >
                      <span className="text-foreground group-hover:text-primary flex items-center gap-1.5 font-medium">
                        {page.title || "Untitled"}
                        {page.systemRoute && (
                          <Lock
                            className="text-muted-foreground h-3 w-3"
                            aria-label="Built-in route"
                          />
                        )}
                      </span>
                      {page.summary && (
                        <span className="text-muted-foreground block truncate text-[11.5px]">
                          {page.summary}
                        </span>
                      )}
                    </Link>
                  </Td>
                  <Td className="hidden md:table-cell">
                    <code className="text-muted-foreground text-[12px]">{page.path}</code>
                  </Td>
                  <Td className="hidden lg:table-cell">
                    {page.sections.length > 0 ? (
                      <Badge>{page.sections.length} managed</Badge>
                    ) : (
                      <span className="text-muted-foreground/50 text-[12px]">—</span>
                    )}
                  </Td>
                  <Td>
                    <StatusPill tone={CONTENT_STATUS_META[page.status].tone}>
                      {CONTENT_STATUS_META[page.status].label}
                    </StatusPill>
                  </Td>
                  <Td className="hidden lg:table-cell">
                    <span className="text-muted-foreground text-[12px]">
                      {formatRelativeTime(page.updatedAt)}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {page.status === "published" && (
                        <a
                          href={page.path}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-md"
                          aria-label="View on the website"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void navigate({
                            to: "/admin/website/pages/$pageId",
                            params: { pageId: page.id },
                          })
                        }
                      >
                        Edit
                      </Button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      <CreatePageDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(page) => {
          setCreateOpen(false);
          toast.success("Page created as a draft");
          void navigate({ to: "/admin/website/pages/$pageId", params: { pageId: page.id } });
        }}
        existingPaths={pages.map((page) => page.path)}
      />
    </>
  );
}

function CreatePageDialog({
  open,
  onClose,
  onCreated,
  existingPaths,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (page: ManagedPage) => void;
  existingPaths: string[];
}) {
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("");
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The path tracks the title until the operator edits it directly.
  const effectivePath = touched ? path : `/${slugify(title)}`;
  const clash = existingPaths.includes(normalizePath(effectivePath));

  const create = async () => {
    if (!title.trim()) {
      setError("A title is required.");
      return;
    }
    if (clash) {
      setError("A page already exists at that address.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { page } = await website.createPage({ title: title.trim(), path: effectivePath });
      onCreated(page);
      setTitle("");
      setPath("");
      setTouched(false);
    } catch (caught) {
      setError(caught instanceof CmsError ? caught.message : "Could not create the page.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a page"
      description="New pages start as drafts. Add sections, preview, then publish when ready."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={Plus} loading={saving} onClick={create}>
            Create page
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Page title" required>
          {(props) => (
            <Input
              {...props}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Investor Relations"
              autoFocus
            />
          )}
        </Field>
        <Field
          label="Address"
          hint="Where the page will live on the website."
          error={clash ? "A page already exists at that address." : null}
        >
          {(props) => (
            <Input
              {...props}
              value={effectivePath}
              onChange={(event) => {
                setTouched(true);
                setPath(event.target.value);
              }}
              placeholder="/investors"
            />
          )}
        </Field>
        {error && (
          <p role="alert" className="text-destructive text-[12px]">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}

export const Route = createFileRoute("/admin/website/pages/")({
  component: function PagesRoute() {
    return (
      <AdminShell requiredPermission="pages.read">
        <PagesScreen />
      </AdminShell>
    );
  },
});
