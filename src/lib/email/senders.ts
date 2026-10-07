/**
 * The site's sender identities, defined once in parts.
 *
 * Held as `{ name, localPart, domain }` rather than as `"ENICE Group <noreply@enicehq.com>"`
 * because the two providers spell a From address differently: Resend wants the formatted string,
 * PulseAssist wants the local part and appends the account's verified sending domain. Keeping the
 * parts here means switching provider does not mean editing every constant — see `Sender` in
 * `./types`.
 *
 * `EMAIL_FROM_DOMAIN` is the single place the sending domain is set. It defaults to `enicehq.com`
 * so the Resend path behaves exactly as it did before this abstraction existed; the PulseAssist
 * adapter requires the variable explicitly and refuses to send if it does not match a domain
 * verified on the account, rather than silently rewriting the address.
 */
import type { Sender } from "./types";

export const DEFAULT_SENDING_DOMAIN = "enicehq.com";

function sendingDomain(): string {
  return process.env.EMAIL_FROM_DOMAIN?.trim() || DEFAULT_SENDING_DOMAIN;
}

/**
 * Resolved per call rather than frozen at module load: these run in serverless handlers where a
 * changed environment variable should take effect on the next invocation.
 */
export function contactFormSender(): Sender {
  return { name: "ENICE Contact", localPart: "noreply", domain: sendingDomain() };
}

export function groupSender(): Sender {
  return { name: "ENICE Group", localPart: "noreply", domain: sendingDomain() };
}

/** Where internal notifications go. Not a sender, but it belongs with the addressing config. */
export const INTERNAL_RECIPIENT = "corporate@enicehq.com";
