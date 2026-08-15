/**
 * PulseAssist early-access registration — shared field contract and client submission.
 *
 * The limits and messages here intentionally mirror the Zod schema in
 * `supabase/functions/pulseassist-early-access/index.ts`. Client validation exists for
 * fast feedback only; the Edge Function re-validates everything and is the authority.
 */
import { invokeFunction } from "./supabase-functions";

export const EARLY_ACCESS_FUNCTION = "pulseassist-early-access";

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
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEarlyAccess(values: EarlyAccessFields): FieldErrors {
  const errors: FieldErrors = {};

  const fullName = values.fullName.trim();
  if (!fullName) errors.fullName = "Please enter your full name.";
  else if (fullName.length < 2) errors.fullName = "Please enter your full name.";
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

type ServerErrorBody = {
  ok?: boolean;
  code?: string;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function mapFieldErrors(raw: ServerErrorBody["fieldErrors"]): FieldErrors {
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
 * `honeypot` carries the value of a hidden field that humans never see. It is forwarded
 * so the server can silently absorb bot traffic.
 */
export async function submitEarlyAccess(
  values: EarlyAccessFields,
  honeypot = "",
): Promise<SubmitOutcome> {
  const result = await invokeFunction<{ ok?: boolean }>(EARLY_ACCESS_FUNCTION, {
    method: "POST",
    body: {
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      businessName: values.businessName.trim(),
      businessType: values.businessType,
      businessNeed: values.businessNeed.trim(),
      website: honeypot,
    },
  });

  if (result.kind === "unreachable") return { status: "failed", message: UNREACHABLE };

  const body = (result.data ?? {}) as ServerErrorBody;

  if (result.kind === "ok" && body.ok !== false) return { status: "ok" };

  if (result.status === 409 || body.code === "DUPLICATE") {
    return {
      status: "duplicate",
      message:
        body.error ??
        "This email is already on the PulseAssist early-access list. We'll be in touch.",
    };
  }

  if (result.status === 429) {
    return {
      status: "failed",
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  if (result.status === 400) {
    const fieldErrors = mapFieldErrors(body.fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return {
        status: "invalid",
        fieldErrors,
        message: "Please correct the highlighted fields.",
      };
    }
    return { status: "failed", message: body.error ?? GENERIC_FAILURE };
  }

  return { status: "failed", message: body.error ?? GENERIC_FAILURE };
}
