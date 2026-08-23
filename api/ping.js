import{createRequire as __nodeCreateRequire}from'node:module';const require=__nodeCreateRequire(import.meta.url);

// api-src/ping.ts
function handler(_req, res) {
  res.status(200).json({ ok: true, ts: (/* @__PURE__ */ new Date()).toISOString() });
}
export {
  handler as default
};
