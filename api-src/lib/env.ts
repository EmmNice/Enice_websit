/**
 * Environment lookup that tolerates a platform-applied prefix.
 *
 * ## Why this exists
 *
 * Vercel lets an operator attach a managed store — Postgres, Blob — under a *prefix*, and the
 * prefix is applied to every variable the provider publishes. Connecting Neon under the prefix
 * `DATABASE` yields `DATABASE_DATABASE_URL` rather than `DATABASE_URL`; a Blob store under the
 * prefix `MEDIA` yields `MEDIA_BLOB_READ_WRITE_TOKEN`. The variables belong to the integration
 * and are read-only in the dashboard, so code that insists on the bare name leaves the operator
 * with a store that is correctly provisioned, correctly connected, and still unreachable — with
 * no way to fix it short of destroying the store and re-adding it.
 *
 * This bit us in production once already, on the database. Anything else Vercel can provision
 * under a prefix goes through here.
 *
 * ## The rules
 *
 * A name matches either exactly or as a `_`-delimited suffix. Preference is decided by the
 * *name*, never by iteration order: `process.env` ordering is not guaranteed, and a store chosen
 * at random between deployments is worse than one that is missing. So candidates are considered
 * in the order the caller lists them, and within one name the shortest match wins — meaning a
 * variable an operator set by hand always beats one an integration injected.
 *
 * An optional predicate lets the caller reject values that cannot be what it is looking for.
 * That is what makes suffix matching safe: the same integrations also publish ARNs, hostnames and
 * project ids, and a caller that requires a `postgres://` scheme can never pick one up by
 * accident.
 */

export interface EnvMatch {
  /** The variable the value came from, safe to log. Never log the value. */
  name: string;
  value: string;
}

export function findEnv(
  names: readonly string[],
  accept: (value: string) => boolean = () => true,
  env: NodeJS.ProcessEnv = process.env,
): EnvMatch | null {
  for (const name of names) {
    const matches = Object.keys(env)
      .filter((key) => key === name || key.endsWith(`_${name}`))
      .filter((key) => {
        const value = (env[key] ?? "").trim();
        return value !== "" && accept(value);
      })
      .sort((a, b) => a.length - b.length || a.localeCompare(b));

    const match = matches[0];
    if (match !== undefined) return { name: match, value: (env[match] as string).trim() };
  }

  return null;
}

/** The value only, for callers that do not need to report which variable was used. */
export function envValue(
  names: readonly string[],
  accept?: (value: string) => boolean,
  env?: NodeJS.ProcessEnv,
): string | undefined {
  return findEnv(names, accept, env)?.value;
}
