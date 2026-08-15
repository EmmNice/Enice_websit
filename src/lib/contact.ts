/**
 * Contact form — shared field contract and client submission.
 *
 * Used by both the compact section on the homepage and the full page at `/contact`, so the
 * two forms cannot drift apart. Submissions go to `POST /api/contact`, which emails
 * corporate@enicehq.com with the sender's address as `Reply-To`.
 *
 * The limits and messages here are mirrored by the server, which re-validates everything
 * and is the authority. Client validation exists for fast feedback only.
 */

/** Same-origin Vercel function — no cross-origin call, no public API key. */
export const CONTACT_ENDPOINT = "/api/contact";

export const INQUIRY_OPTIONS = [
  "Fintech Infrastructure Integration (PulsePay)",
  "Telecom or Banking AI Deployment (PulseAssist)",
  "Technology or Product Partnership",
  "General Corporate Inquiry",
] as const;

export const FIELD_LIMITS = {
  name: 200,
  email: 200,
  company: 200,
  inquiry: 200,
  message: 2000,
} as const;

export type ContactFields = {
  name: string;
  email: string;
  company: string;
  inquiry: string;
  message: string;
  /** Opt-in to product updates. Surfaced in the notification email. */
  updates: boolean;
};

export const EMPTY_CONTACT: ContactFields = {
  name: "",
  email: "",
  company: "",
  inquiry: "",
  message: "",
  updates: false,
};

export type ContactFieldErrors = Partial<Record<keyof ContactFields, string>>;

/**
 * Which form is being validated.
 *
 * `full` is the dedicated /contact page, where company and the inquiry category are asked
 * for because the enquiry is expected to be a business one. `compact` is the homepage
 * section, which asks the minimum needed to reply — anyone should be able to send a message
 * without first declaring a company.
 */
export type ContactVariant = "full" | "compact";

/**
 * Deliberately permissive: it rejects clear typos without excluding valid-but-unusual
 * addresses. Deliverability is proven by the auto-reply, not by a regex.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(
  values: ContactFields,
  variant: ContactVariant = "compact",
): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  const name = values.name.trim();
  if (!name || name.length < 2) errors.name = "Please enter your name.";
  else if (name.length > FIELD_LIMITS.name)
    errors.name = `Please keep this under ${FIELD_LIMITS.name} characters.`;

  const email = values.email.trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > FIELD_LIMITS.email)
    errors.email = "Please enter a valid email address.";

  const company = values.company.trim();
  if (variant === "full" && !company) errors.company = "Please enter your company or institution.";
  else if (company.length > FIELD_LIMITS.company)
    errors.company = `Please keep this under ${FIELD_LIMITS.company} characters.`;

  if (variant === "full" && !values.inquiry)
    errors.inquiry = "Please select the nature of your inquiry.";

  const message = values.message.trim();
  if (!message) errors.message = "Please write a message.";
  else if (message.length < 10) errors.message = "Please add a little more detail.";
  else if (message.length > FIELD_LIMITS.message)
    errors.message = `Please keep this under ${FIELD_LIMITS.message} characters.`;

  return errors;
}

export type ContactOutcome =
  | { status: "ok" }
  | { status: "invalid"; fieldErrors: ContactFieldErrors; message: string }
  | { status: "failed"; message: string };

const GENERIC_FAILURE =
  "We could not send your message right now. Please try again, or email corporate@enicehq.com directly.";
const UNREACHABLE =
  "We could not reach our servers. Check your connection and try again, or email corporate@enicehq.com.";

const REQUEST_TIMEOUT_MS = 20_000;

type ServerBody = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function mapFieldErrors(raw: ServerBody["fieldErrors"]): ContactFieldErrors {
  const out: ContactFieldErrors = {};
  if (!raw) return out;
  const allowed: (keyof ContactFields)[] = ["name", "email", "company", "inquiry", "message"];
  for (const key of allowed) {
    const first = raw[key]?.[0];
    if (typeof first === "string" && first) out[key] = first;
  }
  return out;
}

/**
 * Sends a contact message. Never throws — every failure mode is returned so the UI can show
 * something specific and always offer the direct email address as a fallback.
 *
 * `honeypot` is a hidden field humans never see, and `startedAt` is when the form was first
 * rendered; both are forwarded so the server can discard obvious bot traffic.
 */
export async function submitContact(
  values: ContactFields,
  meta: { honeypot?: string; startedAt?: number; source: string },
): Promise<ContactOutcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  let body: ServerBody = {};
  try {
    res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        inquiry: values.inquiry,
        message: values.message.trim(),
        updates: values.updates,
        source: meta.source,
        website: meta.honeypot ?? "",
        startedAt: meta.startedAt,
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

  if (res.status === 400) {
    const fieldErrors = mapFieldErrors(body.fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      return { status: "invalid", fieldErrors, message: "Please correct the highlighted fields." };
    }
  }

  if (res.status === 429) {
    return {
      status: "failed",
      message: "You have sent a few messages already. Please wait a little before trying again.",
    };
  }

  return { status: "failed", message: body.error ?? GENERIC_FAILURE };
}
