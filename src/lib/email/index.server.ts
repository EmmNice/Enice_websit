/**
 * Provider selection — the single place the site decides who sends its email.
 *
 * SERVER ONLY. Import this, never a provider module directly.
 *
 * ## Switching provider
 *
 * Set `EMAIL_PROVIDER`:
 *
 *   pulseassist   (default) ENICE's own product. Needs `PULSEASSIST_API_KEY` and
 *                 `EMAIL_FROM_DOMAIN` set to a domain verified in PulseAssist Email.
 *   resend        The previous provider. Needs `RESEND_API_KEY`.
 *
 * Nothing else in the codebase changes. That is the whole point: the call sites in `api-src/`
 * and the audience stores talk to the port in `./types`, so a switch is one environment
 * variable and a redeploy, not a refactor.
 *
 * ## Why the default is PulseAssist and not "whichever key is present"
 *
 * Inferring the provider from which API key happens to be set sounds convenient and is a trap:
 * both keys will be present during the migration, so the site's sending provider would be
 * decided by the order of a couple of `if`s rather than by an explicit decision — and a
 * mistaken inference means mail going out from the wrong infrastructure without anyone asking
 * for it. The provider is named explicitly, and an unrecognised name is a hard error rather
 * than a silent fallback.
 */
import { type EmailProvider, type ProviderName, EmailProviderConfigError } from "./types";
import { pulseAssistProvider } from "./provider-pulseassist.server";
import { resendProvider } from "./provider-resend.server";

const PROVIDERS: Record<ProviderName, EmailProvider> = {
  pulseassist: pulseAssistProvider,
  resend: resendProvider,
};

export const DEFAULT_PROVIDER: ProviderName = "pulseassist";

/** The configured provider name, validated. */
export function configuredProviderName(): ProviderName {
  const raw = process.env.EMAIL_PROVIDER?.trim().toLowerCase();
  if (!raw) return DEFAULT_PROVIDER;
  if (raw in PROVIDERS) return raw as ProviderName;
  throw new EmailProviderConfigError(
    `EMAIL_PROVIDER="${raw}" is not a known provider. Use one of: ${Object.keys(PROVIDERS).join(", ")}.`,
  );
}

/**
 * The active provider.
 *
 * Resolved per call rather than cached at module load, so a changed environment variable takes
 * effect on the next invocation and tests can switch provider without re-importing the module.
 * The providers themselves are stateless; only their id caches are per-instance.
 */
export function emailProvider(): EmailProvider {
  return PROVIDERS[configuredProviderName()];
}

// The port's vocabulary, re-exported so call sites need exactly one import.
export {
  EmailProviderConfigError,
  EmailSendError,
  formatAddress,
  type AudienceContact,
  type AudienceRef,
  type EmailProvider,
  type OutboundEmail,
  type ProviderName,
  type Sender,
  type SendResult,
} from "./types";
