/**
 * Branded HTML error page returned by the server (src/server.ts, src/start.ts)
 * when a catastrophic SSR failure prevents React from rendering at all.
 *
 * Matches the ENICE Group dark theme so users never see a raw browser error.
 */
export function renderErrorPage(statusCode = 500): string {
  const isServerError = statusCode >= 500;

  const headline = isServerError
    ? "Something went wrong on our end."
    : "This page didn't load.";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Something went wrong — ENICE Group</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background: #080810;
        color: #fff;
        display: grid;
        place-items: center;
        min-height: 100vh;
        padding: 1.5rem;
        position: relative;
        overflow: hidden;
      }

      /* Radial glow */
      body::before {
        content: '';
        position: absolute;
        top: -250px;
        left: 50%;
        transform: translateX(-50%);
        width: 700px;
        height: 500px;
        border-radius: 50%;
        background: radial-gradient(ellipse, #1d4ed8 0%, transparent 70%);
        opacity: 0.18;
        pointer-events: none;
      }

      /* Grid lines */
      body::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px);
        background-size: 48px 48px;
        opacity: 0.028;
        pointer-events: none;
      }

      .card {
        position: relative;
        z-index: 10;
        max-width: 30rem;
        width: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* Wordmark */
      .wordmark {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 2.5rem;
      }
      .wordmark-name {
        font-family: 'Courier New', monospace;
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: 0.12em;
        color: #fff;
      }
      .wordmark-name .e { color: #3b82f6; }
      .wordmark-divider {
        width: 1px;
        height: 1.25rem;
        background: rgba(255,255,255,0.2);
      }
      .wordmark-sub {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.28em;
        color: rgba(255,255,255,0.4);
      }

      /* Status pill */
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 9999px;
        border: 1px solid rgba(245,158,11,0.25);
        background: rgba(245,158,11,0.1);
        padding: 0.375rem 1rem;
        margin-bottom: 2rem;
      }
      .pill-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #fbbf24;
        animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .pill-label {
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.2em;
        color: #fbbf24;
      }

      h1 {
        font-size: clamp(1.75rem, 5vw, 2.5rem);
        font-weight: 700;
        letter-spacing: -0.03em;
        line-height: 1.15;
        color: #fff;
        margin-bottom: 1.25rem;
      }
      h1 span {
        background: linear-gradient(135deg, #60a5fa, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      p {
        font-size: 0.9375rem;
        line-height: 1.7;
        color: rgba(255,255,255,0.45);
        max-width: 22rem;
        margin-bottom: 2.5rem;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 2.75rem;
        padding: 0 1.5rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        text-decoration: none;
        border: none;
        transition: background 0.15s, opacity 0.15s;
      }
      .btn:active { transform: scale(0.97); }
      .btn-primary { background: #2563eb; color: #fff; }
      .btn-primary:hover { background: #3b82f6; }
      .btn-secondary {
        background: rgba(255,255,255,0.05);
        color: rgba(255,255,255,0.7);
        border: 1px solid rgba(255,255,255,0.1);
      }
      .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #fff; }

      .footer {
        margin-top: 3rem;
        font-size: 0.6875rem;
        color: rgba(255,255,255,0.2);
      }
      .footer a {
        color: inherit;
        text-decoration: none;
        transition: color 0.15s;
      }
      .footer a:hover { color: rgba(255,255,255,0.5); }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="wordmark">
        <span class="wordmark-name"><span class="e">E</span>NICE</span>
        <span class="wordmark-divider"></span>
        <span class="wordmark-sub">Group</span>
      </div>

      <div class="pill">
        <span class="pill-dot"></span>
        <span class="pill-label">System Notice</span>
      </div>

      <h1>${headline}<br /><span>We are fixing it.</span></h1>

      <p>
        Something went wrong on our end. We are fixing it right now — please
        refresh the page or try again shortly.
      </p>

      <div class="actions">
        <button class="btn btn-primary" onclick="location.reload()">Refresh page</button>
        <a class="btn btn-secondary" href="/">Go home</a>
      </div>

      <p class="footer">
        If this persists, contact us at
        <a href="mailto:corporate@enicehq.com">corporate@enicehq.com</a>
      </p>
    </div>
  </body>
</html>`;
}
