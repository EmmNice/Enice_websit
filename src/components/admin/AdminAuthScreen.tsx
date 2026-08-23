/**
 * The sign-in experience: password, second factor, and the not-configured state.
 *
 * One component rather than three routes, because all three are the same screen at different
 * stages and routing between them would put the partially-authenticated state in the URL — where a
 * refresh, a back button or a shared link could desynchronise it from the server's view. The stage
 * is derived from `phase` in `AdminContext`, which is derived from the server.
 *
 * ## What is deliberately absent
 *
 * No "create an account", no "sign up", no password-reset-by-email. The panel has no public
 * registration by design: an account exists only because an administrator created it, and a reset
 * is an administrator reissuing an invitation. Adding a self-service reset would create an
 * unauthenticated endpoint that takes an email address and sends a credential — exactly the surface
 * this design avoids.
 *
 * There is also no hint about whether an email exists. Every credential failure renders the same
 * sentence, matching the server, so the form cannot be used to enumerate administrators.
 */

import { useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, Lock, ServerCrash, ShieldCheck } from "lucide-react";
import { auth, CmsError } from "@/lib/cms/admin-client";
import { useAdmin } from "./AdminContext";
import { Button, Field, Input, Spinner } from "./primitives";

export function AdminAuthScreen() {
  const { phase, unavailableReason } = useAdmin();

  if (phase === "loading") {
    return (
      <main className="bg-background flex min-h-dvh items-center justify-center">
        <Spinner className="h-5 w-5" />
        <span className="sr-only">Checking your session</span>
      </main>
    );
  }

  if (phase === "unavailable") return <UnavailableScreen reason={unavailableReason} />;

  return (
    <AuthFrame>{phase === "second-factor" ? <SecondFactorForm /> : <PasswordForm />}</AuthFrame>
  );
}

/**
 * The shared frame.
 *
 * Deliberately plain and unbranded beyond the mark: this page is reachable by anyone who finds the
 * URL, so it should confirm nothing about what lies behind it beyond that it is ENICE's.
 */
function AuthFrame({ children }: { children: React.ReactNode }) {
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
            Private administration for enicehq.com
          </p>
        </div>

        <div className="border-border bg-card rounded-xl border p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
          {children}
        </div>

        <p className="text-muted-foreground mt-6 text-center text-[11.5px] leading-relaxed">
          Access is granted by invitation only. If you need an account, ask an ENICE Owner to invite
          you.
        </p>
      </div>
    </main>
  );
}

function PasswordForm() {
  const { onAuthenticated, onSecondFactorRequired, refresh } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await auth.login(email.trim(), password);

      if (result.mfaRequired) {
        // A successful first stage, not a failure. The password is cleared before advancing so it
        // does not sit in component state through the second step.
        setPassword("");
        onSecondFactorRequired();
        return;
      }

      // The session endpoint is the authority on permissions, so `refresh` follows rather than
      // trusting the login response's identity alone.
      if (result.identity) {
        onAuthenticated(result.identity, []);
      } else {
        await refresh();
      }
    } catch (caught) {
      setError(
        caught instanceof CmsError ? caught.message : "Could not sign in. Please try again.",
      );
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-5 flex items-center gap-2">
        <Lock className="text-primary h-4 w-4" aria-hidden="true" />
        <h2 className="text-foreground text-[14px] font-semibold">Sign in</h2>
      </div>

      <div className="space-y-4">
        <Field label="Email address">
          {(props) => (
            <Input
              {...props}
              ref={emailRef}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@enicehq.com"
              required
            />
          )}
        </Field>

        <Field label="Password">
          {(props) => (
            <Input
              {...props}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
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
        icon={ArrowRight}
        iconPosition="right"
        className="mt-6 w-full"
      >
        Continue
      </Button>
    </form>
  );
}

function SecondFactorForm() {
  const { onAuthenticated, refresh, signOut } = useAdmin();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [useRecovery, setUseRecovery] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [useRecovery]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const result = await auth.verifyCode(code.trim());
      if (result.identity) onAuthenticated(result.identity, []);
      else await refresh();
    } catch (caught) {
      setError(caught instanceof CmsError ? caught.message : "That code was not accepted.");
      setCode("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck className="text-primary h-4 w-4" aria-hidden="true" />
        <h2 className="text-foreground text-[14px] font-semibold">Two-factor verification</h2>
      </div>

      <p className="text-muted-foreground mb-5 text-[12.5px] leading-relaxed">
        {useRecovery
          ? "Enter one of the recovery codes you saved when you set up two-factor authentication. Each code works once."
          : "Enter the six-digit code from your authenticator app."}
      </p>

      <Field label={useRecovery ? "Recovery code" : "Authentication code"}>
        {(props) => (
          <Input
            {...props}
            ref={inputRef}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            // `one-time-code` lets a phone offer the code from an SMS or an authenticator.
            autoComplete="one-time-code"
            inputMode={useRecovery ? "text" : "numeric"}
            placeholder={useRecovery ? "XXXX-XXXX-XXXX-XXXX" : "000000"}
            maxLength={useRecovery ? 24 : 7}
            className={
              useRecovery
                ? "font-mono tracking-wider"
                : "text-center font-mono text-[18px] tracking-[0.35em]"
            }
            required
          />
        )}
      </Field>

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
        className="mt-6 w-full"
      >
        Verify
      </Button>

      <div className="mt-5 flex items-center justify-between text-[11.5px]">
        <button
          type="button"
          onClick={() => {
            setUseRecovery((current) => !current);
            setCode("");
            setError(null);
          }}
          className="text-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
        >
          <KeyRound className="h-3 w-3" aria-hidden="true" />
          {useRecovery ? "Use an authenticator code" : "Use a recovery code"}
        </button>

        {/* Signing out here discards the half-authenticated session server-side, rather than
            leaving it to expire while the browser holds a cookie for it. */}
        <button
          type="button"
          onClick={() => void signOut()}
          className="text-muted-foreground hover:text-foreground"
        >
          Start over
        </button>
      </div>
    </form>
  );
}

/**
 * Shown when the API cannot serve the panel at all.
 *
 * This is the first screen a new deployment shows, so it names the exact environment variables that
 * are missing — the server's own message is passed through rather than replaced with something
 * generic, because that message already says which one.
 */
function UnavailableScreen({ reason }: { reason: string | null }) {
  return (
    <main className="bg-secondary/40 flex min-h-dvh items-center justify-center px-5 py-12">
      <div className="w-full max-w-lg text-center">
        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <ServerCrash className="h-5 w-5" aria-hidden="true" />
        </span>

        <h1 className="text-foreground text-[18px] font-bold tracking-tight">
          The Website Manager is not ready yet
        </h1>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-[13px] leading-relaxed">
          {reason ??
            "The administration API could not be reached. This is a configuration or connectivity problem rather than a sign-in problem."}
        </p>

        <div className="border-border bg-card mt-6 rounded-xl border p-5 text-left">
          <p className="text-foreground mb-3 text-[12.5px] font-semibold">
            Required environment variables
          </p>
          <dl className="space-y-2.5 text-[12px]">
            {[
              ["DATABASE_URL", "A Postgres connection string. A pooled endpoint is recommended."],
              ["CMS_SECRET", "At least 32 random characters: openssl rand -base64 48"],
              ["CMS_OWNER_EMAIL", "The first Owner account, created on first sign-in."],
              [
                "CMS_OWNER_PASSWORD",
                "That account's initial password. Change it after signing in.",
              ],
            ].map(([name, description]) => (
              <div key={name}>
                <dt className="text-foreground font-mono text-[11.5px] font-semibold">{name}</dt>
                <dd className="text-muted-foreground mt-0.5 leading-relaxed">{description}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
