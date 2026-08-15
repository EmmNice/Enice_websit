import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Lock, RefreshCw, Users } from "lucide-react";
import { invokeFunction } from "@/lib/supabase-functions";

export const Route = createFileRoute("/admin/early-access")({
  head: () => ({
    meta: [
      { title: "PulseAssist Early Access — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEarlyAccessPage,
});

/**
 * Recommended review workflow. The server enforces this exact allow-list, so an operator
 * can only move a registration between these states — a public visitor cannot change any
 * status at all.
 */
const STATUSES = [
  "EARLY_ACCESS",
  "UNDER_REVIEW",
  "SELECTED_FOR_BETA",
  "INVITATION_SENT",
  "BETA_USER",
  "REJECTED",
] as const;

type Status = (typeof STATUSES)[number];

const STATUS_STYLES: Record<Status, string> = {
  EARLY_ACCESS: "bg-secondary text-muted-foreground",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-700",
  SELECTED_FOR_BETA: "bg-blue-500/10 text-blue-700",
  INVITATION_SENT: "bg-violet-500/10 text-violet-700",
  BETA_USER: "bg-emerald-500/10 text-emerald-700",
  REJECTED: "bg-destructive/10 text-destructive",
};

type Registration = {
  id: string;
  product: string;
  full_name: string;
  email: string;
  business_name: string;
  business_type: string;
  business_need: string | null;
  source: string;
  status: Status;
  created_at: string;
  updated_at?: string;
};

const STORAGE_KEY = "enice-admin-password";
const ADMIN_FUNCTION = "admin-early-access";

function AdminEarlyAccessPage() {
  const [password, setPassword] = useState(() =>
    typeof window === "undefined" ? "" : (sessionStorage.getItem(STORAGE_KEY) ?? ""),
  );
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async (pwd: string) => {
    setLoading(true);
    setError(null);
    const result = await invokeFunction<{ ok: boolean; registrations: Registration[] }>(
      ADMIN_FUNCTION,
      { method: "GET", headers: { "x-admin-password": pwd } },
    );
    setLoading(false);

    if (result.kind === "unreachable") {
      setError("Could not reach the server. Check your connection and try again.");
      return;
    }
    if (result.status === 401) {
      sessionStorage.removeItem(STORAGE_KEY);
      setError("Invalid password.");
      return;
    }
    if (result.status === 429) {
      setError("Too many attempts. Please wait a few minutes and try again.");
      return;
    }
    if (result.kind === "error" || !result.data?.ok) {
      const message = (result.data as { error?: string } | null)?.error;
      // A 500 here almost always means ADMIN_PASSWORD is not set as an Edge Function
      // secret, so surface the server's own wording rather than masking it.
      setError(message ?? "Could not load registrations. Please try again.");
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, pwd);
    setPassword(pwd);
    setRows(result.data.registrations ?? []);
  }, []);

  async function updateStatus(id: string, status: Status) {
    const previous = rows;
    setSavingId(id);
    setError(null);
    // Optimistic update, rolled back if the server rejects it.
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? prev);

    const result = await invokeFunction<{ ok: boolean }>(ADMIN_FUNCTION, {
      method: "POST",
      headers: { "x-admin-password": password },
      body: { id, status },
    });
    setSavingId(null);

    if (result.kind !== "ok" || !result.data?.ok) {
      setRows(previous ?? null);
      setError((result.data as { error?: string } | null)?.error ?? "Could not update status.");
    }
  }

  if (!rows) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const pwd = input || password;
            if (pwd) load(pwd);
          }}
          className="w-full max-w-sm rounded-xl border border-border bg-card p-8"
        >
          <Lock className="h-5 w-5 text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">PulseAssist Early Access</h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Enter the admin password to view registrations.
          </p>
          <label className="sr-only" htmlFor="admin-password">
            Admin password
          </label>
          <input
            id="admin-password"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin password"
            autoComplete="current-password"
            className="mt-5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          />
          {error && (
            <p role="alert" className="mt-3 text-[12px] text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-5 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              PulseAssist Early Access ({rows.length})
            </h1>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Registrations are review requests only — changing a status here does not grant product
              access.
            </p>
          </div>
          <button
            onClick={() => load(password)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12px] font-semibold text-foreground disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-[12px] text-destructive">
            {error}
          </p>
        )}

        {rows.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-[13px] text-muted-foreground">
            No registrations yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[980px] text-left text-[13px]">
              <thead className="bg-secondary text-[11px] tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Need</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 text-foreground">{r.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <a href={`mailto:${r.email}`} className="hover:text-primary hover:underline">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.business_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.business_type}</td>
                    <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                      {r.business_need ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[r.status] ?? STATUS_STYLES.EARLY_ACCESS}`}
                        >
                          {r.status.replace(/_/g, " ")}
                        </span>
                        <label className="sr-only" htmlFor={`status-${r.id}`}>
                          Status for {r.full_name}
                        </label>
                        <select
                          id={`status-${r.id}`}
                          value={r.status}
                          disabled={savingId === r.id}
                          onChange={(e) => updateStatus(r.id, e.target.value as Status)}
                          className="rounded-md border border-border bg-background px-2 py-1.5 text-[12px] disabled:opacity-60"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
