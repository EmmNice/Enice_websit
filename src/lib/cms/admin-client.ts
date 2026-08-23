/**
 * Client for the private admin API (`/api/cms/*`).
 *
 * ## The three things this layer exists to get right
 *
 * 1. **CSRF.** The session lives in an `HttpOnly` cookie the browser attaches automatically, which
 *    means a request is authenticated whether or not the app intended it. Every mutating call must
 *    therefore also carry the CSRF token in a header. Doing that here, once, is the only way to be
 *    sure no call site forgets — a forgotten header is a 403 in development and a security hole in
 *    a variant that "helpfully" omits the check.
 *
 * 2. **Two-factor state.** A session that has passed the password stage but not the TOTP stage is
 *    rejected with `code: "mfa_required"`. That must resume the second factor, *not* log the user
 *    out — treating it as a generic 401 would discard the partial progress and loop them.
 *
 * 3. **Errors that read like sentences.** Every failure resolves to a `CmsError` carrying the
 *    server's own wording, so a screen can render the actual reason ("Someone else saved this
 *    while you were editing") instead of "Request failed".
 */

import type {
  ActivityEntry,
  AiChangeRequest,
  ContentItem,
  ContentKind,
  ContentStatus,
  ContentSummary,
  DashboardSnapshot,
  ManagedPage,
  MediaAsset,
  SearchHit,
  SectionSchema,
  SectionType,
  SiteSectionRecord,
  SiteSettings,
} from "./types";
import type { AdminRole, Permission } from "./permissions";

const BASE = "/api/cms";
const CSRF_COOKIE = "enice_admin_csrf";
const CSRF_HEADER = "x-enice-csrf";

// ─── Errors ──────────────────────────────────────────────────────────────────

/**
 * A failed request.
 *
 * `code` is the machine-readable discriminator (`mfa_required`, `conflict`,
 * `missing_permission:content.publish`); `message` is what to show a person.
 */
export class CmsError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "CmsError";
  }

  /** The session is gone entirely and the login screen is the only way forward. */
  get isUnauthenticated(): boolean {
    return this.status === 401 && this.code !== "mfa_required";
  }

  /** The password stage succeeded but the second factor is outstanding. */
  get needsSecondFactor(): boolean {
    return this.code === "mfa_required";
  }

  get isPermissionDenied(): boolean {
    return this.status === 403 && this.code.startsWith("missing_permission");
  }

  /** A concurrent edit, a duplicate slug, or an invalid workflow transition. */
  get isConflict(): boolean {
    return this.status === 409;
  }

  /** A missing environment variable rather than anything the user did wrong. */
  get isNotConfigured(): boolean {
    return this.status === 503 || this.code === "not_configured";
  }
}

// ─── Core transport ──────────────────────────────────────────────────────────

/**
 * Reads the CSRF token from its cookie.
 *
 * Deliberately read at call time rather than cached: the server reissues the cookie on session
 * refresh, and a stale cached value would start failing after a long-lived tab's session slid
 * forward.
 */
function csrfToken(): string {
  if (typeof document === "undefined") return "";
  for (const part of document.cookie.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() === CSRF_COOKIE) {
      return decodeURIComponent(part.slice(separator + 1).trim());
    }
  }
  return "";
}

/** Requests are abandoned rather than left pending forever. */
const TIMEOUT_MS = 30_000;

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: { timeoutMs?: number } = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? TIMEOUT_MS);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  // Attached for every non-idempotent verb. The server ignores it on GET.
  if (method !== "GET" && method !== "HEAD") {
    const token = csrfToken();
    if (token) headers[CSRF_HEADER] = token;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      // `same-origin` is the default, but stating it makes the cookie dependency explicit.
      credentials: "same-origin",
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    const aborted = error instanceof DOMException && error.name === "AbortError";
    throw new CmsError(
      0,
      aborted
        ? "That took too long and was cancelled. Check your connection and try again."
        : "Could not reach the server. Check your connection and try again.",
      aborted ? "timeout" : "network_error",
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let payload: Record<string, unknown> = {};
  try {
    payload = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    // A non-JSON body means something upstream failed — a proxy error page, most likely.
    throw new CmsError(
      response.status,
      "The server returned an unexpected response. Please try again.",
      "bad_response",
    );
  }

  if (!response.ok || payload.ok !== true) {
    throw new CmsError(
      response.status,
      typeof payload.error === "string" ? payload.error : "Something went wrong.",
      typeof payload.code === "string" ? payload.code : "error",
      payload.details,
    );
  }

  return payload as T;
}

const get = <T>(path: string) => request<T>("GET", path);
const post = <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {});
const patch = <T>(path: string, body: unknown) => request<T>("PATCH", path, body);
const remove = <T>(path: string) => request<T>("DELETE", path);

/** Builds a query string, omitting empty values so URLs stay readable. */
function query(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

// ─── Session and account ─────────────────────────────────────────────────────

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  title: string;
  avatarUrl: string | null;
  role: AdminRole;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
}

export interface ConfigFlags {
  databaseConfigured: boolean;
  secretConfigured: boolean;
  mediaStorageConfigured: boolean;
  codeDeliveryConfigured: boolean;
  aiConfigured: boolean;
}

export interface SessionState {
  authenticated: boolean;
  mfaRequired?: boolean;
  identity?: AdminProfile;
  permissions?: Permission[];
  csrfToken?: string;
  config: ConfigFlags;
}

export const auth = {
  session: () => get<SessionState>("/auth/session"),

  /**
   * Signs in with a password.
   *
   * Resolves with `mfaRequired: true` rather than throwing when a second factor is needed — that
   * is a successful first step, not a failure, and the caller advances to the code prompt.
   */
  login: (email: string, password: string) =>
    post<{ mfaRequired?: boolean; identity?: AdminProfile; csrfToken?: string }>("/auth/login", {
      email,
      password,
    }),

  verifyCode: (code: string) =>
    post<{ identity: AdminProfile; csrfToken: string }>("/auth/mfa", { code }),

  logout: () => post<{ signedOut: boolean }>("/auth/logout"),

  acceptInvite: (token: string, password: string) =>
    post<{ accepted: boolean; email: string }>("/invite/accept", { token, password }),
};

export interface AdminSessionInfo {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string | null;
  lastSeenAt: string | null;
}

export interface TwoFactorStatus {
  enabled: boolean;
  confirmedAt: string | null;
  recoveryCodesRemaining: number;
}

export const account = {
  load: () =>
    get<{
      identity: AdminProfile;
      permissions: Permission[];
      twoFactor: TwoFactorStatus;
      sessions: AdminSessionInfo[];
    }>("/account"),

  updateProfile: (input: { name?: string; title?: string; avatarUrl?: string | null }) =>
    patch<{ admin: AdminProfile }>("/account", input),

  changePassword: (currentPassword: string, newPassword: string) =>
    post<{ changed: boolean; otherSessionsSignedOut: boolean }>("/account/password", {
      currentPassword,
      newPassword,
    }),

  revokeOtherSessions: () => post<{ revoked: number }>("/account/sessions/revoke-all"),

  startTwoFactor: () => post<{ secret: string; uri: string }>("/account/2fa/start"),

  /** Returns the recovery codes, shown exactly once. */
  confirmTwoFactor: (code: string) =>
    post<{ enabled: boolean; recoveryCodes: string[] }>("/account/2fa/confirm", { code }),

  disableTwoFactor: (password: string) =>
    post<{ enabled: boolean }>("/account/2fa/disable", { password }),

  regenerateRecoveryCodes: (password: string) =>
    post<{ recoveryCodes: string[] }>("/account/2fa/recovery-codes", { password }),
};

// ─── Dashboard, search, publishing ───────────────────────────────────────────

export const insights = {
  dashboard: () => get<DashboardSnapshot>("/dashboard"),

  search: (term: string, limit = 30) =>
    get<{ results: SearchHit[] }>(`/search${query({ q: term, limit })}`),

  publishing: () =>
    get<{
      drafts: ContentSummary[];
      scheduled: ContentSummary[];
      published: ContentSummary[];
      archived: ContentSummary[];
    }>("/publishing"),
};

// ─── Content ─────────────────────────────────────────────────────────────────

export interface ContentListParams {
  kind?: ContentKind;
  status?: ContentStatus;
  category?: string;
  tag?: string;
  search?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  sort?: "recent" | "published" | "title";
}

export interface RevisionSummary {
  id: string;
  revision: number;
  note: string;
  createdAt: string;
  createdByEmail: string | null;
  title: string;
}

export interface ContentDraftInput {
  kind?: ContentKind;
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: unknown;
  coverImageUrl?: string | null;
  author?: { name: string; role?: string; avatarUrl?: string } | null;
  category?: string | null;
  tags?: string[];
  seo?: Record<string, unknown>;
  extras?: Record<string, unknown>;
  /** Sent for optimistic concurrency; a mismatch returns 409. */
  revision?: number;
}

export const content = {
  list: (params: ContentListParams = {}) =>
    get<{ items: ContentSummary[]; total: number }>(`/content${query({ ...params })}`),

  read: (id: string) => get<{ item: ContentItem; revisions: RevisionSummary[] }>(`/content/${id}`),

  create: (input: ContentDraftInput & { kind: ContentKind }) =>
    post<{ item: ContentItem }>("/content", input),

  update: (id: string, input: ContentDraftInput) =>
    patch<{ item: ContentItem }>(`/content/${id}`, input),

  remove: (id: string) => remove<{ deleted: boolean; id: string }>(`/content/${id}`),

  transition: (id: string, status: ContentStatus, scheduledFor?: string | null) =>
    post<{ item: ContentItem }>(`/content/${id}/transition`, { status, scheduledFor }),

  duplicate: (id: string) => post<{ item: ContentItem }>(`/content/${id}/duplicate`),

  revisions: (id: string) => get<{ revisions: RevisionSummary[] }>(`/content/${id}/revisions`),

  revert: (id: string, revision: number) =>
    post<{ item: ContentItem }>(`/content/${id}/revert`, { revision }),

  checkSlug: (kind: ContentKind, slug: string, excludeId?: string) =>
    get<{ available: boolean; suggestion: string }>(
      `/content/slug-available${query({ kind, slug, excludeId })}`,
    ),

  taxonomies: (kind?: ContentKind) =>
    get<{ categories: string[]; tags: string[] }>(`/taxonomies${query({ kind })}`),
};

// ─── Website: pages, sections, settings ──────────────────────────────────────

export const website = {
  pages: () => get<{ pages: ManagedPage[] }>("/pages"),

  page: (id: string) =>
    get<{ page: ManagedPage; schemas: Record<SectionType, SectionSchema> }>(`/pages/${id}`),

  createPage: (input: { title: string; path?: string; summary?: string }) =>
    post<{ page: ManagedPage }>("/pages", input),

  updatePage: (
    id: string,
    input: {
      title?: string;
      path?: string;
      summary?: string;
      sections?: unknown;
      seo?: unknown;
      revision?: number;
    },
  ) => patch<{ page: ManagedPage }>(`/pages/${id}`, input),

  transitionPage: (id: string, status: ContentStatus, scheduledFor?: string | null) =>
    post<{ page: ManagedPage }>(`/pages/${id}/transition`, { status, scheduledFor }),

  removePage: (id: string) => remove<{ deleted: boolean; id: string }>(`/pages/${id}`),

  sections: () =>
    get<{ sections: SiteSectionRecord[]; schemas: Record<SectionType, SectionSchema> }>(
      "/sections",
    ),

  section: (key: string) =>
    get<{ section: SiteSectionRecord; schema: SectionSchema }>(
      `/sections/${encodeURIComponent(key)}`,
    ),

  updateSection: (
    key: string,
    input: { fields?: unknown; visible?: boolean; status?: ContentStatus; label?: string },
  ) => patch<{ section: SiteSectionRecord }>(`/sections/${encodeURIComponent(key)}`, input),

  settings: () =>
    get<{
      settings: SiteSettings;
      options: {
        palettes: Record<string, { label: string; primary: string; accent: string }>;
        typography: Record<string, { label: string; display: string; body: string }>;
        buttonStyles: Record<string, { label: string; radius: string }>;
      };
    }>("/settings"),

  updateSettings: (key: "design" | "header" | "footer" | "seo" | "general", value: unknown) =>
    patch<{ settings: SiteSettings }>(`/settings/${key}`, { value }),
};

// ─── Media ───────────────────────────────────────────────────────────────────

export interface PresignedUpload {
  uploadUrl: string;
  headers: Record<string, string>;
  storageKey: string;
  publicUrl: string;
  expiresInSeconds: number;
}

export const media = {
  list: (
    params: {
      search?: string;
      folder?: string;
      category?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) =>
    get<{
      assets: MediaAsset[];
      total: number;
      folders: string[];
      storageConfigured: boolean;
    }>(`/media${query({ ...params })}`),

  presign: (input: { filename: string; mimeType: string; sizeBytes: number; folder?: string }) =>
    post<{ upload: PresignedUpload }>("/media/presign", input),

  confirm: (input: {
    storageKey: string;
    filename: string;
    mimeType: string;
    alt?: string;
    folder?: string;
    width?: number;
    height?: number;
  }) => post<{ asset: MediaAsset }>("/media/confirm", input),

  update: (id: string, input: { filename?: string; alt?: string; folder?: string }) =>
    patch<{ asset: MediaAsset }>(`/media/${id}`, input),

  usage: (id: string) => get<{ usage: { type: string; label: string }[] }>(`/media/${id}/usage`),

  remove: (id: string) => remove<{ deleted: boolean; id: string }>(`/media/${id}`),
};

/**
 * Uploads a file end to end: presign, PUT the bytes, then record the asset.
 *
 * The `Content-Type` header must be exactly what was signed — the bucket rejects the upload
 * otherwise — so the presign response's headers are passed through verbatim rather than rebuilt.
 *
 * `XMLHttpRequest` is used instead of `fetch` for one reason: it reports upload progress, and a
 * 200 MB video with no progress indicator is indistinguishable from a hung page.
 */
export async function uploadFile(
  file: File,
  options: { folder?: string; alt?: string; onProgress?: (fraction: number) => void } = {},
): Promise<MediaAsset> {
  const { upload } = await media.presign({
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    folder: options.folder,
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", upload.uploadUrl, true);
    for (const [name, value] of Object.entries(upload.headers)) xhr.setRequestHeader(name, value);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(
            new CmsError(
              xhr.status,
              `Object storage rejected the upload (${xhr.status}). Check the bucket's CORS policy allows PUT from this origin.`,
              "upload_failed",
            ),
          );
    xhr.onerror = () =>
      reject(
        new CmsError(
          0,
          "The upload failed. This is usually the bucket's CORS policy — it must allow PUT from this origin.",
          "upload_failed",
        ),
      );
    xhr.onabort = () => reject(new CmsError(0, "The upload was cancelled.", "upload_aborted"));
    xhr.send(file);
  });

  // Reading the intrinsic dimensions is best-effort: a failure must not lose the upload.
  const dimensions = await readImageDimensions(file).catch(() => null);

  return (
    await media.confirm({
      storageKey: upload.storageKey,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      alt: options.alt,
      folder: options.folder,
      width: dimensions?.width,
      height: dimensions?.height,
    })
  ).asset;
}

/** Intrinsic pixel dimensions of an image file, or null for anything that is not an image. */
function readImageDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return Promise.resolve(null);

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

// ─── Administrators, roles, activity ─────────────────────────────────────────

export interface AdminSummary {
  id: string;
  email: string;
  name: string;
  title: string;
  avatarUrl: string | null;
  role: AdminRole;
  status: "active" | "invited" | "suspended";
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  invitePending: boolean;
}

export interface RoleDescriptor {
  role: AdminRole;
  label: string;
  description: string;
  rank: number;
  permissions: Permission[];
}

export const admins = {
  list: () => get<{ admins: AdminSummary[]; assignableRoles: AdminRole[] }>("/admins"),

  invite: (input: { email: string; name?: string; title?: string; role: AdminRole }) =>
    post<{ admin: AdminSummary; inviteToken: string; expiresAt: string }>("/admins", input),

  update: (
    id: string,
    input: {
      name?: string;
      title?: string;
      role?: AdminRole;
      status?: "active" | "suspended";
      avatarUrl?: string | null;
    },
  ) => patch<{ admin: AdminSummary }>(`/admins/${id}`, input),

  reissueInvite: (id: string) =>
    post<{ admin: AdminSummary; inviteToken: string; expiresAt: string }>(
      `/admins/${id}/reissue-invite`,
    ),

  remove: (id: string) => remove<{ deleted: boolean; id: string }>(`/admins/${id}`),

  roles: () =>
    get<{
      roles: RoleDescriptor[];
      permissions: Record<string, { label: string; group: string; sensitive?: boolean }>;
      assignableRoles: AdminRole[];
    }>("/roles"),
};

export const activity = {
  list: (
    params: {
      limit?: number;
      offset?: number;
      action?: string;
      actor?: string;
      entityId?: string;
      search?: string;
    } = {},
  ) => get<{ entries: ActivityEntry[]; total: number }>(`/activity${query({ ...params })}`),
};

// ─── AI Website Manager ──────────────────────────────────────────────────────

export const ai = {
  list: () => get<{ requests: AiChangeRequest[]; codeDeliveryConfigured: boolean }>("/ai/requests"),

  read: (id: string) =>
    get<{ request: AiChangeRequest; codeDeliveryConfigured: boolean }>(`/ai/requests/${id}`),

  /** The model call happens server-side, so this can take a while. */
  create: (prompt: string) =>
    request<{ request: AiChangeRequest }>(
      "POST",
      "/ai/requests",
      { prompt },
      { timeoutMs: 120_000 },
    ),

  approve: (id: string) => post<{ request: AiChangeRequest }>(`/ai/requests/${id}/approve`),

  reject: (id: string, note: string) =>
    post<{ request: AiChangeRequest }>(`/ai/requests/${id}/reject`, { note }),

  requestChanges: (id: string, note: string) =>
    post<{ request: AiChangeRequest }>(`/ai/requests/${id}/request-changes`, { note }),

  apply: (id: string) => post<{ request: AiChangeRequest }>(`/ai/requests/${id}/apply`),

  rollback: (id: string) => post<{ request: AiChangeRequest }>(`/ai/requests/${id}/rollback`),

  openPullRequest: (id: string) =>
    post<{ request: AiChangeRequest }>(`/ai/requests/${id}/pull-request`),
};
