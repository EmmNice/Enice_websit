import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/early-access")({
  head: () => ({
    meta: [
      { title: "PulseAssist Early Access — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEarlyAccessPage,
});

const STATUSES = [
  "EARLY_ACCESS",
  "UNDER_REVIEW",
  "SELECTED_FOR_BETA",
  "INVITATION_SENT",
  "BETA_USER",
  "REJECTED",
];

type Registration = {
  id: string;
  product: string;
  full_name: string;
  email: string;
  business_name: string;
  business_type: string;
  business_need: string | null;
  source: string;
  status: string;
  created_at: string;
};

const STORAGE_KEY = "enice-admin-password";

function AdminEarlyAccessPage() {
  const [password, setPassword] = useState(() =>
    typeof window === "undefined" ? "" : (sessionStorage.getItem(STORAGE_KEY) ?? ""),
  );
  const [input, setInput] = useState("");
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load(pwd: string) {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase.functions.invoke("admin-early-access", {
      method: "GET",
      headers: { "x-admin-password": pwd },
    });
    setLoading(false);
    if (err || !data?.ok) {
      setError("Could not load registrations. Check the password and try again.");
      setRows(null);
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, pwd);
    setPassword(pwd);
    setRows(data.registrations as Registration[]);
  }

  async function updateStatus(id: string, status: string) {
    const { data, error: err } = await supabase.functions.invoke("admin-early-access", {
      method: "POST",
      headers: { "x-admin-password": password },
      body: { id, status },
    });
    if (err || !data?.ok) {
      setError("Could not update status.");
      return;
    }
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, status } : r)) ?? prev);
  }

  if (!rows) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(input || password);
          }}
          className="w-full max-w-sm rounded-xl border border-border bg-card p-8"
        >
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">
            PulseAssist Early Access
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Enter the admin password to view registrations.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Admin password"
            className="mt-5 w-full rounded-md border border-border bg-background px-3 py-2.5 text-[14px] outline-none focus:border-primary"
          />
          {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}
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
          <h1 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            PulseAssist Early Access ({rows.length})
          </h1>
          <button
            onClick={() => load(password)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[12px] font-semibold text-foreground"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        {error && <p className="mt-3 text-[12px] text-destructive">{error}</p>}

        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[880px] text-left text-[13px]">
            <thead className="bg-secondary text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Need</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-4 py-3 text-foreground">{r.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.business_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.business_type}</td>
                  <td className="max-w-[260px] px-4 py-3 text-muted-foreground">
                    {r.business_need ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1.5 text-[12px]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
