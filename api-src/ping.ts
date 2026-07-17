// Minimal diagnostic endpoint — no imports, no AI code.
// Tests whether Vercel can invoke ANY function in this project.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function handler(_req: any, res: any) {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
}
