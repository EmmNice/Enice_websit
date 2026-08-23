/**
 * Cryptographic primitives for the ENICE Website Manager.
 *
 * Everything here is built on `node:crypto`. That is a deliberate constraint: `bcrypt` and
 * `argon2` are native modules that need compiling for the deployment target, and an
 * authenticator library would be a third dependency in the trust path of the login flow. The
 * algorithms used — scrypt for passwords, AES-256-GCM for secrets at rest, HMAC-SHA1 for TOTP
 * — are all standard, and implementing the small amount of glue keeps the audit surface small
 * and the bundle free of native binaries.
 *
 * ## Threat model
 *
 * Assume an attacker who obtains a full database dump. They must not be able to:
 *   - recover passwords (scrypt, per-user salt, deliberately slow)
 *   - use session tokens (only SHA-256 digests are stored)
 *   - mint valid TOTP codes (secrets are encrypted with a key held outside the database)
 *   - use recovery codes (stored as digests of high-entropy values)
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  createHash,
  hkdfSync,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import type { ScryptOptions } from "node:crypto";
import { promisify } from "node:util";

/**
 * `promisify`'s inferred overload drops the options argument, so the cost parameters below
 * would be silently ignored at the type level. Naming the signature keeps them checked.
 */
type ScryptFn = (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
) => Promise<Buffer>;

const scrypt = promisify(scryptCallback) as ScryptFn;

// ─── Application secret ──────────────────────────────────────────────────────

/** Thrown when `CMS_SECRET` is missing or too weak for the operation being attempted. */
export class SecretNotConfiguredError extends Error {
  constructor() {
    super(
      "CMS_SECRET is not configured. Generate one with `openssl rand -base64 48` and set it " +
        "as an environment variable. It encrypts two-factor secrets and signs CSRF tokens.",
    );
    this.name = "SecretNotConfiguredError";
  }
}

const MIN_SECRET_LENGTH = 32;

export function isSecretConfigured(): boolean {
  const secret = process.env.CMS_SECRET;
  return typeof secret === "string" && secret.length >= MIN_SECRET_LENGTH;
}

function appSecret(): string {
  const secret = process.env.CMS_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) throw new SecretNotConfiguredError();
  return secret;
}

/**
 * Derives a purpose-scoped key from the application secret.
 *
 * HKDF with a distinct `info` label per use means the CSRF signing key and the TOTP encryption
 * key are cryptographically independent, so a weakness or leak in one context cannot be used
 * against the other — a property that using `CMS_SECRET` directly everywhere would not have.
 */
function derivedKey(purpose: string, length = 32): Buffer {
  return Buffer.from(hkdfSync("sha256", appSecret(), "enice-cms-v1", purpose, length));
}

// ─── Constant-time comparison ────────────────────────────────────────────────

/**
 * Compares two strings without leaking their contents through timing.
 *
 * `timingSafeEqual` throws on length mismatch, which would itself be an oracle, so both inputs
 * are hashed to a fixed 32 bytes first and the digests compared. That makes the comparison
 * length-independent as well as content-independent.
 */
export function safeEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a, "utf8").digest();
  const digestB = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(digestA, digestB);
}

// ─── Random tokens ───────────────────────────────────────────────────────────

/** URL-safe random token. 32 bytes gives 256 bits — far beyond guessable. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * SHA-256 hex digest, used for session and invite tokens.
 *
 * A fast hash is correct here, unlike for passwords: these values are 256-bit random strings,
 * so there is no dictionary to attack and nothing for a slow KDF to defend against.
 */
export function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

// ─── Password hashing ────────────────────────────────────────────────────────

/**
 * scrypt cost parameters.
 *
 * N=2^15 with r=8 needs roughly 32 MB per hash and takes ~100 ms on the function runtime —
 * enough to make offline cracking expensive without risking a serverless timeout. `maxmem`
 * must be raised explicitly because Node's 32 MB default is just under what these
 * parameters require, and the call would otherwise fail at runtime rather than at review.
 */
const SCRYPT_N = 32_768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;
const SCRYPT_MAXMEM = 96 * 1024 * 1024;

/**
 * Hashes a password into a self-describing string:
 * `scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>`
 *
 * The parameters travel with the hash so they can be raised later without invalidating every
 * existing password — `verifyPassword` reads whatever each stored hash was made with.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

/**
 * Verifies a password against a stored hash.
 *
 * Returns false rather than throwing for malformed input, so a corrupt row cannot turn a login
 * attempt into a 500. The comparison is timing-safe.
 */
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[4], "base64");
    expected = Buffer.from(parts[5], "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;

  try {
    const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N,
      r,
      p,
      maxmem: SCRYPT_MAXMEM,
    });
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/**
 * Password policy.
 *
 * The rules and the message wording live in `src/lib/cms/password-policy.ts` so the admin panel can
 * apply the same check before submitting a form. This module re-exports them and delegates, which
 * keeps this file the enforcement point without letting the two definitions drift.
 */
export {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  checkPassword as validatePassword,
} from "../../src/lib/cms/password-policy";

// ─── Encryption at rest (AES-256-GCM) ────────────────────────────────────────

const ENCRYPTION_PREFIX = "v1";

/**
 * Encrypts a value with AES-256-GCM under a key derived from `CMS_SECRET`.
 *
 * Used for TOTP secrets. GCM is authenticated, so a tampered ciphertext fails to decrypt
 * rather than yielding a different plaintext — which matters because a modified TOTP secret
 * would otherwise silently lock an administrator out of their own account.
 *
 * Format: `v1.<iv base64>.<authTag base64>.<ciphertext base64>`
 */
export function encryptSecret(plaintext: string): string {
  const key = derivedKey("totp-encryption");
  // 96-bit nonce is the size GCM is specified for and the size Node's GCM mode expects.
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

/** Reverses `encryptSecret`. Returns null for anything malformed, tampered or wrongly keyed. */
export function decryptSecret(payload: string | null): string | null {
  if (!payload) return null;
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== ENCRYPTION_PREFIX) return null;

  try {
    const key = derivedKey("totp-encryption");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(parts[1], "base64"));
    decipher.setAuthTag(Buffer.from(parts[2], "base64"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(parts[3], "base64")),
      decipher.final(),
    ]);
    return plaintext.toString("utf8");
  } catch {
    // Wrong key or tampered payload. Callers treat this as "2FA unavailable" rather than
    // crashing, so a rotated CMS_SECRET degrades to a recovery-code login.
    return null;
  }
}

// ─── Base32 (RFC 4648) ───────────────────────────────────────────────────────

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Base32 without padding — the encoding authenticator apps expect for a TOTP secret. */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  // Left-align the remaining bits into a final character.
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31];

  return output;
}

/** Decodes base32, ignoring padding, spaces and case as an authenticator app would. */
export function base32Decode(input: string): Buffer {
  const normalized = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

// ─── TOTP (RFC 6238) ─────────────────────────────────────────────────────────

/** 30-second step and 6 digits: the defaults every authenticator app assumes. */
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;

/**
 * How many steps either side of now are accepted.
 *
 * One step (±30 s) tolerates ordinary clock drift and a slow submission. Widening this
 * proportionally widens the window for an intercepted code, so it stays at the minimum that
 * does not generate support requests.
 */
const TOTP_WINDOW = 1;

/** A fresh 160-bit TOTP secret, base32-encoded for display and QR encoding. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Computes the TOTP code for one time step. */
function totpAt(secret: Buffer, counter: number): string {
  // The counter is a 64-bit big-endian value; `writeBigUInt64BE` avoids the sign and
  // precision problems of splitting it into two 32-bit halves by hand.
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", secret).update(message).digest();

  // Dynamic truncation, RFC 4226 §5.4: the low nibble of the last byte selects the offset.
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (binary % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, "0");
}

/** The code for the current step. Exposed for enrolment confirmation and testing. */
export function totpNow(base32Secret: string, atMs = Date.now()): string {
  const counter = Math.floor(atMs / 1000 / TOTP_STEP_SECONDS);
  return totpAt(base32Decode(base32Secret), counter);
}

/**
 * Verifies a submitted TOTP code.
 *
 * Every candidate step is compared with `timingSafeEqual` and the loop always runs to
 * completion, so neither the result nor *which* step matched is observable through timing.
 */
export function verifyTotp(base32Secret: string, code: unknown, atMs = Date.now()): boolean {
  if (typeof code !== "string") return false;
  const cleaned = code.replace(/[\s-]/g, "");
  if (!new RegExp(`^\\d{${TOTP_DIGITS}}$`).test(cleaned)) return false;

  const secret = base32Decode(base32Secret);
  if (secret.length === 0) return false;

  const counter = Math.floor(atMs / 1000 / TOTP_STEP_SECONDS);
  const submitted = Buffer.from(cleaned, "utf8");
  let matched = false;

  for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset++) {
    const candidate = Buffer.from(totpAt(secret, counter + offset), "utf8");
    if (candidate.length === submitted.length && timingSafeEqual(candidate, submitted)) {
      matched = true;
    }
  }

  return matched;
}

/**
 * Builds the `otpauth://` URI an authenticator app scans.
 *
 * The issuer appears both as a path prefix and as a parameter — the redundancy is what the
 * spec calls for, and older apps read only one of the two.
 */
export function totpUri(email: string, base32Secret: string, issuer = "ENICE Website Manager") {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret: base32Secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

// ─── Recovery codes ──────────────────────────────────────────────────────────

/**
 * Alphabet for recovery codes, chosen to survive being written down and read back: no `0`/`O`,
 * no `1`/`I`/`L`, no `U` (mistaken for V), and no vowels that could form words.
 */
const RECOVERY_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
const RECOVERY_CODE_COUNT = 10;
const RECOVERY_CODE_CHARS = 16;

/**
 * Generates recovery codes and their digests.
 *
 * The plaintext is returned once, for display, and only the digests are persisted — so a
 * database dump does not yield a way past two-factor authentication. SHA-256 is sufficient
 * here because each code carries ~78 bits of entropy, leaving nothing to brute-force.
 *
 * `randomInt` is used rather than `randomBytes % alphabet.length`, which would bias the
 * distribution toward the start of the alphabet.
 */
export function generateRecoveryCodes(): { codes: string[]; hashes: string[] } {
  const codes: string[] = [];

  for (let index = 0; index < RECOVERY_CODE_COUNT; index++) {
    let raw = "";
    for (let position = 0; position < RECOVERY_CODE_CHARS; position++) {
      raw += RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)];
    }
    // Grouped into fours: markedly easier to transcribe accurately.
    codes.push(raw.replace(/(.{4})(?=.)/g, "$1-"));
  }

  return { codes, hashes: codes.map((code) => sha256(normalizeRecoveryCode(code))) };
}

/** Normalises a submitted code so formatting and case never cause a false rejection. */
export function normalizeRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Shape stored in `admin_users.recovery_codes`. Consumed codes are kept, marked used. */
export interface StoredRecoveryCode {
  hash: string;
  usedAt: string | null;
}

/**
 * Consumes a recovery code, returning the updated list when it matched.
 *
 * Single-use is enforced by marking rather than removing, so the count of remaining codes stays
 * meaningful and the activity log can show that a code was spent. Every entry is compared even
 * after a match, keeping the work independent of position in the list.
 */
export function consumeRecoveryCode(
  stored: StoredRecoveryCode[],
  submitted: string,
): { matched: boolean; updated: StoredRecoveryCode[] } {
  const digest = sha256(normalizeRecoveryCode(submitted));
  let matched = false;

  const updated = stored.map((entry) => {
    if (entry.usedAt === null && safeEqual(entry.hash, digest) && !matched) {
      matched = true;
      return { hash: entry.hash, usedAt: new Date().toISOString() };
    }
    return entry;
  });

  return { matched, updated };
}

// ─── CSRF tokens ─────────────────────────────────────────────────────────────

/**
 * Signed, session-bound CSRF token.
 *
 * The session cookie is `SameSite=Strict`, which already stops a cross-site form from
 * authenticating. This is the second layer: the token is bound to the session id by an HMAC, so
 * it cannot be lifted from one administrator's session and replayed in another's, and it is
 * delivered in a header the browser will not attach automatically.
 */
export function issueCsrfToken(sessionId: string): string {
  const nonce = randomToken(16);
  const signature = createHmac("sha256", derivedKey("csrf-signing"))
    .update(`${sessionId}.${nonce}`)
    .digest("base64url");
  return `${nonce}.${signature}`;
}

/** Verifies a CSRF token against the session it must belong to. */
export function verifyCsrfToken(sessionId: string, token: unknown): boolean {
  if (typeof token !== "string") return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const nonce = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  const expected = createHmac("sha256", derivedKey("csrf-signing"))
    .update(`${sessionId}.${nonce}`)
    .digest("base64url");

  return safeEqual(provided, expected);
}
