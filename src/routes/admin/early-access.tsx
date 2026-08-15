import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Lock, RefreshCw, Users } from "lucide-react";
import {
  ADMIN_EARLY_ACCESS_ENDPOINT,
  EARLY_ACCESS_STATUSES,
  type EarlyAccessStatus,
} from "@/lib/early-access";

export const Route = createFileRoute("/admin/early-access")({
  head: () => ({
    meta: [
      { title: "PulseAssist Early Access — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEarlyAccessPage,
});

const STATUS_STYLES: Record<EarlyAccessStatus, string> = {
  EARLY_ACCESS: "bg-secondary text-muted-foreground",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-700",
  SELECTED_FOR_BETA: "bg-blue-500/10 text-blue-700",
  INVITATION_SENT: "bg-violet-500/10 text-violet-700",
  BETA_USER: "bg-emerald-500/10 text-emerald-700",
  REJECTED: "bg-destructive/10 text-destructive",
};

type Registration = {
  id: string;
  email: string;
  fullName: string;
  product: string;
  businessName: string;
  businessType: string;
  businessNeed: string;
  source: string;
  status: EarlyAccessStatus;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "enice-admin-password";

async function callAdmin(
  password: string,
  init: { method: "GET" | "POST"; body?: unknown },
): Promise<{ status: number; body: Record<string, unknown> | null }> {
  try {
    const res = await fetch(ADMIN_EARLY_ACCESS_ENDPOINT, {
      method: init.method,
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const text = await res.text();
    let body: Record<string, unknown> | null = null;
    try {
      body = text ? (JSON.parse(text) as Record<string, unknown>) : null;
    } catch {
      body = null;
    }
    return { status: res.status, body };
  } catch {
    return { status: 0, body: null };
  }
}

function AdminEarlyAccessPage() {
  const [password, setPassword] = useState(() =>
    typeof window === "undefined" ? "" : (sessionStorage.getItem(STORAGE_KEY) ?? ""),
  );
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async (pwd: string) => {
    setLoading(true);
    setError(null);
    const { status, body } = await callAdmin(pwd, { method: "GET" });
    setLoading(false);

    if (status === 0) {
      setError("Could not reach the server. Check your connection and try again.");
      return;
    }
    if (status === 401) {
      sessionStorage.removeItem(STORAGE_KEY);
      setError("Invalid password.");
      return;
    }
    if (status === 429) {
      setError("Too many attempts. Please wait a few minutes and try again.");
      return;
    }
    if (status !== 200 || body?.ok !== true) {
      // Surface the server's own wording so a missing ADMIN_PASSWORD is diagnosable.
      setError((body?.error as string) ?? "Could not load registrations. Please try again.");
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, pwd);
    setPassword(pwd);
    setRows((body.registrations as Registration[]) ?? []);
    setTruncated(Boolean(body.truncated));
  }, []);

  async function updateStatus(row: Registration, status: EarlyAccessStatus) {
    const previous = rows;
    setSavingId(row.id);
    setError(null);
    // Optimistic update, rolled back if the server rejects it.
    setRows((prev) => prev?.map((r) => (r.id === row.id ? { ...r, status } : r)) ?? prev);

    const { status: code, body } = await callAdmin(password, {
      method: "POST",
      body: { email: row.email, status },
    });
    setSavingId(null);

    if (code !== 200 || body?.ok !== true) {
      setRows(previous ?? null);
      setError((body?.error as string) ?? "Could not update status.");
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
        {truncated && (
          <p className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[12px] text-amber-700">
            Showing the first 100 registrations. Resend's contacts API has no pagination cursor —
            view the full list in the Resend dashboard.
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
                    <td className="px-4 py-3 text-foreground">{r.fullName}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <a href={`mailto:${r.email}`} className="hover:text-primary hover:underline">
                        {r.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.businessName || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.businessType || "—"}</td>
                    <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                      {r.businessNeed || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.source}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[r.status] ?? STATUS_STYLES.EARLY_ACCESS}`}
                        >
                          {r.status.replace(/_/g, " ")}
                        </span>
                        <label className="sr-only" htmlFor={`status-${r.id}`}>
                          Status for {r.fullName}
                        </label>
                        <select
                          id={`status-${r.id}`}
                          value={r.status}
                          disabled={savingId === r.id}
                          onChange={(e) => updateStatus(r, e.target.value as EarlyAccessStatus)}
                          className="rounded-md border border-border bg-background px-2 py-1.5 text-[12px] disabled:opacity-60"
                        >
                          {EARLY_ACCESS_STATUSES.map((s) => (
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
