import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react";
import { auth, CmsError } from "@/lib/cms/admin-client";
import { Button, Field, Input } from "@/components/admin/primitives";
import { PASSWORD_MIN_LENGTH } from "@/lib/cms/password-policy";

/**
 * Invitation acceptance — where a new administrator sets their first password.
 *
 * ## Why this is a separate, unauthenticated route
 *
 * It has to be reachable by someone with no account yet. The single-use token in the URL *is* the
 * credential: it is compared by digest server-side, expires after seven days, and is cleared on
 * first use. Nobody — including whoever sent the invitation — ever handles a working password.
 *
 * This is the only unauthenticated write endpoint in the whole panel, which is why the token is the
 * sole means of authorisation and why the server returns one deliberately vague message for every
 * failure: an expired token and a forged one must be indistinguishable, or the endpoint becomes a
 * way to test guesses.
 */
function AcceptInvitePage() {
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  // Checked client-side purely to give immediate feedback; the server enforces the real policy.
  const mismatch = confirmation.length > 0 && password !== confirmation;
  const tooShort = password.length > 0 && password.length < PASSWORD_MIN_LENGTH;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || mismatch || tooShort) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await auth.acceptInvite(token ?? "", password);
      setDone(result.email);
    } catch (caught) {
      setError(
        caught instanceof CmsError ? caught.message : "Could not set your password. Try again.",
      );
    } finally {
      setSubmitting(false);
      setPassword("");
      setConfirmation("");
    }
  };

  return (
    <main className="bg-secondary/40 flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="bg-primary text-primary-foreground mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-[16px] font-bold">
            E
          </span>
          <h1 className="text-foreground text-[18px] font-bold tracking-tight">
            ENICE Website Manager
          </h1>
          <p className="text-muted-foreground mt-1 text-[12.5px]">
            Set up your administrator access
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border p-6">
          {done ? (
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-foreground text-[14px] font-semibold">Your password is set</h2>
              <p className="text-muted-foreground mt-2 text-[12.5px] leading-relaxed">
                You can now sign in as <span className="text-foreground font-medium">{done}</span>.
              </p>
              <Button
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                onClick={() => (window.location.href = "/admin")}
              >
                Go to sign in
              </Button>
              <p className="text-muted-foreground mt-4 text-[11.5px] leading-relaxed">
                Once signed in, turn on two-factor authentication under Administration → Settings.
              </p>
            </div>
          ) : !token ? (
            <div className="text-center">
              <span className="bg-secondary text-muted-foreground mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="text-foreground text-[14px] font-semibold">
                This link is missing its invitation code
              </h2>
              <p className="text-muted-foreground mt-2 text-[12.5px] leading-relaxed">
                Use the complete link you were sent. If it has expired, ask an ENICE Owner to
                reissue your invitation.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="mb-5 flex items-center gap-2">
                <ShieldCheck className="text-primary h-4 w-4" aria-hidden="true" />
                <h2 className="text-foreground text-[14px] font-semibold">Choose a password</h2>
              </div>

              <div className="space-y-4">
                <Field
                  label="New password"
                  hint={`At least ${PASSWORD_MIN_LENGTH} characters. A memorable phrase is stronger than a short password with symbols.`}
                  error={tooShort ? `Use at least ${PASSWORD_MIN_LENGTH} characters.` : null}
                >
                  {(props) => (
                    <Input
                      {...props}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      autoFocus
                      required
                    />
                  )}
                </Field>

                <Field label="Confirm password" error={mismatch ? "These do not match." : null}>
                  {(props) => (
                    <Input
                      {...props}
                      type="password"
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      autoComplete="new-password"
                      required
                    />
                  )}
                </Field>
              </div>

              {error && (
                <p role="alert" className="text-destructive mt-4 text-[12px]">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                disabled={!password || mismatch || tooShort}
                className="mt-6 w-full"
              >
                Set password
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/admin/invite")({
  // The token arrives in the query string. Typed here so the component reads it safely rather than
  // parsing `window.location` by hand.
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),

  head: () => ({
    meta: [
      { title: "Set up your access · ENICE Website Manager" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
    ],
  }),

  component: AcceptInvitePage,
});
