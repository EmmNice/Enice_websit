import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { administrators, CmsError } from "@/lib/cms/admin-client";
import { PasswordInput } from "@/components/admin/primitives";

/**
 * Accepting an invitation.
 *
 * Public on purpose: the person has no account yet, and the single-use token in the URL is the
 * credential. Setting a password here activates the account; they then sign in normally, so this
 * page never issues a session of its own.
 */
function InvitePage() {
  const navigate = useNavigate();
  const token =
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("token") ?? "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!token) {
      setError("This link is missing its invitation. Ask for a new one.");
      return;
    }
    if (password.length < 10) {
      setError("Use at least 10 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The two passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await administrators.accept(token, password);
      setDone(result.email);
    } catch (caught) {
      setError(
        caught instanceof CmsError
          ? caught.message
          : "We could not activate this invitation. Ask for a new link.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="bg-background flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.2em] uppercase">
          ENICE Website Manager
        </p>

        {done ? (
          <>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">You are set up.</h1>
            <p className="text-muted-foreground mt-3 text-[14px] leading-relaxed">
              {done} can now sign in with the password you just chose.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/admin" })}
              className="bg-foreground text-background mt-6 w-full rounded-md px-4 py-2.5 text-[14px] font-semibold"
            >
              Go to sign in
            </button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-3">
            <h1 className="text-2xl font-semibold tracking-tight">Choose your password</h1>
            <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
              Set a password for your administrator account. Use at least 10 characters.
            </p>

            <label className="mt-6 block text-[12.5px] font-semibold" htmlFor="pw">
              Password
            </label>
            <PasswordInput
              id="pw"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 block w-full px-3 py-2.5 text-[14px]"
            />

            <label className="mt-4 block text-[12.5px] font-semibold" htmlFor="pw2">
              Confirm password
            </label>
            <PasswordInput
              id="pw2"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 block w-full px-3 py-2.5 text-[14px]"
            />

            {error && (
              <p role="alert" className="text-destructive mt-4 text-[12.5px]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="bg-foreground text-background mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[14px] font-semibold disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Activate my account
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export const Route = createFileRoute("/admin/invite")({
  head: () => ({
    meta: [{ title: "Set up your account" }, { name: "robots", content: "noindex" }],
  }),
  component: InvitePage,
});
