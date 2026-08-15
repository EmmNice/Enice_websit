/**
 * PulseAssist early-access registration — shared field contract and client submission.
 *
 * This module is safe on both client and server: no secrets, no server-only imports. The
 * limits and messages here are mirrored by the server-side validation in
 * `api-src/early-access.ts`; client validation exists for fast feedback only, and the
 * handler re-validates everything.
 */

/** POST target. Same-origin Vercel function — no cross-origin call, no public API key. */
export const EARLY_ACCESS_ENDPOINT = "/api/early-access";
export const ADMIN_EARLY_ACCESS_ENDPOINT = "/api/admin/early-access";

/**
 * Review workflow. The server enforces this exact list, so an operator can only move a
 * registration between these states and a public visitor cannot set a status at all.
 * Submitting the form never grants product access — it records a request to be reviewed.
 */
export const EARLY_ACCESS_STATUSES = [
  "EARLY_ACCESS",
  "UNDER_REVIEW",
  "SELECTED_FOR_BETA",
  "INVITATION_SENT",
  "BETA_USER",
  "REJECTED",
] as const;

export type EarlyAccessStatus = (typeof EARLY_ACCESS_STATUSES)[number];

/** Kept in sync with the server. Anything not listed is rejected server-side. */
export const BUSINESS_TYPES = [
  "Bank or financial institution",
  "Fintech",
  "Telecom",
  "Insurance",
  "E-commerce or retail",
  "Healthcare",
  "Logistics",
  "Government or public sector",
  "Startup",
  "Other",
] as const;

export const FIELD_LIMITS = {
  fullName: 120,
  email: 254,
  businessName: 160,
  businessType: 80,
  businessNeed: 1000,
} as const;

export type EarlyAccessFields = {
  fullName: string;
  email: string;
  businessName: string;
  businessType: string;
  businessNeed: string;
};

export type FieldErrors = Partial<Record<keyof EarlyAccessFields, string>>;

export const EMPTY_FIELDS: EarlyAccessFields = {
  fullName: "",
  email: "",
  businessName: "",
  businessType: "",
  businessNeed: "",
};

/**
 * Deliberately permissive: it rejects clear typos without excluding valid-but-unusual
 * addresses. Deliverability is proven by the confirmation email, not by a regex.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEarlyAccess(values: EarlyAccessFields): FieldErrors {
  const errors: FieldErrors = {};

  const fullName = values.fullName.trim();
  if (!fullName || fullName.length < 2) errors.fullName = "Please enter your full name.";
  else if (fullName.length > FIELD_LIMITS.fullName)
    errors.fullName = `Please keep this under ${FIELD_LIMITS.fullName} characters.`;

  const email = values.email.trim();
  if (!email) errors.email = "Please enter your work email address.";
  else if (!EMAIL_RE.test(email) || email.length > FIELD_LIMITS.email)
    errors.email = "Please enter a valid work email address.";

  const businessName = values.businessName.trim();
  if (!businessName) errors.businessName = "Please enter your business name.";
  else if (businessName.length > FIELD_LIMITS.businessName)
    errors.businessName = `Please keep this under ${FIELD_LIMITS.businessName} characters.`;

  if (!values.businessType) errors.businessType = "Please select your business type.";
  else if (!BUSINESS_TYPES.includes(values.businessType as (typeof BUSINESS_TYPES)[number]))
    errors.businessType = "Please select a business type from the list.";

  if (values.businessNeed.length > FIELD_LIMITS.businessNeed)
    errors.businessNeed = `Please keep this under ${FIELD_LIMITS.businessNeed} characters.`;

  return errors;
}

export type SubmitOutcome =
  | { status: "ok" }
  | { status: "duplicate"; message: string }
  | { status: "invalid"; fieldErrors: FieldErrors; message: string }
  | { status: "failed"; message: string };

const GENERIC_FAILURE = "We could not submit your request right now. Please try again in a moment.";
const UNREACHABLE = "We could not reach our servers. Check your connection and try again.";

const REQUEST_TIMEOUT_MS = 15_000;

type ServerBody = {
  ok?: boolean;
  code?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function mapFieldErrors(raw: ServerBody["fieldErrors"]): FieldErrors {
  const out: FieldErrors = {};
  if (!raw) return out;
  const allowed: (keyof EarlyAccessFields)[] = [
    "fullName",
    "email",
    "businessName",
    "businessType",
    "businessNeed",
  ];
  for (const key of allowed) {
    const first = raw[key]?.[0];
    if (typeof first === "string" && first) out[key] = first;
  }
  return out;
}

/**
 * Submits a registration. Never throws — every failure mode is returned so the UI can
 * render a specific, useful message.
 *
 * `honeypot` carries a hidden field that humans never see; it is forwarded so the server
 * can silently absorb bot traffic.
 */
export async function submitEarlyAccess(
  values: EarlyAccessFields,
  honeypot = "",
): Promise<SubmitOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  let body: ServerBody = {};
  try {
    res = await fetch(EARLY_ACCESS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        businessName: values.businessName.trim(),
        businessType: values.businessType,
        businessNeed: values.businessNeed.trim(),
        website: honeypot,
      }),
      signal: controller.signal,
    });

    // A platform-level failure can return an HTML error page; parse defensively so raw
    // markup never reaches the UI.
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text) as ServerBody;
      } catch {
        body = {};
      }
    }
  } catch {
    // Includes AbortError from the timeout above.
    return { status: "failed", message: UNREACHABLE };
  } finally {
    clearTimeout(timer);
  }

  if (res.ok && body.ok !== false) return { status: "ok" };

  if (res.status === 409 || body.code === "DUPLICATE") {
    return {
      status: "duplicate",
      message:
        body.error ??
        "This email is already on the PulseAssist early-access list. We'll be in touch.",
    };
  }

  if (res.status === 429) {
    return {
      status: "failed",
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  if (res.status === 400) {
    const fieldErrors = mapFieldErrors(body.fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return { status: "invalid", fieldErrors, message: "Please correct the highlighted fields." };
    }
  }

  return { status: "failed", message: body.error ?? GENERIC_FAILURE };
}
