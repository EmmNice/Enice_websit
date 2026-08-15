/**
 * Vercel serverless function — GET /api/ping
 *
 * Dependency-free health check. Deliberately imports nothing so it still answers when a
 * problem in the shared modules would break every other function, which makes it the first
 * thing to hit when diagnosing a deployment.
 */
import type { ApiRequest, ApiResponse } from "./lib/http";

export default function handler(_req: ApiRequest, res: ApiResponse) {
  res.status(200).json({ ok: true, ts: new Date().toISOString() });
}
