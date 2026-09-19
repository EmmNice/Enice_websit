/**
 * The PulseAssist Email provider — ENICE's own product, used by ENICE.
 *
 * SERVER ONLY. Reads `PULSEASSIST_API_KEY`. Talks to the public `/v1/email` API over plain
 * `fetch` — deliberately no SDK, because the whole point of this module is that the site depends
 * on an HTTP contract it controls rather than on a vendor package.
 *
 * ## Authentication and scope
 *
 * `Authorization: Bearer <key>` with a key minted in the PulseAssist Email console (API keys
 * screen). The key needs the `send` scope; the account needs an Email plan that includes the
 * `email_api` capability — the free plan does not, and the API answers 403
 * `EMAIL_CAPABILITY_REQUIRED` when it is missing, which is surfaced here as a config error
 * rather than a send failure because retrying will not fix it.
 *
 * ## How the From address works, and why it differs from Resend
 *
 * The API takes `from` as a LOCAL PART only (`"noreply"`), never a full address. The domain is
 * resolved server-side from the workspace's verified sending identity, so a caller cannot send
 * as a domain the account has not proven it owns via DKIM/SPF. That is a deliberate security
 * property of the product, and it is why `Sender` in the port carries parts rather than a formatted
 * string. `EMAIL_FROM_DOMAIN` must therefore match a domain verified in PulseAssist, and this
 * adapter checks the two agree instead of letting a mismatch fail as a confusing 409 later.
 *
 * ## Acceptance is not delivery
 *
 * A send returns 202: the provider has taken custody. Inbox delivery is reported afterwards
 * through events/webhooks, never claimed by this call — so a 202 here means "accepted", and the
 * caller must not tell a visitor their mail arrived.
 *
 * ## Audiences
 *
 * PulseAssist lists are the audience primitive, and contact `attributes` are free-form JSON —
 * so unlike Resend there is NO key provisioning step and no risk of values being silently
 * dropped for an unknown key. That whole class of bug does not exist here.
 */
import {
  type AudienceContact,
  type AudienceRef,
  type EmailProvider,
  type ListContactsResult,
  type OutboundEmail,
  type SendResult,
  type UpsertContactInput,
  type UpsertContactResult,
  EmailProviderConfigError,
  EmailSendError,
  isTransientStatus,
  sleep,
  toRecipientArray,
} from "./types";

/**
 * The PulseAssist API base.
 *
 * `https://getpulseassist.com` — NOT `api.getpulseassist.com`, which does not exist. That
 * subdomain was this module's original default and is an NXDOMAIN: it looks like the obvious
 * hostname for an API, so it was written without being resolved. The failure it produced was
 * quietly misleading rather than loud — `fetch` rejects, the adapter reports a transport failure
 * with no HTTP status, and the site answered "we could not deliver your message" as though the
 * provider had refused the mail. The API had never been contacted at all.
 *
 * `PULSEASSIST_API_URL` still overrides this for staging.
 */
const DEFAULT_BASE_URL = "https://getpulseassist.com";

type Json = Record<string, unknown>;

type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  /** The API's problem+json `detail`/`title`, or a transport message. */
  error: string | null;
  /** The API's stable machine code, e.g. `EMAIL_CAPABILITY_REQUIRED`. */
  code: string | null;
};

function config(): { apiKey: string; baseUrl: string; fromDomain: string } {
  const apiKey = process.env.PULSEASSIST_API_KEY;
  if (!apiKey) {
    throw new EmailProviderConfigError("PULSEASSIST_API_KEY is not configured.");
  }
  const fromDomain = process.env.EMAIL_FROM_DOMAIN;
  if (!fromDomain) {
    throw new EmailProviderConfigError(
      "EMAIL_FROM_DOMAIN is not configured. It must be a domain verified in PulseAssist Email.",
    );
  }
  const baseUrl = (process.env.PULSEASSIST_API_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return { apiKey, baseUrl, fromDomain };
}

/** One request. Never throws for an HTTP status — the caller decides what a status means. */
async function call<T>(
  path: string,
  init: { method?: string; body?: Json; idempotencyKey?: string } = {},
): Promise<ApiResponse<T>> {
  const { apiKey, baseUrl } = config();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/v1${path}`, {
      method: init.method ?? "GET",
      headers,
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
  } catch (err) {
    /*
     * A transport failure has no HTTP status; reported as status 0 so it is never mistaken for a
     * refusal by the provider.
     *
     * The URL is named in the message deliberately. When this module defaulted to a hostname that
     * did not resolve, the log read "Could not reach PulseAssist: TypeError: fetch failed" — true,
     * useless, and consistent with a dozen unrelated causes. Naming the host it actually tried makes
     * a wrong base URL or an NXDOMAIN obvious at a glance instead of something to bisect.
     */
    return {
      ok: false,
      status: 0,
      data: null,
      error: `Could not reach PulseAssist at ${baseUrl}: ${String(err)}`,
      code: null,
    };
  }

  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!res.ok) {
    const p = (parsed ?? {}) as Record<string, unknown>;
    const detail =
      (typeof p.detail === "string" && p.detail) ||
      (typeof p.title === "string" && p.title) ||
      (typeof p.error === "string" && p.error) ||
      `PulseAssist returned ${res.status}`;
    const code = typeof p.code === "string" ? p.code : null;
    return { ok: false, status: res.status, data: null, error: detail, code };
  }

  return { ok: true, status: res.status, data: (parsed as T) ?? null, error: null, code: null };
}

/**
 * Retry wrapper for this adapter's response shape.
 *
 * Retries only rate limiting, server faults and transport failures (status 0). A 4xx is the
 * API telling us the request is wrong, and repeating it wastes the visitor's time.
 */
async function callWithRetry<T>(
  label: string,
  path: string,
  init: { method?: string; body?: Json; idempotencyKey?: string } = {},
  attempts = 3,
): Promise<ApiResponse<T>> {
  let last: ApiResponse<T> = {
    ok: false,
    status: 0,
    data: null,
    error: "not attempted",
    code: null,
  };
  for (let i = 0; i < attempts; i++) {
    last = await call<T>(path, init);
    if (last.ok) return last;
    const retryable = last.status === 0 || isTransientStatus(last.status);
    if (!retryable) return last;
    if (i < attempts - 1) {
      const backoff = 400 * 2 ** i;
      console.warn(`[pulseassist] ${label} failed (${last.status}); retrying in ${backoff}ms`);
      await sleep(backoff);
    }
  }
  return last;
}

/**
 * A refusal that means "this account cannot use the API", not "this message was bad".
 *
 * 401/403 with the capability/plan codes are configuration problems: the key is wrong, revoked,
 * or the plan does not include API access. Surfacing them as config errors makes the handlers
 * answer 503 with "temporarily unavailable" instead of telling a visitor their message failed.
 */
function isConfigRefusal(res: ApiResponse<unknown>): boolean {
  if (res.status === 401) return true;
  if (res.status !== 403) return false;
  const code = res.code ?? "";
  return /CAPABILITY|ENTITLEMENT|PLAN|SUBSCRIPTION|SCOPE/i.test(code);
}

// ── Audience resolution ───────────────────────────────────────────────────────

type ApiList = { id: number; name: string };

/** Cached per warm instance: the id never changes for a given name. */
const listIdCache = new Map<string, number>();

async function resolveListId(audience: AudienceRef): Promise<number> {
  const pinEnvVar = audience.idEnvVars?.pulseassist;
  const pinned = pinEnvVar ? process.env[pinEnvVar] : undefined;
  // A PulseAssist list id is an integer; anything else is ignored rather than sent as garbage.
  if (pinned && /^\d+$/.test(pinned.trim())) return Number(pinned.trim());

  const cached = listIdCache.get(audience.name);
  if (cached) return cached;

  const existing = await callWithRetry<{ lists: ApiList[] }>("lists.list", "/email/lists");
  if (!existing.ok) {
    if (isConfigRefusal(existing))
      throw new EmailProviderConfigError(existing.error ?? "PulseAssist refused the API key.");
    throw new EmailSendError(
      `Could not list audiences: ${existing.error}`,
      existing.status,
      "pulseassist",
    );
  }
  const found = (existing.data?.lists ?? []).find((l) => l.name === audience.name);
  if (found) {
    listIdCache.set(audience.name, found.id);
    return found.id;
  }

  // Created rather than required to pre-exist, so deploying never depends on a manual step.
  const created = await callWithRetry<{ list: ApiList }>("lists.create", "/email/lists", {
    method: "POST",
    body: { name: audience.name, description: "Created automatically by the ENICE website." },
  });
  if (!created.ok || !created.data?.list?.id) {
    // A concurrent cold start may have created it first; re-read before giving up.
    const reread = await callWithRetry<{ lists: ApiList[] }>("lists.list(retry)", "/email/lists");
    const raced = (reread.data?.lists ?? []).find((l) => l.name === audience.name);
    if (raced) {
      listIdCache.set(audience.name, raced.id);
      return raced.id;
    }
    throw new EmailSendError(
      `Could not create the "${audience.name}" audience: ${created.error}`,
      created.status,
      "pulseassist",
    );
  }
  listIdCache.set(audience.name, created.data.list.id);
  return created.data.list.id;
}

// ── Contact mapping ──────────────────────────────────────────────────────────

type ApiContact = {
  id: number;
  email: string;
  name: string | null;
  attributes: Record<string, string> | null;
  createdAt: string;
};

function toAudienceContact(c: ApiContact): AudienceContact {
  return {
    id: String(c.id),
    email: c.email,
    name: c.name ?? c.email,
    attributes: c.attributes ?? {},
    createdAt: c.createdAt,
  };
}

/**
 * The contact for an address.
 *
 * Uses the list endpoint's `search`, which matches email/name/company, then filters for an
 * EXACT address match — a search for `ada@example.com` must never return `ada@example.com.au`
 * and have us overwrite the wrong person's record.
 */
async function fetchContact(email: string): Promise<ApiContact | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;
  const res = await callWithRetry<{ contacts: ApiContact[] }>(
    "contacts.search",
    `/email/contacts?limit=25&search=${encodeURIComponent(target)}`,
  );
  if (!res.ok) {
    if (isConfigRefusal(res))
      throw new EmailProviderConfigError(res.error ?? "PulseAssist refused the API key.");
    throw new EmailSendError(
      `Could not look up the contact: ${res.error}`,
      res.status,
      "pulseassist",
    );
  }
  return (res.data?.contacts ?? []).find((c) => c.email.trim().toLowerCase() === target) ?? null;
}

// ── The provider ─────────────────────────────────────────────────────────────

export const pulseAssistProvider: EmailProvider = {
  name: "pulseassist",

  async send(message: OutboundEmail): Promise<SendResult> {
    const { fromDomain } = config();

    /*
     * The From domain is checked against the configured sending domain before the call.
     *
     * PulseAssist takes only the local part and appends the workspace's verified domain, so a
     * caller asking to send from a different domain would silently have it rewritten. Failing
     * here names the real problem ("this domain is not the configured sending domain") instead
     * of delivering mail from an address nobody expected.
     */
    if (message.from.domain.toLowerCase() !== fromDomain.toLowerCase()) {
      throw new EmailProviderConfigError(
        `Refusing to send as "${message.from.localPart}@${message.from.domain}": PulseAssist sends from ` +
          `the account's verified domain, which is configured as "${fromDomain}". Verify the domain in ` +
          `PulseAssist Email and set EMAIL_FROM_DOMAIN to match.`,
      );
    }

    const recipients = toRecipientArray(message.to);
    const res = await callWithRetry<{ id?: string; sendId?: string }>("email.send", "/email/send", {
      method: "POST",
      body: {
        // A local part only — see the note above.
        from: message.from.localPart,
        /*
         * The display name, sent separately because `from` cannot carry it.
         *
         * Without this the API composes a bare `noreply@enicehq.com` and every message the site
         * sends arrives showing a raw address — which the recipient's inbox lists as though it were
         * machine-generated. ENICE's own team read contact-form enquiries that way: an automated
         * notice rather than a person writing in. PulseAssist sanitises the value server-side, so a
         * visitor's typed name cannot forge a header through it.
         */
        ...(message.from.name ? { fromName: message.from.name } : {}),
        ...(message.headers && Object.keys(message.headers).length > 0
          ? { headers: message.headers }
          : {}),
        to: recipients.length === 1 ? recipients[0] : recipients,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
        subject: message.subject,
        html: message.html,
        ...(message.text ? { text: message.text } : {}),
      },
      idempotencyKey: message.idempotencyKey,
    });

    if (!res.ok) {
      if (isConfigRefusal(res)) {
        throw new EmailProviderConfigError(res.error ?? "PulseAssist refused the API key.");
      }
      throw new EmailSendError(
        res.error ?? "PulseAssist refused the message.",
        res.status,
        "pulseassist",
      );
    }

    // 202 Accepted. The id is whatever the API called it; both spellings are tolerated so a
    // field rename upstream degrades to "no id" rather than throwing on a successful send.
    return { id: res.data?.id ?? res.data?.sendId ?? null, provider: "pulseassist" };
  },

  async findContact(email: string): Promise<AudienceContact | null> {
    const contact = await fetchContact(email);
    return contact ? toAudienceContact(contact) : null;
  },

  async upsertContact(input: UpsertContactInput): Promise<UpsertContactResult> {
    const email = input.email.trim().toLowerCase();
    const listId = await resolveListId(input.audience);
    const existing = await fetchContact(email);

    if (existing) {
      /*
       * Attributes are MERGED, not replaced. A person may be both an early-access applicant and
       * a product-updates subscriber, and each flow writes its own namespaced keys; replacing the
       * map would make the second signup erase the first one's record.
       */
      const merged = { ...(existing.attributes ?? {}), ...input.attributes };
      const updated = await callWithRetry<{ contact: ApiContact }>(
        "contacts.update",
        `/email/contacts/${existing.id}`,
        { method: "PATCH", body: { name: existing.name ?? input.name, attributes: merged } },
      );
      if (!updated.ok) {
        throw new EmailSendError(
          `Could not update the contact: ${updated.error}`,
          updated.status,
          "pulseassist",
        );
      }
      await addToList(listId, existing.id);
      return { outcome: "updated" };
    }

    const created = await callWithRetry<{ contact: ApiContact }>(
      "contacts.create",
      "/email/contacts",
      {
        method: "POST",
        body: {
          email,
          name: input.name,
          attributes: input.attributes,
          source: "enice_website",
        },
      },
    );
    if (!created.ok || !created.data?.contact?.id) {
      if (isConfigRefusal(created)) {
        throw new EmailProviderConfigError(created.error ?? "PulseAssist refused the API key.");
      }
      throw new EmailSendError(
        `Could not create the contact: ${created.error}`,
        created.status,
        "pulseassist",
      );
    }
    await addToList(listId, created.data.contact.id);
    return { outcome: "created" };
  },

  async updateContactAttributes(
    email: string,
    attributes: Record<string, string>,
  ): Promise<boolean> {
    const existing = await fetchContact(email);
    if (!existing) return false;
    const merged = { ...(existing.attributes ?? {}), ...attributes };
    const res = await callWithRetry<{ contact: ApiContact }>(
      "contacts.update(attributes)",
      `/email/contacts/${existing.id}`,
      { method: "PATCH", body: { attributes: merged } },
    );
    if (!res.ok) {
      throw new EmailSendError(
        `Could not update the contact: ${res.error}`,
        res.status,
        "pulseassist",
      );
    }
    return true;
  },

  async listAudienceContacts(audience: AudienceRef, limit: number): Promise<ListContactsResult> {
    const listId = await resolveListId(audience);
    const capped = Math.min(Math.max(limit, 1), 100);

    /*
     * One request, and the attributes come with it.
     *
     * Worth noting against the Resend adapter, which costs 1 + N requests because its list
     * response omits custom properties and each contact has to be fetched individually. Here the
     * list response carries attributes, so a page of 100 applicants is a single call.
     */
    const res = await callWithRetry<{ contacts: ApiContact[]; nextAfterId: string | null }>(
      "contacts.list",
      `/email/contacts?limit=${capped}&listId=${listId}`,
    );
    if (!res.ok) {
      if (isConfigRefusal(res))
        throw new EmailProviderConfigError(res.error ?? "PulseAssist refused the API key.");
      throw new EmailSendError(
        `Could not list the audience: ${res.error}`,
        res.status,
        "pulseassist",
      );
    }

    const contacts = (res.data?.contacts ?? []).map(toAudienceContact);
    return { contacts, hasMore: Boolean(res.data?.nextAfterId) };
  },
};

/** Membership is additive and already-a-member is success, so a repeat signup is not an error. */
async function addToList(listId: number, contactId: number | string): Promise<void> {
  const res = await callWithRetry<unknown>("lists.addMembers", `/email/lists/${listId}/members`, {
    method: "POST",
    body: { contactIds: [Number(contactId)] },
  });
  if (!res.ok && !/exist|already|duplicate/i.test(res.error ?? "")) {
    throw new EmailSendError(
      `Could not add the contact to the audience: ${res.error}`,
      res.status,
      "pulseassist",
    );
  }
}

/** Test seam: clears the per-instance audience id cache. */
export function __resetPulseAssistCaches(): void {
  listIdCache.clear();
}
