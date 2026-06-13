import { useState } from "react";
import { Check, Send } from "lucide-react";

const SHADOW_CARD =
  "0 1px 2px 0 rgba(17,24,39,0.04), 0 4px 6px -1px rgba(17,24,39,0.05)";

export function ContactHub() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid corporate email required";
    if (!form.topic) e.topic = "Select an inquiry type";
    if (form.message.trim().length < 10) e.message = "Tell us a bit more (10+ characters)";
    return e;
  };

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: "", email: "", topic: "", message: "" });
    }, 3200);
  };

  return (
    <section id="contact" className="border-t border-border bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Corporate Inquiries
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl md:text-[2.75rem]">
            Start a conversation with ENICE Group.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            For partnerships, enterprise integrations, and platform inquiries.
            Our team responds within one business day.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-12 rounded-xl border border-border bg-background p-7 sm:p-10"
          style={{ boxShadow: SHADOW_CARD }}
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Check className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                Inquiry received.
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A member of the ENICE Group team will be in touch shortly.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              <Field
                label="Full Name"
                error={errors.name}
                input={
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="Jane Doe"
                  />
                }
              />
              <Field
                label="Corporate Email"
                error={errors.email}
                input={
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="jane@company.com"
                  />
                }
              />
              <Field
                label="Nature of Inquiry"
                error={errors.topic}
                input={
                  <select
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option value="">Select inquiry type…</option>
                    <option>Inquire about PulsePay</option>
                    <option>Inquire about PulseAssist</option>
                    <option>Partnership / Enterprise Integration</option>
                    <option>Careers / Co-Pilot Pipeline</option>
                  </select>
                }
              />
              <Field
                label="Message"
                error={errors.message}
                input={
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="Tell us about your team, project, and how we can collaborate."
                  />
                }
              />
              <button
                type="submit"
                className="group mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Send Inquiry
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function Field({
  label,
  input,
  error,
}: {
  label: string;
  input: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {input}
      {error && <span className="mt-1.5 block text-[11px] text-destructive">{error}</span>}
    </label>
  );
}
