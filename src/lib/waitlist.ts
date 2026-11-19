/**
 * PulsePay waitlist: the contract shared by the public form, the API and the admin screen.
 *
 * Keeping the interest list, the status vocabulary and the validation here means the three can
 * never disagree about what a valid signup is. The server re-validates everything and is the
 * authority; client validation exists for fast feedback only.
 */

/** Same-origin Vercel function, no cross-origin call and no public API key. */
export const WAITLIST_ENDPOINT = "/api/waitlist";

// ─── Interests ───────────────────────────────────────────────────────────────

/** What a visitor can say they are looking forward to. Stored as the `id`, shown as the label. */
export const WAITLIST_INTERESTS = [
  { id: "transfers", label: "Instant transfers and payments" },
  { id: "airtime", label: "Airtime and data purchases" },
  { id: "dollar_cards", label: "Virtual dollar cards" },
  { id: "bills", label: "Bill payments" },
  { id: "rewards", label: "Cashback and rewards" },
  { id: "assistant", label: "Fin, your financial assistant" },
  { id: "savings", label: "Money management and savings" },
] as const;

export type WaitlistInterestId = (typeof WAITLIST_INTERESTS)[number]["id"];

const INTEREST_IDS: readonly string[] = WAITLIST_INTERESTS.map((i) => i.id);

export function interestLabel(id: string): string {
  return WAITLIST_INTERESTS.find((i) => i.id === id)?.label ?? id;
}

// ─── Status ──────────────────────────────────────────────────────────────────

/** Where a registration is in the team's follow-up. */
export const WAITLIST_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "invited",
  "onboarded",
  "not_interested",
] as const;

export type WaitlistStatus = (typeof WAITLIST_STATUSES)[number];

export const WAITLIST_STATUS_LABEL: Record<WaitlistStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  invited: "Invited",
  onboarded: "Onboarded",
  not_interested: "Not interested",
};

/** How the person describes themselves. Used to categorise the list. */
export const WAITLIST_SEGMENTS = ["individual", "business", "developer"] as const;
export type WaitlistSegment = (typeof WAITLIST_SEGMENTS)[number];

export const WAITLIST_SEGMENT_LABEL: Record<WaitlistSegment, string> = {
  individual: "Individual",
  business: "Business",
  developer: "Developer",
};

// ─── Limits and validation ───────────────────────────────────────────────────

export const WAITLIST_LIMITS = {
  name: 200,
  email: 200,
  phone: 24,
  notes: 2000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Normalises a phone number to digits with an optional leading `+`, or `""` if it is not
 * plausible. Nigerian local format (`080...`) is converted to `+234...` so the same person typing
 * their number two ways is recognised as one registration.
 */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  // Nigerian local format: 0803... becomes 234803... so both spellings dedupe to one person.
  if (!hasPlus && digits.startsWith("0") && digits.length === 11) {
    digits = `234${digits.slice(1)}`;
  }
  if (digits.length < 8 || digits.length > 15) return "";
  return `+${digits}`;
}

export type WaitlistFields = {
  name: string;
  email: string;
  phone: string;
  interests: string[];
  /** Explicit, separate opt-in to be contacted about the launch. Never pre-ticked. */
  consent: boolean;
};

export const EMPTY_WAITLIST: WaitlistFields = {
  name: "",
  email: "",
  phone: "",
  interests: [],
  consent: false,
};

export type WaitlistFieldErrors = Partial<Record<keyof WaitlistFields, string>>;

export function validateWaitlist(values: WaitlistFields): WaitlistFieldErrors {
  const errors: WaitlistFieldErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = "Please enter your name.";
  else if (name.length < 2) errors.name = "Please enter your full name.";
  else if (name.length > WAITLIST_LIMITS.name)
    errors.name = `Please keep this under ${WAITLIST_LIMITS.name} characters.`;

  const email = values.email.trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > WAITLIST_LIMITS.email)
    errors.email = "Please enter a valid email address.";

  if (values.phone.trim() && !normalizePhone(values.phone))
    errors.phone = "Please enter a valid phone number, with country code if outside Nigeria.";

  if (values.interests.some((i) => !INTEREST_IDS.includes(i)))
    errors.interests = "One of the selected options is not valid.";

  if (!values.consent)
    errors.consent = "Please confirm you are happy for us to contact you about the launch.";

  return errors;
}

// ─── Public submission ───────────────────────────────────────────────────────

export type WaitlistSubmitResult =
  { ok: true; status: "joined" | "already_joined" } | { ok: false; error: string };

/**
 * Sends a signup. `website` and `startedAt` are the honeypot and timing gate: a real visitor
 * leaves the hidden field empty and takes more than a moment to fill the form.
 */
export async function submitWaitlist(input: {
  fields: WaitlistFields;
  source: string;
  website: string;
  startedAt: number;
}): Promise<WaitlistSubmitResult> {
  try {
    const response = await fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.fields.name.trim(),
        email: input.fields.email.trim(),
        phone: input.fields.phone.trim(),
        interests: input.fields.interests,
        consent: input.fields.consent,
        source: input.source,
        website: input.website,
        startedAt: input.startedAt,
      }),
    });

    const payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      status?: "joined" | "already_joined";
      error?: string;
    } | null;

    if (response.ok && payload?.ok) {
      return {
        ok: true,
        status: payload.status === "already_joined" ? "already_joined" : "joined",
      };
    }

    return {
      ok: false,
      error: payload?.error || "We could not add you to the list right now. Please try again.",
    };
  } catch {
    return {
      ok: false,
      error: "We could not reach the server. Check your connection and try again.",
    };
  }
}

// ─── Admin record ────────────────────────────────────────────────────────────

/** One registration as the admin screen sees it. */
export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  interests: string[];
  segment: WaitlistSegment | null;
  status: WaitlistStatus;
  /** Whether they agreed to be contacted about the launch. */
  consent: boolean;
  consentAt: string | null;
  /** Set when consent is withdrawn; the person stays on file but is never notified. */
  unsubscribedAt: string | null;
  source: string;
  notes: string;
  lastContactedAt: string | null;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistStats {
  total: number;
  consented: number;
  unsubscribed: number;
  last7Days: number;
  byStatus: Record<WaitlistStatus, number>;
  byInterest: Record<string, number>;
}
