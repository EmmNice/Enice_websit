/**
 * Global API error-handling wrapper.
 *
 * Usage — wrap every Vercel serverless handler with withErrorHandling():
 *
 *   export default withErrorHandling(async (req, res) => {
 *     // ... your handler code
 *   });
 *
 * Guarantees:
 *   - Any unhandled exception is caught before it can leak a stack trace.
 *   - The error is logged server-side with a reference ID.
 *   - The client always receives a clean JSON response (never a raw error).
 *   - Headers are never written twice (guards against "headers already sent").
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReq = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRes = any;

type ApiHandler = (req: AnyReq, res: AnyRes) => Promise<void> | void;

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err: unknown) {
      // Generate a short reference ID so the error is traceable in logs
      // without exposing any internal detail to the client.
      const ref = `E${Date.now().toString(36).toUpperCase()}`;

      console.error(`[api:unhandled:${ref}]`, err);

      // Do not write a second response if the handler already started one.
      if (res.headersSent) return;

      res.status(500).json({
        ok: false,
        error: "An unexpected error occurred on our end. Please try again shortly.",
        ref,
      });
    }
  };
}
