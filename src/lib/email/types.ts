/**
 * The email provider PORT — the one interface the site talks to.
 *
 * SERVER ONLY. Consumed by the handlers in `api-src/` and by the audience stores in
 * `src/lib/*-store.server.ts`. Nothing outside `src/lib/email/` may import a provider SDK.
 *
 * ## Why an interface rather than calling a provider directly
 *
 * The site previously imported the Resend SDK in six places, which meant the provider was not a
 * decision the project could revisit — it was a dependency spread across the call sites. Email
 * delivery is exactly the kind of thing that gets re-tendered: pricing changes, deliverability
 * changes, and here the company is moving to its own product (PulseAssist Email) and wants to be
 * able to move again without a rewrite.
 *
 * So every provider-specific fact lives behind this port:
 *
 *   - how a From address is spelled (Resend wants `Name <box@domain>`, PulseAssist wants the
 *     local part and resolves the domain from the workspace's verified sending identity);
 *   - whether custom fields must be provisioned before use (Resend: yes, silently dropped
 *     otherwise; PulseAssist: no, attributes are free-form);
 *   - what an audience is called (Resend "segments", PulseAssist "lists");
 *   - error and retry shapes.
 *
 * Callers express INTENT — "send this", "put this person on that list" — and never a provider's
 * spelling of it.
 */

// ── Sending ──────────────────────────────────────────────────────────────────

/**
 * A sender identity, held in parts rather than as a formatted string.
 *
 * This is the load-bearing piece of the abstraction. A pre-formatted
 * `"ENICE Group <noreply@enicehq.com>"` is a Resend-shaped value: PulseAssist takes only the
 * local part (`noreply`) and appends the workspace's verified sending domain, because the
 * domain is a property of the account's proven DNS rather than of the message. Keeping the
 * parts separate lets each provider spell it its own way, and means switching provider does
 * not mean rewriting every From constant.
 */
export type Sender = {
  /** Display name, e.g. "ENICE Group". Optional — some providers ignore it. */
  name?: string;
  /** The mailbox before the @, e.g. "noreply". */
  localPart: string;
  /** The sending domain, e.g. "enicehq.com". Must be verified with the active provider. */
  domain: string;
};

/**
 * Maximum display-name length. RFC 5322 allows far more; a name longer than this is a mistake or an
 * attempt to push the address out of an inbox list.
 */
const MAX_DISPLAY_NAME = 120;

/**
 * Strip anything that could break out of the header, then quote if needed.
 *
 * `` `${sender.name} <${address}>` `` was fine while every name was a hardcoded constant, and stops
 * being fine the moment one carries visitor input — which the contact-form notification now does, so
 * that it shows WHO wrote in rather than a bare noreply address. A name containing CR or LF would
 * otherwise let a visitor append their own headers to mail the site sends.
 *
 * The PulseAssist path sanitises server-side as well; this is the Resend path's equivalent, and
 * belongs here regardless so no future caller has to remember.
 */
function displayName(raw: string): string {
  const clean = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_DISPLAY_NAME)
    .trim();
  if (!clean) return "";
  // Quote unless it is plainly safe unquoted; a comma alone would otherwise read as a second address.
  return /^[A-Za-z0-9 !#$%&'*+\-/=?^_`{|}~.]+$/.test(clean)
    ? clean
    : `"${clean.replace(/([\\"])/g, "\\$1")}"`;
}

export function formatAddress(sender: Sender): string {
  const address = `${sender.localPart}@${sender.domain}`;
  const name = sender.name ? displayName(sender.name) : "";
  return name ? `${name} <${address}>` : address;
}

export type OutboundEmail = {
  from: Sender;
  /** One or more recipients. A single string is the common case. */
  to: string | string[];
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  /**
   * Makes a retried send safe. PulseAssist honours it natively via `Idempotency-Key`; providers
   * without the concept ignore it, which is why it is optional rather than assumed.
   */
  idempotencyKey?: string;
  /**
   * Extra MIME headers. Used for the RFC 3834 auto-reply markers — see `AUTO_REPLY_HEADERS`.
   *
   * Both providers forward these; PulseAssist refuses the headers a caller must not set (From, Bcc,
   * DKIM-Signature and so on) with a 400 rather than dropping them silently.
   */
  headers?: Record<string, string>;
};

/**
 * What marks an email as machine-generated, so other mail systems stop answering it.
 *
 * `Auto-Submitted` is RFC 3834 and is the standard signal; `X-Auto-Response-Suppress` is Microsoft's
 * and is what Exchange and Outlook actually honour, so both are needed in practice.
 *
 * Why it matters here rather than being a nicety: the acknowledgement goes to an address a stranger
 * typed into a form, from `noreply@`. If that address has an out-of-office or a ticketing
 * autoresponder on it, an unmarked receipt invites a reply, which arrives at `noreply@` and — with
 * any autoresponder of our own, now or later — answers back. Marking the message is how that loop
 * is prevented at the standard rather than by hoping. It also stops "We received your message"
 * generating a spurious ticket in the recipient's own helpdesk.
 *
 * `auto-replied` is the correct value for a message sent BECAUSE of a specific incoming request.
 * `auto-generated` (below) is for mail nobody asked for individually.
 */
export const AUTO_REPLY_HEADERS: Record<string, string> = {
  "Auto-Submitted": "auto-replied",
  "X-Auto-Response-Suppress": "All",
};

/**
 * For automated mail that is not a reply to the recipient — the internal notification.
 *
 * Marked too, so that a holiday responder on the team mailbox cannot answer the notification and so
 * a helpdesk watching that mailbox does not treat it as a customer email.
 */
export const AUTO_GENERATED_HEADERS: Record<string, string> = {
  "Auto-Submitted": "auto-generated",
  "X-Auto-Response-Suppress": "All",
};

export type SendResult = {
  /** The provider's id for the message, when it returns one. */
  id: string | null;
  /** Which provider actually sent it — recorded in logs so a switch is visible after the fact. */
  provider: ProviderName;
};

// ── Audience (contacts + lists) ───────────────────────────────────────────────

/**
 * A named audience. Resend calls these segments, PulseAssist calls them lists; the port names
 * the CONCEPT and each adapter resolves it to an id, creating it if absent so a deploy never
 * depends on someone having clicked through a dashboard first.
 */
export type AudienceRef = {
  /** Human name, e.g. "PulseAssist Early Access". */
  name: string;
  /**
   * Optional per-provider env var holding a pre-existing id to pin instead of resolving by name.
   *
   * Keyed BY PROVIDER because an audience id is provider-specific — a Resend segment id is a
   * uuid, a PulseAssist list id is an integer. A single shared variable would hand one provider
   * the other's id after a switch, which either 404s or, worse, resolves to an unrelated
   * audience. Pinning is optional; absent one, the adapter resolves by name and creates it.
   */
  idEnvVars?: Partial<Record<ProviderName, string>>;
};

export type AudienceContact = {
  id: string;
  email: string;
  /** Full name. The port keeps one field; adapters split/join if their provider needs two. */
  name: string;
  /** Free-form string attributes. Adapters provision keys first if their provider requires it. */
  attributes: Record<string, string>;
  createdAt: string;
};

export type UpsertContactInput = {
  email: string;
  name: string;
  attributes: Record<string, string>;
  /** The audience to place them on. Membership is additive; existing memberships are kept. */
  audience: AudienceRef;
};

export type UpsertContactResult = { outcome: "created" | "updated" };

export type ListContactsResult = {
  contacts: AudienceContact[];
  /** True when the provider has more than was returned, so callers can say so honestly. */
  hasMore: boolean;
};

// ── The port ──────────────────────────────────────────────────────────────────

export type ProviderName = "pulseassist" | "resend";

export interface EmailProvider {
  readonly name: ProviderName;

  /** Transactional send. Throws `EmailSendError` when the provider refuses the message. */
  send(message: OutboundEmail): Promise<SendResult>;

  /** The contact for this address, or null. Attributes included. */
  findContact(email: string): Promise<AudienceContact | null>;

  /** Create or update the contact and ensure they are on the audience. */
  upsertContact(input: UpsertContactInput): Promise<UpsertContactResult>;

  /**
   * Merge attributes onto an existing contact. Returns false when there is no such contact,
   * rather than throwing — "no longer on the list" is a normal answer for an admin action.
   */
  updateContactAttributes(email: string, attributes: Record<string, string>): Promise<boolean>;

  /** Contacts on an audience, newest first. */
  listAudienceContacts(audience: AudienceRef, limit: number): Promise<ListContactsResult>;
}

// ── Errors ───────────────────────────────────────────────────────────────────

/**
 * The provider is not configured (missing key or sending domain).
 *
 * Distinct from a send failure on purpose: callers answer 503 for this — "the form is
 * temporarily unavailable" — rather than 500, because it is our configuration at fault and
 * retrying the same request will not help until it is fixed.
 */
export class EmailProviderConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailProviderConfigError";
  }
}

/** The provider accepted the request but refused the message, or the call failed outright. */
export class EmailSendError extends Error {
  constructor(
    message: string,
    readonly status: number | null = null,
    readonly provider: ProviderName | null = null,
  ) {
    super(message);
    this.name = "EmailSendError";
  }
}

// ── Shared helpers ───────────────────────────────────────────────────────────

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Rate limiting and server faults are worth retrying; a 4xx rejection is not. */
export function isTransientStatus(status: number | null): boolean {
  if (status === null) return false;
  return status === 429 || status >= 500;
}

/**
 * Retries a provider call on rate limiting and server errors.
 *
 * Kept in the port rather than per adapter because the need is universal: the first request
 * after a cold start tripped Resend's per-second limit in production, and any provider can
 * answer 429. `shouldRetry` lets each adapter decide from its own error shape.
 */
export async function withRetry<T>(
  label: string,
  call: () => Promise<T>,
  shouldRetry: (result: T) => boolean,
  attempts = 3,
): Promise<T> {
  let last!: T;
  for (let i = 0; i < attempts; i++) {
    last = await call();
    if (!shouldRetry(last)) return last;
    if (i < attempts - 1) {
      const backoff = 400 * 2 ** i;
      console.warn(`[email] ${label} hit a transient error; retrying in ${backoff}ms`);
      await sleep(backoff);
    }
  }
  return last;
}

/** Providers that store names in two fields need this; the port keeps one. */
export function splitName(fullName: string): { firstName: string; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

export function joinName(firstName: string | null, lastName: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

export function toRecipientArray(to: string | string[]): string[] {
  return Array.isArray(to) ? to : [to];
}
