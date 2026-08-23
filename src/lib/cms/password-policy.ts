/**
 * The password policy, shared by the server and the admin panel.
 *
 * The server is the enforcement point — `validatePassword` in `api-src/lib/crypto.ts` imports these
 * constants and the list below. The panel imports them too, purely so it can tell someone the rule
 * *before* they submit and have it rejected.
 *
 * Keeping one definition is the point. A client that thought the minimum was 8 while the server
 * required 12 would produce a form that looks valid and then fails, with no indication why.
 *
 * ## Why length rather than character classes
 *
 * Mandatory symbols and digits push people toward predictable substitutions (`Password1!`) and
 * toward writing passwords down, while adding little real entropy. Length is what actually
 * correlates with strength, so the rule is a high floor on length and a small blocklist for the
 * handful of long-but-worthless values a length check alone would admit.
 */

export const PASSWORD_MIN_LENGTH = 12;

/**
 * Upper bound. Not a security rule but a denial-of-service one: scrypt hashes whatever it is given,
 * and a multi-megabyte password would tie up the function for as long as it took.
 */
export const PASSWORD_MAX_LENGTH = 200;

/** The minimum number of distinct characters, which rejects `aaaaaaaaaaaa` and similar. */
export const PASSWORD_MIN_UNIQUE_CHARS = 5;

/**
 * Values that satisfy the length rule but are among the first things any attacker tries — including
 * the brand-specific ones someone setting up this particular system might reach for.
 */
export const WEAK_PASSWORDS: ReadonlySet<string> = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd123",
  "administrator",
  "letmein12345",
  "qwertyuiop12",
  "123456789012",
  "enicegroup123",
  "enicehq12345",
  "welcome12345",
  "changeme1234",
  "adminadmin12",
  "websitemanager",
]);

export type PasswordCheck = { ok: true } | { ok: false; error: string };

/**
 * Validates a candidate password.
 *
 * Isomorphic: no Node or DOM APIs, so the same function runs in the serverless handler and in the
 * browser. Messages are written to be shown to a person directly.
 */
export function checkPassword(password: unknown): PasswordCheck {
  if (typeof password !== "string") {
    return { ok: false, error: "A password is required." };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      error: `Use at least ${PASSWORD_MIN_LENGTH} characters. Length matters more than symbols.`,
    };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, error: `Keep the password under ${PASSWORD_MAX_LENGTH} characters.` };
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, error: "That password is too common. Choose something unique." };
  }
  if (new Set(password).size < PASSWORD_MIN_UNIQUE_CHARS) {
    return { ok: false, error: "Use a greater variety of characters." };
  }
  return { ok: true };
}
