import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, RefreshCw, Users, Download } from "lucide-react";

export const Route = createFileRoute("/admin/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminWatchlistPage,
});

type Contact = {
  id: string;
  email: string;
  created_at: string;
  unsubscribed: boolean;
};

const STORAGE_KEY = "enice-admin-password";

function AdminWatchlistPage() {
  const [password, setPassword] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) ?? ""
  );
  const [input, setInput] = useState("");
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchContacts(pwd: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/watchlist", {
        headers: { "x-admin-password": pwd },
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (res.status === 401) {
          sessionStorage.removeItem(STORAGE_KEY);
          setPassword("");
          setError("Incorrect password.");
        } else {
          setError(json.error ?? "Something went wrong.");
        }
        return;
      }
      sessionStorage.setItem(STORAGE_KEY, pwd);
      setContacts(json.contacts);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (password) fetchContacts(password);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setPassword(input);
    fetchContacts(input);
  }

  function downloadCsv() {
    if (!contacts || contacts.length === 0) return;
    const rows = [
      ["Email", "Signed Up", "Unsubscribed"],
      ...contacts.map((c) => [
        c.email,
        new Date(c.created_at).toISOString(),
        c.unsubscribed ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `watchlist-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!password || (error && !contacts)) {
    return (
      <main id="main" className="flex min-h-dvh items-center justify-center bg-background px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Admin Access
            </h1>
          </div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Password
          </label>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mb-4 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Enter"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-dvh bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">
              Watchlist Sign-Ups
            </h1>
            {contacts && (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {contacts.length}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchContacts(password)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={downloadCsv}
              disabled={!contacts || contacts.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Signed Up</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {!contacts || contacts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">
                    {loading ? "Loading…" : "No sign-ups yet."}
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(c.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.unsubscribed
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {c.unsubscribed ? "Unsubscribed" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
