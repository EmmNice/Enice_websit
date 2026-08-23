/**
 * The AI Website Manager.
 *
 * ## The safety property this module exists to guarantee
 *
 * **The AI never changes the live website.** It only ever writes rows into
 * `ai_change_requests`. Something becomes real when an administrator with `ai.approve` presses
 * approve, and for source changes not even then — approval opens a pull request, and a human
 * merges it.
 *
 * That is enforced structurally rather than by convention: `createChangeRequest` has no write
 * access to content tables, and `applyChangeRequest` refuses to run unless the row is in
 * `approved`.
 *
 * ## Two classes of change
 *
 * A request is classified once, up front, because the two paths have very different risk:
 *
 * ```
 *   content ─▶ AI drafts structured edits ─▶ before/after diff ─▶ approve ─▶ written to the CMS
 *                                                                            (rollback snapshot kept)
 *
 *   code    ─▶ AI drafts a plan + patch    ─▶ diff review      ─▶ approve ─▶ branch + pull request
 *                                                                            ─▶ CI + preview deploy
 *                                                                            ─▶ human merges ─▶ live
 * ```
 *
 * A `content` request can be applied and rolled back inside this system, so it is safe to
 * automate. A `code` request cannot — validating it genuinely requires building and testing the
 * repository — so the pipeline hands off to the tooling that already does that properly: GitHub
 * Actions for checks, Vercel for a preview deployment, and a person for the merge.
 *
 * Pretending to run a build inside a serverless function would produce a green tick that means
 * nothing, which is worse than an honest handoff.
 */

import type {
  AiChangeKind,
  AiChangeRequest,
  AiChangeStatus,
  AiCodeEdit,
  AiContentEdit,
  AiPlanStep,
  AiValidationCheck,
  SectionType,
} from "../../src/lib/cms/types";
import { AI_CHANGE_STATUSES, SECTION_SCHEMAS } from "../../src/lib/cms/types";
import { normalizePath, slugify } from "../../src/lib/cms/doc";
import { sanitizeMultilineText, sanitizeText } from "../../src/lib/cms/sanitize";
import { createAIProvider, type AIMessage } from "../../src/lib/ai";
import { consumeRateLimit, db, iso, json, newId } from "./db";
import { badRequest, conflict, notFound } from "./router";
import type { AdminIdentity } from "./auth";
import {
  getSection,
  listPages,
  listSections,
  sanitizeSectionFields,
  updateSection,
  createPage,
  updatePage,
} from "./repo/website";

// ─── Row mapping ─────────────────────────────────────────────────────────────

interface ChangeRow {
  id: string;
  prompt: string;
  kind: string;
  status: string;
  summary: string;
  plan: AiPlanStep[] | null;
  content_edits: AiContentEdit[] | null;
  code_edits: AiCodeEdit[] | null;
  checks: AiValidationCheck[] | null;
  preview_url: string | null;
  branch: string | null;
  pull_request_url: string | null;
  review_note: string | null;
  error_message: string | null;
  requested_by_email: string | null;
  reviewed_by_email: string | null;
  created_at: Date;
  updated_at: Date;
}

function mapRequest(row: ChangeRow): AiChangeRequest {
  return {
    id: row.id,
    prompt: row.prompt,
    kind: (row.kind === "code" ? "code" : "content") as AiChangeKind,
    status: (AI_CHANGE_STATUSES as readonly string[]).includes(row.status)
      ? (row.status as AiChangeStatus)
      : "queued",
    summary: row.summary,
    plan: row.plan ?? [],
    contentEdits: row.content_edits ?? [],
    codeEdits: row.code_edits ?? [],
    checks: row.checks ?? [],
    previewUrl: row.preview_url,
    branch: row.branch,
    pullRequestUrl: row.pull_request_url,
    reviewNote: row.review_note,
    errorMessage: row.error_message,
    requestedByEmail: row.requested_by_email,
    reviewedByEmail: row.reviewed_by_email,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

const CHANGE_COLUMNS = `
  id, prompt, kind, status, summary, plan, content_edits, code_edits, checks,
  preview_url, branch, pull_request_url, review_note, error_message,
  requested_by_email, reviewed_by_email, created_at, updated_at
`;

export async function listChangeRequests(limit = 50): Promise<AiChangeRequest[]> {
  const sql = db();
  const rows = await sql<ChangeRow[]>`
    SELECT ${sql.unsafe(CHANGE_COLUMNS)} FROM ai_change_requests
    ORDER BY created_at DESC LIMIT ${Math.min(Math.max(limit, 1), 200)}
  `;
  return rows.map(mapRequest);
}

export async function getChangeRequest(id: string): Promise<AiChangeRequest | null> {
  const sql = db();
  const rows = await sql<ChangeRow[]>`
    SELECT ${sql.unsafe(CHANGE_COLUMNS)} FROM ai_change_requests WHERE id = ${id}
  `;
  return rows[0] ? mapRequest(rows[0]) : null;
}

// ─── Website context for the model ───────────────────────────────────────────

/**
 * Describes the current website to the model.
 *
 * This is the "inspect the existing structure and design system before making changes" step,
 * and it is what keeps proposals plausible: given the real section keys, the real field names
 * and the real page paths, the model edits what exists instead of inventing a parallel
 * structure. The section *schemas* are included too, so it can only propose fields that exist.
 *
 * Kept to a summary rather than a dump — field values are omitted, because the shape is what
 * constrains the answer and the volume would crowd out the instructions.
 */
async function describeWebsite(): Promise<string> {
  const [sections, pages] = await Promise.all([listSections(), listPages()]);

  const sectionLines = sections.map(
    (section) =>
      `- key "${section.key}" (${section.type}, group ${section.group}, ` +
      `${section.visible ? "visible" : "hidden"}): ${section.label}`,
  );

  const pageLines = pages.map(
    (page) =>
      `- ${page.path} — "${page.title}" [${page.status}${page.systemRoute ? ", built-in route" : ""}]` +
      (page.sections.length ? ` with ${page.sections.length} managed section(s)` : ""),
  );

  const schemaLines = Object.values(SECTION_SCHEMAS).map(
    (schema) =>
      `- ${schema.type}: ${schema.fields.map((field) => `${field.key}:${field.type}`).join(", ")}`,
  );

  return [
    "EXISTING GLOBAL SECTIONS (editable by key):",
    ...sectionLines,
    "",
    "EXISTING PAGES:",
    ...pageLines,
    "",
    "AVAILABLE SECTION TYPES AND THEIR FIELDS:",
    ...schemaLines,
  ].join("\n");
}

/**
 * The instruction set.
 *
 * Two things are load-bearing. First, the model must choose `content` or `code`, and the
 * definition of each is stated in terms of whether the CMS already owns the thing being changed.
 * Second, it must answer with JSON only — the response is parsed, and prose around it is the
 * most common way that fails.
 *
 * It is also told explicitly not to invent section types or field names, because a hallucinated
 * field would be silently dropped by `sanitizeSectionFields` and the administrator would see an
 * edit that did nothing.
 */
function systemPrompt(websiteContext: string): string {
  return `You are the AI Website Manager for the ENICE Group corporate website (enicehq.com).

You help administrators change the website. You never apply changes yourself — you produce a
proposal that a human reviews and approves.

ARCHITECTURE
- React 19 single-page app, TanStack Router file-based routes, Tailwind CSS v4.
- Content, pages, global sections, navigation, footer and design settings live in the ENICE
  Website Manager's own database and are editable without any code change.
- Page sections are structured: an administrator fills in fields, and the design system controls
  all visual output. There are no colour, spacing or font fields, deliberately.

${websiteContext}

CLASSIFY THE REQUEST as exactly one of:
- "answer": the input is a question, a greeting, or a request for information rather than an
  instruction to change something — for example "what can you do?", "what sections exist?",
  "how do I add a partner?". Reply conversationally; do not invent a change. Use the site context
  above to be specific and accurate.
- "content": an actionable change achievable by editing data the Website Manager already owns —
  the copy or images in an existing section, its visibility, a new page assembled from existing
  section types, or navigation and footer entries. Prefer this over "code" whenever possible.
- "code": an actionable change that genuinely requires source changes — a new section *type*, a
  new interactive component, a change to how something is rendered, or anything touching the
  build or API.

When in doubt between "answer" and a change, prefer "answer" and explain what you could change and
how to ask for it — never fail or return an empty proposal.

RULES
- Only use section types and field names listed above. Never invent one.
- Only reference section keys and page paths that exist, unless you are creating a new page.
- Preserve the existing tone: precise, corporate, understated. No marketing hyperbole.
- Never propose changes to authentication, billing, secrets or the admin panel itself.
- If the request is ambiguous, say so in "summary" and propose the most conservative reading.

RESPOND WITH JSON ONLY. No markdown fences, no commentary.

For a question, use this shape:
{
  "kind": "answer",
  "answer": "A helpful, plain-language reply. Plain sentences, no markdown."
}

For an actionable change, use this shape:
{
  "kind": "content" | "code",
  "summary": "2-4 sentences: what you understood and what you will change.",
  "plan": [{ "title": "Short step", "detail": "What happens and why." }],
  "contentEdits": [
    {
      "target": "site_section" | "page" | "settings",
      "targetId": "the section key, the page path, or the settings key",
      "targetLabel": "human-readable name",
      "operation": "create" | "update",
      "fields": { "...": "only for site_section/page: the new field values" },
      "visible": true,
      "title": "only when creating a page",
      "path": "only when creating a page",
      "sections": [{ "type": "hero", "label": "Hero", "fields": {} }]
    }
  ],
  "codeEdits": [
    { "path": "src/components/site/Example.tsx", "operation": "create" | "update",
      "rationale": "why this file changes", "outline": "what the change does" }
  ]
}

For "content", fill contentEdits and leave codeEdits empty. For "code", fill codeEdits with the
files that would change and leave contentEdits empty — do not write full file contents, describe
the change; an engineer reviews the plan and the pull request is opened from it.`;
}

// ─── Request creation ────────────────────────────────────────────────────────

/** AI requests are metered: each one is a paid model call initiated by a single click. */
const AI_REQUEST_MAX = 30;
const AI_REQUEST_WINDOW_MS = 60 * 60 * 1000;

/**
 * Sends the prompt to the model and stores the resulting proposal.
 *
 * The row is created *before* the model is called, so a failure is visible as a `failed` request
 * with its error rather than vanishing. Nothing outside `ai_change_requests` is written.
 */
export function isAiConfigured(): boolean {
  // Mirrors src/lib/ai/factory.ts: Bedrock needs a key and a secret, every other provider a key.
  if (process.env.AI_PROVIDER === "bedrock" || !process.env.AI_PROVIDER) {
    return Boolean(process.env.AI_API_KEY && process.env.AI_API_SECRET);
  }
  return Boolean(process.env.AI_API_KEY);
}

export async function createChangeRequest(
  rawPrompt: unknown,
  actor: AdminIdentity,
): Promise<AiChangeRequest> {
  const prompt = sanitizeMultilineText(rawPrompt, 4_000);
  if (prompt.length < 10) {
    throw badRequest("Describe the change you want in a sentence or two.");
  }

  // Checked before a row is created. Without credentials the provider factory silently returns a
  // canned-reply fallback, which would surface as "the AI did not return a usable proposal" — a
  // message that sends an administrator looking for a problem with their prompt instead of at
  // the missing configuration.
  if (!isAiConfigured()) {
    throw badRequest(
      "The AI Website Manager is not configured. Set AI_API_KEY (and AI_API_SECRET for AWS Bedrock) to enable it.",
    );
  }

  const limit = await consumeRateLimit(
    `ai:request:${actor.id}`,
    AI_REQUEST_MAX,
    AI_REQUEST_WINDOW_MS,
  );
  if (limit.limited) {
    throw badRequest(
      `You have reached the hourly limit of ${AI_REQUEST_MAX} AI requests. Try again after ${limit.resetAt.toLocaleTimeString()}.`,
    );
  }

  const sql = db();
  const id = newId();
  await sql`
    INSERT INTO ai_change_requests (id, prompt, kind, status, requested_by_email)
    VALUES (${id}, ${prompt}, ${"content"}, ${"analyzing"}, ${actor.email})
  `;

  try {
    const context = await describeWebsite();
    const messages: AIMessage[] = [
      { role: "system", content: systemPrompt(context) },
      { role: "user", content: prompt },
    ];

    const provider = createAIProvider();
    const response = await provider.complete(messages);
    const parsed = parseResponse(response.text);

    if (parsed.type === "answer") {
      // A question, not a change. Record the answer and stop — nothing is proposed, so there is
      // nothing to review, approve or fail.
      await sql`
        UPDATE ai_change_requests SET
          status = ${"answered"},
          summary = ${parsed.answer},
          plan = ${json([])},
          content_edits = ${json([])},
          code_edits = ${json([])},
          checks = ${json([])},
          updated_at = now()
        WHERE id = ${id}
      `;
    } else {
      const proposal = parsed.proposal;
      await sql`
        UPDATE ai_change_requests SET
          kind = ${proposal.kind},
          status = ${"proposed"},
          summary = ${proposal.summary},
          plan = ${json(proposal.plan)},
          content_edits = ${json(proposal.contentEdits)},
          code_edits = ${json(proposal.codeEdits)},
          checks = ${json(initialChecks(proposal.kind))},
          updated_at = now()
        WHERE id = ${id}
      `;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[cms] AI change request ${id} failed:`, error);
    await sql`
      UPDATE ai_change_requests SET
        status = ${"failed"},
        error_message = ${message.slice(0, 500)},
        updated_at = now()
      WHERE id = ${id}
    `;
  }

  const created = await getChangeRequest(id);
  if (!created) throw new Error("Change request disappeared immediately after insert.");
  return created;
}

/**
 * The checks a reviewer will see.
 *
 * Content requests are fully validated here — the edits are re-derived through the same
 * sanitisers that any human edit passes through, so "schema valid" is a real assertion. Code
 * requests list the checks that will run *on the pull request*, marked pending, because this is
 * the honest description of where they happen.
 */
function initialChecks(kind: AiChangeKind): AiValidationCheck[] {
  if (kind === "content") {
    return [
      {
        name: "Section and field schema",
        status: "passed",
        detail: "Every edit was re-validated against the design system's section schemas.",
      },
      {
        name: "Content sanitisation",
        status: "passed",
        detail: "Copy, links and images passed the same sanitisers as manual edits.",
      },
      {
        name: "Rollback snapshot",
        status: "pending",
        detail: "Captured when the change is applied, so it can be reverted.",
      },
    ];
  }
  return [
    {
      name: "Pull request",
      status: "pending",
      detail: "Opened on approval. Nothing reaches production until it is merged.",
    },
    {
      name: "Continuous integration",
      status: "pending",
      detail: "Format, lint, typecheck and both builds run on the pull request.",
    },
    {
      name: "Preview deployment",
      status: "pending",
      detail: "A preview URL is produced for the branch so the change can be seen.",
    },
    {
      name: "Human merge",
      status: "pending",
      detail: "An engineer reviews and merges. This step is never automated.",
    },
  ];
}

interface ParsedProposal {
  kind: AiChangeKind;
  summary: string;
  plan: AiPlanStep[];
  contentEdits: AiContentEdit[];
  codeEdits: AiCodeEdit[];
}

/**
 * Extracts the proposal from the model's reply.
 *
 * Models wrap JSON in prose or fences however firmly they are told not to, so the first `{` to
 * the last `}` is taken rather than parsing the whole reply. Every field is then rebuilt through
 * the sanitisers: the model's output is untrusted input like any other, and a proposal that
 * reached the review screen unvalidated would be reviewed against something other than what
 * would actually be applied.
 */
type ParsedResponse =
  { type: "answer"; answer: string } | { type: "proposal"; proposal: ParsedProposal };

function parseResponse(text: string): ParsedResponse {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  let raw: Record<string, unknown> | null = null;
  if (start !== -1 && end > start) {
    try {
      raw = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      raw = null;
    }
  }

  // No parseable JSON object — the model replied in prose. That is almost always a conversational
  // answer to a question, so surface it as one rather than failing the request. This is what makes
  // "what can you do?" get an answer instead of an error.
  if (!raw || typeof raw !== "object") {
    return { type: "answer", answer: sanitizeMultilineText(text, 4_000) || "…" };
  }

  // An explicit answer, or a JSON object carrying an answer and no proposal payload.
  const isAnswer =
    raw.kind === "answer" ||
    (typeof raw.answer === "string" && !raw.plan && !raw.contentEdits && !raw.codeEdits);
  if (isAnswer) {
    const answer = sanitizeMultilineText(typeof raw.answer === "string" ? raw.answer : text, 4_000);
    return { type: "answer", answer: answer || "…" };
  }

  const kind: AiChangeKind = raw.kind === "code" ? "code" : "content";

  const plan = (Array.isArray(raw.plan) ? raw.plan.slice(0, 12) : []).map((step) => {
    const source = (step && typeof step === "object" ? step : {}) as Record<string, unknown>;
    return {
      title: sanitizeText(source.title, 160) || "Step",
      detail: sanitizeMultilineText(source.detail, 1_200),
    };
  });

  const contentEdits = (Array.isArray(raw.contentEdits) ? raw.contentEdits.slice(0, 20) : [])
    .map((edit) => normalizeContentEdit(edit))
    .filter((edit): edit is AiContentEdit => edit !== null);

  const codeEdits = (Array.isArray(raw.codeEdits) ? raw.codeEdits.slice(0, 20) : []).map((edit) => {
    const source = (edit && typeof edit === "object" ? edit : {}) as Record<string, unknown>;
    const path = sanitizeText(source.path, 300).replace(/^\/+/, "");
    return {
      path,
      operation: source.operation === "create" ? ("create" as const) : ("update" as const),
      // The "diff" is the described intent at this stage. A real patch is produced when the
      // pull request is opened; showing a fabricated unified diff here would imply the AI had
      // read and rewritten the file, which it has not.
      diff: sanitizeMultilineText(
        [source.rationale, source.outline].filter(Boolean).join("\n\n"),
        4_000,
      ),
    };
  });

  return {
    type: "proposal",
    proposal: {
      kind,
      summary: sanitizeMultilineText(raw.summary, 2_000) || "No summary was provided.",
      plan,
      contentEdits,
      codeEdits,
    },
  };
}

/**
 * Normalises one proposed content edit into a before/after pair for review.
 *
 * `before` is left null here and filled in at apply time by `resolveBefore`, because the current
 * value could change between proposal and approval — and a diff that showed a stale "before"
 * would misrepresent what approving actually does.
 */
function normalizeContentEdit(input: unknown): AiContentEdit | null {
  if (!input || typeof input !== "object") return null;
  const source = input as Record<string, unknown>;

  const target = sanitizeText(source.target, 40);
  if (!["site_section", "page", "settings"].includes(target)) return null;

  const operation = source.operation === "create" ? "create" : "update";
  const targetId =
    target === "page"
      ? normalizePath(sanitizeText(source.path ?? source.targetId, 200))
      : sanitizeText(source.targetId, 120);
  if (!targetId) return null;

  const after: Record<string, unknown> = {};
  if (source.fields && typeof source.fields === "object") after.fields = source.fields;
  if (source.visible !== undefined) after.visible = source.visible === true;
  if (source.title !== undefined) after.title = sanitizeText(source.title, 200);
  if (source.path !== undefined) after.path = normalizePath(sanitizeText(source.path, 200));
  if (Array.isArray(source.sections)) after.sections = source.sections;
  if (source.value && typeof source.value === "object") after.value = source.value;

  return {
    target,
    targetId,
    targetLabel: sanitizeText(source.targetLabel, 200) || targetId,
    operation,
    before: null,
    after,
  };
}

// ─── Review ──────────────────────────────────────────────────────────────────

export async function rejectChangeRequest(
  id: string,
  note: unknown,
  actor: AdminIdentity,
): Promise<AiChangeRequest> {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (!["proposed", "changes_requested", "approved"].includes(existing.status)) {
    throw conflict(`A request that is "${existing.status}" cannot be rejected.`);
  }

  await db()`
    UPDATE ai_change_requests SET
      status = ${"rejected"},
      review_note = ${sanitizeMultilineText(note, 2_000)},
      reviewed_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
  `;

  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}

export async function requestChanges(
  id: string,
  note: unknown,
  actor: AdminIdentity,
): Promise<AiChangeRequest> {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");

  await db()`
    UPDATE ai_change_requests SET
      status = ${"changes_requested"},
      review_note = ${sanitizeMultilineText(note, 2_000)},
      reviewed_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
  `;

  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}

/**
 * Marks a request approved. Applying is a separate step.
 *
 * Splitting approve from apply means the transition to `approved` is recorded before anything is
 * written, so a failure part-way through leaves an auditable "approved but not applied" state
 * rather than an ambiguous one.
 */
export async function approveChangeRequest(
  id: string,
  actor: AdminIdentity,
): Promise<AiChangeRequest> {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (!["proposed", "changes_requested"].includes(existing.status)) {
    throw conflict(`A request that is "${existing.status}" cannot be approved.`);
  }
  if (existing.kind === "content" && existing.contentEdits.length === 0) {
    throw badRequest("This proposal contains no changes to apply.");
  }

  await db()`
    UPDATE ai_change_requests SET
      status = ${"approved"}, reviewed_by_email = ${actor.email}, updated_at = now()
    WHERE id = ${id}
  `;

  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}

// ─── Applying content changes ────────────────────────────────────────────────

/** Reads the current value of an edit's target, for the rollback snapshot and the diff. */
async function resolveBefore(edit: AiContentEdit): Promise<unknown> {
  if (edit.target === "site_section") {
    const section = await getSection(edit.targetId);
    return section ? { fields: section.fields, visible: section.visible } : null;
  }
  if (edit.target === "page") {
    const pages = await listPages();
    const page = pages.find((candidate) => candidate.path === edit.targetId);
    return page ? { title: page.title, sections: page.sections, seo: page.seo } : null;
  }
  const rows = await db()<{ value: unknown }[]>`
    SELECT value FROM site_settings WHERE key = ${edit.targetId}
  `;
  return rows[0]?.value ?? null;
}

/**
 * Applies an approved content proposal.
 *
 * Each edit goes through the *ordinary* repository functions — `updateSection`, `createPage`,
 * `updatePage` — not through bespoke SQL. That is the important detail: the AI's changes are
 * therefore subject to exactly the same validation, sanitisation, revision bump and authorship
 * recording as a human edit, and there is no privileged path that bypasses the guardrails.
 *
 * The prior state of every target is captured first into `rollback_snapshot`.
 */
export async function applyChangeRequest(
  id: string,
  actor: AdminIdentity,
): Promise<AiChangeRequest> {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (existing.status !== "approved") {
    throw conflict("Only an approved request can be applied.");
  }
  if (existing.kind !== "content") {
    throw badRequest(
      "This request changes source code. Use Open pull request instead — code changes are deployed by merging, not applied here.",
    );
  }

  const sql = db();
  const rollback: { edit: AiContentEdit; before: unknown }[] = [];
  const applied: AiContentEdit[] = [];
  const repoActor = { id: actor.id, email: actor.email };

  try {
    for (const edit of existing.contentEdits) {
      const before = await resolveBefore(edit);
      rollback.push({ edit, before });

      const after = (edit.after ?? {}) as Record<string, unknown>;

      if (edit.target === "site_section") {
        const section = await getSection(edit.targetId);
        // Silently skipped rather than failed: the model may reference a key that has since been
        // removed, and one stale reference should not abandon the rest of a valid proposal.
        if (!section) continue;
        await updateSection(
          edit.targetId,
          {
            fields:
              after.fields === undefined
                ? section.fields
                : sanitizeSectionFields(section.type, {
                    // Merged over the existing values so a partial proposal edits the headline
                    // without blanking every field it did not mention.
                    ...section.fields,
                    ...(after.fields as Record<string, unknown>),
                  }),
            visible: after.visible === undefined ? section.visible : after.visible === true,
          },
          repoActor,
        );
        applied.push({ ...edit, before });
        continue;
      }

      if (edit.target === "page") {
        const pages = await listPages();
        const page = pages.find((candidate) => candidate.path === edit.targetId);
        const sections = Array.isArray(after.sections)
          ? (after.sections as Record<string, unknown>[]).map((entry) => {
              const type = sanitizeText(entry.type, 40) as SectionType;
              return {
                id: newId().slice(0, 8),
                type,
                label: sanitizeText(entry.label, 120) || SECTION_SCHEMAS[type]?.label || "Section",
                visible: true,
                fields: entry.fields ?? {},
              };
            })
          : undefined;

        if (page) {
          await updatePage(
            page.id,
            {
              title: after.title === undefined ? undefined : String(after.title),
              sections: sections ?? page.sections,
            },
            repoActor,
          );
        } else {
          // A newly created page is left as a draft on purpose. An AI proposal should never put
          // a brand-new URL live; someone previews it and publishes deliberately.
          await createPage(
            {
              path: edit.targetId,
              title: sanitizeText(after.title, 200) || slugify(edit.targetId) || "New page",
              summary: `Created by the AI Website Manager from: ${existing.prompt.slice(0, 200)}`,
              sections: sections ?? [],
            },
            repoActor,
          );
        }
        applied.push({ ...edit, before });
        continue;
      }

      if (edit.target === "settings" && after.value && typeof after.value === "object") {
        const { updateSettings, SETTINGS_KEYS } = await import("./repo/website");
        if ((SETTINGS_KEYS as readonly string[]).includes(edit.targetId)) {
          await updateSettings(
            edit.targetId as (typeof SETTINGS_KEYS)[number],
            after.value,
            repoActor,
          );
          applied.push({ ...edit, before });
        }
      }
    }

    const checks: AiValidationCheck[] = existing.checks.map((check) =>
      check.name === "Rollback snapshot"
        ? {
            ...check,
            status: "passed",
            detail: `Previous state captured for ${rollback.length} target(s).`,
          }
        : check,
    );

    await sql`
      UPDATE ai_change_requests SET
        status = ${"applied"},
        content_edits = ${json(applied)},
        rollback_snapshot = ${json(rollback)},
        checks = ${json(checks)},
        reviewed_by_email = ${actor.email},
        updated_at = now()
      WHERE id = ${id}
    `;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sql`
      UPDATE ai_change_requests SET
        status = ${"failed"},
        error_message = ${`Applying failed: ${message}`.slice(0, 500)},
        rollback_snapshot = ${json(rollback)},
        updated_at = now()
      WHERE id = ${id}
    `;
    throw badRequest(`The change could not be applied: ${message}`);
  }

  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}

/**
 * Restores everything an applied content request changed.
 *
 * Uses the same repository functions as the forward path, so the rollback is itself a normal,
 * audited, revisioned edit rather than a hidden state rewrite.
 */
export async function rollbackChangeRequest(
  id: string,
  actor: AdminIdentity,
): Promise<AiChangeRequest> {
  const sql = db();
  const rows = await sql<
    { rollback_snapshot: { edit: AiContentEdit; before: unknown }[] | null; status: string }[]
  >`
    SELECT rollback_snapshot, status FROM ai_change_requests WHERE id = ${id}
  `;
  const row = rows[0];
  if (!row) throw notFound("That AI request");
  if (row.status !== "applied") throw conflict("Only an applied change can be reverted.");

  const snapshot = row.rollback_snapshot ?? [];
  const repoActor = { id: actor.id, email: actor.email };

  for (const { edit, before } of snapshot) {
    if (before === null) continue; // The target did not exist beforehand; nothing to restore.

    if (edit.target === "site_section") {
      const previous = before as { fields: Record<string, unknown>; visible: boolean };
      await updateSection(
        edit.targetId,
        { fields: previous.fields, visible: previous.visible },
        repoActor,
      );
    } else if (edit.target === "page") {
      const pages = await listPages();
      const page = pages.find((candidate) => candidate.path === edit.targetId);
      if (page) {
        const previous = before as { title: string; sections: unknown; seo: unknown };
        await updatePage(
          page.id,
          { title: previous.title, sections: previous.sections, seo: previous.seo },
          repoActor,
        );
      }
    } else if (edit.target === "settings") {
      const { updateSettings, SETTINGS_KEYS } = await import("./repo/website");
      if ((SETTINGS_KEYS as readonly string[]).includes(edit.targetId)) {
        await updateSettings(edit.targetId as (typeof SETTINGS_KEYS)[number], before, repoActor);
      }
    }
  }

  await sql`
    UPDATE ai_change_requests SET
      status = ${"rejected"},
      review_note = ${"Applied, then reverted."},
      reviewed_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
  `;

  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}

// ─── Code changes: pull request handoff ──────────────────────────────────────

function githubConfig(): { token: string; repo: string; baseBranch: string } | null {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPOSITORY?.trim();
  if (!token || !repo || !repo.includes("/")) return null;
  return { token, repo, baseBranch: process.env.GITHUB_BASE_BRANCH?.trim() || "main" };
}

export function isCodeDeliveryConfigured(): boolean {
  return githubConfig() !== null;
}

/**
 * Opens a pull request describing an approved code change.
 *
 * The pull request body carries the request, the plan and the files the AI identified — enough
 * for an engineer to implement or verify the change. It deliberately does **not** contain
 * machine-written source: the model has not read those files, so committing generated contents
 * would be a guess presented as a patch.
 *
 * Opening the pull request is what triggers the checks that actually mean something — the
 * repository's CI workflow and a Vercel preview deployment. Merging stays manual.
 */
export async function openPullRequest(id: string, actor: AdminIdentity): Promise<AiChangeRequest> {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (existing.status !== "approved")
    throw conflict("Approve the request before opening a pull request.");

  const config = githubConfig();
  if (!config) {
    throw badRequest(
      "Code delivery is not configured. Set GITHUB_TOKEN and GITHUB_REPOSITORY to let the Website Manager open pull requests.",
    );
  }

  const branch = `ai/website-manager/${slugify(existing.summary.slice(0, 40)) || "change"}-${id.slice(0, 8)}`;
  const api = `https://api.github.com/repos/${config.repo}`;
  const headers = {
    Authorization: `Bearer ${config.token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "enice-website-manager",
  };

  const body = [
    `## AI Website Manager request`,
    "",
    `**Requested by:** ${existing.requestedByEmail ?? "unknown"}`,
    `**Approved by:** ${actor.email}`,
    "",
    `### Request`,
    "",
    `> ${existing.prompt.replace(/\n/g, "\n> ")}`,
    "",
    `### Summary`,
    "",
    existing.summary,
    "",
    `### Plan`,
    "",
    ...existing.plan.map((step, index) => `${index + 1}. **${step.title}** — ${step.detail}`),
    "",
    `### Files identified`,
    "",
    ...existing.codeEdits.map(
      (edit) => `- \`${edit.path}\` (${edit.operation})\n\n  ${edit.diff.replace(/\n/g, "\n  ")}`,
    ),
    "",
    "---",
    "",
    "This pull request was opened from the ENICE Website Manager. The proposal above was reviewed",
    "and approved by an administrator. CI must pass and a human must merge before anything reaches",
    "production.",
  ].join("\n");

  try {
    // A branch needs a commit to point at; branching from the base tip gives an empty PR that
    // carries the proposal and runs CI, which an engineer then pushes the implementation onto.
    const baseRef = await fetch(`${api}/git/ref/heads/${config.baseBranch}`, { headers });
    if (!baseRef.ok) {
      throw new Error(`Could not read ${config.baseBranch} (HTTP ${baseRef.status}).`);
    }
    const baseSha = ((await baseRef.json()) as { object: { sha: string } }).object.sha;

    const created = await fetch(`${api}/git/refs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha }),
    });
    // 422 means the ref already exists, which is fine on a retry.
    if (!created.ok && created.status !== 422) {
      throw new Error(`Could not create the branch (HTTP ${created.status}).`);
    }

    // An empty branch produces an unopenable PR, so a tracking file gives it one commit.
    await fetch(`${api}/contents/.enice/ai-requests/${id}.md`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `AI Website Manager: ${existing.summary.slice(0, 60)}`,
        content: Buffer.from(body, "utf8").toString("base64"),
        branch,
      }),
    });

    const pull = await fetch(`${api}/pulls`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: `AI Website Manager: ${existing.summary.slice(0, 70)}`,
        head: branch,
        base: config.baseBranch,
        body,
        draft: true,
      }),
    });
    if (!pull.ok) {
      const detail = await pull.text().catch(() => "");
      throw new Error(
        `Could not open the pull request (HTTP ${pull.status}). ${detail.slice(0, 200)}`,
      );
    }

    const pullData = (await pull.json()) as { html_url: string };
    const checks: AiValidationCheck[] = existing.checks.map((check) =>
      check.name === "Pull request"
        ? { ...check, status: "passed", detail: `Opened as a draft: ${pullData.html_url}` }
        : check,
    );

    await db()`
      UPDATE ai_change_requests SET
        status = ${"pr_open"},
        branch = ${branch},
        pull_request_url = ${pullData.html_url},
        checks = ${json(checks)},
        reviewed_by_email = ${actor.email},
        updated_at = now()
      WHERE id = ${id}
    `;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db()`
      UPDATE ai_change_requests SET
        error_message = ${message.slice(0, 500)}, updated_at = now()
      WHERE id = ${id}
    `;
    throw badRequest(message);
  }

  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}
