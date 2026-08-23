import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CircleCheck,
  CircleDashed,
  Code2,
  FileEdit,
  GitPullRequest,
  RotateCcw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import type { AiChangeRequest, AiValidationCheck } from "@/lib/cms/types";
import { AI_CHANGE_STATUS_META } from "@/lib/cms/types";
import { ai, CmsError } from "@/lib/cms/admin-client";
import { formatRelativeTime } from "@/lib/cms/public-client";
import { AdminShell, describeError } from "@/components/admin/AdminShell";
import { useAdmin } from "@/components/admin/AdminContext";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm, Modal } from "@/components/admin/Modal";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  NotConfiguredNotice,
  PageHeader,
  SkeletonRows,
  StatusPill,
  Textarea,
} from "@/components/admin/primitives";

/**
 * The AI Website Manager.
 *
 * An administrator describes a change in plain language; the AI inspects the existing site and
 * returns a proposal — never an applied change. The safety model is the point of the whole screen:
 * a `content` proposal is a set of before/after edits that, once approved, apply to CMS data and
 * can be rolled back; a `code` proposal becomes a pull request that CI checks and a human merges.
 * Nothing here touches production without an explicit approval, and code changes never do so
 * without a human merge. See `api-src/lib/ai-manager.ts` for the enforced pipeline.
 */
function AiManagerScreen() {
  const { can, config } = useAdmin();
  const toast = useToast();

  const [requests, setRequests] = useState<AiChangeRequest[]>([]);
  const [codeDelivery, setCodeDelivery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<AiChangeRequest | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    ai.list()
      .then((result) => {
        setRequests(result.requests);
        setCodeDelivery(result.codeDeliveryConfigured);
      })
      .catch((caught) => setError(describeError(caught)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const submit = async () => {
    if (prompt.trim().length < 10) {
      toast.warning("Add a little more detail", "Describe the change in a sentence or two.");
      return;
    }
    setSubmitting(true);
    try {
      const { request } = await ai.create(prompt.trim());
      setPrompt("");
      setRequests((current) => [request, ...current]);
      if (request.status === "proposed") {
        setSelected(request);
        toast.success("Proposal ready", "Review it before anything is applied.");
      } else if (request.status === "failed") {
        toast.error("The AI could not complete that", request.errorMessage ?? undefined);
      }
    } catch (caught) {
      toast.error(
        "Could not create the request",
        caught instanceof CmsError ? caught.message : undefined,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canRequest = can("ai.request");

  return (
    <>
      <PageHeader
        title="AI Website Manager"
        description="Describe a website change in plain language. The AI inspects the site and proposes changes for you to review — nothing is applied without your approval."
      />

      {!config.aiConfigured && (
        <NotConfiguredNotice title="The AI Website Manager is not configured" className="mb-5">
          <p>
            Set <code className="font-mono">AI_API_KEY</code> (and{" "}
            <code className="font-mono">AI_API_SECRET</code> for AWS Bedrock) to enable it. The
            review, approval and deployment workflow works regardless — it just needs a model to
            generate proposals.
          </p>
        </NotConfiguredNotice>
      )}

      {canRequest && (
        <Card className="mb-6 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="text-primary h-4 w-4" aria-hidden="true" />
            <h2 className="text-foreground text-[14px] font-semibold">Ask for a change</h2>
          </div>
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            placeholder="e.g. Change the homepage hero headline to focus on payments. Or: add a new Services page using the existing design."
            className="text-[14px]"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-[11.5px]">
              The AI proposes; you approve. Content changes are reversible; code changes open a pull
              request.
            </p>
            <Button
              variant="primary"
              icon={Send}
              loading={submitting}
              onClick={submit}
              disabled={!config.aiConfigured}
            >
              {submitting ? "Thinking…" : "Ask the AI"}
            </Button>
          </div>
        </Card>
      )}

      <CardHeader
        title="Requests"
        description="Every AI request and its status."
        className="border-border mb-0 rounded-t-xl border border-b-0"
      />
      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <SkeletonRows rows={4} />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No requests yet"
          description="Ask the AI for a change above. It will inspect the ENICE website and return a proposal you can review."
        />
      ) : (
        <div className="border-border overflow-hidden rounded-b-xl border">
          {requests.map((request, index) => {
            const meta = AI_CHANGE_STATUS_META[request.status];
            return (
              <button
                key={request.id}
                type="button"
                onClick={() => setSelected(request)}
                className={[
                  "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                  index > 0 ? "border-border border-t" : "",
                  "hover:bg-secondary/40",
                ].join(" ")}
              >
                <span className="bg-secondary text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  {request.kind === "code" ? (
                    <Code2 className="h-4 w-4" />
                  ) : (
                    <FileEdit className="h-4 w-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block truncate text-[13px] font-medium">
                    {request.prompt}
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    {request.kind === "code" ? "Code change" : "Content change"} ·{" "}
                    {formatRelativeTime(request.createdAt)}
                    {request.requestedByEmail ? ` · ${request.requestedByEmail}` : ""}
                  </span>
                </span>
                <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
              </button>
            );
          })}
        </div>
      )}

      <RequestDetail
        request={selected}
        codeDelivery={codeDelivery}
        onClose={() => setSelected(null)}
        onChanged={(updated) => {
          setRequests((current) => current.map((r) => (r.id === updated.id ? updated : r)));
          setSelected(updated);
        }}
      />
    </>
  );
}

const CHECK_ICON = {
  passed: CircleCheck,
  failed: X,
  pending: CircleDashed,
  skipped: CircleDashed,
} as const;

function CheckRow({ check }: { check: AiValidationCheck }) {
  const Icon = CHECK_ICON[check.status];
  const color =
    check.status === "passed"
      ? "text-emerald-600"
      : check.status === "failed"
        ? "text-red-600"
        : "text-muted-foreground";
  return (
    <li className="flex items-start gap-2.5">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} aria-hidden="true" />
      <span className="min-w-0">
        <span className="text-foreground block text-[12.5px] font-medium">{check.name}</span>
        <span className="text-muted-foreground block text-[11.5px]">{check.detail}</span>
      </span>
    </li>
  );
}

function RequestDetail({
  request,
  codeDelivery,
  onClose,
  onChanged,
}: {
  request: AiChangeRequest | null;
  codeDelivery: boolean;
  onClose: () => void;
  onChanged: (request: AiChangeRequest) => void;
}) {
  const { can } = useAdmin();
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!request) return null;

  const meta = AI_CHANGE_STATUS_META[request.status];
  const canApprove = can("ai.approve");
  const canDeploy = can("ai.deploy");

  const act = async (label: string, action: () => Promise<{ request: AiChangeRequest }>) => {
    setBusy(true);
    try {
      const { request: updated } = await action();
      onChanged(updated);
      toast.success(label);
    } catch (caught) {
      toast.error("Action failed", caught instanceof CmsError ? caught.message : undefined);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={Boolean(request)} onClose={onClose} title="AI proposal" size="xl">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
              Request
            </p>
            <p className="text-foreground mt-1 text-[14px]">{request.prompt}</p>
          </div>
          <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
        </div>

        {request.errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-800">
            {request.errorMessage}
          </div>
        )}

        {request.summary && (
          <div>
            <p className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
              What the AI understood
            </p>
            <p className="text-foreground/85 text-[13px] leading-relaxed">{request.summary}</p>
          </div>
        )}

        {request.plan.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
              Plan
            </p>
            <ol className="space-y-2">
              {request.plan.map((step, index) => (
                <li key={index} className="flex gap-2.5">
                  <span className="bg-secondary text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="text-foreground block text-[12.5px] font-semibold">
                      {step.title}
                    </span>
                    <span className="text-muted-foreground block text-[11.5px] leading-relaxed">
                      {step.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {request.contentEdits.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
              Content changes ({request.contentEdits.length})
            </p>
            <div className="space-y-2">
              {request.contentEdits.map((edit, index) => (
                <div key={index} className="border-border rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <StatusPill tone="info" dot={false}>
                      {edit.operation}
                    </StatusPill>
                    <span className="text-foreground text-[12.5px] font-medium">
                      {edit.targetLabel}
                    </span>
                    <span className="text-muted-foreground text-[11px]">{edit.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {request.codeEdits.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
              Files this would change ({request.codeEdits.length})
            </p>
            <div className="space-y-2">
              {request.codeEdits.map((edit, index) => (
                <div key={index} className="border-border rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <StatusPill tone="warning" dot={false}>
                      {edit.operation}
                    </StatusPill>
                    <code className="text-foreground text-[12px]">{edit.path}</code>
                  </div>
                  {edit.diff && (
                    <p className="text-muted-foreground mt-2 text-[11.5px] leading-relaxed whitespace-pre-wrap">
                      {edit.diff}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {request.checks.length > 0 && (
          <div>
            <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">
              Validation
            </p>
            <ul className="space-y-2">
              {request.checks.map((check) => (
                <CheckRow key={check.name} check={check} />
              ))}
            </ul>
          </div>
        )}

        {request.pullRequestUrl && (
          <a
            href={request.pullRequestUrl}
            target="_blank"
            rel="noreferrer"
            className="border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.07] flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] font-medium transition-colors"
          >
            <GitPullRequest className="text-primary h-4 w-4" aria-hidden="true" />
            View the pull request on GitHub
          </a>
        )}

        {request.reviewNote && (
          <div className="border-border rounded-lg border p-3">
            <p className="text-muted-foreground text-[11px] font-semibold">Reviewer note</p>
            <p className="text-foreground/85 mt-0.5 text-[12.5px]">{request.reviewNote}</p>
          </div>
        )}
      </div>

      {/* Actions available for the current state. */}
      {(request.status === "proposed" || request.status === "changes_requested") && canApprove && (
        <div className="border-border mt-5 space-y-3 border-t pt-4">
          <Textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            rows={2}
            placeholder="Optional note (required when requesting changes or rejecting)…"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              icon={ThumbsUp}
              loading={busy}
              onClick={() => act("Approved", () => ai.approve(request.id))}
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              icon={RotateCcw}
              loading={busy}
              disabled={!feedback.trim()}
              onClick={() =>
                act("Sent back for changes", () => ai.requestChanges(request.id, feedback.trim()))
              }
            >
              Request changes
            </Button>
            <Button
              variant="ghost"
              icon={ThumbsDown}
              loading={busy}
              className="text-destructive"
              disabled={!feedback.trim()}
              onClick={() => act("Rejected", () => ai.reject(request.id, feedback.trim()))}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {request.status === "approved" && (
        <div className="border-border mt-5 flex flex-wrap gap-2 border-t pt-4">
          {request.kind === "content" ? (
            canApprove && (
              <Button
                variant="primary"
                icon={Check}
                loading={busy}
                onClick={async () => {
                  const ok = await confirm({
                    title: "Apply this change to the live website?",
                    message:
                      "The content changes will be applied immediately. They can be rolled back afterwards.",
                    confirmLabel: "Apply now",
                    tone: "primary",
                  });
                  if (ok) void act("Applied to the website", () => ai.apply(request.id));
                }}
              >
                Apply to website
              </Button>
            )
          ) : canDeploy ? (
            <Button
              variant="primary"
              icon={GitPullRequest}
              loading={busy}
              disabled={!codeDelivery}
              onClick={() => act("Pull request opened", () => ai.openPullRequest(request.id))}
            >
              Open pull request
            </Button>
          ) : (
            <p className="text-muted-foreground text-[12px]">
              This is a code change. Opening a pull request needs the deploy permission.
            </p>
          )}
          {request.kind === "code" && !codeDelivery && canDeploy && (
            <p className="text-muted-foreground w-full text-[11.5px]">
              Set <code className="font-mono">GITHUB_TOKEN</code> and{" "}
              <code className="font-mono">GITHUB_REPOSITORY</code> to enable pull requests.
            </p>
          )}
        </div>
      )}

      {request.status === "applied" && canApprove && (
        <div className="border-border mt-5 border-t pt-4">
          <Button
            variant="outline"
            icon={RotateCcw}
            loading={busy}
            onClick={async () => {
              const ok = await confirm({
                title: "Revert this change?",
                message:
                  "The previous content will be restored. This is itself recorded and can be redone.",
                confirmLabel: "Revert",
              });
              if (ok) void act("Reverted", () => ai.rollback(request.id));
            }}
          >
            Revert this change
          </Button>
        </div>
      )}

      {dialog}
    </Modal>
  );
}

export const Route = createFileRoute("/admin/ai")({
  component: function AiRoute() {
    return (
      <AdminShell requiredPermission="ai.read">
        <AiManagerScreen />
      </AdminShell>
    );
  },
});
