// api-src/ping.ts
function handler(_req, res) {
  res.status(200).json({ ok: true, ts: (/* @__PURE__ */ new Date()).toISOString() });
}
export {
  handler as default
};
