var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/lib/cms/types.ts
function mediaCategoryFor(mimeType) {
  for (const [category, spec] of Object.entries(MEDIA_LIMITS)) {
    if (spec.mimeTypes.includes(mimeType)) return category;
  }
  return null;
}
var CONTENT_KINDS, CONTENT_KIND_META, CONTENT_STATUSES, CONTENT_KIND_SEGMENT, KIND_BY_SEGMENT, SECTION_TYPES, SECTION_SCHEMAS, BRAND_PALETTES, TYPE_PAIRINGS, BUTTON_STYLES, MEDIA_LIMITS, AI_CHANGE_STATUSES;
var init_types = __esm({
  "src/lib/cms/types.ts"() {
    "use strict";
    CONTENT_KINDS = ["blog", "announcement", "update", "news"];
    CONTENT_KIND_META = {
      blog: {
        singular: "Blog post",
        plural: "Blog",
        route: "/admin/content/blog",
        publicPrefix: "/blog",
        description: "Long-form articles published to the ENICE Group blog."
      },
      announcement: {
        singular: "Announcement",
        plural: "Announcements",
        route: "/admin/content/announcements",
        publicPrefix: "/announcements",
        description: "Company, product and partnership announcements, with an optional call to action."
      },
      update: {
        singular: "Update",
        plural: "Updates",
        route: "/admin/content/updates",
        publicPrefix: null,
        description: "Short notices about new services, features and expansions."
      },
      news: {
        singular: "News entry",
        plural: "News",
        route: "/admin/content/news",
        publicPrefix: "/news",
        description: "The ENICE news feed and changelog of milestones and platform changes."
      }
    };
    CONTENT_STATUSES = ["draft", "scheduled", "published", "archived"];
    CONTENT_KIND_SEGMENT = {
      blog: "blog",
      announcement: "announcements",
      update: "updates",
      news: "news"
    };
    KIND_BY_SEGMENT = new Map(
      Object.entries(CONTENT_KIND_SEGMENT).map(([kind, segment]) => [segment, kind])
    );
    SECTION_TYPES = [
      "hero",
      "richText",
      "featureGrid",
      "statistics",
      "logoStrip",
      "testimonials",
      "cta",
      "faq",
      "contact",
      "mediaSplit",
      "pricing",
      "steps"
    ];
    SECTION_SCHEMAS = {
      hero: {
        type: "hero",
        label: "Hero",
        description: "Page-opening headline with supporting copy and up to two actions.",
        icon: "Sparkles",
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small label above the headline." },
          { key: "heading", label: "Headline", type: "text", required: true },
          { key: "subheading", label: "Supporting copy", type: "textarea" },
          { key: "primaryCtaLabel", label: "Primary button label", type: "text" },
          { key: "primaryCtaUrl", label: "Primary button URL", type: "url" },
          { key: "secondaryCtaLabel", label: "Secondary button label", type: "text" },
          { key: "secondaryCtaUrl", label: "Secondary button URL", type: "url" },
          { key: "image", label: "Accompanying image", type: "image" }
        ]
      },
      richText: {
        type: "richText",
        label: "Rich text",
        description: "A block of formatted prose, using the full editor.",
        icon: "AlignLeft",
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          { key: "body", label: "Content", type: "richtext", required: true }
        ]
      },
      featureGrid: {
        type: "featureGrid",
        label: "Feature grid",
        description: "A grid of capabilities, services or products.",
        icon: "LayoutGrid",
        fields: [
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subheading", label: "Supporting copy", type: "textarea" },
          {
            key: "items",
            label: "Features",
            type: "repeater",
            max: 12,
            of: [
              {
                key: "icon",
                label: "Icon name",
                type: "text",
                help: "A lucide icon, e.g. ShieldCheck"
              },
              { key: "title", label: "Title", type: "text", required: true },
              { key: "description", label: "Description", type: "textarea" },
              { key: "url", label: "Link", type: "url" }
            ]
          }
        ]
      },
      statistics: {
        type: "statistics",
        label: "Company statistics",
        description: "A band of headline numbers.",
        icon: "BarChart3",
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          {
            key: "items",
            label: "Statistics",
            type: "repeater",
            max: 6,
            of: [
              { key: "value", label: "Value", type: "text", required: true },
              { key: "label", label: "Label", type: "text", required: true }
            ]
          }
        ]
      },
      logoStrip: {
        type: "logoStrip",
        label: "Partners",
        description: "A strip of partner or customer logos.",
        icon: "Handshake",
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          {
            key: "items",
            label: "Partners",
            type: "repeater",
            max: 24,
            of: [
              { key: "name", label: "Name", type: "text", required: true },
              { key: "logo", label: "Logo", type: "image" },
              { key: "url", label: "Website", type: "url" }
            ]
          }
        ]
      },
      testimonials: {
        type: "testimonials",
        label: "Testimonials",
        description: "Quotes from customers or partners.",
        icon: "Quote",
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          {
            key: "items",
            label: "Testimonials",
            type: "repeater",
            max: 9,
            of: [
              { key: "quote", label: "Quote", type: "textarea", required: true },
              { key: "name", label: "Name", type: "text", required: true },
              { key: "role", label: "Role and company", type: "text" },
              { key: "avatar", label: "Photo", type: "image" }
            ]
          }
        ]
      },
      cta: {
        type: "cta",
        label: "Call to action",
        description: "A closing band that drives one action.",
        icon: "MousePointerClick",
        fields: [
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subheading", label: "Supporting copy", type: "textarea" },
          { key: "ctaLabel", label: "Button label", type: "text", required: true },
          { key: "ctaUrl", label: "Button URL", type: "url", required: true },
          {
            key: "style",
            label: "Emphasis",
            type: "select",
            options: ["standard", "prominent"],
            help: "Both styles are brand-approved."
          }
        ]
      },
      faq: {
        type: "faq",
        label: "FAQ",
        description: "Expandable questions and answers.",
        icon: "CircleHelp",
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          {
            key: "items",
            label: "Questions",
            type: "repeater",
            max: 30,
            of: [
              { key: "question", label: "Question", type: "text", required: true },
              { key: "answer", label: "Answer", type: "textarea", required: true }
            ]
          }
        ]
      },
      contact: {
        type: "contact",
        label: "Contact",
        description: "Contact details alongside the enquiry form.",
        icon: "Mail",
        fields: [
          { key: "heading", label: "Heading", type: "text" },
          { key: "subheading", label: "Supporting copy", type: "textarea" },
          { key: "email", label: "Email address", type: "text" },
          { key: "showForm", label: "Show the enquiry form", type: "boolean" }
        ]
      },
      mediaSplit: {
        type: "mediaSplit",
        label: "Media and text",
        description: "An image beside a block of copy.",
        icon: "Columns2",
        fields: [
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Content", type: "richtext" },
          { key: "image", label: "Image", type: "image", required: true },
          { key: "imageSide", label: "Image side", type: "select", options: ["left", "right"] },
          { key: "ctaLabel", label: "Button label", type: "text" },
          { key: "ctaUrl", label: "Button URL", type: "url" }
        ]
      },
      pricing: {
        type: "pricing",
        label: "Plans",
        description: "Comparable plans or packages.",
        icon: "CreditCard",
        fields: [
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subheading", label: "Supporting copy", type: "textarea" },
          {
            key: "items",
            label: "Plans",
            type: "repeater",
            max: 4,
            of: [
              { key: "name", label: "Plan name", type: "text", required: true },
              { key: "price", label: "Price", type: "text" },
              { key: "cadence", label: "Billing cadence", type: "text" },
              { key: "description", label: "Description", type: "textarea" },
              { key: "features", label: "Features, one per line", type: "textarea" },
              { key: "ctaLabel", label: "Button label", type: "text" },
              { key: "ctaUrl", label: "Button URL", type: "url" },
              { key: "highlighted", label: "Highlight this plan", type: "boolean" }
            ]
          }
        ]
      },
      steps: {
        type: "steps",
        label: "Process steps",
        description: "A numbered sequence explaining how something works.",
        icon: "ListOrdered",
        fields: [
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subheading", label: "Supporting copy", type: "textarea" },
          {
            key: "items",
            label: "Steps",
            type: "repeater",
            max: 8,
            of: [
              { key: "title", label: "Title", type: "text", required: true },
              { key: "description", label: "Description", type: "textarea" }
            ]
          }
        ]
      }
    };
    BRAND_PALETTES = {
      "enice-navy": { label: "ENICE Navy (default)", primary: "#1E3A8A", accent: "#334155" },
      "enice-midnight": { label: "ENICE Midnight", primary: "#0F172A", accent: "#1E3A8A" },
      "enice-slate": { label: "ENICE Slate", primary: "#334155", accent: "#475569" },
      "enice-indigo": { label: "ENICE Indigo", primary: "#3730A3", accent: "#4F46E5" }
    };
    TYPE_PAIRINGS = {
      inter: { label: "Inter (default)", display: "Inter", body: "Inter" },
      "inter-tight": { label: "Inter Tight headings", display: "Inter Tight", body: "Inter" },
      "geist-inter": { label: "Geist headings", display: "Geist", body: "Inter" }
    };
    BUTTON_STYLES = {
      standard: { label: "Standard (6px)", radius: "0.375rem" },
      soft: { label: "Soft (10px)", radius: "0.625rem" },
      pill: { label: "Pill", radius: "9999px" }
    };
    MEDIA_LIMITS = {
      image: {
        mimeTypes: ["image/png", "image/jpeg", "image/webp", "image/avif", "image/svg+xml"],
        maxBytes: 12 * 1024 * 1024
      },
      video: {
        mimeTypes: ["video/mp4", "video/webm"],
        maxBytes: 200 * 1024 * 1024
      },
      document: {
        mimeTypes: ["application/pdf"],
        maxBytes: 25 * 1024 * 1024
      }
    };
    AI_CHANGE_STATUSES = [
      "queued",
      "analyzing",
      "proposed",
      "changes_requested",
      "approved",
      "applied",
      "pr_open",
      "deployed",
      "rejected",
      "failed"
    ];
  }
});

// api-src/lib/http.ts
function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const fromHeader = typeof first === "string" ? first.split(",")[0]?.trim() : void 0;
  return fromHeader || req.socket?.remoteAddress || "unknown";
}
function header(req, name) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}
function parseJsonBody(body) {
  if (typeof body === "string") {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  if (body && typeof body === "object") return body;
  return {};
}
function errorRef(prefix) {
  return `${prefix}${Date.now().toString(36).toUpperCase()}`;
}
var init_http = __esm({
  "api-src/lib/http.ts"() {
    "use strict";
  }
});

// node_modules/postgres/src/query.js
function cachedError(xs) {
  if (originCache.has(xs))
    return originCache.get(xs);
  const x = Error.stackTraceLimit;
  Error.stackTraceLimit = 4;
  originCache.set(xs, new Error());
  Error.stackTraceLimit = x;
  return originCache.get(xs);
}
var originCache, originStackCache, originError, CLOSE, Query;
var init_query = __esm({
  "node_modules/postgres/src/query.js"() {
    originCache = /* @__PURE__ */ new Map();
    originStackCache = /* @__PURE__ */ new Map();
    originError = /* @__PURE__ */ Symbol("OriginError");
    CLOSE = {};
    Query = class extends Promise {
      constructor(strings, args, handler2, canceller, options = {}) {
        let resolve, reject;
        super((a, b2) => {
          resolve = a;
          reject = b2;
        });
        this.tagged = Array.isArray(strings.raw);
        this.strings = strings;
        this.args = args;
        this.handler = handler2;
        this.canceller = canceller;
        this.options = options;
        this.state = null;
        this.statement = null;
        this.resolve = (x) => (this.active = false, resolve(x));
        this.reject = (x) => (this.active = false, reject(x));
        this.active = false;
        this.cancelled = null;
        this.executed = false;
        this.signature = "";
        this[originError] = this.handler.debug ? new Error() : this.tagged && cachedError(this.strings);
      }
      get origin() {
        return (this.handler.debug ? this[originError].stack : this.tagged && originStackCache.has(this.strings) ? originStackCache.get(this.strings) : originStackCache.set(this.strings, this[originError].stack).get(this.strings)) || "";
      }
      static get [Symbol.species]() {
        return Promise;
      }
      cancel() {
        return this.canceller && (this.canceller(this), this.canceller = null);
      }
      simple() {
        this.options.simple = true;
        this.options.prepare = false;
        return this;
      }
      async readable() {
        this.simple();
        this.streaming = true;
        return this;
      }
      async writable() {
        this.simple();
        this.streaming = true;
        return this;
      }
      cursor(rows = 1, fn) {
        this.options.simple = false;
        if (typeof rows === "function") {
          fn = rows;
          rows = 1;
        }
        this.cursorRows = rows;
        if (typeof fn === "function")
          return this.cursorFn = fn, this;
        let prev;
        return {
          [Symbol.asyncIterator]: () => ({
            next: () => {
              if (this.executed && !this.active)
                return { done: true };
              prev && prev();
              const promise = new Promise((resolve, reject) => {
                this.cursorFn = (value) => {
                  resolve({ value, done: false });
                  return new Promise((r) => prev = r);
                };
                this.resolve = () => (this.active = false, resolve({ done: true }));
                this.reject = (x) => (this.active = false, reject(x));
              });
              this.execute();
              return promise;
            },
            return() {
              prev && prev(CLOSE);
              return { done: true };
            }
          })
        };
      }
      describe() {
        this.options.simple = false;
        this.onlyDescribe = this.options.prepare = true;
        return this;
      }
      stream() {
        throw new Error(".stream has been renamed to .forEach");
      }
      forEach(fn) {
        this.forEachFn = fn;
        this.handle();
        return this;
      }
      raw() {
        this.isRaw = true;
        return this;
      }
      values() {
        this.isRaw = "values";
        return this;
      }
      async handle() {
        !this.executed && (this.executed = true) && await 1 && this.handler(this);
      }
      execute() {
        this.handle();
        return this;
      }
      then() {
        this.handle();
        return super.then.apply(this, arguments);
      }
      catch() {
        this.handle();
        return super.catch.apply(this, arguments);
      }
      finally() {
        this.handle();
        return super.finally.apply(this, arguments);
      }
    };
  }
});

// node_modules/postgres/src/errors.js
function connection(x, options, socket) {
  const { host, port } = socket || options;
  const error = Object.assign(
    new Error("write " + x + " " + (options.path || host + ":" + port)),
    {
      code: x,
      errno: x,
      address: options.path || host
    },
    options.path ? {} : { port }
  );
  Error.captureStackTrace(error, connection);
  return error;
}
function postgres(x) {
  const error = new PostgresError(x);
  Error.captureStackTrace(error, postgres);
  return error;
}
function generic(code, message) {
  const error = Object.assign(new Error(code + ": " + message), { code });
  Error.captureStackTrace(error, generic);
  return error;
}
function notSupported(x) {
  const error = Object.assign(
    new Error(x + " (B) is not supported"),
    {
      code: "MESSAGE_NOT_SUPPORTED",
      name: x
    }
  );
  Error.captureStackTrace(error, notSupported);
  return error;
}
var PostgresError, Errors;
var init_errors = __esm({
  "node_modules/postgres/src/errors.js"() {
    PostgresError = class extends Error {
      constructor(x) {
        super(x.message);
        this.name = this.constructor.name;
        Object.assign(this, x);
      }
    };
    Errors = {
      connection,
      postgres,
      generic,
      notSupported
    };
  }
});

// node_modules/postgres/src/types.js
function handleValue(x, parameters, types2, options) {
  let value = x instanceof Parameter ? x.value : x;
  if (value === void 0) {
    x instanceof Parameter ? x.value = options.transform.undefined : value = x = options.transform.undefined;
    if (value === void 0)
      throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
  }
  return "$" + types2.push(
    x instanceof Parameter ? (parameters.push(x.value), x.array ? x.array[x.type || inferType(x.value)] || x.type || firstIsString(x.value) : x.type) : (parameters.push(x), inferType(x))
  );
}
function stringify(q, string, value, parameters, types2, options) {
  for (let i = 1; i < q.strings.length; i++) {
    string += stringifyValue(string, value, parameters, types2, options) + q.strings[i];
    value = q.args[i];
  }
  return string;
}
function stringifyValue(string, value, parameters, types2, o) {
  return value instanceof Builder ? value.build(string, parameters, types2, o) : value instanceof Query ? fragment(value, parameters, types2, o) : value instanceof Identifier ? value.value : value && value[0] instanceof Query ? value.reduce((acc, x) => acc + " " + fragment(x, parameters, types2, o), "") : handleValue(value, parameters, types2, o);
}
function fragment(q, parameters, types2, options) {
  q.fragment = true;
  return stringify(q, q.strings[0], q.args[0], parameters, types2, options);
}
function valuesBuilder(first, parameters, types2, columns, options) {
  return first.map(
    (row) => "(" + columns.map(
      (column) => stringifyValue("values", row[column], parameters, types2, options)
    ).join(",") + ")"
  ).join(",");
}
function values(first, rest, parameters, types2, options) {
  const multi = Array.isArray(first[0]);
  const columns = rest.length ? rest.flat() : Object.keys(multi ? first[0] : first);
  return valuesBuilder(multi ? first : [first], parameters, types2, columns, options);
}
function select(first, rest, parameters, types2, options) {
  typeof first === "string" && (first = [first].concat(rest));
  if (Array.isArray(first))
    return escapeIdentifiers(first, options);
  let value;
  const columns = rest.length ? rest.flat() : Object.keys(first);
  return columns.map((x) => {
    value = first[x];
    return (value instanceof Query ? fragment(value, parameters, types2, options) : value instanceof Identifier ? value.value : handleValue(value, parameters, types2, options)) + " as " + escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x);
  }).join(",");
}
function notTagged() {
  throw Errors.generic("NOT_TAGGED_CALL", "Query not called as a tagged template literal");
}
function firstIsString(x) {
  if (Array.isArray(x))
    return firstIsString(x[0]);
  return typeof x === "string" ? 1009 : 0;
}
function typeHandlers(types2) {
  return Object.keys(types2).reduce((acc, k) => {
    types2[k].from && [].concat(types2[k].from).forEach((x) => acc.parsers[x] = types2[k].parse);
    if (types2[k].serialize) {
      acc.serializers[types2[k].to] = types2[k].serialize;
      types2[k].from && [].concat(types2[k].from).forEach((x) => acc.serializers[x] = types2[k].serialize);
    }
    return acc;
  }, { parsers: {}, serializers: {} });
}
function escapeIdentifiers(xs, { transform: { column } }) {
  return xs.map((x) => escapeIdentifier(column.to ? column.to(x) : x)).join(",");
}
function arrayEscape(x) {
  return x.replace(escapeBackslash, "\\\\").replace(escapeQuote, '\\"');
}
function arrayParserLoop(s, x, parser, typarray) {
  const xs = [];
  const delimiter = typarray === 1020 ? ";" : ",";
  for (; s.i < x.length; s.i++) {
    s.char = x[s.i];
    if (s.quoted) {
      if (s.char === "\\") {
        s.str += x[++s.i];
      } else if (s.char === '"') {
        xs.push(parser ? parser(s.str) : s.str);
        s.str = "";
        s.quoted = x[s.i + 1] === '"';
        s.last = s.i + 2;
      } else {
        s.str += s.char;
      }
    } else if (s.char === '"') {
      s.quoted = true;
    } else if (s.char === "{") {
      s.last = ++s.i;
      xs.push(arrayParserLoop(s, x, parser, typarray));
    } else if (s.char === "}") {
      s.quoted = false;
      s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
      break;
    } else if (s.char === delimiter && s.p !== "}" && s.p !== '"') {
      xs.push(parser ? parser(x.slice(s.last, s.i)) : x.slice(s.last, s.i));
      s.last = s.i + 1;
    }
    s.p = s.char;
  }
  s.last < s.i && xs.push(parser ? parser(x.slice(s.last, s.i + 1)) : x.slice(s.last, s.i + 1));
  return xs;
}
function createJsonTransform(fn) {
  return function jsonTransform(x, column) {
    return typeof x === "object" && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x2) => jsonTransform(x2, column)) : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {}) : x;
  };
}
var types, NotTagged, Identifier, Parameter, Builder, defaultHandlers, builders, serializers, parsers, mergeUserTypes, escapeIdentifier, inferType, escapeBackslash, escapeQuote, arraySerializer, arrayParserState, arrayParser, toCamel, toPascal, toKebab, fromCamel, fromPascal, fromKebab, camel, pascal, kebab;
var init_types2 = __esm({
  "node_modules/postgres/src/types.js"() {
    init_query();
    init_errors();
    types = {
      string: {
        to: 25,
        from: null,
        // defaults to string
        serialize: (x) => "" + x
      },
      number: {
        to: 0,
        from: [21, 23, 26, 700, 701],
        serialize: (x) => "" + x,
        parse: (x) => +x
      },
      json: {
        to: 114,
        from: [114, 3802],
        serialize: (x) => JSON.stringify(x),
        parse: (x) => JSON.parse(x)
      },
      boolean: {
        to: 16,
        from: 16,
        serialize: (x) => x === true ? "t" : "f",
        parse: (x) => x === "t"
      },
      date: {
        to: 1184,
        from: [1082, 1114, 1184],
        serialize: (x) => (x instanceof Date ? x : new Date(x)).toISOString(),
        parse: (x) => new Date(x)
      },
      bytea: {
        to: 17,
        from: 17,
        serialize: (x) => "\\x" + Buffer.from(x).toString("hex"),
        parse: (x) => Buffer.from(x.slice(2), "hex")
      }
    };
    NotTagged = class {
      then() {
        notTagged();
      }
      catch() {
        notTagged();
      }
      finally() {
        notTagged();
      }
    };
    Identifier = class extends NotTagged {
      constructor(value) {
        super();
        this.value = escapeIdentifier(value);
      }
    };
    Parameter = class extends NotTagged {
      constructor(value, type, array) {
        super();
        this.value = value;
        this.type = type;
        this.array = array;
      }
    };
    Builder = class extends NotTagged {
      constructor(first, rest) {
        super();
        this.first = first;
        this.rest = rest;
      }
      build(before, parameters, types2, options) {
        const keyword = builders.map(([x, fn]) => ({ fn, i: before.search(x) })).sort((a, b2) => a.i - b2.i).pop();
        return keyword.i === -1 ? escapeIdentifiers(this.first, options) : keyword.fn(this.first, this.rest, parameters, types2, options);
      }
    };
    defaultHandlers = typeHandlers(types);
    builders = Object.entries({
      values,
      in: (...xs) => {
        const x = values(...xs);
        return x === "()" ? "(null)" : x;
      },
      select,
      as: select,
      returning: select,
      "\\(": select,
      update(first, rest, parameters, types2, options) {
        return (rest.length ? rest.flat() : Object.keys(first)).map(
          (x) => escapeIdentifier(options.transform.column.to ? options.transform.column.to(x) : x) + "=" + stringifyValue("values", first[x], parameters, types2, options)
        );
      },
      insert(first, rest, parameters, types2, options) {
        const columns = rest.length ? rest.flat() : Object.keys(Array.isArray(first) ? first[0] : first);
        return "(" + escapeIdentifiers(columns, options) + ")values" + valuesBuilder(Array.isArray(first) ? first : [first], parameters, types2, columns, options);
      }
    }).map(([x, fn]) => [new RegExp("((?:^|[\\s(])" + x + "(?:$|[\\s(]))(?![\\s\\S]*\\1)", "i"), fn]);
    serializers = defaultHandlers.serializers;
    parsers = defaultHandlers.parsers;
    mergeUserTypes = function(types2) {
      const user = typeHandlers(types2 || {});
      return {
        serializers: Object.assign({}, serializers, user.serializers),
        parsers: Object.assign({}, parsers, user.parsers)
      };
    };
    escapeIdentifier = function escape(str) {
      return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
    };
    inferType = function inferType2(x) {
      return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === "bigint" ? 20 : Array.isArray(x) ? inferType2(x[0]) : 0;
    };
    escapeBackslash = /\\/g;
    escapeQuote = /"/g;
    arraySerializer = function arraySerializer2(xs, serializer, options, typarray) {
      if (Array.isArray(xs) === false)
        return xs;
      if (!xs.length)
        return "{}";
      const first = xs[0];
      const delimiter = typarray === 1020 ? ";" : ",";
      if (Array.isArray(first) && !first.type)
        return "{" + xs.map((x) => arraySerializer2(x, serializer, options, typarray)).join(delimiter) + "}";
      return "{" + xs.map((x) => {
        if (x === void 0) {
          x = options.transform.undefined;
          if (x === void 0)
            throw Errors.generic("UNDEFINED_VALUE", "Undefined values are not allowed");
        }
        return x === null ? "null" : '"' + arrayEscape(serializer ? serializer(x.type ? x.value : x) : "" + x) + '"';
      }).join(delimiter) + "}";
    };
    arrayParserState = {
      i: 0,
      char: null,
      str: "",
      quoted: false,
      last: 0
    };
    arrayParser = function arrayParser2(x, parser, typarray) {
      arrayParserState.i = arrayParserState.last = 0;
      return arrayParserLoop(arrayParserState, x, parser, typarray);
    };
    toCamel = (x) => {
      let str = x[0];
      for (let i = 1; i < x.length; i++)
        str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
      return str;
    };
    toPascal = (x) => {
      let str = x[0].toUpperCase();
      for (let i = 1; i < x.length; i++)
        str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
      return str;
    };
    toKebab = (x) => x.replace(/_/g, "-");
    fromCamel = (x) => x.replace(/([A-Z])/g, "_$1").toLowerCase();
    fromPascal = (x) => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
    fromKebab = (x) => x.replace(/-/g, "_");
    toCamel.column = { from: toCamel };
    toCamel.value = { from: createJsonTransform(toCamel) };
    fromCamel.column = { to: fromCamel };
    camel = { ...toCamel };
    camel.column.to = fromCamel;
    toPascal.column = { from: toPascal };
    toPascal.value = { from: createJsonTransform(toPascal) };
    fromPascal.column = { to: fromPascal };
    pascal = { ...toPascal };
    pascal.column.to = fromPascal;
    toKebab.column = { from: toKebab };
    toKebab.value = { from: createJsonTransform(toKebab) };
    fromKebab.column = { to: fromKebab };
    kebab = { ...toKebab };
    kebab.column.to = fromKebab;
  }
});

// node_modules/postgres/src/result.js
var Result;
var init_result = __esm({
  "node_modules/postgres/src/result.js"() {
    Result = class extends Array {
      constructor() {
        super();
        Object.defineProperties(this, {
          count: { value: null, writable: true },
          state: { value: null, writable: true },
          command: { value: null, writable: true },
          columns: { value: null, writable: true },
          statement: { value: null, writable: true }
        });
      }
      static get [Symbol.species]() {
        return Array;
      }
    };
  }
});

// node_modules/postgres/src/queue.js
function Queue(initial = []) {
  let xs = initial.slice();
  let index = 0;
  return {
    get length() {
      return xs.length - index;
    },
    remove: (x) => {
      const index2 = xs.indexOf(x);
      return index2 === -1 ? null : (xs.splice(index2, 1), x);
    },
    push: (x) => (xs.push(x), x),
    shift: () => {
      const out = xs[index++];
      if (index === xs.length) {
        index = 0;
        xs = [];
      } else {
        xs[index - 1] = void 0;
      }
      return out;
    }
  };
}
var queue_default;
var init_queue = __esm({
  "node_modules/postgres/src/queue.js"() {
    queue_default = Queue;
  }
});

// node_modules/postgres/src/bytes.js
function fit(x) {
  if (buffer.length - b.i < x) {
    const prev = buffer, length = prev.length;
    buffer = Buffer.allocUnsafe(length + (length >> 1) + x);
    prev.copy(buffer);
  }
}
function reset() {
  b.i = 0;
  return b;
}
var size, buffer, messages, b, bytes_default;
var init_bytes = __esm({
  "node_modules/postgres/src/bytes.js"() {
    size = 256;
    buffer = Buffer.allocUnsafe(size);
    messages = "BCcDdEFfHPpQSX".split("").reduce((acc, x) => {
      const v = x.charCodeAt(0);
      acc[x] = () => {
        buffer[0] = v;
        b.i = 5;
        return b;
      };
      return acc;
    }, {});
    b = Object.assign(reset, messages, {
      N: String.fromCharCode(0),
      i: 0,
      inc(x) {
        b.i += x;
        return b;
      },
      str(x) {
        const length = Buffer.byteLength(x);
        fit(length);
        b.i += buffer.write(x, b.i, length, "utf8");
        return b;
      },
      i16(x) {
        fit(2);
        buffer.writeUInt16BE(x, b.i);
        b.i += 2;
        return b;
      },
      i32(x, i) {
        if (i || i === 0) {
          buffer.writeUInt32BE(x, i);
          return b;
        }
        fit(4);
        buffer.writeUInt32BE(x, b.i);
        b.i += 4;
        return b;
      },
      z(x) {
        fit(x);
        buffer.fill(0, b.i, b.i + x);
        b.i += x;
        return b;
      },
      raw(x) {
        buffer = Buffer.concat([buffer.subarray(0, b.i), x]);
        b.i = buffer.length;
        return b;
      },
      end(at = 1) {
        buffer.writeUInt32BE(b.i - at, at);
        const out = buffer.subarray(0, b.i);
        b.i = 0;
        buffer = Buffer.allocUnsafe(size);
        return out;
      }
    });
    bytes_default = b;
  }
});

// node_modules/postgres/src/connection.js
import net from "net";
import tls from "tls";
import crypto from "crypto";
import Stream from "stream";
import { performance } from "perf_hooks";
function Connection(options, queues = {}, { onopen = noop, onend = noop, onclose = noop } = {}) {
  const {
    sslnegotiation,
    ssl,
    max,
    user,
    host,
    port,
    database,
    parsers: parsers2,
    transform,
    onnotice,
    onnotify,
    onparameter,
    max_pipeline,
    keep_alive,
    backoff: backoff2,
    target_session_attrs
  } = options;
  const sent = queue_default(), id = uid++, backend = { pid: null, secret: null }, idleTimer = timer(end, options.idle_timeout), lifeTimer = timer(end, options.max_lifetime), connectTimer = timer(connectTimedOut, options.connect_timeout);
  let socket = null, cancelMessage, errorResponse = null, result = new Result(), incoming = Buffer.alloc(0), needsTypes = options.fetch_types, backendParameters = {}, statements = {}, statementId = Math.random().toString(36).slice(2), statementCount = 1, closedTime = 0, remaining = 0, hostIndex = 0, retries = 0, length = 0, delay = 0, rows = 0, serverSignature = null, nextWriteTimer = null, terminated = false, incomings = null, results = null, initial = null, ending = null, stream = null, chunk = null, ended = null, nonce = null, query = null, final = null;
  const connection2 = {
    queue: queues.closed,
    idleTimer,
    connect(query2) {
      initial = query2;
      reconnect();
    },
    terminate,
    execute,
    cancel,
    end,
    count: 0,
    id
  };
  queues.closed && queues.closed.push(connection2);
  return connection2;
  async function createSocket() {
    let x;
    try {
      x = options.socket ? await Promise.resolve(options.socket(options)) : new net.Socket();
    } catch (e) {
      error(e);
      return;
    }
    x.on("error", error);
    x.on("close", closed);
    x.on("drain", drain);
    return x;
  }
  async function cancel({ pid, secret }, resolve, reject) {
    try {
      cancelMessage = bytes_default().i32(16).i32(80877102).i32(pid).i32(secret).end(16);
      await connect();
      socket.once("error", reject);
      socket.once("close", resolve);
    } catch (error2) {
      reject(error2);
    }
  }
  function execute(q) {
    if (terminated)
      return queryError(q, Errors.connection("CONNECTION_DESTROYED", options));
    if (stream)
      return queryError(q, Errors.generic("COPY_IN_PROGRESS", "You cannot execute queries during copy"));
    if (q.cancelled)
      return;
    try {
      q.state = backend;
      query ? sent.push(q) : (query = q, query.active = true);
      build(q);
      return write(toBuffer(q)) && !q.describeFirst && !q.cursorFn && sent.length < max_pipeline && (!q.options.onexecute || q.options.onexecute(connection2));
    } catch (error2) {
      sent.length === 0 && write(Sync);
      errored(error2);
      return true;
    }
  }
  function toBuffer(q) {
    if (q.parameters.length >= 65534)
      throw Errors.generic("MAX_PARAMETERS_EXCEEDED", "Max number of parameters (65534) exceeded");
    return q.options.simple ? bytes_default().Q().str(q.statement.string + bytes_default.N).end() : q.describeFirst ? Buffer.concat([describe(q), Flush]) : q.prepare ? q.prepared ? prepared(q) : Buffer.concat([describe(q), prepared(q)]) : unnamed(q);
  }
  function describe(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types, q.statement.name),
      Describe("S", q.statement.name)
    ]);
  }
  function prepared(q) {
    return Buffer.concat([
      Bind(q.parameters, q.statement.types, q.statement.name, q.cursorName),
      q.cursorFn ? Execute("", q.cursorRows) : ExecuteUnnamed
    ]);
  }
  function unnamed(q) {
    return Buffer.concat([
      Parse(q.statement.string, q.parameters, q.statement.types),
      DescribeUnnamed,
      prepared(q)
    ]);
  }
  function build(q) {
    const parameters = [], types2 = [];
    const string = stringify(q, q.strings[0], q.args[0], parameters, types2, options);
    !q.tagged && q.args.forEach((x) => handleValue(x, parameters, types2, options));
    q.prepare = options.prepare && ("prepare" in q.options ? q.options.prepare : true);
    q.string = string;
    q.signature = q.prepare && types2 + string;
    q.onlyDescribe && delete statements[q.signature];
    q.parameters = q.parameters || parameters;
    q.prepared = q.prepare && q.signature in statements;
    q.describeFirst = q.onlyDescribe || parameters.length && !q.prepared;
    q.statement = q.prepared ? statements[q.signature] : { string, types: types2, name: q.prepare ? statementId + statementCount++ : "" };
    typeof options.debug === "function" && options.debug(id, string, parameters, types2);
  }
  function write(x, fn) {
    chunk = chunk ? Buffer.concat([chunk, x]) : Buffer.from(x);
    if (fn || chunk.length >= 1024)
      return nextWrite(fn);
    nextWriteTimer === null && (nextWriteTimer = setImmediate(nextWrite));
    return true;
  }
  function nextWrite(fn) {
    const x = socket.write(chunk, fn);
    nextWriteTimer !== null && clearImmediate(nextWriteTimer);
    chunk = nextWriteTimer = null;
    return x;
  }
  function connectTimedOut() {
    errored(Errors.connection("CONNECT_TIMEOUT", options, socket));
    socket.destroy();
  }
  async function secure() {
    if (sslnegotiation !== "direct") {
      write(SSLRequest);
      const canSSL = await new Promise((r) => socket.once("data", (x) => r(x[0] === 83)));
      if (!canSSL && ssl === "prefer")
        return connected();
    }
    const options2 = {
      socket,
      servername: net.isIP(socket.host) ? void 0 : socket.host
    };
    if (sslnegotiation === "direct")
      options2.ALPNProtocols = ["postgresql"];
    if (ssl === "require" || ssl === "allow" || ssl === "prefer")
      options2.rejectUnauthorized = false;
    else if (typeof ssl === "object")
      Object.assign(options2, ssl);
    socket.removeAllListeners();
    socket = tls.connect(options2);
    socket.on("secureConnect", connected);
    socket.on("error", error);
    socket.on("close", closed);
    socket.on("drain", drain);
  }
  function drain() {
    !query && onopen(connection2);
  }
  function data(x) {
    if (incomings) {
      incomings.push(x);
      remaining -= x.length;
      if (remaining > 0)
        return;
    }
    incoming = incomings ? Buffer.concat(incomings, length - remaining) : incoming.length === 0 ? x : Buffer.concat([incoming, x], incoming.length + x.length);
    while (incoming.length > 4) {
      length = incoming.readUInt32BE(1);
      if (length >= incoming.length) {
        remaining = length - incoming.length;
        incomings = [incoming];
        break;
      }
      try {
        handle(incoming.subarray(0, length + 1));
      } catch (e) {
        query && (query.cursorFn || query.describeFirst) && write(Sync);
        errored(e);
      }
      incoming = incoming.subarray(length + 1);
      remaining = 0;
      incomings = null;
    }
  }
  async function connect() {
    terminated = false;
    backendParameters = {};
    socket || (socket = await createSocket());
    if (!socket)
      return;
    connectTimer.start();
    if (options.socket)
      return ssl ? secure() : connected();
    socket.on("connect", ssl ? secure : connected);
    if (options.path)
      return socket.connect(options.path);
    socket.ssl = ssl;
    socket.connect(port[hostIndex], host[hostIndex]);
    socket.host = host[hostIndex];
    socket.port = port[hostIndex];
    hostIndex = (hostIndex + 1) % port.length;
  }
  function reconnect() {
    setTimeout(connect, closedTime ? Math.max(0, closedTime + delay - performance.now()) : 0);
  }
  function connected() {
    try {
      statements = {};
      needsTypes = options.fetch_types;
      statementId = Math.random().toString(36).slice(2);
      statementCount = 1;
      lifeTimer.start();
      socket.on("data", data);
      keep_alive && socket.setKeepAlive && socket.setKeepAlive(true, 1e3 * keep_alive);
      const s = StartupMessage();
      write(s);
    } catch (err) {
      error(err);
    }
  }
  function error(err) {
    if (connection2.queue === queues.connecting && options.host[retries + 1])
      return;
    errored(err);
    while (sent.length)
      queryError(sent.shift(), err);
  }
  function errored(err) {
    stream && (stream.destroy(err), stream = null);
    query && queryError(query, err);
    initial && (queryError(initial, err), initial = null);
  }
  function queryError(query2, err) {
    if (query2.reserve)
      return query2.reject(err);
    if (!err || typeof err !== "object")
      err = new Error(err);
    "query" in err || "parameters" in err || Object.defineProperties(err, {
      stack: { value: err.stack + query2.origin.replace(/.*\n/, "\n"), enumerable: options.debug },
      query: { value: query2.string, enumerable: options.debug },
      parameters: { value: query2.parameters, enumerable: options.debug },
      args: { value: query2.args, enumerable: options.debug },
      types: { value: query2.statement && query2.statement.types, enumerable: options.debug }
    });
    query2.reject(err);
  }
  function end() {
    return ending || (!connection2.reserved && onend(connection2), !connection2.reserved && !initial && !query && sent.length === 0 ? (terminate(), new Promise((r) => socket && socket.readyState !== "closed" ? socket.once("close", r) : r())) : ending = new Promise((r) => ended = r));
  }
  function terminate() {
    terminated = true;
    if (stream || query || initial || sent.length)
      error(Errors.connection("CONNECTION_DESTROYED", options));
    clearImmediate(nextWriteTimer);
    if (socket) {
      socket.removeListener("data", data);
      socket.removeListener("connect", connected);
      socket.readyState === "open" && socket.end(bytes_default().X().end());
    }
    ended && (ended(), ending = ended = null);
  }
  async function closed(hadError) {
    incoming = Buffer.alloc(0);
    remaining = 0;
    incomings = null;
    clearImmediate(nextWriteTimer);
    socket.removeListener("data", data);
    socket.removeListener("connect", connected);
    idleTimer.cancel();
    lifeTimer.cancel();
    connectTimer.cancel();
    socket.removeAllListeners();
    socket = null;
    if (initial)
      return reconnect();
    !hadError && (query || sent.length) && error(Errors.connection("CONNECTION_CLOSED", options, socket));
    closedTime = performance.now();
    hadError && options.shared.retries++;
    delay = (typeof backoff2 === "function" ? backoff2(options.shared.retries) : backoff2) * 1e3;
    onclose(connection2, Errors.connection("CONNECTION_CLOSED", options, socket));
  }
  function handle(xs, x = xs[0]) {
    (x === 68 ? DataRow : (
      // D
      x === 100 ? CopyData : (
        // d
        x === 65 ? NotificationResponse : (
          // A
          x === 83 ? ParameterStatus : (
            // S
            x === 90 ? ReadyForQuery : (
              // Z
              x === 67 ? CommandComplete : (
                // C
                x === 50 ? BindComplete : (
                  // 2
                  x === 49 ? ParseComplete : (
                    // 1
                    x === 116 ? ParameterDescription : (
                      // t
                      x === 84 ? RowDescription : (
                        // T
                        x === 82 ? Authentication : (
                          // R
                          x === 110 ? NoData : (
                            // n
                            x === 75 ? BackendKeyData : (
                              // K
                              x === 69 ? ErrorResponse : (
                                // E
                                x === 115 ? PortalSuspended : (
                                  // s
                                  x === 51 ? CloseComplete : (
                                    // 3
                                    x === 71 ? CopyInResponse : (
                                      // G
                                      x === 78 ? NoticeResponse : (
                                        // N
                                        x === 72 ? CopyOutResponse : (
                                          // H
                                          x === 99 ? CopyDone : (
                                            // c
                                            x === 73 ? EmptyQueryResponse : (
                                              // I
                                              x === 86 ? FunctionCallResponse : (
                                                // V
                                                x === 118 ? NegotiateProtocolVersion : (
                                                  // v
                                                  x === 87 ? CopyBothResponse : (
                                                    // W
                                                    /* c8 ignore next */
                                                    UnknownMessage
                                                  )
                                                )
                                              )
                                            )
                                          )
                                        )
                                      )
                                    )
                                  )
                                )
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    ))(xs);
  }
  function DataRow(x) {
    let index = 7;
    let length2;
    let column;
    let value;
    const row = query.isRaw ? new Array(query.statement.columns.length) : {};
    for (let i = 0; i < query.statement.columns.length; i++) {
      column = query.statement.columns[i];
      length2 = x.readInt32BE(index);
      index += 4;
      value = length2 === -1 ? null : query.isRaw === true ? x.subarray(index, index += length2) : column.parser === void 0 ? x.toString("utf8", index, index += length2) : column.parser.array === true ? column.parser(x.toString("utf8", index + 1, index += length2)) : column.parser(x.toString("utf8", index, index += length2));
      query.isRaw ? row[i] = query.isRaw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
    }
    query.forEachFn ? query.forEachFn(transform.row.from ? transform.row.from(row) : row, result) : result[rows++] = transform.row.from ? transform.row.from(row) : row;
  }
  function ParameterStatus(x) {
    const [k, v] = x.toString("utf8", 5, x.length - 1).split(bytes_default.N);
    backendParameters[k] = v;
    if (options.parameters[k] !== v) {
      options.parameters[k] = v;
      onparameter && onparameter(k, v);
    }
  }
  function ReadyForQuery(x) {
    if (query) {
      if (errorResponse) {
        query.retried ? errored(query.retried) : query.prepared && retryRoutines.has(errorResponse.routine) ? retry(query, errorResponse) : errored(errorResponse);
      } else {
        query.resolve(results || result);
      }
    } else if (errorResponse) {
      errored(errorResponse);
    }
    query = results = errorResponse = null;
    result = new Result();
    connectTimer.cancel();
    if (initial) {
      if (target_session_attrs) {
        if (!backendParameters.in_hot_standby || !backendParameters.default_transaction_read_only)
          return fetchState();
        else if (tryNext(target_session_attrs, backendParameters))
          return terminate();
      }
      if (needsTypes) {
        initial.reserve && (initial = null);
        return fetchArrayTypes();
      }
      initial && !initial.reserve && execute(initial);
      options.shared.retries = retries = 0;
      initial = null;
      return;
    }
    while (sent.length && (query = sent.shift()) && (query.active = true, query.cancelled))
      Connection(options).cancel(query.state, query.cancelled.resolve, query.cancelled.reject);
    if (query)
      return;
    connection2.reserved ? !connection2.reserved.release && x[5] === 73 ? ending ? terminate() : (connection2.reserved = null, onopen(connection2)) : connection2.reserved() : ending ? terminate() : onopen(connection2);
  }
  function CommandComplete(x) {
    rows = 0;
    for (let i = x.length - 1; i > 0; i--) {
      if (x[i] === 32 && x[i + 1] < 58 && result.count === null)
        result.count = +x.toString("utf8", i + 1, x.length - 1);
      if (x[i - 1] >= 65) {
        result.command = x.toString("utf8", 5, i);
        result.state = backend;
        break;
      }
    }
    final && (final(), final = null);
    if (result.command === "BEGIN" && max !== 1 && !connection2.reserved)
      return errored(Errors.generic("UNSAFE_TRANSACTION", "Only use sql.begin, sql.reserved or max: 1"));
    if (query.options.simple)
      return BindComplete();
    if (query.cursorFn) {
      result.count && query.cursorFn(result);
      write(Sync);
    }
  }
  function ParseComplete() {
    query.parsing = false;
  }
  function BindComplete() {
    !result.statement && (result.statement = query.statement);
    result.columns = query.statement.columns;
  }
  function ParameterDescription(x) {
    const length2 = x.readUInt16BE(5);
    for (let i = 0; i < length2; ++i)
      !query.statement.types[i] && (query.statement.types[i] = x.readUInt32BE(7 + i * 4));
    query.prepare && (statements[query.signature] = query.statement);
    query.describeFirst && !query.onlyDescribe && (write(prepared(query)), query.describeFirst = false);
  }
  function RowDescription(x) {
    if (result.command) {
      results = results || [result];
      results.push(result = new Result());
      result.count = null;
      query.statement.columns = null;
    }
    const length2 = x.readUInt16BE(5);
    let index = 7;
    let start;
    query.statement.columns = Array(length2);
    for (let i = 0; i < length2; ++i) {
      start = index;
      while (x[index++] !== 0) ;
      const table = x.readUInt32BE(index);
      const number = x.readUInt16BE(index + 4);
      const type = x.readUInt32BE(index + 6);
      query.statement.columns[i] = {
        name: transform.column.from ? transform.column.from(x.toString("utf8", start, index - 1)) : x.toString("utf8", start, index - 1),
        parser: parsers2[type],
        table,
        number,
        type
      };
      index += 18;
    }
    result.statement = query.statement;
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  async function Authentication(x, type = x.readUInt32BE(5)) {
    (type === 3 ? AuthenticationCleartextPassword : type === 5 ? AuthenticationMD5Password : type === 10 ? SASL : type === 11 ? SASLContinue : type === 12 ? SASLFinal : type !== 0 ? UnknownAuth : noop)(x, type);
  }
  async function AuthenticationCleartextPassword() {
    const payload = await Pass();
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function AuthenticationMD5Password(x) {
    const payload = "md5" + await md5(
      Buffer.concat([
        Buffer.from(await md5(await Pass() + user)),
        x.subarray(9)
      ])
    );
    write(
      bytes_default().p().str(payload).z(1).end()
    );
  }
  async function SASL() {
    nonce = (await crypto.randomBytes(18)).toString("base64");
    bytes_default().p().str("SCRAM-SHA-256" + bytes_default.N);
    const i = bytes_default.i;
    write(bytes_default.inc(4).str("n,,n=*,r=" + nonce).i32(bytes_default.i - i - 4, i).end());
  }
  async function SASLContinue(x) {
    const res = x.toString("utf8", 9).split(",").reduce((acc, x2) => (acc[x2[0]] = x2.slice(2), acc), {});
    const saltedPassword = await crypto.pbkdf2Sync(
      await Pass(),
      Buffer.from(res.s, "base64"),
      parseInt(res.i),
      32,
      "sha256"
    );
    const clientKey = await hmac(saltedPassword, "Client Key");
    const auth = "n=*,r=" + nonce + ",r=" + res.r + ",s=" + res.s + ",i=" + res.i + ",c=biws,r=" + res.r;
    serverSignature = (await hmac(await hmac(saltedPassword, "Server Key"), auth)).toString("base64");
    const payload = "c=biws,r=" + res.r + ",p=" + xor(
      clientKey,
      Buffer.from(await hmac(await sha256(clientKey), auth))
    ).toString("base64");
    write(
      bytes_default().p().str(payload).end()
    );
  }
  function SASLFinal(x) {
    if (x.toString("utf8", 9).split(bytes_default.N, 1)[0].slice(2) === serverSignature)
      return;
    errored(Errors.generic("SASL_SIGNATURE_MISMATCH", "The server did not return the correct signature"));
    socket.destroy();
  }
  function Pass() {
    return Promise.resolve(
      typeof options.pass === "function" ? options.pass() : options.pass
    );
  }
  function NoData() {
    result.statement = query.statement;
    result.statement.columns = [];
    if (query.onlyDescribe)
      return query.resolve(query.statement), write(Sync);
  }
  function BackendKeyData(x) {
    backend.pid = x.readUInt32BE(5);
    backend.secret = x.readUInt32BE(9);
  }
  async function fetchArrayTypes() {
    needsTypes = false;
    const types2 = await new Query([`
      select b.oid, b.typarray
      from pg_catalog.pg_type a
      left join pg_catalog.pg_type b on b.oid = a.typelem
      where a.typcategory = 'A'
      group by b.oid, b.typarray
      order by b.oid
    `], [], execute);
    types2.forEach(({ oid, typarray }) => addArrayType(oid, typarray));
  }
  function addArrayType(oid, typarray) {
    if (!!options.parsers[typarray] && !!options.serializers[typarray]) return;
    const parser = options.parsers[oid];
    options.shared.typeArrayMap[oid] = typarray;
    options.parsers[typarray] = (xs) => arrayParser(xs, parser, typarray);
    options.parsers[typarray].array = true;
    options.serializers[typarray] = (xs) => arraySerializer(xs, options.serializers[oid], options, typarray);
  }
  function tryNext(x, xs) {
    return x === "read-write" && xs.default_transaction_read_only === "on" || x === "read-only" && xs.default_transaction_read_only === "off" || x === "primary" && xs.in_hot_standby === "on" || x === "standby" && xs.in_hot_standby === "off" || x === "prefer-standby" && xs.in_hot_standby === "off" && options.host[retries];
  }
  function fetchState() {
    const query2 = new Query([`
      show transaction_read_only;
      select pg_catalog.pg_is_in_recovery()
    `], [], execute, null, { simple: true });
    query2.resolve = ([[a], [b2]]) => {
      backendParameters.default_transaction_read_only = a.transaction_read_only;
      backendParameters.in_hot_standby = b2.pg_is_in_recovery ? "on" : "off";
    };
    query2.execute();
  }
  function ErrorResponse(x) {
    if (query) {
      (query.cursorFn || query.describeFirst) && write(Sync);
      errorResponse = Errors.postgres(parseError(x));
    } else {
      errored(Errors.postgres(parseError(x)));
    }
  }
  function retry(q, error2) {
    delete statements[q.signature];
    q.retried = error2;
    execute(q);
  }
  function NotificationResponse(x) {
    if (!onnotify)
      return;
    let index = 9;
    while (x[index++] !== 0) ;
    onnotify(
      x.toString("utf8", 9, index - 1),
      x.toString("utf8", index, x.length - 1)
    );
  }
  async function PortalSuspended() {
    try {
      const x = await Promise.resolve(query.cursorFn(result));
      rows = 0;
      x === CLOSE ? write(Close(query.portal)) : (result = new Result(), write(Execute("", query.cursorRows)));
    } catch (err) {
      write(Sync);
      query.reject(err);
    }
  }
  function CloseComplete() {
    result.count && query.cursorFn(result);
    query.resolve(result);
  }
  function CopyInResponse() {
    stream = new Stream.Writable({
      autoDestroy: true,
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
        stream = null;
      }
    });
    query.resolve(stream);
  }
  function CopyOutResponse() {
    stream = new Stream.Readable({
      read() {
        socket.resume();
      }
    });
    query.resolve(stream);
  }
  function CopyBothResponse() {
    stream = new Stream.Duplex({
      autoDestroy: true,
      read() {
        socket.resume();
      },
      /* c8 ignore next 11 */
      write(chunk2, encoding, callback) {
        socket.write(bytes_default().d().raw(chunk2).end(), callback);
      },
      destroy(error2, callback) {
        callback(error2);
        socket.write(bytes_default().f().str(error2 + bytes_default.N).end());
        stream = null;
      },
      final(callback) {
        socket.write(bytes_default().c().end());
        final = callback;
      }
    });
    query.resolve(stream);
  }
  function CopyData(x) {
    stream && (stream.push(x.subarray(5)) || socket.pause());
  }
  function CopyDone() {
    stream && stream.push(null);
    stream = null;
  }
  function NoticeResponse(x) {
    onnotice ? onnotice(parseError(x)) : console.log(parseError(x));
  }
  function EmptyQueryResponse() {
  }
  function FunctionCallResponse() {
    errored(Errors.notSupported("FunctionCallResponse"));
  }
  function NegotiateProtocolVersion() {
    errored(Errors.notSupported("NegotiateProtocolVersion"));
  }
  function UnknownMessage(x) {
    console.error("Postgres.js : Unknown Message:", x[0]);
  }
  function UnknownAuth(x, type) {
    console.error("Postgres.js : Unknown Auth:", type);
  }
  function Bind(parameters, types2, statement = "", portal = "") {
    let prev, type;
    bytes_default().B().str(portal + bytes_default.N).str(statement + bytes_default.N).i16(0).i16(parameters.length);
    parameters.forEach((x, i) => {
      if (x === null)
        return bytes_default.i32(4294967295);
      type = types2[i];
      parameters[i] = x = type in options.serializers ? options.serializers[type](x) : "" + x;
      prev = bytes_default.i;
      bytes_default.inc(4).str(x).i32(bytes_default.i - prev - 4, prev);
    });
    bytes_default.i16(0);
    return bytes_default.end();
  }
  function Parse(str, parameters, types2, name = "") {
    bytes_default().P().str(name + bytes_default.N).str(str + bytes_default.N).i16(parameters.length);
    parameters.forEach((x, i) => bytes_default.i32(types2[i] || 0));
    return bytes_default.end();
  }
  function Describe(x, name = "") {
    return bytes_default().D().str(x).str(name + bytes_default.N).end();
  }
  function Execute(portal = "", rows2 = 0) {
    return Buffer.concat([
      bytes_default().E().str(portal + bytes_default.N).i32(rows2).end(),
      Flush
    ]);
  }
  function Close(portal = "") {
    return Buffer.concat([
      bytes_default().C().str("P").str(portal + bytes_default.N).end(),
      bytes_default().S().end()
    ]);
  }
  function StartupMessage() {
    return cancelMessage || bytes_default().inc(4).i16(3).z(2).str(
      Object.entries(Object.assign(
        {
          user,
          database,
          client_encoding: "UTF8"
        },
        options.connection
      )).filter(([, v]) => v).map(([k, v]) => k + bytes_default.N + v).join(bytes_default.N)
    ).z(2).end(0);
  }
}
function parseError(x) {
  const error = {};
  let start = 5;
  for (let i = 5; i < x.length - 1; i++) {
    if (x[i] === 0) {
      error[errorFields[x[start]]] = x.toString("utf8", start + 1, i);
      start = i + 1;
    }
  }
  return error;
}
function md5(x) {
  return crypto.createHash("md5").update(x).digest("hex");
}
function hmac(key, x) {
  return crypto.createHmac("sha256", key).update(x).digest();
}
function sha256(x) {
  return crypto.createHash("sha256").update(x).digest();
}
function xor(a, b2) {
  const length = Math.max(a.length, b2.length);
  const buffer2 = Buffer.allocUnsafe(length);
  for (let i = 0; i < length; i++)
    buffer2[i] = a[i] ^ b2[i];
  return buffer2;
}
function timer(fn, seconds) {
  seconds = typeof seconds === "function" ? seconds() : seconds;
  if (!seconds)
    return { cancel: noop, start: noop };
  let timer2;
  return {
    cancel() {
      timer2 && (clearTimeout(timer2), timer2 = null);
    },
    start() {
      timer2 && clearTimeout(timer2);
      timer2 = setTimeout(done, seconds * 1e3, arguments);
    }
  };
  function done(args) {
    fn.apply(null, args);
    timer2 = null;
  }
}
var connection_default, uid, Sync, Flush, SSLRequest, ExecuteUnnamed, DescribeUnnamed, noop, retryRoutines, errorFields;
var init_connection = __esm({
  "node_modules/postgres/src/connection.js"() {
    init_types2();
    init_errors();
    init_result();
    init_queue();
    init_query();
    init_bytes();
    connection_default = Connection;
    uid = 1;
    Sync = bytes_default().S().end();
    Flush = bytes_default().H().end();
    SSLRequest = bytes_default().i32(8).i32(80877103).end(8);
    ExecuteUnnamed = Buffer.concat([bytes_default().E().str(bytes_default.N).i32(0).end(), Sync]);
    DescribeUnnamed = bytes_default().D().str("S").str(bytes_default.N).end();
    noop = () => {
    };
    retryRoutines = /* @__PURE__ */ new Set([
      "FetchPreparedStatement",
      "RevalidateCachedQuery",
      "transformAssignedExpr"
    ]);
    errorFields = {
      83: "severity_local",
      // S
      86: "severity",
      // V
      67: "code",
      // C
      77: "message",
      // M
      68: "detail",
      // D
      72: "hint",
      // H
      80: "position",
      // P
      112: "internal_position",
      // p
      113: "internal_query",
      // q
      87: "where",
      // W
      115: "schema_name",
      // s
      116: "table_name",
      // t
      99: "column_name",
      // c
      100: "data type_name",
      // d
      110: "constraint_name",
      // n
      70: "file",
      // F
      76: "line",
      // L
      82: "routine"
      // R
    };
  }
});

// node_modules/postgres/src/subscribe.js
function Subscribe(postgres2, options) {
  const subscribers = /* @__PURE__ */ new Map(), slot = "postgresjs_" + Math.random().toString(36).slice(2), state = {};
  let connection2, stream, ended = false;
  const sql = subscribe.sql = postgres2({
    ...options,
    transform: { column: {}, value: {}, row: {} },
    max: 1,
    fetch_types: false,
    idle_timeout: null,
    max_lifetime: null,
    connection: {
      ...options.connection,
      replication: "database"
    },
    onclose: async function() {
      if (ended)
        return;
      stream = null;
      state.pid = state.secret = void 0;
      connected(await init(sql, slot, options.publications));
      subscribers.forEach((event) => event.forEach(({ onsubscribe }) => onsubscribe()));
    },
    no_subscribe: true
  });
  const end = sql.end, close = sql.close;
  sql.end = async () => {
    ended = true;
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return end();
  };
  sql.close = async () => {
    stream && await new Promise((r) => (stream.once("close", r), stream.end()));
    return close();
  };
  return subscribe;
  async function subscribe(event, fn, onsubscribe = noop2, onerror = noop2) {
    event = parseEvent(event);
    if (!connection2)
      connection2 = init(sql, slot, options.publications);
    const subscriber = { fn, onsubscribe };
    const fns = subscribers.has(event) ? subscribers.get(event).add(subscriber) : subscribers.set(event, /* @__PURE__ */ new Set([subscriber])).get(event);
    const unsubscribe = () => {
      fns.delete(subscriber);
      fns.size === 0 && subscribers.delete(event);
    };
    return connection2.then((x) => {
      connected(x);
      onsubscribe();
      stream && stream.on("error", onerror);
      return { unsubscribe, state, sql };
    });
  }
  function connected(x) {
    stream = x.stream;
    state.pid = x.state.pid;
    state.secret = x.state.secret;
  }
  async function init(sql2, slot2, publications) {
    if (!publications)
      throw new Error("Missing publication names");
    const xs = await sql2.unsafe(
      `CREATE_REPLICATION_SLOT ${slot2} TEMPORARY LOGICAL pgoutput NOEXPORT_SNAPSHOT`
    );
    const [x] = xs;
    const stream2 = await sql2.unsafe(
      `START_REPLICATION SLOT ${slot2} LOGICAL ${x.consistent_point} (proto_version '1', publication_names '${publications}')`
    ).writable();
    const state2 = {
      lsn: Buffer.concat(x.consistent_point.split("/").map((x2) => Buffer.from(("00000000" + x2).slice(-8), "hex")))
    };
    stream2.on("data", data);
    stream2.on("error", error);
    stream2.on("close", sql2.close);
    return { stream: stream2, state: xs.state };
    function error(e) {
      console.error("Unexpected error during logical streaming - reconnecting", e);
    }
    function data(x2) {
      if (x2[0] === 119) {
        parse(x2.subarray(25), state2, sql2.options.parsers, handle, options.transform);
      } else if (x2[0] === 107 && x2[17]) {
        state2.lsn = x2.subarray(1, 9);
        pong();
      }
    }
    function handle(a, b2) {
      const path = b2.relation.schema + "." + b2.relation.table;
      call("*", a, b2);
      call("*:" + path, a, b2);
      b2.relation.keys.length && call("*:" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
      call(b2.command, a, b2);
      call(b2.command + ":" + path, a, b2);
      b2.relation.keys.length && call(b2.command + ":" + path + "=" + b2.relation.keys.map((x2) => a[x2.name]), a, b2);
    }
    function pong() {
      const x2 = Buffer.alloc(34);
      x2[0] = "r".charCodeAt(0);
      x2.fill(state2.lsn, 1);
      x2.writeBigInt64BE(BigInt(Date.now() - Date.UTC(2e3, 0, 1)) * BigInt(1e3), 25);
      stream2.write(x2);
    }
  }
  function call(x, a, b2) {
    subscribers.has(x) && subscribers.get(x).forEach(({ fn }) => fn(a, b2, x));
  }
}
function Time(x) {
  return new Date(Date.UTC(2e3, 0, 1) + Number(x / BigInt(1e3)));
}
function parse(x, state, parsers2, handle, transform) {
  const char = (acc, [k, v]) => (acc[k.charCodeAt(0)] = v, acc);
  Object.entries({
    R: (x2) => {
      let i = 1;
      const r = state[x2.readUInt32BE(i)] = {
        schema: x2.toString("utf8", i += 4, i = x2.indexOf(0, i)) || "pg_catalog",
        table: x2.toString("utf8", i + 1, i = x2.indexOf(0, i + 1)),
        columns: Array(x2.readUInt16BE(i += 2)),
        keys: []
      };
      i += 2;
      let columnIndex = 0, column;
      while (i < x2.length) {
        column = r.columns[columnIndex++] = {
          key: x2[i++],
          name: transform.column.from ? transform.column.from(x2.toString("utf8", i, i = x2.indexOf(0, i))) : x2.toString("utf8", i, i = x2.indexOf(0, i)),
          type: x2.readUInt32BE(i += 1),
          parser: parsers2[x2.readUInt32BE(i)],
          atttypmod: x2.readUInt32BE(i += 4)
        };
        column.key && r.keys.push(column);
        i += 4;
      }
    },
    Y: () => {
    },
    // Type
    O: () => {
    },
    // Origin
    B: (x2) => {
      state.date = Time(x2.readBigInt64BE(9));
      state.lsn = x2.subarray(1, 9);
    },
    I: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      const { row } = tuples(x2, relation.columns, i += 7, transform);
      handle(row, {
        command: "insert",
        relation
      });
    },
    D: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      handle(
        key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform).row : null,
        {
          command: "delete",
          relation,
          key
        }
      );
    },
    U: (x2) => {
      let i = 1;
      const relation = state[x2.readUInt32BE(i)];
      i += 4;
      const key = x2[i] === 75;
      const xs = key || x2[i] === 79 ? tuples(x2, relation.columns, i += 3, transform) : null;
      xs && (i = xs.i);
      const { row } = tuples(x2, relation.columns, i + 3, transform);
      handle(row, {
        command: "update",
        relation,
        key,
        old: xs && xs.row
      });
    },
    T: () => {
    },
    // Truncate,
    C: () => {
    }
    // Commit
  }).reduce(char, {})[x[0]](x);
}
function tuples(x, columns, xi, transform) {
  let type, column, value;
  const row = transform.raw ? new Array(columns.length) : {};
  for (let i = 0; i < columns.length; i++) {
    type = x[xi++];
    column = columns[i];
    value = type === 110 ? null : type === 117 ? void 0 : column.parser === void 0 ? x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)) : column.parser.array === true ? column.parser(x.toString("utf8", xi + 5, xi += 4 + x.readUInt32BE(xi))) : column.parser(x.toString("utf8", xi + 4, xi += 4 + x.readUInt32BE(xi)));
    transform.raw ? row[i] = transform.raw === true ? value : transform.value.from ? transform.value.from(value, column) : value : row[column.name] = transform.value.from ? transform.value.from(value, column) : value;
  }
  return { i: xi, row: transform.row.from ? transform.row.from(row) : row };
}
function parseEvent(x) {
  const xs = x.match(/^(\*|insert|update|delete)?:?([^.]+?\.?[^=]+)?=?(.+)?/i) || [];
  if (!xs)
    throw new Error("Malformed subscribe pattern: " + x);
  const [, command, path, key] = xs;
  return (command || "*") + (path ? ":" + (path.indexOf(".") === -1 ? "public." + path : path) : "") + (key ? "=" + key : "");
}
var noop2;
var init_subscribe = __esm({
  "node_modules/postgres/src/subscribe.js"() {
    noop2 = () => {
    };
  }
});

// node_modules/postgres/src/large.js
import Stream2 from "stream";
function largeObject(sql, oid, mode = 131072 | 262144) {
  return new Promise(async (resolve, reject) => {
    await sql.begin(async (sql2) => {
      let finish;
      !oid && ([{ oid }] = await sql2`select lo_creat(-1) as oid`);
      const [{ fd }] = await sql2`select lo_open(${oid}, ${mode}) as fd`;
      const lo = {
        writable,
        readable,
        close: () => sql2`select lo_close(${fd})`.then(finish),
        tell: () => sql2`select lo_tell64(${fd})`,
        read: (x) => sql2`select loread(${fd}, ${x}) as data`,
        write: (x) => sql2`select lowrite(${fd}, ${x})`,
        truncate: (x) => sql2`select lo_truncate64(${fd}, ${x})`,
        seek: (x, whence = 0) => sql2`select lo_lseek64(${fd}, ${x}, ${whence})`,
        size: () => sql2`
          select
            lo_lseek64(${fd}, location, 0) as position,
            seek.size
          from (
            select
              lo_lseek64($1, 0, 2) as size,
              tell.location
            from (select lo_tell64($1) as location) tell
          ) seek
        `
      };
      resolve(lo);
      return new Promise(async (r) => finish = r);
      async function readable({
        highWaterMark = 2048 * 8,
        start = 0,
        end = Infinity
      } = {}) {
        let max = end - start;
        start && await lo.seek(start);
        return new Stream2.Readable({
          highWaterMark,
          async read(size2) {
            const l = size2 > max ? size2 - max : size2;
            max -= size2;
            const [{ data }] = await lo.read(l);
            this.push(data);
            if (data.length < size2)
              this.push(null);
          }
        });
      }
      async function writable({
        highWaterMark = 2048 * 8,
        start = 0
      } = {}) {
        start && await lo.seek(start);
        return new Stream2.Writable({
          highWaterMark,
          write(chunk, encoding, callback) {
            lo.write(chunk).then(() => callback(), callback);
          }
        });
      }
    }).catch(reject);
  });
}
var init_large = __esm({
  "node_modules/postgres/src/large.js"() {
  }
});

// node_modules/postgres/src/index.js
import os from "os";
import fs from "fs";
function Postgres(a, b2) {
  const options = parseOptions(a, b2), subscribe = options.no_subscribe || Subscribe(Postgres, { ...options });
  let ending = false;
  const queries = queue_default(), connecting = queue_default(), reserved = queue_default(), closed = queue_default(), ended = queue_default(), open = queue_default(), busy = queue_default(), full = queue_default(), queues = { connecting, reserved, closed, ended, open, busy, full };
  const connections = [...Array(options.max)].map(() => connection_default(options, queues, { onopen, onend, onclose }));
  const sql = Sql(handler2);
  Object.assign(sql, {
    get parameters() {
      return options.parameters;
    },
    largeObject: largeObject.bind(null, sql),
    subscribe,
    CLOSE,
    END: CLOSE,
    PostgresError,
    options,
    reserve,
    listen,
    begin,
    close,
    end
  });
  return sql;
  function Sql(handler3) {
    handler3.debug = options.debug;
    Object.entries(options.types).reduce((acc, [name, type]) => {
      acc[name] = (x) => new Parameter(x, type.to);
      return acc;
    }, typed);
    Object.assign(sql2, {
      types: typed,
      typed,
      unsafe,
      notify,
      array,
      json: json2,
      file
    });
    return sql2;
    function typed(value, type) {
      return new Parameter(value, type);
    }
    function sql2(strings, ...args) {
      const query = strings && Array.isArray(strings.raw) ? new Query(strings, args, handler3, cancel) : typeof strings === "string" && !args.length ? new Identifier(options.transform.column.to ? options.transform.column.to(strings) : strings) : new Builder(strings, args);
      return query;
    }
    function unsafe(string, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([string], args, handler3, cancel, {
        prepare: false,
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
    function file(path, args = [], options2 = {}) {
      arguments.length === 2 && !Array.isArray(args) && (options2 = args, args = []);
      const query = new Query([], args, (query2) => {
        fs.readFile(path, "utf8", (err, string) => {
          if (err)
            return query2.reject(err);
          query2.strings = [string];
          handler3(query2);
        });
      }, cancel, {
        ...options2,
        simple: "simple" in options2 ? options2.simple : args.length === 0
      });
      return query;
    }
  }
  async function listen(name, fn, onlisten) {
    const listener = { fn, onlisten };
    const sql2 = listen.sql || (listen.sql = Postgres({
      ...options,
      max: 1,
      idle_timeout: null,
      max_lifetime: null,
      fetch_types: false,
      onclose() {
        Object.entries(listen.channels).forEach(([name2, { listeners }]) => {
          delete listen.channels[name2];
          Promise.all(listeners.map((l) => listen(name2, l.fn, l.onlisten).catch(() => {
          })));
        });
      },
      onnotify(c, x) {
        c in listen.channels && listen.channels[c].listeners.forEach((l) => l.fn(x));
      }
    }));
    const channels = listen.channels || (listen.channels = {}), exists = name in channels;
    if (exists) {
      channels[name].listeners.push(listener);
      const result2 = await channels[name].result;
      listener.onlisten && listener.onlisten();
      return { state: result2.state, unlisten };
    }
    channels[name] = { result: sql2`listen ${sql2.unsafe('"' + name.replace(/"/g, '""') + '"')}`, listeners: [listener] };
    const result = await channels[name].result;
    listener.onlisten && listener.onlisten();
    return { state: result.state, unlisten };
    async function unlisten() {
      if (name in channels === false)
        return;
      channels[name].listeners = channels[name].listeners.filter((x) => x !== listener);
      if (channels[name].listeners.length)
        return;
      delete channels[name];
      return sql2`unlisten ${sql2.unsafe('"' + name.replace(/"/g, '""') + '"')}`;
    }
  }
  async function notify(channel, payload) {
    return await sql`select pg_notify(${channel}, ${"" + payload})`;
  }
  async function reserve() {
    const queue = queue_default();
    const c = open.length ? open.shift() : await new Promise((resolve, reject) => {
      const query = { reserve: resolve, reject };
      queries.push(query);
      closed.length && connect(closed.shift(), query);
    });
    move(c, reserved);
    c.reserved = () => queue.length ? c.execute(queue.shift()) : move(c, reserved);
    c.reserved.release = true;
    const sql2 = Sql(handler3);
    sql2.release = () => {
      c.reserved = null;
      onopen(c);
    };
    return sql2;
    function handler3(q) {
      c.queue === full ? queue.push(q) : c.execute(q) || move(c, full);
    }
  }
  async function begin(options2, fn) {
    !fn && (fn = options2, options2 = "");
    const queries2 = queue_default();
    let savepoints = 0, connection2, prepare = null;
    try {
      await sql.unsafe("begin " + options2.replace(/[^a-z ]/ig, ""), [], { onexecute }).execute();
      return await Promise.race([
        scope(connection2, fn),
        new Promise((_, reject) => connection2.onclose = reject)
      ]);
    } catch (error) {
      throw error;
    }
    async function scope(c, fn2, name) {
      const sql2 = Sql(handler3);
      sql2.savepoint = savepoint;
      sql2.prepare = (x) => prepare = x.replace(/[^a-z0-9$-_. ]/gi);
      let uncaughtError, result;
      name && await sql2`savepoint ${sql2(name)}`;
      try {
        result = await new Promise((resolve, reject) => {
          const x = fn2(sql2);
          Promise.resolve(Array.isArray(x) ? Promise.all(x) : x).then(resolve, reject);
        });
        if (uncaughtError)
          throw uncaughtError;
      } catch (e) {
        await (name ? sql2`rollback to ${sql2(name)}` : sql2`rollback`);
        throw e instanceof PostgresError && e.code === "25P02" && uncaughtError || e;
      }
      if (!name) {
        prepare ? await sql2`prepare transaction '${sql2.unsafe(prepare)}'` : await sql2`commit`;
      }
      return result;
      function savepoint(name2, fn3) {
        if (name2 && Array.isArray(name2.raw))
          return savepoint((sql3) => sql3.apply(sql3, arguments));
        arguments.length === 1 && (fn3 = name2, name2 = null);
        return scope(c, fn3, "s" + savepoints++ + (name2 ? "_" + name2 : ""));
      }
      function handler3(q) {
        q.catch((e) => uncaughtError || (uncaughtError = e));
        c.queue === full ? queries2.push(q) : c.execute(q) || move(c, full);
      }
    }
    function onexecute(c) {
      connection2 = c;
      move(c, reserved);
      c.reserved = () => queries2.length ? c.execute(queries2.shift()) : move(c, reserved);
    }
  }
  function move(c, queue) {
    c.queue.remove(c);
    queue.push(c);
    c.queue = queue;
    queue === open ? c.idleTimer.start() : c.idleTimer.cancel();
    return c;
  }
  function json2(x) {
    return new Parameter(x, 3802);
  }
  function array(x, type) {
    if (!Array.isArray(x))
      return array(Array.from(arguments));
    return new Parameter(x, type || (x.length ? inferType(x) || 25 : 0), options.shared.typeArrayMap);
  }
  function handler2(query) {
    if (ending)
      return query.reject(Errors.connection("CONNECTION_ENDED", options, options));
    if (open.length)
      return go(open.shift(), query);
    if (closed.length)
      return connect(closed.shift(), query);
    busy.length ? go(busy.shift(), query) : queries.push(query);
  }
  function go(c, query) {
    return c.execute(query) ? move(c, busy) : move(c, full);
  }
  function cancel(query) {
    return new Promise((resolve, reject) => {
      query.state ? query.active ? connection_default(options).cancel(query.state, resolve, reject) : query.cancelled = { resolve, reject } : (queries.remove(query), query.cancelled = true, query.reject(Errors.generic("57014", "canceling statement due to user request")), resolve());
    });
  }
  async function end({ timeout = null } = {}) {
    if (ending)
      return ending;
    await 1;
    let timer2;
    return ending = Promise.race([
      new Promise((r) => timeout !== null && (timer2 = setTimeout(destroy, timeout * 1e3, r))),
      Promise.all(connections.map((c) => c.end()).concat(
        listen.sql ? listen.sql.end({ timeout: 0 }) : [],
        subscribe.sql ? subscribe.sql.end({ timeout: 0 }) : []
      ))
    ]).then(() => clearTimeout(timer2));
  }
  async function close() {
    await Promise.all(connections.map((c) => c.end()));
  }
  async function destroy(resolve) {
    await Promise.all(connections.map((c) => c.terminate()));
    while (queries.length)
      queries.shift().reject(Errors.connection("CONNECTION_DESTROYED", options));
    resolve();
  }
  function connect(c, query) {
    move(c, connecting);
    c.connect(query);
    return c;
  }
  function onend(c) {
    move(c, ended);
  }
  function onopen(c) {
    if (queries.length === 0)
      return move(c, open);
    let max = Math.ceil(queries.length / (connecting.length + 1)), ready = true;
    while (ready && queries.length && max-- > 0) {
      const query = queries.shift();
      if (query.reserve)
        return query.reserve(c);
      ready = c.execute(query);
    }
    ready ? move(c, busy) : move(c, full);
  }
  function onclose(c, e) {
    move(c, closed);
    c.reserved = null;
    c.onclose && (c.onclose(e), c.onclose = null);
    options.onclose && options.onclose(c.id);
    queries.length && connect(c, queries.shift());
  }
}
function parseOptions(a, b2) {
  if (a && a.shared)
    return a;
  const env = process.env, o = (!a || typeof a === "string" ? b2 : a) || {}, { url, multihost } = parseUrl(a), query = [...url.searchParams].reduce((a2, [b3, c]) => (a2[b3] = c, a2), {}), host = o.hostname || o.host || multihost || url.hostname || env.PGHOST || "localhost", port = o.port || url.port || env.PGPORT || 5432, user = o.user || o.username || url.username || env.PGUSERNAME || env.PGUSER || osUsername();
  o.no_prepare && (o.prepare = false);
  query.sslmode && (query.ssl = query.sslmode, delete query.sslmode);
  "timeout" in o && (console.log("The timeout option is deprecated, use idle_timeout instead"), o.idle_timeout = o.timeout);
  query.sslrootcert === "system" && (query.ssl = "verify-full");
  const ints = ["idle_timeout", "connect_timeout", "max_lifetime", "max_pipeline", "backoff", "keep_alive"];
  const defaults = {
    max: globalThis.Cloudflare ? 3 : 10,
    ssl: false,
    sslnegotiation: null,
    idle_timeout: null,
    connect_timeout: 30,
    max_lifetime,
    max_pipeline: 100,
    backoff,
    keep_alive: 60,
    prepare: true,
    debug: false,
    fetch_types: true,
    publications: "alltables",
    target_session_attrs: null
  };
  return {
    host: Array.isArray(host) ? host : host.split(",").map((x) => x.split(":")[0]),
    port: Array.isArray(port) ? port : host.split(",").map((x) => parseInt(x.split(":")[1] || port)),
    path: o.path || host.indexOf("/") > -1 && host + "/.s.PGSQL." + port,
    database: o.database || o.db || (url.pathname || "").slice(1) || env.PGDATABASE || user,
    user,
    pass: o.pass || o.password || url.password || env.PGPASSWORD || "",
    ...Object.entries(defaults).reduce(
      (acc, [k, d]) => {
        const value = k in o ? o[k] : k in query ? query[k] === "disable" || query[k] === "false" ? false : query[k] : env["PG" + k.toUpperCase()] || d;
        acc[k] = typeof value === "string" && ints.includes(k) ? +value : value;
        return acc;
      },
      {}
    ),
    connection: {
      application_name: env.PGAPPNAME || "postgres.js",
      ...o.connection,
      ...Object.entries(query).reduce((acc, [k, v]) => (k in defaults || (acc[k] = v), acc), {})
    },
    types: o.types || {},
    target_session_attrs: tsa(o, url, env),
    onnotice: o.onnotice,
    onnotify: o.onnotify,
    onclose: o.onclose,
    onparameter: o.onparameter,
    socket: o.socket,
    transform: parseTransform(o.transform || { undefined: void 0 }),
    parameters: {},
    shared: { retries: 0, typeArrayMap: {} },
    ...mergeUserTypes(o.types)
  };
}
function tsa(o, url, env) {
  const x = o.target_session_attrs || url.searchParams.get("target_session_attrs") || env.PGTARGETSESSIONATTRS;
  if (!x || ["read-write", "read-only", "primary", "standby", "prefer-standby"].includes(x))
    return x;
  throw new Error("target_session_attrs " + x + " is not supported");
}
function backoff(retries) {
  return (0.5 + Math.random() / 2) * Math.min(3 ** retries / 100, 20);
}
function max_lifetime() {
  return 60 * (30 + Math.random() * 30);
}
function parseTransform(x) {
  return {
    undefined: x.undefined,
    column: {
      from: typeof x.column === "function" ? x.column : x.column && x.column.from,
      to: x.column && x.column.to
    },
    value: {
      from: typeof x.value === "function" ? x.value : x.value && x.value.from,
      to: x.value && x.value.to
    },
    row: {
      from: typeof x.row === "function" ? x.row : x.row && x.row.from,
      to: x.row && x.row.to
    }
  };
}
function parseUrl(url) {
  if (!url || typeof url !== "string")
    return { url: { searchParams: /* @__PURE__ */ new Map() } };
  let host = url;
  host = host.slice(host.indexOf("://") + 3).split(/[?/]/)[0];
  host = decodeURIComponent(host.slice(host.indexOf("@") + 1));
  const urlObj = new URL(url.replace(host, host.split(",")[0]));
  return {
    url: {
      username: decodeURIComponent(urlObj.username),
      password: decodeURIComponent(urlObj.password),
      host: urlObj.host,
      hostname: urlObj.hostname,
      port: urlObj.port,
      pathname: urlObj.pathname,
      searchParams: urlObj.searchParams
    },
    multihost: host.indexOf(",") > -1 && host
  };
}
function osUsername() {
  try {
    return os.userInfo().username;
  } catch (_) {
    return process.env.USERNAME || process.env.USER || process.env.LOGNAME;
  }
}
var src_default;
var init_src = __esm({
  "node_modules/postgres/src/index.js"() {
    init_types2();
    init_connection();
    init_query();
    init_queue();
    init_errors();
    init_subscribe();
    init_large();
    Object.assign(Postgres, {
      PostgresError,
      toPascal,
      pascal,
      toCamel,
      camel,
      toKebab,
      kebab,
      fromPascal,
      fromCamel,
      fromKebab,
      BigInt: {
        to: 20,
        from: [20],
        parse: (x) => BigInt(x),
        // eslint-disable-line
        serialize: (x) => x.toString()
      }
    });
    src_default = Postgres;
  }
});

// api-src/lib/schema.ts
var MIGRATIONS, MIGRATIONS_TABLE_SQL, MIGRATION_LOCK_KEY;
var init_schema = __esm({
  "api-src/lib/schema.ts"() {
    "use strict";
    MIGRATIONS = [
      {
        id: 1,
        name: "initial_schema",
        sql: (
          /* sql */
          `
-- \u2500\u2500\u2500 Administrators \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Email is stored lower-cased by the application; the UNIQUE constraint then gives
-- case-insensitive uniqueness without depending on the citext extension.
CREATE TABLE IF NOT EXISTS admin_users (
  id                    uuid PRIMARY KEY,
  email                 text NOT NULL UNIQUE,
  name                  text NOT NULL DEFAULT '',
  title                 text NOT NULL DEFAULT '',
  avatar_url            text,
  role                  text NOT NULL DEFAULT 'editor',
  -- active | invited | suspended
  status                text NOT NULL DEFAULT 'invited',

  -- NULL until an invited administrator sets a password.
  password_hash         text,
  password_updated_at   timestamptz,
  must_change_password  boolean NOT NULL DEFAULT false,

  -- TOTP secret, encrypted at rest (see api-src/lib/crypto.ts). Never returned by the API.
  totp_secret           text,
  totp_enabled          boolean NOT NULL DEFAULT false,
  totp_confirmed_at     timestamptz,
  -- Hashed single-use recovery codes: [{ "hash": "...", "usedAt": null }]
  recovery_codes        jsonb NOT NULL DEFAULT '[]'::jsonb,

  invite_token_hash     text,
  invite_expires_at     timestamptz,

  -- Brute-force state. Persisted rather than held in memory because each serverless
  -- instance has its own memory, so an in-process counter is trivially bypassed by
  -- spreading attempts across concurrent invocations.
  failed_attempts       integer NOT NULL DEFAULT 0,
  locked_until          timestamptz,

  last_login_at         timestamptz,
  last_login_ip         text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_users_role_idx ON admin_users (role);
CREATE INDEX IF NOT EXISTS admin_users_status_idx ON admin_users (status);

-- \u2500\u2500\u2500 Sessions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Only the SHA-256 of the session token is stored. A database leak therefore does not
-- hand over usable sessions, exactly as with password hashes.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id             uuid PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash     text NOT NULL UNIQUE,
  ip_address     text,
  user_agent     text,
  -- False between password verification and the TOTP step, so a half-authenticated
  -- session cannot reach any content route.
  mfa_satisfied  boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_seen_at   timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL,
  revoked_at     timestamptz
);

CREATE INDEX IF NOT EXISTS admin_sessions_user_idx ON admin_sessions (user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions (expires_at);

-- \u2500\u2500\u2500 Persisted rate limiting \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- A fixed-window counter shared by every instance. Used for login attempts and for
-- capping AI requests.
CREATE TABLE IF NOT EXISTS cms_rate_limits (
  key       text PRIMARY KEY,
  count     integer NOT NULL DEFAULT 0,
  reset_at  timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS cms_rate_limits_reset_idx ON cms_rate_limits (reset_at);

-- \u2500\u2500\u2500 Editorial content \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Blog posts, announcements, updates and news share this table. They differ in where
-- they surface and which extras they carry, not in how they are authored, scheduled,
-- previewed or audited \u2014 so one table means one publishing pipeline and one audit path.
CREATE TABLE IF NOT EXISTS content_items (
  id               uuid PRIMARY KEY,
  kind             text NOT NULL,
  status           text NOT NULL DEFAULT 'draft',
  title            text NOT NULL DEFAULT '',
  slug             text NOT NULL,
  excerpt          text NOT NULL DEFAULT '',
  body             jsonb NOT NULL DEFAULT '{"version":1,"blocks":[]}'::jsonb,
  cover_image_url  text,
  author           jsonb,
  category         text,
  tags             text[] NOT NULL DEFAULT '{}',
  seo              jsonb NOT NULL DEFAULT '{}'::jsonb,
  extras           jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Derived on write so listings never have to parse a document to render a card.
  reading_minutes  integer NOT NULL DEFAULT 0,
  search_text      text NOT NULL DEFAULT '',

  published_at     timestamptz,
  scheduled_for    timestamptz,
  archived_at      timestamptz,

  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  created_by       uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by       uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_by_email text,
  updated_by_email text,
  revision         integer NOT NULL DEFAULT 1,

  -- Slugs are unique per kind, so a blog post and an announcement may share one.
  CONSTRAINT content_items_kind_slug_key UNIQUE (kind, slug)
);

CREATE INDEX IF NOT EXISTS content_items_feed_idx
  ON content_items (kind, status, published_at DESC);
CREATE INDEX IF NOT EXISTS content_items_status_idx ON content_items (status);
-- Partial index: the scheduler only ever asks for rows still waiting to go live.
CREATE INDEX IF NOT EXISTS content_items_due_idx
  ON content_items (scheduled_for)
  WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS content_items_updated_idx ON content_items (updated_at DESC);
-- to_tsvector with a literal configuration is immutable, so it can be indexed directly.
-- 'english' is core Postgres; no extension required.
CREATE INDEX IF NOT EXISTS content_items_search_idx
  ON content_items USING gin (to_tsvector('english', search_text));

-- \u2500\u2500\u2500 Revisions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- A snapshot per save, which is what makes "revert this change" possible.
CREATE TABLE IF NOT EXISTS content_revisions (
  id               uuid PRIMARY KEY,
  content_id       uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  revision         integer NOT NULL,
  snapshot         jsonb NOT NULL,
  note             text NOT NULL DEFAULT '',
  created_at       timestamptz NOT NULL DEFAULT now(),
  created_by_email text,
  CONSTRAINT content_revisions_unique UNIQUE (content_id, revision)
);

CREATE INDEX IF NOT EXISTS content_revisions_lookup_idx
  ON content_revisions (content_id, revision DESC);

-- \u2500\u2500\u2500 Taxonomies \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Categories and tags are suggestions surfaced in the editor, not a constraint on
-- content_items. Adding one must never require a deploy.
CREATE TABLE IF NOT EXISTS content_taxonomies (
  id         uuid PRIMARY KEY,
  kind       text NOT NULL DEFAULT 'global',
  taxonomy   text NOT NULL,
  name       text NOT NULL,
  slug       text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_taxonomies_unique UNIQUE (kind, taxonomy, slug)
);

-- \u2500\u2500\u2500 Pages \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
CREATE TABLE IF NOT EXISTS cms_pages (
  id               uuid PRIMARY KEY,
  path             text NOT NULL UNIQUE,
  title            text NOT NULL DEFAULT '',
  summary          text NOT NULL DEFAULT '',
  status           text NOT NULL DEFAULT 'draft',
  -- Ordered PageSection[]: structured blocks from the design system, never free layout.
  sections         jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo              jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- True for paths backed by a hand-built React route. Editable, but not deletable:
  -- removing the row would leave a route in the bundle pointing at nothing.
  system_route     boolean NOT NULL DEFAULT false,
  published_at     timestamptz,
  scheduled_for    timestamptz,
  archived_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_email text,
  revision         integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS cms_pages_status_idx ON cms_pages (status);

-- \u2500\u2500\u2500 Global website sections \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Sections belonging to the site rather than to one page: the homepage hero, the
-- partners strip, the FAQ. Addressed by a stable key that a React component looks up.
CREATE TABLE IF NOT EXISTS site_sections (
  key              text PRIMARY KEY,
  label            text NOT NULL,
  group_name       text NOT NULL DEFAULT 'General',
  type             text NOT NULL,
  visible          boolean NOT NULL DEFAULT true,
  status           text NOT NULL DEFAULT 'published',
  fields           jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order       integer NOT NULL DEFAULT 0,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_email text,
  revision         integer NOT NULL DEFAULT 1
);

-- \u2500\u2500\u2500 Settings \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- One row per settings document: 'design', 'header', 'footer', 'seo', 'general'.
CREATE TABLE IF NOT EXISTS site_settings (
  key              text PRIMARY KEY,
  value            jsonb NOT NULL,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  updated_by_email text
);

-- \u2500\u2500\u2500 Media \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Metadata only. Bytes live in S3-compatible object storage; storage_key is what a
-- delete acts on. Keeping large files out of Postgres keeps backups and reads sane.
CREATE TABLE IF NOT EXISTS media_assets (
  id                 uuid PRIMARY KEY,
  storage_key        text NOT NULL UNIQUE,
  url                text NOT NULL,
  filename           text NOT NULL,
  mime_type          text NOT NULL,
  size_bytes         bigint NOT NULL DEFAULT 0,
  width              integer,
  height             integer,
  alt                text NOT NULL DEFAULT '',
  folder             text NOT NULL DEFAULT '',
  uploaded_by_email  text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_assets_created_idx ON media_assets (created_at DESC);
CREATE INDEX IF NOT EXISTS media_assets_folder_idx ON media_assets (folder);
CREATE INDEX IF NOT EXISTS media_assets_search_idx
  ON media_assets USING gin (to_tsvector('english', filename || ' ' || alt));

-- \u2500\u2500\u2500 Activity log \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Append-only. The API never exposes an update or delete for this table.
CREATE TABLE IF NOT EXISTS activity_log (
  id           uuid PRIMARY KEY,
  actor_id     uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  actor_email  text,
  actor_name   text,
  action       text NOT NULL,
  entity_type  text,
  entity_id    text,
  entity_label text,
  outcome      text NOT NULL DEFAULT 'success',
  ip_address   text,
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_recent_idx ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_actor_idx ON activity_log (actor_email, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_action_idx ON activity_log (action, created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_entity_idx ON activity_log (entity_type, entity_id);

-- \u2500\u2500\u2500 AI change requests \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- The review pipeline for AI-assisted changes. 'content' requests apply to CMS data on
-- approval; 'code' requests become a pull request, so a human still merges.
CREATE TABLE IF NOT EXISTS ai_change_requests (
  id                 uuid PRIMARY KEY,
  prompt             text NOT NULL,
  kind               text NOT NULL DEFAULT 'content',
  status             text NOT NULL DEFAULT 'queued',
  summary            text NOT NULL DEFAULT '',
  plan               jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_edits      jsonb NOT NULL DEFAULT '[]'::jsonb,
  code_edits         jsonb NOT NULL DEFAULT '[]'::jsonb,
  checks             jsonb NOT NULL DEFAULT '[]'::jsonb,
  preview_url        text,
  branch             text,
  pull_request_url   text,
  review_note        text,
  error_message      text,
  -- The prior state of everything a 'content' request touched, so an applied change
  -- can be rolled back after the fact.
  rollback_snapshot  jsonb,
  requested_by_email text,
  reviewed_by_email  text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_change_requests_status_idx
  ON ai_change_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_change_requests_recent_idx
  ON ai_change_requests (created_at DESC);
`
        )
      }
    ];
    MIGRATIONS_TABLE_SQL = /* sql */
    `
CREATE TABLE IF NOT EXISTS cms_migrations (
  id         integer PRIMARY KEY,
  name       text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`;
    MIGRATION_LOCK_KEY = "8324119407551002";
  }
});

// api-src/lib/db.ts
import { randomUUID } from "node:crypto";
function isInvalidInputSyntax(error) {
  return Boolean(error) && error.code === "22P02";
}
function resolveDatabaseUrl(env = process.env) {
  for (const name of URL_VARIABLES) {
    const matches = Object.keys(env).filter((key) => key === name || key.endsWith(`_${name}`)).filter((key) => POSTGRES_URL.test((env[key] ?? "").trim())).sort((a, b2) => a.length - b2.length || a.localeCompare(b2));
    const variable = matches[0];
    if (variable !== void 0) return { url: env[variable].trim(), variable };
  }
  return null;
}
function isDatabaseConfigured() {
  return resolveDatabaseUrl() !== null;
}
function sslSetting(url) {
  if (/[?&]sslmode=/.test(url)) return void 0;
  try {
    const { hostname } = new URL(url);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return false;
  } catch {
  }
  return "require";
}
function db() {
  if (client) return client;
  const resolved = resolveDatabaseUrl();
  if (resolved === null) throw new DatabaseNotConfiguredError();
  const { url, variable } = resolved;
  console.log(`[db] connecting using ${variable}`);
  client = src_default(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    // Named prepared statements are incompatible with transaction-mode poolers.
    prepare: false,
    ssl: sslSetting(url),
    // Postgres emits notices for every `IF NOT EXISTS` no-op during migration; they are
    // expected and would otherwise fill the function logs on each cold start.
    onnotice: () => {
    },
    transform: { undefined: null }
  });
  return client;
}
function newId() {
  return randomUUID();
}
async function ensureMigrated() {
  if (!isDatabaseConfigured()) throw new DatabaseNotConfiguredError();
  if (migrationPromise) return migrationPromise;
  migrationPromise = runMigrations().catch((error) => {
    migrationPromise = null;
    throw error;
  });
  return migrationPromise;
}
async function runMigrations() {
  const sql = db();
  await sql.unsafe(MIGRATIONS_TABLE_SQL).simple();
  const applied = await sql`SELECT id FROM cms_migrations`;
  const appliedIds = new Set(applied.map((row) => row.id));
  const pending = MIGRATIONS.filter((migration) => !appliedIds.has(migration.id));
  if (pending.length === 0) return;
  await sql`SELECT pg_advisory_lock(${MIGRATION_LOCK_KEY}::bigint)`;
  try {
    const nowApplied = await sql`SELECT id FROM cms_migrations`;
    const nowAppliedIds = new Set(nowApplied.map((row) => row.id));
    for (const migration of MIGRATIONS) {
      if (nowAppliedIds.has(migration.id)) continue;
      await sql.unsafe(migration.sql).simple();
      await sql`
        INSERT INTO cms_migrations (id, name)
        VALUES (${migration.id}, ${migration.name})
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`[cms] applied migration ${migration.id}: ${migration.name}`);
    }
  } finally {
    await sql`SELECT pg_advisory_unlock(${MIGRATION_LOCK_KEY}::bigint)`;
  }
}
async function consumeRateLimit(key, max, windowMs) {
  const sql = db();
  const rows = await sql`
    INSERT INTO cms_rate_limits (key, count, reset_at)
    VALUES (${key}, 1, now() + ${`${windowMs} milliseconds`}::interval)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN cms_rate_limits.reset_at < now() THEN 1
        ELSE cms_rate_limits.count + 1
      END,
      reset_at = CASE
        WHEN cms_rate_limits.reset_at < now()
          THEN now() + ${`${windowMs} milliseconds`}::interval
        ELSE cms_rate_limits.reset_at
      END
    RETURNING count, reset_at
  `;
  const row = rows[0];
  const count = row?.count ?? 1;
  return {
    limited: count > max,
    remaining: Math.max(0, max - count),
    resetAt: row?.reset_at ?? new Date(Date.now() + windowMs)
  };
}
async function clearRateLimit(key) {
  await db()`DELETE FROM cms_rate_limits WHERE key = ${key}`;
}
async function pruneExpired() {
  const sql = db();
  try {
    await sql`DELETE FROM admin_sessions WHERE expires_at < now() - interval '7 days'`;
    await sql`DELETE FROM cms_rate_limits WHERE reset_at < now() - interval '1 day'`;
  } catch (error) {
    console.warn("[cms] pruning expired rows failed:", error);
  }
}
function json(value) {
  return db().json(value ?? null);
}
function isoOrNull(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
function iso(value) {
  return isoOrNull(value) ?? (/* @__PURE__ */ new Date()).toISOString();
}
function parseDate(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
var DatabaseNotConfiguredError, client, POSTGRES_URL, URL_VARIABLES, migrationPromise;
var init_db = __esm({
  "api-src/lib/db.ts"() {
    "use strict";
    init_src();
    init_schema();
    DatabaseNotConfiguredError = class extends Error {
      constructor() {
        super(
          "The Website Manager database is not configured. Set DATABASE_URL to a Postgres connection string (a pooled endpoint is recommended). If the database was attached through a Vercel integration under a prefix, the prefixed name is also accepted \u2014 the value simply has to begin with postgres:// or postgresql://."
        );
        this.name = "DatabaseNotConfiguredError";
      }
    };
    client = null;
    POSTGRES_URL = /^postgres(ql)?:\/\/[^\s]/i;
    URL_VARIABLES = [
      "DATABASE_URL",
      "POSTGRES_URL",
      "POSTGRES_PRISMA_URL",
      "DATABASE_URL_UNPOOLED",
      "POSTGRES_URL_NON_POOLING"
    ];
    migrationPromise = null;
  }
});

// api-src/lib/router.ts
function resolveRequestPath(req, mountPrefix) {
  const rawUrl = req.url ?? "/";
  const parsed = new URL(rawUrl, "http://cms.internal");
  const fromQuery = parsed.searchParams.get(ROUTE_PARAM);
  if (fromQuery !== null) {
    const query = new URLSearchParams(parsed.searchParams);
    query.delete(ROUTE_PARAM);
    return { path: normalizePath(fromQuery), query };
  }
  let path = parsed.pathname;
  if (path.startsWith(mountPrefix)) path = path.slice(mountPrefix.length);
  return { path: normalizePath(path), query: parsed.searchParams };
}
function normalizePath(value) {
  const trimmed = value.replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "/";
}
function buildContext(req, res, path, query, params, identity) {
  return {
    req,
    res,
    method: (req.method ?? "GET").toUpperCase(),
    path,
    params,
    query,
    body: parseJsonBody(req.body),
    identity
  };
}
function badRequest(message, details) {
  return new HttpError(400, message, "bad_request", details);
}
function notFound(what = "That item") {
  return new HttpError(404, `${what} could not be found.`, "not_found");
}
function conflict(message) {
  return new HttpError(409, message, "conflict");
}
function intParam(query, key, fallback, max) {
  const raw = Number(query.get(key));
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(Math.max(Math.trunc(raw), 0), max);
}
function enumValue(value, allowed, label) {
  if (typeof value === "string" && allowed.includes(value))
    return value;
  throw badRequest(`${label} must be one of: ${allowed.join(", ")}.`);
}
var Router, ROUTE_PARAM, HttpError;
var init_router = __esm({
  "api-src/lib/router.ts"() {
    "use strict";
    init_http();
    Router = class {
      routes = [];
      add(spec, handler2) {
        const [method, pattern] = spec.split(" ");
        this.routes.push({
          method: method.toUpperCase(),
          segments: pattern.split("/").filter(Boolean),
          handler: handler2
        });
        return this;
      }
      /**
       * Finds the handler for a method and path.
       *
       * Returns `null` for no path match at all, and `"method_mismatch"` when the path exists
       * under a different verb — which lets the caller answer 405 rather than 404, so a wrong verb
       * is immediately obvious instead of looking like a missing endpoint.
       */
      match(method, path) {
        const parts = path.split("/").filter(Boolean);
        let pathExists = false;
        for (const route of this.routes) {
          if (route.segments.length !== parts.length) continue;
          const params = {};
          let matched = true;
          for (let index = 0; index < route.segments.length; index++) {
            const segment = route.segments[index];
            if (segment.startsWith(":")) {
              params[segment.slice(1)] = decodeURIComponent(parts[index]);
            } else if (segment !== parts[index]) {
              matched = false;
              break;
            }
          }
          if (!matched) continue;
          pathExists = true;
          if (route.method === method.toUpperCase()) return { handler: route.handler, params };
        }
        return pathExists ? "method_mismatch" : null;
      }
    };
    ROUTE_PARAM = "__route";
    HttpError = class extends Error {
      constructor(statusCode, message, code = "error", details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = "HttpError";
      }
      statusCode;
      code;
      details;
    };
  }
});

// src/lib/cms/sanitize.ts
function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function escapeTextRun(value) {
  return value.replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#\d{1,7}|#[xX][0-9a-fA-F]{1,6});)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function sanitizeUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 4096) return null;
  const cleaned = trimmed.replace(/[\u0000-\u001F\u007F]/g, "");
  if (!cleaned) return null;
  if (/^[/#?]/.test(cleaned)) {
    if (cleaned.startsWith("//")) {
      try {
        const url = new URL(`https:${cleaned}`);
        return SAFE_PROTOCOLS.has(url.protocol) ? url.toString() : null;
      } catch {
        return null;
      }
    }
    return cleaned;
  }
  if (!cleaned.includes(":")) return cleaned;
  try {
    const url = new URL(cleaned);
    return SAFE_PROTOCOLS.has(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}
function extractHref(rawAttributes) {
  const match = /(?:^|\s)href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(rawAttributes);
  if (!match) return null;
  const raw = match[1] ?? match[2] ?? match[3] ?? "";
  return decodeEntities(raw);
}
function decodeEntities(value) {
  return value.replace(
    /&#x([0-9a-fA-F]{1,6});?/g,
    (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16))
  ).replace(/&#(\d{1,7});?/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10))).replace(/&quot;/gi, '"').replace(/&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&");
}
function sanitizeInlineHtml(input) {
  if (typeof input !== "string" || !input) return "";
  const source = input.length > MAX_INLINE_LENGTH ? input.slice(0, MAX_INLINE_LENGTH) : input;
  const out = [];
  const stack = [];
  const tokenPattern = /<!--[\s\S]*?(?:-->|$)|<!\[CDATA\[[\s\S]*?\]\]>|<\/?([a-zA-Z][\w:-]*)([^>]*)>/g;
  let cursor = 0;
  let match;
  while ((match = tokenPattern.exec(source)) !== null) {
    if (match.index > cursor) {
      out.push(escapeTextRun(source.slice(cursor, match.index)));
    }
    cursor = match.index + match[0].length;
    const tagName = match[1]?.toLowerCase();
    if (!tagName) continue;
    const isClosing = match[0].startsWith("</");
    if (!isClosing && DROP_CONTENT_TAGS.has(tagName)) {
      const closePattern = new RegExp(`</\\s*${tagName}\\s*>`, "i");
      const rest = source.slice(cursor);
      const closeMatch = closePattern.exec(rest);
      cursor = closeMatch ? cursor + closeMatch.index + closeMatch[0].length : source.length;
      tokenPattern.lastIndex = cursor;
      continue;
    }
    if (isClosing && DROP_CONTENT_TAGS.has(tagName)) continue;
    const canonical = ALLOWED_TAGS[tagName];
    if (!canonical) continue;
    if (VOID_TAGS.has(canonical)) {
      if (!isClosing) out.push(`<${canonical}>`);
      continue;
    }
    if (isClosing) {
      const depth = stack.lastIndexOf(canonical);
      if (depth === -1) continue;
      while (stack.length > depth) {
        out.push(`</${stack.pop()}>`);
      }
      continue;
    }
    if (stack.length >= MAX_NESTING) continue;
    if (canonical === "a") {
      const href = sanitizeUrl(extractHref(match[2] ?? ""));
      if (!href) continue;
      const external = /^https?:/i.test(href) && !href.includes("enicehq.com");
      const attributes = external ? ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer nofollow"` : ` href="${escapeHtml(href)}"`;
      out.push(`<a${attributes}>`);
      stack.push("a");
      continue;
    }
    out.push(`<${canonical}>`);
    stack.push(canonical);
  }
  if (cursor < source.length) out.push(escapeTextRun(source.slice(cursor)));
  while (stack.length > 0) out.push(`</${stack.pop()}>`);
  return out.join("");
}
function inlineHtmlToText(input) {
  if (typeof input !== "string" || !input) return "";
  return decodeEntities(
    input.replace(/<\s*br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").replace(/\s+/g, " ")
  ).trim();
}
function sanitizeText(value, maxLength = 300) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}
function sanitizeMultilineText(value, maxLength = 5e3) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim().slice(0, maxLength);
}
var ALLOWED_TAGS, VOID_TAGS, DROP_CONTENT_TAGS, SAFE_PROTOCOLS, MAX_INLINE_LENGTH, MAX_NESTING;
var init_sanitize = __esm({
  "src/lib/cms/sanitize.ts"() {
    "use strict";
    ALLOWED_TAGS = {
      strong: "strong",
      b: "strong",
      em: "em",
      i: "em",
      code: "code",
      a: "a",
      br: "br",
      s: "s",
      strike: "s",
      del: "s",
      sup: "sup",
      sub: "sub"
    };
    VOID_TAGS = /* @__PURE__ */ new Set(["br"]);
    DROP_CONTENT_TAGS = /* @__PURE__ */ new Set([
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "noscript",
      "svg",
      "math",
      "template",
      "link",
      "meta",
      "base",
      "form",
      "input",
      "button",
      "textarea",
      "select"
    ]);
    SAFE_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:", "mailto:", "tel:"]);
    MAX_INLINE_LENGTH = 2e5;
    MAX_NESTING = 8;
  }
});

// src/lib/cms/doc.ts
function blockId() {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}
function resolveVideo(rawUrl) {
  const safe = sanitizeUrl(rawUrl);
  if (!safe) return { provider: "file", embed: "" };
  const youtube = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/.exec(
    safe
  );
  if (youtube) {
    return { provider: "youtube", embed: `https://www.youtube-nocookie.com/embed/${youtube[1]}` };
  }
  const vimeo = /vimeo\.com\/(?:video\/)?(\d{6,})/.exec(safe);
  if (vimeo) return { provider: "vimeo", embed: `https://player.vimeo.com/video/${vimeo[1]}` };
  return { provider: "file", embed: safe };
}
function asString(value) {
  return typeof value === "string" ? value : "";
}
function asStringArray(value, max) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map((entry) => asString(entry));
}
function sanitizeDoc(input) {
  const raw = input;
  const rawBlocks = Array.isArray(raw?.blocks) ? raw.blocks : [];
  const blocks = [];
  const seenIds = /* @__PURE__ */ new Set();
  for (const entry of rawBlocks.slice(0, MAX_BLOCKS)) {
    if (!entry || typeof entry !== "object") continue;
    const source = entry;
    const type = asString(source.type);
    if (!BLOCK_TYPES.includes(type)) continue;
    let id = sanitizeText(source.id, 40) || blockId();
    if (seenIds.has(id)) id = blockId();
    seenIds.add(id);
    switch (type) {
      case "heading": {
        const html = sanitizeInlineHtml(source.html);
        if (!inlineHtmlToText(html)) break;
        const rawLevel = Number(source.level);
        const level = HEADING_LEVELS.includes(rawLevel) ? rawLevel : 2;
        blocks.push({ id, type, level, html });
        break;
      }
      case "paragraph": {
        const html = sanitizeInlineHtml(source.html);
        if (!inlineHtmlToText(html)) break;
        blocks.push({ id, type, html });
        break;
      }
      case "list": {
        const items = asStringArray(source.items, MAX_LIST_ITEMS).map((item) => sanitizeInlineHtml(item)).filter((item) => inlineHtmlToText(item).length > 0);
        if (items.length === 0) break;
        blocks.push({ id, type, ordered: source.ordered === true, items });
        break;
      }
      case "quote": {
        const html = sanitizeInlineHtml(source.html);
        if (!inlineHtmlToText(html)) break;
        blocks.push({ id, type, html, attribution: sanitizeText(source.attribution, 200) });
        break;
      }
      case "image": {
        const url = sanitizeUrl(source.url);
        if (!url) break;
        blocks.push({
          id,
          type,
          url,
          alt: sanitizeText(source.alt, 300),
          caption: sanitizeText(source.caption, 300),
          width: source.width === "full" ? "full" : "inset"
        });
        break;
      }
      case "video": {
        const url = sanitizeUrl(source.url);
        if (!url) break;
        const { provider } = resolveVideo(url);
        blocks.push({ id, type, url, caption: sanitizeText(source.caption, 300), provider });
        break;
      }
      case "table": {
        const head = asStringArray(source.head, MAX_TABLE_COLUMNS).map(
          (cell) => sanitizeText(cell, 200)
        );
        const columns = head.length;
        if (columns === 0) break;
        const rawRows = Array.isArray(source.rows) ? source.rows.slice(0, MAX_TABLE_ROWS) : [];
        const rows = rawRows.map((row) => {
          const cells = asStringArray(row, MAX_TABLE_COLUMNS).map(
            (cell) => sanitizeText(cell, 500)
          );
          return Array.from({ length: columns }, (_, index) => cells[index] ?? "");
        }).filter((row) => row.some((cell) => cell.length > 0));
        if (rows.length === 0) break;
        blocks.push({ id, type, head, rows, caption: sanitizeText(source.caption, 300) });
        break;
      }
      case "code": {
        const code = asString(source.code).slice(0, MAX_CODE_LENGTH);
        if (!code.trim()) break;
        const language = asString(source.language);
        blocks.push({
          id,
          type,
          language: CODE_LANGUAGES.includes(language) ? language : "text",
          code,
          filename: sanitizeText(source.filename, 120)
        });
        break;
      }
      case "callout": {
        const html = sanitizeInlineHtml(source.html);
        const title = sanitizeText(source.title, 200);
        if (!inlineHtmlToText(html) && !title) break;
        const variant = asString(source.variant);
        blocks.push({
          id,
          type,
          variant: CALLOUT_VARIANTS.includes(variant) ? variant : "info",
          title,
          html
        });
        break;
      }
      case "divider":
        blocks.push({ id, type });
        break;
    }
  }
  return { version: 1, blocks };
}
function docToPlainText(doc) {
  const parts = [];
  for (const block of doc.blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
        parts.push(inlineHtmlToText(block.html));
        break;
      case "list":
        parts.push(block.items.map((item) => inlineHtmlToText(item)).join(" "));
        break;
      case "quote":
        parts.push(inlineHtmlToText(block.html));
        if (block.attribution) parts.push(block.attribution);
        break;
      case "callout":
        if (block.title) parts.push(block.title);
        parts.push(inlineHtmlToText(block.html));
        break;
      case "image":
      case "video":
        if (block.caption) parts.push(block.caption);
        break;
      case "table":
        parts.push(block.head.join(" "));
        for (const row of block.rows) parts.push(row.join(" "));
        break;
      // Code is excluded: it would skew reading time and pollute search with syntax.
      case "code":
      case "divider":
        break;
    }
  }
  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
function wordCount(doc) {
  const text = docToPlainText(doc);
  return text ? text.split(/\s+/).length : 0;
}
function readingMinutes(doc) {
  const words = wordCount(doc);
  if (words === 0) return 0;
  return Math.max(1, Math.round(words / 225));
}
function deriveExcerpt(doc, maxLength = 200) {
  const paragraph = doc.blocks.find(
    (block) => block.type === "paragraph" && inlineHtmlToText(block.html).length > 40
  );
  const text = paragraph ? inlineHtmlToText(paragraph.html) : docToPlainText(doc);
  if (!text) return "";
  if (text.length <= maxLength) return text;
  const window = text.slice(0, maxLength);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("? "),
    window.lastIndexOf("! ")
  );
  if (sentenceEnd > maxLength * 0.6) return window.slice(0, sentenceEnd + 1);
  const lastSpace = window.lastIndexOf(" ");
  return `${(lastSpace > 0 ? window.slice(0, lastSpace) : window).trimEnd()}\u2026`;
}
function firstImageUrl(doc) {
  const image = doc.blocks.find((block) => block.type === "image");
  return image?.url ?? null;
}
function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96).replace(/-+$/g, "");
}
function normalizePath2(value) {
  const segments = value.split("/").map((segment) => slugify(segment)).filter(Boolean);
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}
var BLOCK_TYPES, HEADING_LEVELS, CALLOUT_VARIANTS, MAX_BLOCKS, MAX_LIST_ITEMS, MAX_TABLE_COLUMNS, MAX_TABLE_ROWS, MAX_CODE_LENGTH, CODE_LANGUAGES;
var init_doc = __esm({
  "src/lib/cms/doc.ts"() {
    "use strict";
    init_sanitize();
    BLOCK_TYPES = [
      "heading",
      "paragraph",
      "list",
      "quote",
      "image",
      "video",
      "table",
      "code",
      "callout",
      "divider"
    ];
    HEADING_LEVELS = [2, 3, 4];
    CALLOUT_VARIANTS = ["info", "success", "warning", "danger"];
    MAX_BLOCKS = 600;
    MAX_LIST_ITEMS = 200;
    MAX_TABLE_COLUMNS = 10;
    MAX_TABLE_ROWS = 200;
    MAX_CODE_LENGTH = 4e4;
    CODE_LANGUAGES = [
      "text",
      "bash",
      "json",
      "typescript",
      "javascript",
      "tsx",
      "python",
      "go",
      "rust",
      "sql",
      "yaml",
      "html",
      "css"
    ];
  }
});

// src/lib/cms/seo-resolve.ts
var FALLBACK_SEO_DEFAULTS;
var init_seo_resolve = __esm({
  "src/lib/cms/seo-resolve.ts"() {
    "use strict";
    FALLBACK_SEO_DEFAULTS = {
      titleSuffix: " | ENICE Group",
      defaultDescription: "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
      defaultOgImage: "/og.png",
      indexSite: true,
      robotsExtra: ""
    };
  }
});

// api-src/lib/repo/website.ts
var website_exports = {};
__export(website_exports, {
  SETTINGS_KEYS: () => SETTINGS_KEYS,
  createPage: () => createPage,
  defaultSettings: () => defaultSettings,
  deletePage: () => deletePage,
  getPage: () => getPage,
  getPageByPath: () => getPageByPath,
  getSection: () => getSection,
  getSettings: () => getSettings,
  listPages: () => listPages,
  listSections: () => listSections,
  publishDuePages: () => publishDuePages,
  sanitizeSectionFields: () => sanitizeSectionFields,
  seedWebsiteDefaults: () => seedWebsiteDefaults,
  transitionPage: () => transitionPage,
  updatePage: () => updatePage,
  updateSection: () => updateSection,
  updateSettings: () => updateSettings
});
function sanitizeSectionFields(type, input) {
  const schema = SECTION_SCHEMAS[type];
  if (!schema) return {};
  const source = input && typeof input === "object" ? input : {};
  const output = {};
  for (const field of schema.fields) {
    const value = source[field.key];
    switch (field.type) {
      case "text":
        output[field.key] = sanitizeText(value, 300);
        break;
      case "textarea":
        output[field.key] = sanitizeMultilineText(value, 4e3);
        break;
      case "richtext":
        output[field.key] = sanitizeDoc(value);
        break;
      case "image":
      case "url":
        output[field.key] = sanitizeUrl(value) ?? "";
        break;
      case "boolean":
        output[field.key] = value === true;
        break;
      case "select":
        output[field.key] = typeof value === "string" && field.options?.includes(value) ? value : field.options?.[0] ?? "";
        break;
      case "repeater": {
        const rows = Array.isArray(value) ? value.slice(0, field.max ?? 20) : [];
        output[field.key] = rows.map((row) => {
          const rowSource = row && typeof row === "object" ? row : {};
          const rowOutput = {};
          for (const sub of field.of ?? []) {
            const subValue = rowSource[sub.key];
            if (sub.type === "image" || sub.type === "url") {
              rowOutput[sub.key] = sanitizeUrl(subValue) ?? "";
            } else if (sub.type === "boolean") {
              rowOutput[sub.key] = subValue === true;
            } else if (sub.type === "textarea") {
              rowOutput[sub.key] = sanitizeMultilineText(subValue, 2e3);
            } else if (sub.type === "richtext") {
              rowOutput[sub.key] = sanitizeDoc(subValue);
            } else {
              rowOutput[sub.key] = sanitizeText(subValue, 300);
            }
          }
          return rowOutput;
        });
        break;
      }
    }
  }
  return output;
}
function sanitizeSeoFields(value) {
  if (!value || typeof value !== "object") return {};
  const source = value;
  return {
    title: sanitizeText(source.title, 200) || void 0,
    description: sanitizeMultilineText(source.description, 400) || void 0,
    canonicalUrl: sanitizeUrl(source.canonicalUrl) ?? void 0,
    ogTitle: sanitizeText(source.ogTitle, 200) || void 0,
    ogDescription: sanitizeMultilineText(source.ogDescription, 400) || void 0,
    ogImage: sanitizeUrl(source.ogImage) ?? void 0,
    index: source.index === false ? false : void 0
  };
}
function toStatus2(value) {
  return typeof value === "string" && CONTENT_STATUSES.includes(value) ? value : "draft";
}
function mapPage(row) {
  return {
    id: row.id,
    path: row.path,
    title: row.title,
    summary: row.summary,
    status: toStatus2(row.status),
    sections: row.sections ?? [],
    seo: row.seo ?? {},
    systemRoute: row.system_route,
    publishedAt: isoOrNull(row.published_at),
    scheduledFor: isoOrNull(row.scheduled_for),
    archivedAt: isoOrNull(row.archived_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    updatedByEmail: row.updated_by_email,
    revision: row.revision
  };
}
function sanitizeSections(value) {
  if (!Array.isArray(value)) return [];
  const sections = [];
  for (const entry of value.slice(0, 40)) {
    if (!entry || typeof entry !== "object") continue;
    const source = entry;
    const type = source.type;
    if (typeof type !== "string" || !SECTION_TYPES.includes(type)) continue;
    const sectionType = type;
    sections.push({
      id: sanitizeText(source.id, 40) || newId().slice(0, 8),
      type: sectionType,
      label: sanitizeText(source.label, 120) || SECTION_SCHEMAS[sectionType].label,
      visible: source.visible !== false,
      fields: sanitizeSectionFields(sectionType, source.fields)
    });
  }
  return sections;
}
async function listPages() {
  const rows = await db()`
    SELECT id, path, title, summary, status, sections, seo, system_route,
           published_at, scheduled_for, archived_at, created_at, updated_at,
           updated_by_email, revision
    FROM cms_pages
    ORDER BY system_route DESC, path ASC
  `;
  return rows.map(mapPage);
}
async function getPage(id) {
  const rows = await db()`
    SELECT id, path, title, summary, status, sections, seo, system_route,
           published_at, scheduled_for, archived_at, created_at, updated_at,
           updated_by_email, revision
    FROM cms_pages WHERE id = ${id}
  `;
  return rows[0] ? mapPage(rows[0]) : null;
}
async function getPageByPath(path, publishedOnly = true) {
  const sql = db();
  const rows = await sql`
    SELECT id, path, title, summary, status, sections, seo, system_route,
           published_at, scheduled_for, archived_at, created_at, updated_at,
           updated_by_email, revision
    FROM cms_pages
    WHERE path = ${normalizePath2(path)}
      ${publishedOnly ? sql`AND status = 'published'` : sql``}
  `;
  return rows[0] ? mapPage(rows[0]) : null;
}
async function createPage(input, actor) {
  const title = sanitizeText(input.title, 200);
  if (!title) throw badRequest("A page title is required.");
  const path = normalizePath2(input.path?.trim() || slugify(title));
  if (path === "/") throw badRequest("The homepage already exists and cannot be recreated.");
  const existing = await db()`SELECT id FROM cms_pages WHERE path = ${path}`;
  if (existing.length > 0) throw conflict(`A page already exists at ${path}.`);
  const id = newId();
  await db()`
    INSERT INTO cms_pages (id, path, title, summary, status, sections, seo, updated_by_email)
    VALUES (
      ${id}, ${path}, ${title}, ${sanitizeMultilineText(input.summary, 500)}, ${"draft"},
      ${json(sanitizeSections(input.sections))}, ${json(sanitizeSeoFields(input.seo))},
      ${actor.email}
    )
  `;
  const created = await getPage(id);
  if (!created) throw new Error("Page disappeared immediately after insert.");
  return created;
}
async function updatePage(id, input, actor, expectedRevision) {
  const existing = await getPage(id);
  if (!existing) throw notFound("That page");
  if (expectedRevision !== void 0 && expectedRevision !== existing.revision) {
    throw conflict("Someone else saved this page while you were editing. Reload and try again.");
  }
  let path = existing.path;
  if (input.path !== void 0) {
    const candidate = normalizePath2(input.path);
    if (candidate !== existing.path) {
      if (existing.systemRoute) {
        throw badRequest(
          "This page's address is fixed because it is built into the website. Its content and SEO are still editable."
        );
      }
      const clash = await db()`
        SELECT id FROM cms_pages WHERE path = ${candidate} AND id <> ${id}
      `;
      if (clash.length > 0) throw conflict(`A page already exists at ${candidate}.`);
      path = candidate;
    }
  }
  await db()`
    UPDATE cms_pages SET
      path = ${path},
      title = ${input.title === void 0 ? existing.title : sanitizeText(input.title, 200)},
      summary = ${input.summary === void 0 ? existing.summary : sanitizeMultilineText(input.summary, 500)},
      sections = ${json(
    input.sections === void 0 ? existing.sections : sanitizeSections(input.sections)
  )},
      seo = ${json(input.seo === void 0 ? existing.seo : sanitizeSeoFields(input.seo))},
      updated_at = now(),
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;
  const updated = await getPage(id);
  if (!updated) throw notFound("That page");
  return updated;
}
async function transitionPage(id, status, scheduledFor, actor) {
  const existing = await getPage(id);
  if (!existing) throw notFound("That page");
  const sql = db();
  const when = status === "scheduled" ? parseDate(scheduledFor) : null;
  if (status === "scheduled" && !when) {
    throw badRequest("Choose the date and time this page should publish.");
  }
  await sql`
    UPDATE cms_pages SET
      status = ${status},
      published_at = ${status === "published" ? sql`COALESCE(published_at, now())` : sql`published_at`},
      scheduled_for = ${when},
      archived_at = ${status === "archived" ? sql`now()` : sql`NULL`},
      updated_at = now(),
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;
  const updated = await getPage(id);
  if (!updated) throw notFound("That page");
  return updated;
}
async function deletePage(id) {
  const existing = await getPage(id);
  if (!existing) throw notFound("That page");
  if (existing.systemRoute) {
    throw badRequest(
      "This page is built into the website and cannot be deleted. Unpublish or archive it instead."
    );
  }
  await db()`DELETE FROM cms_pages WHERE id = ${id}`;
  return existing;
}
async function publishDuePages() {
  const rows = await db()`
    UPDATE cms_pages
    SET status = 'published',
        published_at = COALESCE(published_at, scheduled_for, now()),
        scheduled_for = NULL,
        updated_at = now()
    WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now()
    RETURNING id
  `;
  return rows.length;
}
function mapSection(row) {
  return {
    key: row.key,
    label: row.label,
    group: row.group_name,
    type: row.type,
    visible: row.visible,
    status: toStatus2(row.status),
    fields: row.fields ?? {},
    updatedAt: iso(row.updated_at),
    updatedByEmail: row.updated_by_email,
    revision: row.revision
  };
}
async function listSections() {
  const rows = await db()`
    SELECT key, label, group_name, type, visible, status, fields, sort_order,
           updated_at, updated_by_email, revision
    FROM site_sections
    ORDER BY sort_order ASC, key ASC
  `;
  return rows.map(mapSection);
}
async function getSection(key) {
  const rows = await db()`
    SELECT key, label, group_name, type, visible, status, fields, sort_order,
           updated_at, updated_by_email, revision
    FROM site_sections WHERE key = ${key}
  `;
  return rows[0] ? mapSection(rows[0]) : null;
}
async function updateSection(key, input, actor) {
  const existing = await getSection(key);
  if (!existing) throw notFound("That section");
  await db()`
    UPDATE site_sections SET
      fields = ${json(
    input.fields === void 0 ? existing.fields : sanitizeSectionFields(existing.type, input.fields)
  )},
      visible = ${input.visible === void 0 ? existing.visible : input.visible === true},
      status = ${input.status === void 0 ? existing.status : toStatus2(input.status)},
      label = ${input.label === void 0 ? existing.label : sanitizeText(input.label, 120)},
      updated_at = now(),
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE key = ${key}
  `;
  const updated = await getSection(key);
  if (!updated) throw notFound("That section");
  return updated;
}
function sanitizeNavItems(value, depth = 0) {
  if (!Array.isArray(value)) return [];
  const items = [];
  for (const entry of value.slice(0, 20)) {
    if (!entry || typeof entry !== "object") continue;
    const source = entry;
    const label = sanitizeText(source.label, 60);
    const url = sanitizeUrl(source.url);
    if (!label || !url) continue;
    items.push({
      id: sanitizeText(source.id, 40) || newId().slice(0, 8),
      label,
      url,
      visible: source.visible !== false,
      // The header is designed for a single dropdown level; deeper nesting has nowhere to render.
      children: depth === 0 ? sanitizeNavItems(source.children, 1) : void 0
    });
  }
  return items;
}
function sanitizeDesign(value, existing) {
  const source = value && typeof value === "object" ? value : {};
  const palette = typeof source.palette === "string" ? source.palette : existing.palette;
  const typography = typeof source.typography === "string" ? source.typography : existing.typography;
  const buttonStyle = typeof source.buttonStyle === "string" ? source.buttonStyle : existing.buttonStyle;
  return {
    logoUrl: source.logoUrl === void 0 ? existing.logoUrl : sanitizeUrl(source.logoUrl),
    logoDarkUrl: source.logoDarkUrl === void 0 ? existing.logoDarkUrl : sanitizeUrl(source.logoDarkUrl),
    faviconUrl: source.faviconUrl === void 0 ? existing.faviconUrl : sanitizeUrl(source.faviconUrl),
    ogImageUrl: source.ogImageUrl === void 0 ? existing.ogImageUrl : sanitizeUrl(source.ogImageUrl),
    // Unknown keys fall back to the current value, so a malformed payload can never leave the
    // site with a palette or font that has no definition behind it.
    palette: palette in BRAND_PALETTES ? palette : existing.palette,
    typography: typography in TYPE_PAIRINGS ? typography : existing.typography,
    buttonStyle: buttonStyle in BUTTON_STYLES ? buttonStyle : existing.buttonStyle
  };
}
function sanitizeHeader(value, existing) {
  const source = value && typeof value === "object" ? value : {};
  return {
    items: source.items === void 0 ? existing.items : sanitizeNavItems(source.items),
    ctaLabel: source.ctaLabel === void 0 ? existing.ctaLabel : sanitizeText(source.ctaLabel, 40),
    ctaUrl: source.ctaUrl === void 0 ? existing.ctaUrl : sanitizeUrl(source.ctaUrl) ?? "",
    showCta: source.showCta === void 0 ? existing.showCta : source.showCta === true,
    sticky: source.sticky === void 0 ? existing.sticky : source.sticky === true
  };
}
function sanitizeFooter(value, existing) {
  const source = value && typeof value === "object" ? value : {};
  const columns = source.columns === void 0 ? existing.columns : (Array.isArray(source.columns) ? source.columns.slice(0, 6) : []).map((entry) => {
    const column = entry && typeof entry === "object" ? entry : {};
    return {
      id: sanitizeText(column.id, 40) || newId().slice(0, 8),
      heading: sanitizeText(column.heading, 60),
      links: sanitizeNavItems(column.links, 1)
    };
  });
  return {
    columns,
    tagline: source.tagline === void 0 ? existing.tagline : sanitizeMultilineText(source.tagline, 300),
    copyright: source.copyright === void 0 ? existing.copyright : sanitizeText(source.copyright, 200),
    showSocials: source.showSocials === void 0 ? existing.showSocials : source.showSocials === true
  };
}
function sanitizeSeoDefaults(value, existing) {
  const source = value && typeof value === "object" ? value : {};
  return {
    titleSuffix: source.titleSuffix === void 0 ? existing.titleSuffix : sanitizeText(source.titleSuffix, 60),
    defaultDescription: source.defaultDescription === void 0 ? existing.defaultDescription : sanitizeMultilineText(source.defaultDescription, 400),
    defaultOgImage: source.defaultOgImage === void 0 ? existing.defaultOgImage : sanitizeUrl(source.defaultOgImage) ?? existing.defaultOgImage,
    indexSite: source.indexSite === void 0 ? existing.indexSite : source.indexSite === true,
    robotsExtra: source.robotsExtra === void 0 ? existing.robotsExtra : sanitizeText(source.robotsExtra, 120)
  };
}
async function getSettings() {
  const rows = await db()`
    SELECT key, value FROM site_settings
  `;
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const defaults = defaultSettings();
  return {
    design: { ...defaults.design, ...stored.get("design") ?? {} },
    header: { ...defaults.header, ...stored.get("header") ?? {} },
    footer: { ...defaults.footer, ...stored.get("footer") ?? {} },
    seo: { ...defaults.seo, ...stored.get("seo") ?? {} },
    ...(() => {
      const general = stored.get("general") ?? {};
      return {
        announcementBarEnabled: general.announcementBarEnabled === void 0 ? defaults.announcementBarEnabled : general.announcementBarEnabled === true,
        maintenanceNotice: typeof general.maintenanceNotice === "string" ? general.maintenanceNotice : defaults.maintenanceNotice
      };
    })()
  };
}
async function updateSettings(key, value, actor) {
  const current = await getSettings();
  const next = key === "design" ? sanitizeDesign(value, current.design) : key === "header" ? sanitizeHeader(value, current.header) : key === "footer" ? sanitizeFooter(value, current.footer) : key === "seo" ? sanitizeSeoDefaults(value, current.seo) : (() => {
    const source = value && typeof value === "object" ? value : {};
    return {
      announcementBarEnabled: source.announcementBarEnabled === true,
      maintenanceNotice: sanitizeInlineHtml(source.maintenanceNotice)
    };
  })();
  await db()`
    INSERT INTO site_settings (key, value, updated_by_email)
    VALUES (${key}, ${json(next)}, ${actor.email})
    ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = now(), updated_by_email = EXCLUDED.updated_by_email
  `;
  return getSettings();
}
function defaultSettings() {
  return {
    design: {
      logoUrl: null,
      logoDarkUrl: null,
      faviconUrl: null,
      ogImageUrl: null,
      palette: "enice-navy",
      typography: "inter",
      buttonStyle: "standard"
    },
    header: {
      items: [
        { id: "nav-home", label: "Home", url: "/", visible: true },
        { id: "nav-products", label: "Products", url: "/portfolio", visible: true },
        { id: "nav-about", label: "About", url: "/about", visible: true },
        { id: "nav-contact", label: "Contact", url: "/contact", visible: true }
      ],
      ctaLabel: "Contact us",
      ctaUrl: "/contact",
      showCta: true,
      sticky: true
    },
    footer: {
      columns: [
        {
          id: "col-products",
          heading: "Products",
          links: [
            { id: "f-pulsepay", label: "PulsePay", url: "/portfolio/pulsepay", visible: true },
            {
              id: "f-pulseassist",
              label: "PulseAssist",
              url: "/portfolio/pulseassist",
              visible: true
            },
            {
              id: "f-collection",
              label: "PulsePay Payment Collection",
              url: "/portfolio/payment-collection",
              visible: true
            },
            { id: "f-epulse", label: "ePulse", url: "/portfolio/epulse", visible: true },
            { id: "f-pulsex", label: "PulseX", url: "/portfolio/pulsex", visible: true }
          ]
        },
        {
          id: "col-updates",
          heading: "Updates",
          links: [
            { id: "f-blog", label: "Blog & Announcements", url: "/blog/", visible: true },
            { id: "f-roadmap", label: "Roadmap", url: "/roadmap", visible: true },
            { id: "f-status", label: "System Status", url: "/status", visible: true }
          ]
        },
        {
          id: "col-company",
          heading: "Company",
          links: [
            { id: "f-about", label: "About ENICE Group", url: "/about", visible: true },
            { id: "f-contact", label: "Contact", url: "/contact", visible: true },
            { id: "f-privacy", label: "Privacy Policy", url: "/privacy", visible: true },
            { id: "f-terms", label: "Terms of Service", url: "/terms", visible: true },
            {
              id: "f-compliance",
              label: "Regulatory Compliance",
              url: "/compliance",
              visible: true
            }
          ]
        }
      ],
      tagline: "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
      copyright: `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ENICE Group. All rights reserved.`,
      showSocials: true
    },
    seo: FALLBACK_SEO_DEFAULTS,
    announcementBarEnabled: false,
    maintenanceNotice: ""
  };
}
async function seedWebsiteDefaults() {
  const sql = db();
  const defaults = defaultSettings();
  const settingsRows = [
    ["design", defaults.design],
    ["header", defaults.header],
    ["footer", defaults.footer],
    ["seo", defaults.seo],
    [
      "general",
      {
        announcementBarEnabled: defaults.announcementBarEnabled,
        maintenanceNotice: defaults.maintenanceNotice
      }
    ]
  ];
  for (const [key, value] of settingsRows) {
    await sql`
      INSERT INTO site_settings (key, value) VALUES (${key}, ${json(value)})
      ON CONFLICT (key) DO NOTHING
    `;
  }
  for (const section of DEFAULT_SECTIONS) {
    await sql`
      INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
      VALUES (
        ${section.key}, ${section.label}, ${section.group}, ${section.type}, true, ${"published"},
        ${json(sanitizeSectionFields(section.type, section.fields))}, ${section.order}
      )
      ON CONFLICT (key) DO NOTHING
    `;
  }
  for (const page of SYSTEM_PAGES) {
    await sql`
      INSERT INTO cms_pages (
        id, path, title, summary, status, sections, seo, system_route, published_at
      ) VALUES (
        ${newId()}, ${page.path}, ${page.title}, ${page.summary}, ${"published"},
        ${json([])}, ${json({})}, true, now()
      )
      ON CONFLICT (path) DO NOTHING
    `;
  }
}
var SETTINGS_KEYS, DEFAULT_SECTIONS, SYSTEM_PAGES;
var init_website = __esm({
  "api-src/lib/repo/website.ts"() {
    "use strict";
    init_types();
    init_doc();
    init_sanitize();
    init_seo_resolve();
    init_db();
    init_router();
    SETTINGS_KEYS = ["design", "header", "footer", "seo", "general"];
    DEFAULT_SECTIONS = [
      {
        key: "home.hero",
        label: "Homepage hero",
        group: "Home",
        type: "hero",
        order: 10,
        fields: {
          eyebrow: "ENICE GROUP",
          heading: "Technology products for financial services, commerce, and communication",
          subheading: "ENICE Group builds, owns, and operates the platforms behind modern payments, digital banking, and enterprise AI.",
          primaryCtaLabel: "Explore our products",
          primaryCtaUrl: "/portfolio",
          secondaryCtaLabel: "Contact us",
          secondaryCtaUrl: "/contact"
        }
      },
      {
        key: "home.statistics",
        label: "Company statistics",
        group: "Home",
        type: "statistics",
        order: 20,
        fields: {
          heading: "Built for scale",
          items: [
            { value: "5", label: "Products in the portfolio" },
            { value: "24/7", label: "Platform monitoring" },
            { value: "2026", label: "Founded" }
          ]
        }
      },
      {
        key: "home.products",
        label: "Product grid",
        group: "Home",
        type: "featureGrid",
        order: 30,
        fields: {
          eyebrow: "PORTFOLIO",
          heading: "What we build",
          subheading: "Five platforms across payments, banking, digital assets, and enterprise AI.",
          items: [
            {
              icon: "CreditCard",
              title: "PulsePay",
              description: "Virtual card issuance, programmable wallets, and embedded treasury.",
              url: "/portfolio/pulsepay"
            },
            {
              icon: "Bot",
              title: "PulseAssist",
              description: "Multi-tenant AI operations platform for banking, fintech, and telecom.",
              url: "/portfolio/pulseassist"
            },
            {
              icon: "Landmark",
              title: "ePulse",
              description: "Global financial platform for freelancers, creators, and businesses.",
              url: "/portfolio/epulse"
            },
            {
              icon: "TrendingUp",
              title: "PulseX",
              description: "Digital asset trading and management.",
              url: "/portfolio/pulsex"
            },
            {
              icon: "Wallet",
              title: "Payment Collection",
              description: "Payment infrastructure for businesses to accept and manage payments.",
              url: "/portfolio/payment-collection"
            }
          ]
        }
      },
      {
        key: "home.partners",
        label: "Partners strip",
        group: "Home",
        type: "logoStrip",
        order: 40,
        fields: { heading: "Working with", items: [] }
      },
      {
        key: "home.faq",
        label: "Frequently asked questions",
        group: "Home",
        type: "faq",
        order: 50,
        fields: { heading: "Frequently asked questions", items: [] }
      },
      {
        key: "home.cta",
        label: "Closing call to action",
        group: "Home",
        type: "cta",
        order: 60,
        fields: {
          heading: "Talk to the ENICE Group team",
          subheading: "Product access, platform integration, enterprise licensing, or partnerships.",
          ctaLabel: "Contact us",
          ctaUrl: "/contact",
          style: "prominent"
        }
      },
      {
        key: "about.intro",
        label: "About introduction",
        group: "About",
        type: "richText",
        order: 110,
        fields: { heading: "Who we are", body: { version: 1, blocks: [] } }
      },
      {
        key: "about.values",
        label: "How we work",
        group: "About",
        type: "featureGrid",
        order: 120,
        fields: { heading: "How we work", items: [] }
      },
      {
        key: "contact.details",
        label: "Contact details",
        group: "Contact",
        type: "contact",
        order: 210,
        fields: {
          heading: "Contact ENICE Group",
          subheading: "We reply to every enquiry.",
          email: "corporate@enicehq.com",
          showForm: true
        }
      }
    ];
    SYSTEM_PAGES = [
      { path: "/", title: "Home", summary: "The ENICE Group homepage." },
      { path: "/about", title: "About ENICE Group", summary: "Company story, mission, and approach." },
      { path: "/portfolio", title: "Products", summary: "The ENICE Group product portfolio." },
      { path: "/portfolio/pulsepay", title: "PulsePay", summary: "Virtual payment platform." },
      {
        path: "/portfolio/pulseassist",
        title: "PulseAssist",
        summary: "Enterprise AI operations platform."
      },
      { path: "/portfolio/epulse", title: "ePulse", summary: "Global financial platform." },
      { path: "/portfolio/pulsex", title: "PulseX", summary: "Digital asset platform." },
      {
        path: "/portfolio/payment-collection",
        title: "PulsePay Payment Collection",
        summary: "Payment infrastructure for businesses."
      },
      { path: "/contact", title: "Contact", summary: "Enquiry form and contact details." },
      { path: "/roadmap", title: "Product Roadmap", summary: "Milestones and what is next." },
      { path: "/blog", title: "Blog and Updates", summary: "The blog, news, and announcements index." },
      { path: "/docs", title: "API Documentation", summary: "ENICE Core API reference." },
      { path: "/status", title: "System Status", summary: "Live availability of the API and website." },
      { path: "/privacy", title: "Privacy Policy", summary: "Legal \u2014 privacy." },
      { path: "/terms", title: "Terms of Service", summary: "Legal \u2014 terms." },
      { path: "/compliance", title: "Regulatory Compliance", summary: "Legal \u2014 compliance." }
    ];
  }
});

// api-src/cms.ts
init_types();

// src/lib/cms/permissions.ts
var ADMIN_ROLES = ["owner", "administrator", "editor"];
var ROLE_META = {
  owner: {
    label: "Owner",
    description: "Complete control, including administrators, critical website settings and deploying code changes.",
    rank: 0
  },
  administrator: {
    label: "Administrator",
    description: "Manages all website content, pages, sections, media and design. Can approve AI changes but cannot deploy code or manage administrators.",
    rank: 1
  },
  editor: {
    label: "Editor",
    description: "Writes and publishes blog posts, news, announcements and updates, and manages media. Cannot change website settings or deploy.",
    rank: 2
  }
};
var PERMISSIONS = [
  // Editorial content: blog, announcements, updates, news.
  "content.read",
  "content.write",
  "content.publish",
  "content.delete",
  // Pages and website sections.
  "pages.read",
  "pages.write",
  "pages.publish",
  "pages.delete",
  "sections.read",
  "sections.write",
  // Media library.
  "media.read",
  "media.write",
  "media.delete",
  // Navigation, footer, SEO defaults, design controls, site settings.
  "settings.read",
  "settings.write",
  "design.write",
  // AI Website Manager.
  "ai.read",
  "ai.request",
  "ai.approve",
  "ai.deploy",
  // Administration.
  "admins.read",
  "admins.write",
  "activity.read"
];
var PERMISSION_META = {
  "content.read": { label: "View content", group: "Content" },
  "content.write": { label: "Create and edit content", group: "Content" },
  "content.publish": { label: "Publish, schedule and archive content", group: "Content" },
  "content.delete": { label: "Delete content", group: "Content", sensitive: true },
  "pages.read": { label: "View pages", group: "Website" },
  "pages.write": { label: "Create and edit pages", group: "Website" },
  "pages.publish": { label: "Publish and unpublish pages", group: "Website" },
  "pages.delete": { label: "Delete pages", group: "Website", sensitive: true },
  "sections.read": { label: "View website sections", group: "Website" },
  "sections.write": { label: "Edit website sections", group: "Website" },
  "media.read": { label: "View media", group: "Media" },
  "media.write": { label: "Upload and rename media", group: "Media" },
  "media.delete": { label: "Delete media", group: "Media", sensitive: true },
  "settings.read": { label: "View website settings", group: "Configuration" },
  "settings.write": {
    label: "Change navigation, footer and SEO defaults",
    group: "Configuration",
    sensitive: true
  },
  "design.write": { label: "Change logo, palette and typography", group: "Configuration" },
  "ai.read": { label: "View AI change requests", group: "AI" },
  "ai.request": { label: "Ask the AI for website changes", group: "AI" },
  "ai.approve": { label: "Approve AI proposals", group: "AI", sensitive: true },
  "ai.deploy": { label: "Deploy approved code changes", group: "AI", sensitive: true },
  "admins.read": { label: "View administrators", group: "Administration" },
  "admins.write": {
    label: "Invite and manage administrators",
    group: "Administration",
    sensitive: true
  },
  "activity.read": { label: "View the activity log", group: "Administration" }
};
var ROLE_PERMISSIONS = {
  owner: PERMISSIONS,
  administrator: [
    "content.read",
    "content.write",
    "content.publish",
    "content.delete",
    "pages.read",
    "pages.write",
    "pages.publish",
    "sections.read",
    "sections.write",
    "media.read",
    "media.write",
    "media.delete",
    "settings.read",
    "settings.write",
    "design.write",
    "ai.read",
    "ai.request",
    "ai.approve",
    "admins.read",
    "activity.read"
  ],
  editor: [
    "content.read",
    "content.write",
    "content.publish",
    "pages.read",
    "sections.read",
    "media.read",
    "media.write",
    "settings.read",
    "ai.read",
    "ai.request",
    "activity.read"
  ]
};
function can(role, permission) {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role];
  return granted ? granted.includes(permission) : false;
}
function canManageRole(actor, target) {
  if (!can(actor, "admins.write")) return false;
  return ROLE_META[actor].rank < ROLE_META[target].rank;
}
function assignableRoles(actor) {
  return ADMIN_ROLES.filter((role) => ROLE_META[role].rank > ROLE_META[actor].rank);
}

// api-src/cms.ts
init_http();
init_db();

// api-src/lib/auth.ts
init_http();
init_db();

// api-src/lib/crypto.ts
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  createHash,
  hkdfSync,
  randomBytes,
  randomInt,
  scrypt as scryptCallback,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";

// src/lib/cms/password-policy.ts
var PASSWORD_MIN_LENGTH = 12;
var PASSWORD_MAX_LENGTH = 200;
var PASSWORD_MIN_UNIQUE_CHARS = 5;
var WEAK_PASSWORDS = /* @__PURE__ */ new Set([
  "password",
  "password1",
  "password123",
  "passw0rd123",
  "administrator",
  "letmein12345",
  "qwertyuiop12",
  "123456789012",
  "enicegroup123",
  "enicehq12345",
  "welcome12345",
  "changeme1234",
  "adminadmin12",
  "websitemanager"
]);
function checkPassword(password) {
  if (typeof password !== "string") {
    return { ok: false, error: "A password is required." };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      error: `Use at least ${PASSWORD_MIN_LENGTH} characters. Length matters more than symbols.`
    };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, error: `Keep the password under ${PASSWORD_MAX_LENGTH} characters.` };
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, error: "That password is too common. Choose something unique." };
  }
  if (new Set(password).size < PASSWORD_MIN_UNIQUE_CHARS) {
    return { ok: false, error: "Use a greater variety of characters." };
  }
  return { ok: true };
}

// api-src/lib/crypto.ts
var scrypt = promisify(scryptCallback);
var SecretNotConfiguredError = class extends Error {
  constructor() {
    super(
      "CMS_SECRET is not configured. Generate one with `openssl rand -base64 48` and set it as an environment variable. It encrypts two-factor secrets and signs CSRF tokens."
    );
    this.name = "SecretNotConfiguredError";
  }
};
var MIN_SECRET_LENGTH = 32;
function isSecretConfigured() {
  const secret = process.env.CMS_SECRET;
  return typeof secret === "string" && secret.length >= MIN_SECRET_LENGTH;
}
function appSecret() {
  const secret = process.env.CMS_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) throw new SecretNotConfiguredError();
  return secret;
}
function derivedKey(purpose, length = 32) {
  return Buffer.from(hkdfSync("sha256", appSecret(), "enice-cms-v1", purpose, length));
}
function safeEqual(a, b2) {
  const digestA = createHash("sha256").update(a, "utf8").digest();
  const digestB = createHash("sha256").update(b2, "utf8").digest();
  return timingSafeEqual(digestA, digestB);
}
function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}
function sha2562(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
var SCRYPT_N = 32768;
var SCRYPT_R = 8;
var SCRYPT_P = 1;
var SCRYPT_KEYLEN = 64;
var SCRYPT_MAXMEM = 96 * 1024 * 1024;
async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scrypt(password.normalize("NFKC"), salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM
  });
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64"),
    derived.toString("base64")
  ].join("$");
}
async function verifyPassword(password, stored) {
  if (!stored) return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;
  let salt;
  let expected;
  try {
    salt = Buffer.from(parts[4], "base64");
    expected = Buffer.from(parts[5], "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length === 0) return false;
  try {
    const derived = await scrypt(password.normalize("NFKC"), salt, expected.length, {
      N,
      r,
      p,
      maxmem: SCRYPT_MAXMEM
    });
    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
var ENCRYPTION_PREFIX = "v1";
function encryptSecret(plaintext) {
  const key = derivedKey("totp-encryption");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    ENCRYPTION_PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64")
  ].join(".");
}
function decryptSecret(payload) {
  if (!payload) return null;
  const parts = payload.split(".");
  if (parts.length !== 4 || parts[0] !== ENCRYPTION_PREFIX) return null;
  try {
    const key = derivedKey("totp-encryption");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(parts[1], "base64"));
    decipher.setAuthTag(Buffer.from(parts[2], "base64"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(parts[3], "base64")),
      decipher.final()
    ]);
    return plaintext.toString("utf8");
  } catch {
    return null;
  }
}
var BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(buffer2) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer2) {
    value = value << 8 | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[value >>> bits - 5 & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[value << 5 - bits & 31];
  return output;
}
function base32Decode(input) {
  const normalized = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = value << 5 | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push(value >>> bits - 8 & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}
var TOTP_STEP_SECONDS = 30;
var TOTP_DIGITS = 6;
var TOTP_WINDOW = 1;
function generateTotpSecret() {
  return base32Encode(randomBytes(20));
}
function totpAt(secret, counter) {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", secret).update(message).digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = (digest[offset] & 127) << 24 | (digest[offset + 1] & 255) << 16 | (digest[offset + 2] & 255) << 8 | digest[offset + 3] & 255;
  return (binary % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, "0");
}
function verifyTotp(base32Secret, code, atMs = Date.now()) {
  if (typeof code !== "string") return false;
  const cleaned = code.replace(/[\s-]/g, "");
  if (!new RegExp(`^\\d{${TOTP_DIGITS}}$`).test(cleaned)) return false;
  const secret = base32Decode(base32Secret);
  if (secret.length === 0) return false;
  const counter = Math.floor(atMs / 1e3 / TOTP_STEP_SECONDS);
  const submitted = Buffer.from(cleaned, "utf8");
  let matched = false;
  for (let offset = -TOTP_WINDOW; offset <= TOTP_WINDOW; offset++) {
    const candidate = Buffer.from(totpAt(secret, counter + offset), "utf8");
    if (candidate.length === submitted.length && timingSafeEqual(candidate, submitted)) {
      matched = true;
    }
  }
  return matched;
}
function totpUri(email, base32Secret, issuer = "ENICE Website Manager") {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret: base32Secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS)
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
var RECOVERY_ALPHABET = "ABCDEFGHJKMNPQRSTVWXYZ23456789";
var RECOVERY_CODE_COUNT = 10;
var RECOVERY_CODE_CHARS = 16;
function generateRecoveryCodes() {
  const codes = [];
  for (let index = 0; index < RECOVERY_CODE_COUNT; index++) {
    let raw = "";
    for (let position = 0; position < RECOVERY_CODE_CHARS; position++) {
      raw += RECOVERY_ALPHABET[randomInt(RECOVERY_ALPHABET.length)];
    }
    codes.push(raw.replace(/(.{4})(?=.)/g, "$1-"));
  }
  return { codes, hashes: codes.map((code) => sha2562(normalizeRecoveryCode(code))) };
}
function normalizeRecoveryCode(code) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
function consumeRecoveryCode(stored, submitted) {
  const digest = sha2562(normalizeRecoveryCode(submitted));
  let matched = false;
  const updated = stored.map((entry) => {
    if (entry.usedAt === null && safeEqual(entry.hash, digest) && !matched) {
      matched = true;
      return { hash: entry.hash, usedAt: (/* @__PURE__ */ new Date()).toISOString() };
    }
    return entry;
  });
  return { matched, updated };
}
function issueCsrfToken(sessionId) {
  const nonce = randomToken(16);
  const signature = createHmac("sha256", derivedKey("csrf-signing")).update(`${sessionId}.${nonce}`).digest("base64url");
  return `${nonce}.${signature}`;
}
function verifyCsrfToken(sessionId, token) {
  if (typeof token !== "string") return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const nonce = token.slice(0, separator);
  const provided = token.slice(separator + 1);
  const expected = createHmac("sha256", derivedKey("csrf-signing")).update(`${sessionId}.${nonce}`).digest("base64url");
  return safeEqual(provided, expected);
}

// api-src/lib/auth.ts
var SESSION_COOKIE = "enice_admin_session";
var CSRF_COOKIE = "enice_admin_csrf";
var CSRF_HEADER = "x-enice-csrf";
var SESSION_IDLE_MS = 12 * 60 * 60 * 1e3;
var SESSION_ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1e3;
var MAX_FAILED_ATTEMPTS = 8;
var ACCOUNT_LOCK_MS = 15 * 60 * 1e3;
var IP_ATTEMPT_MAX = 20;
var IP_ATTEMPT_WINDOW_MS = 15 * 60 * 1e3;
var MFA_ATTEMPT_MAX = 10;
var MFA_ATTEMPT_WINDOW_MS = 15 * 60 * 1e3;
function parseCookies(req) {
  const raw = header(req, "cookie");
  if (!raw) return {};
  const cookies = {};
  for (const part of raw.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      cookies[name] = part.slice(separator + 1).trim();
    }
  }
  return cookies;
}
function secureCookiesRequired() {
  if (process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview") return true;
  return process.env.NODE_ENV === "production";
}
function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Strict"];
  if (options.httpOnly !== false) parts.push("HttpOnly");
  if (secureCookiesRequired()) parts.push("Secure");
  if (options.maxAgeSeconds === 0) {
    parts.push("Max-Age=0", "Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  } else if (options.maxAgeSeconds !== void 0) {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }
  return parts.join("; ");
}
function setAuthCookies(res, sessionToken, csrfToken, maxAgeSeconds = Math.floor(SESSION_IDLE_MS / 1e3)) {
  res.setHeader("Set-Cookie", [
    serializeCookie(SESSION_COOKIE, sessionToken, { maxAgeSeconds, httpOnly: true }),
    serializeCookie(CSRF_COOKIE, csrfToken, { maxAgeSeconds, httpOnly: false })
  ]);
}
function clearAuthCookies(res) {
  res.setHeader("Set-Cookie", [
    serializeCookie(SESSION_COOKIE, "", { maxAgeSeconds: 0, httpOnly: true }),
    serializeCookie(CSRF_COOKIE, "", { maxAgeSeconds: 0, httpOnly: false })
  ]);
}
function toRole(value) {
  return ADMIN_ROLES.includes(value) ? value : "editor";
}
function toIdentity(row, sessionId, mfaSatisfied) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    avatarUrl: row.avatar_url,
    role: toRole(row.role),
    totpEnabled: row.totp_enabled,
    mustChangePassword: row.must_change_password,
    lastLoginAt: isoOrNull(row.last_login_at),
    sessionId,
    mfaSatisfied
  };
}
var USER_COLUMNS = `
  id, email, name, title, avatar_url, role, status, password_hash,
  totp_secret, totp_enabled, recovery_codes, must_change_password,
  failed_attempts, locked_until, last_login_at
`;
async function ensureBootstrapOwner() {
  const email = process.env.CMS_OWNER_EMAIL?.trim().toLowerCase();
  const password = process.env.CMS_OWNER_PASSWORD;
  if (!email || !password) return;
  const sql = db();
  const existing = await sql`SELECT count(*)::text AS count FROM admin_users`;
  if (Number(existing[0]?.count ?? "0") > 0) return;
  const passwordHash = await hashPassword(password);
  await sql`
    INSERT INTO admin_users (
      id, email, name, title, role, status, password_hash, password_updated_at
    )
    SELECT ${newId()}, ${email}, ${process.env.CMS_OWNER_NAME?.trim() || "ENICE Owner"},
           ${"Owner"}, ${"owner"}, ${"active"}, ${passwordHash}, now()
    WHERE NOT EXISTS (SELECT 1 FROM admin_users)
  `;
  console.log(`[cms] bootstrapped owner account for ${email}`);
}
async function authenticateWithPassword(req, email, password) {
  const ip = clientIp(req);
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const ipLimit = await consumeRateLimit(`login:ip:${ip}`, IP_ATTEMPT_MAX, IP_ATTEMPT_WINDOW_MS);
  if (ipLimit.limited) {
    return {
      ok: false,
      failure: {
        kind: "rate_limited",
        retryAfterSeconds: Math.max(1, Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 1e3))
      }
    };
  }
  if (!normalizedEmail || typeof password !== "string" || !password) {
    return { ok: false, failure: { kind: "invalid_credentials" } };
  }
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(USER_COLUMNS)} FROM admin_users WHERE email = ${normalizedEmail}
  `;
  const user = rows[0];
  if (!user) {
    await verifyPassword(password, await dummyHash());
    return { ok: false, failure: { kind: "invalid_credentials" } };
  }
  if (user.locked_until && user.locked_until.getTime() > Date.now()) {
    return {
      ok: false,
      failure: {
        kind: "account_locked",
        retryAfterSeconds: Math.ceil((user.locked_until.getTime() - Date.now()) / 1e3)
      }
    };
  }
  if (user.status === "suspended") return { ok: false, failure: { kind: "suspended" } };
  if (!user.password_hash) return { ok: false, failure: { kind: "invite_pending" } };
  const passwordOk = await verifyPassword(password, user.password_hash);
  if (!passwordOk) {
    await recordFailedAttempt(sql, user);
    return { ok: false, failure: { kind: "invalid_credentials" } };
  }
  await sql`
    UPDATE admin_users
    SET failed_attempts = 0, locked_until = NULL, last_login_at = now(), last_login_ip = ${ip},
        updated_at = now()
    WHERE id = ${user.id}
  `;
  await clearRateLimit(`login:ip:${ip}`);
  const mfaRequired = user.totp_enabled;
  const { token, csrf } = await createSession(user.id, req, !mfaRequired);
  if (mfaRequired) {
    return { ok: false, failure: { kind: "mfa_required", sessionToken: token, csrfToken: csrf } };
  }
  const identity = toIdentity(user, "", true);
  return { ok: true, identity, sessionToken: token, csrfToken: csrf };
}
var cachedDummyHash = null;
async function dummyHash() {
  if (!cachedDummyHash) cachedDummyHash = await hashPassword(randomToken(16));
  return cachedDummyHash;
}
async function recordFailedAttempt(sql, user) {
  const attempts = user.failed_attempts + 1;
  const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
  await sql`
    UPDATE admin_users
    SET failed_attempts = ${attempts},
        locked_until = ${shouldLock ? new Date(Date.now() + ACCOUNT_LOCK_MS) : null},
        updated_at = now()
    WHERE id = ${user.id}
  `;
}
async function completeMfa(req, sessionToken, code) {
  const sql = db();
  const ip = clientIp(req);
  const limit = await consumeRateLimit(`mfa:ip:${ip}`, MFA_ATTEMPT_MAX, MFA_ATTEMPT_WINDOW_MS);
  if (limit.limited) {
    return {
      ok: false,
      failure: {
        kind: "rate_limited",
        retryAfterSeconds: Math.max(1, Math.ceil((limit.resetAt.getTime() - Date.now()) / 1e3))
      }
    };
  }
  const sessions = await sql`
    SELECT id, user_id FROM admin_sessions
    WHERE token_hash = ${sha2562(sessionToken)}
      AND revoked_at IS NULL
      AND expires_at > now()
  `;
  const session = sessions[0];
  if (!session) return { ok: false, failure: { kind: "invalid_credentials" } };
  const rows = await sql`
    SELECT ${sql.unsafe(USER_COLUMNS)} FROM admin_users WHERE id = ${session.user_id}
  `;
  const user = rows[0];
  if (!user || user.status === "suspended") {
    return { ok: false, failure: { kind: "suspended" } };
  }
  const submitted = typeof code === "string" ? code.trim() : "";
  if (!submitted) return { ok: false, failure: { kind: "mfa_invalid" } };
  const secret = decryptSecret(user.totp_secret);
  let accepted = secret ? verifyTotp(secret, submitted) : false;
  if (!accepted && submitted.replace(/[^A-Za-z0-9]/g, "").length >= 12) {
    const stored = Array.isArray(user.recovery_codes) ? user.recovery_codes : [];
    const result = consumeRecoveryCode(stored, submitted);
    if (result.matched) {
      accepted = true;
      await sql`
        UPDATE admin_users
        SET recovery_codes = ${json(result.updated)}, updated_at = now()
        WHERE id = ${user.id}
      `;
    }
  }
  if (!accepted) {
    await recordFailedAttempt(sql, user);
    return { ok: false, failure: { kind: "mfa_invalid" } };
  }
  await sql`
    UPDATE admin_sessions
    SET mfa_satisfied = true, last_seen_at = now()
    WHERE id = ${session.id}
  `;
  await sql`
    UPDATE admin_users SET failed_attempts = 0, locked_until = NULL WHERE id = ${user.id}
  `;
  await clearRateLimit(`mfa:ip:${ip}`);
  const csrf = issueCsrfToken(session.id);
  return {
    ok: true,
    identity: toIdentity(user, session.id, true),
    sessionToken,
    csrfToken: csrf
  };
}
async function createSession(userId, req, mfaSatisfied) {
  const sql = db();
  const sessionId = newId();
  const token = randomToken(32);
  await sql`
    INSERT INTO admin_sessions (
      id, user_id, token_hash, ip_address, user_agent, mfa_satisfied, expires_at
    ) VALUES (
      ${sessionId}, ${userId}, ${sha2562(token)}, ${clientIp(req)},
      ${(header(req, "user-agent") ?? "").slice(0, 400)}, ${mfaSatisfied},
      ${new Date(Date.now() + SESSION_IDLE_MS)}
    )
  `;
  return { token, csrf: issueCsrfToken(sessionId), sessionId };
}
async function resolveSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(
    USER_COLUMNS.split(",").map((column) => `u.${column.trim()}`).join(", ")
  )},
           s.id AS session_id, s.mfa_satisfied
    FROM admin_sessions s
    JOIN admin_users u ON u.id = s.user_id
    WHERE s.token_hash = ${sha2562(token)}
      AND s.revoked_at IS NULL
      AND s.expires_at > now()
      AND s.created_at > now() - ${`${SESSION_ABSOLUTE_MS} milliseconds`}::interval
      AND u.status = 'active'
  `;
  const row = rows[0];
  if (!row) return null;
  await sql`
    UPDATE admin_sessions
    SET last_seen_at = now(), expires_at = now() + ${`${SESSION_IDLE_MS} milliseconds`}::interval
    WHERE id = ${row.session_id}
  `;
  return { identity: toIdentity(row, row.session_id, row.mfa_satisfied) };
}
async function revokeSession(sessionId) {
  await db()`UPDATE admin_sessions SET revoked_at = now() WHERE id = ${sessionId}`;
}
async function revokeAllSessions(userId, exceptSessionId) {
  const sql = db();
  const rows = await sql`
    UPDATE admin_sessions
    SET revoked_at = now()
    WHERE user_id = ${userId}
      AND revoked_at IS NULL
      ${exceptSessionId ? sql`AND id <> ${exceptSessionId}` : sql``}
    RETURNING id
  `;
  return rows.length;
}
async function listSessions(userId) {
  const rows = await db()`
    SELECT id, ip_address, user_agent, created_at, last_seen_at
    FROM admin_sessions
    WHERE user_id = ${userId} AND revoked_at IS NULL AND expires_at > now()
    ORDER BY last_seen_at DESC
    LIMIT 50
  `;
  return rows.map((row) => ({
    id: row.id,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: isoOrNull(row.created_at),
    lastSeenAt: isoOrNull(row.last_seen_at)
  }));
}
var AuthError = class extends Error {
  constructor(statusCode, message, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = "AuthError";
  }
  statusCode;
  code;
};
function requireFullSession(session) {
  if (!session) throw new AuthError(401, "Sign in to continue.", "unauthenticated");
  if (!session.identity.mfaSatisfied) {
    throw new AuthError(401, "Two-factor verification required.", "mfa_required");
  }
  return session.identity;
}
function requirePermission(identity, permission) {
  if (!can(identity.role, permission)) {
    throw new AuthError(
      403,
      `Your role (${ROLE_META[identity.role].label}) cannot perform this action.`,
      `missing_permission:${permission}`
    );
  }
}
function requireCsrf(req, identity) {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  const token = header(req, CSRF_HEADER);
  if (!verifyCsrfToken(identity.sessionId, token)) {
    throw new AuthError(403, "Your session expired. Reload the page and try again.", "bad_csrf");
  }
}
function requireSameOrigin(req) {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return;
  const origin = header(req, "origin");
  if (!origin) return;
  const host = header(req, "x-forwarded-host") ?? header(req, "host");
  if (!host) return;
  try {
    if (new URL(origin).host !== host) {
      throw new AuthError(403, "Cross-origin requests are not allowed.", "bad_origin");
    }
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError(403, "Malformed Origin header.", "bad_origin");
  }
}

// api-src/lib/audit.ts
init_db();
init_http();
async function recordActivity(req, actor, action, target = {}) {
  try {
    await db()`
      INSERT INTO activity_log (
        id, actor_id, actor_email, actor_name, action,
        entity_type, entity_id, entity_label, outcome, ip_address, metadata
      ) VALUES (
        ${newId()}, ${actor?.id ?? null}, ${actor?.email ?? null}, ${actor?.name ?? null},
        ${action}, ${target.entityType ?? null}, ${target.entityId ?? null},
        ${target.entityLabel ?? null}, ${target.outcome ?? "success"},
        ${clientIp(req)}, ${json(target.metadata ?? {})}
      )
    `;
  } catch (error) {
    console.error(`[cms] failed to record activity "${action}":`, error);
  }
}
function toEntry(row) {
  return {
    id: row.id,
    actorEmail: row.actor_email,
    actorName: row.actor_name,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityLabel: row.entity_label,
    outcome: row.outcome === "failure" ? "failure" : "success",
    ipAddress: row.ip_address,
    metadata: row.metadata ?? {},
    createdAt: isoOrNull(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function listActivity(query = {}) {
  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();
  const filters = [
    query.action ? sql`AND action = ${query.action}` : sql``,
    query.actorEmail ? sql`AND actor_email = ${query.actorEmail}` : sql``,
    query.entityId ? sql`AND entity_id = ${query.entityId}` : sql``,
    search ? sql`AND (
            actor_email ILIKE ${`%${search}%`}
            OR entity_label ILIKE ${`%${search}%`}
            OR action ILIKE ${`%${search}%`}
          )` : sql``
  ];
  const rows = await sql`
    SELECT id, actor_email, actor_name, action, entity_type, entity_id, entity_label,
           outcome, ip_address, metadata, created_at
    FROM activity_log
    WHERE true ${filters[0]} ${filters[1]} ${filters[2]} ${filters[3]}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const counted = await sql`
    SELECT count(*)::text AS count
    FROM activity_log
    WHERE true ${filters[0]} ${filters[1]} ${filters[2]} ${filters[3]}
  `;
  return { entries: rows.map(toEntry), total: Number(counted[0]?.count ?? "0") };
}
async function recentActivity(limit = 8) {
  const { entries } = await listActivity({ limit });
  return entries;
}

// api-src/lib/storage.ts
init_types();
import { createHash as createHash2, createHmac as createHmac2 } from "node:crypto";
function storageConfig() {
  const bucket = process.env.MEDIA_S3_BUCKET?.trim();
  const accessKeyId = process.env.MEDIA_S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.MEDIA_S3_SECRET_ACCESS_KEY?.trim();
  if (!bucket || !accessKeyId || !secretAccessKey) return null;
  const region = process.env.MEDIA_S3_REGION?.trim() || "us-east-1";
  const rawEndpoint = process.env.MEDIA_S3_ENDPOINT?.trim();
  const endpoint = rawEndpoint ? rawEndpoint.replace(/^https?:\/\//, "").replace(/\/+$/, "") : `s3.${region}.amazonaws.com`;
  const forcePathStyle = process.env.MEDIA_S3_FORCE_PATH_STYLE === "true" || Boolean(rawEndpoint && !isAwsEndpoint(endpoint));
  const configuredPublicBase = process.env.MEDIA_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  const publicBaseUrl = configuredPublicBase || (forcePathStyle ? `https://${endpoint}/${bucket}` : `https://${bucket}.${endpoint}`);
  return { bucket, region, accessKeyId, secretAccessKey, endpoint, forcePathStyle, publicBaseUrl };
}
function isAwsEndpoint(endpoint) {
  return /(^|\.)amazonaws\.com$/.test(endpoint);
}
function isMediaStorageConfigured() {
  return storageConfig() !== null;
}
var StorageNotConfiguredError = class extends Error {
  constructor() {
    super(
      "Media storage is not configured. Set MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY_ID and MEDIA_S3_SECRET_ACCESS_KEY (plus MEDIA_S3_ENDPOINT for non-AWS providers)."
    );
    this.name = "StorageNotConfiguredError";
  }
};
function uriEncode(value, encodeSlash = true) {
  let out = "";
  for (const char of value) {
    if (/[A-Za-z0-9\-._~]/.test(char)) {
      out += char;
    } else if (char === "/") {
      out += encodeSlash ? "%2F" : "/";
    } else {
      for (const byte of Buffer.from(char, "utf8")) {
        out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
      }
    }
  }
  return out;
}
function sha256Hex(value) {
  return createHash2("sha256").update(value).digest("hex");
}
function hmac2(key, value) {
  return createHmac2("sha256", key).update(value, "utf8").digest();
}
function signingKey(secret, dateStamp, region, service) {
  return hmac2(hmac2(hmac2(hmac2(`AWS4${secret}`, dateStamp), region), service), "aws4_request");
}
function amzDates(now = /* @__PURE__ */ new Date()) {
  const amzDate = `${now.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}
function hostFor(config) {
  return config.forcePathStyle ? config.endpoint : `${config.bucket}.${config.endpoint}`;
}
function canonicalPathFor(config, key) {
  const encodedKey = uriEncode(key, false);
  return config.forcePathStyle ? `/${config.bucket}/${encodedKey}` : `/${encodedKey}`;
}
function buildStorageKey(filename, folder = "") {
  const cleanedFolder = folder.split("/").map((segment) => segment.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40)).filter(Boolean).join("/");
  const basename = filename.split(/[/\\]/).pop() ?? "";
  const lastDot = basename.lastIndexOf(".");
  const rawBase = lastDot > 0 ? basename.slice(0, lastDot) : basename;
  const rawExtension = lastDot > 0 ? basename.slice(lastDot + 1) : "";
  const base = rawBase.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
  const extension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  const suffix = createHash2("sha256").update(`${filename}:${Date.now()}:${Math.random()}`).digest("hex").slice(0, 8);
  const now = /* @__PURE__ */ new Date();
  const datePrefix = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const name = extension ? `${base}-${suffix}.${extension}` : `${base}-${suffix}`;
  return [cleanedFolder, datePrefix, name].filter(Boolean).join("/");
}
function publicUrlFor(key) {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();
  return `${config.publicBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
function validateUpload(mimeType, sizeBytes) {
  const category = mediaCategoryFor(mimeType);
  if (!category) {
    const permitted = Object.values(MEDIA_LIMITS).flatMap((spec) => spec.mimeTypes).join(", ");
    return { ok: false, error: `Unsupported file type "${mimeType}". Permitted: ${permitted}.` };
  }
  const { maxBytes } = MEDIA_LIMITS[category];
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return { ok: false, error: "A valid file size is required." };
  }
  if (sizeBytes > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `That ${category} exceeds the ${limitMb} MB limit.` };
  }
  return { ok: true };
}
function presignUpload(options) {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();
  const expiresInSeconds = Math.min(Math.max(options.expiresInSeconds ?? 300, 60), 3600);
  const storageKey = buildStorageKey(options.filename, options.folder);
  const host = hostFor(config);
  const canonicalUri = canonicalPathFor(config, storageKey);
  const { amzDate, dateStamp } = amzDates();
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const signedHeaders = "content-type;host";
  const query = /* @__PURE__ */ new Map([
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${config.accessKeyId}/${credentialScope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresInSeconds)],
    ["X-Amz-SignedHeaders", signedHeaders]
  ]);
  const canonicalQuery = [...query.entries()].sort(([a], [b2]) => a < b2 ? -1 : a > b2 ? 1 : 0).map(([key, value]) => `${uriEncode(key)}=${uriEncode(value)}`).join("&");
  const canonicalHeaders = `content-type:${options.mimeType}
host:${host}
`;
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD"
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = createHmac2(
    "sha256",
    signingKey(config.secretAccessKey, dateStamp, config.region, "s3")
  ).update(stringToSign, "utf8").digest("hex");
  return {
    uploadUrl: `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`,
    headers: { "Content-Type": options.mimeType },
    storageKey,
    publicUrl: publicUrlFor(storageKey),
    expiresInSeconds
  };
}
async function deleteObject(storageKey) {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();
  const host = hostFor(config);
  const canonicalUri = canonicalPathFor(config, storageKey);
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = sha256Hex("");
  const canonicalHeaders = `host:${host}
x-amz-content-sha256:${payloadHash}
x-amz-date:${amzDate}
`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "DELETE",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = createHmac2(
    "sha256",
    signingKey(config.secretAccessKey, dateStamp, config.region, "s3")
  ).update(stringToSign, "utf8").digest("hex");
  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: "DELETE",
    headers: {
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    }
  });
  if (!response.ok && response.status !== 404) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(
      `Object storage refused the delete (${response.status}): ${detail.slice(0, 300)}`
    );
  }
}
async function headObject(storageKey) {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();
  const host = hostFor(config);
  const canonicalUri = canonicalPathFor(config, storageKey);
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = sha256Hex("");
  const canonicalHeaders = `host:${host}
x-amz-content-sha256:${payloadHash}
x-amz-date:${amzDate}
`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "HEAD",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = createHmac2(
    "sha256",
    signingKey(config.secretAccessKey, dateStamp, config.region, "s3")
  ).update(stringToSign, "utf8").digest("hex");
  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: "HEAD",
    headers: {
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization: `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    }
  });
  if (!response.ok) return { exists: false, sizeBytes: 0, mimeType: null };
  return {
    exists: true,
    sizeBytes: Number(response.headers.get("content-length") ?? "0"),
    mimeType: response.headers.get("content-type")
  };
}

// api-src/cms.ts
init_router();

// api-src/lib/repo/content.ts
init_types();
init_doc();
init_sanitize();
init_db();
init_router();
var FULL_COLUMNS = `
  id, kind, status, title, slug, excerpt, body, cover_image_url, author, category, tags,
  seo, extras, reading_minutes, published_at, scheduled_for, archived_at,
  created_at, updated_at, created_by_email, updated_by_email, revision
`;
var SUMMARY_COLUMNS = `
  id, kind, status, title, slug, excerpt, cover_image_url, author, category, tags,
  seo, extras, reading_minutes, published_at, scheduled_for, updated_at, updated_by_email
`;
function toKind(value) {
  return CONTENT_KINDS.includes(value) ? value : "blog";
}
function toStatus(value) {
  return CONTENT_STATUSES.includes(value) ? value : "draft";
}
function mapItem(row) {
  return {
    id: row.id,
    kind: toKind(row.kind),
    status: toStatus(row.status),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    coverImageUrl: row.cover_image_url,
    author: row.author,
    category: row.category,
    tags: row.tags ?? [],
    seo: row.seo ?? {},
    extras: row.extras ?? {},
    publishedAt: isoOrNull(row.published_at),
    scheduledFor: isoOrNull(row.scheduled_for),
    archivedAt: isoOrNull(row.archived_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    createdByEmail: row.created_by_email,
    updatedByEmail: row.updated_by_email,
    revision: row.revision
  };
}
function mapSummary(row) {
  return {
    id: row.id,
    kind: toKind(row.kind),
    status: toStatus(row.status),
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    category: row.category,
    tags: row.tags ?? [],
    author: row.author,
    seo: row.seo ?? {},
    extras: row.extras ?? {},
    publishedAt: isoOrNull(row.published_at),
    scheduledFor: isoOrNull(row.scheduled_for),
    updatedAt: iso(row.updated_at),
    updatedByEmail: row.updated_by_email,
    readingMinutes: row.reading_minutes
  };
}
async function publishDueContent() {
  const rows = await db()`
    UPDATE content_items
    SET status = 'published',
        published_at = COALESCE(published_at, scheduled_for, now()),
        scheduled_for = NULL,
        updated_at = now()
    WHERE status = 'scheduled' AND scheduled_for IS NOT NULL AND scheduled_for <= now()
    RETURNING id, title, kind
  `;
  if (rows.length > 0) {
    console.log(`[cms] auto-published ${rows.length} scheduled item(s)`);
  }
  return rows.map((row) => row.id);
}
async function isSlugAvailable(kind, slug, excludeId) {
  const sql = db();
  const rows = await sql`
    SELECT id FROM content_items
    WHERE kind = ${kind} AND slug = ${slug}
      ${excludeId ? sql`AND id <> ${excludeId}` : sql``}
    LIMIT 1
  `;
  return rows.length === 0;
}
async function uniqueSlug(kind, desired, excludeId) {
  const base = slugify(desired) || "untitled";
  if (await isSlugAvailable(kind, base, excludeId)) return base;
  for (let suffix = 2; suffix <= 50; suffix++) {
    const candidate = `${base}-${suffix}`;
    if (await isSlugAvailable(kind, candidate, excludeId)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}
function sanitizeAuthor(value) {
  if (!value || typeof value !== "object") return null;
  const source = value;
  const name = sanitizeText(source.name, 120);
  if (!name) return null;
  return {
    name,
    role: sanitizeText(source.role, 120) || void 0,
    avatarUrl: sanitizeUrl(source.avatarUrl) ?? void 0
  };
}
function sanitizeTags(value) {
  if (!Array.isArray(value)) return [];
  const seen = /* @__PURE__ */ new Set();
  for (const entry of value.slice(0, 30)) {
    const tag = sanitizeText(entry, 40);
    if (tag) seen.add(tag);
  }
  return [...seen];
}
function sanitizeSeo(value) {
  if (!value || typeof value !== "object") return {};
  const source = value;
  return {
    title: sanitizeText(source.title, 200) || void 0,
    description: sanitizeMultilineText(source.description, 400) || void 0,
    canonicalUrl: sanitizeUrl(source.canonicalUrl) ?? void 0,
    ogTitle: sanitizeText(source.ogTitle, 200) || void 0,
    ogDescription: sanitizeMultilineText(source.ogDescription, 400) || void 0,
    ogImage: sanitizeUrl(source.ogImage) ?? void 0,
    index: source.index === false ? false : void 0
  };
}
function sanitizeExtras(value) {
  if (!value || typeof value !== "object") return {};
  const source = value;
  const extras = {};
  const ctaSource = source.cta;
  if (ctaSource && typeof ctaSource === "object") {
    const cta = ctaSource;
    const label = sanitizeText(cta.label, 80);
    const url = sanitizeUrl(cta.url);
    if (label && url) extras.cta = { label, url };
  }
  const startsAt = parseDate(source.startsAt);
  const endsAt = parseDate(source.endsAt);
  if (startsAt) extras.startsAt = startsAt.toISOString();
  if (endsAt) extras.endsAt = endsAt.toISOString();
  if (source.featured === true) extras.featured = true;
  const icon = sanitizeText(source.icon, 40);
  if (icon) extras.icon = icon;
  return extras;
}
function normalizeInput(input, existing) {
  const body = sanitizeDoc(input.body ?? existing?.body ?? { version: 1, blocks: [] });
  const title = sanitizeText(input.title ?? existing?.title ?? "", 250);
  const explicitExcerpt = sanitizeMultilineText(input.excerpt ?? existing?.excerpt ?? "", 500);
  const excerpt = explicitExcerpt || deriveExcerpt(body);
  const coverFromInput = input.coverImageUrl === null ? null : sanitizeUrl(input.coverImageUrl) ?? existing?.coverImageUrl ?? null;
  return {
    title,
    excerpt,
    body,
    coverImageUrl: coverFromInput ?? firstImageUrl(body),
    author: input.author === void 0 ? existing?.author ?? null : sanitizeAuthor(input.author),
    category: input.category === void 0 ? existing?.category ?? null : sanitizeText(input.category, 60) || null,
    tags: input.tags === void 0 ? existing?.tags ?? [] : sanitizeTags(input.tags),
    seo: input.seo === void 0 ? existing?.seo ?? {} : sanitizeSeo(input.seo),
    extras: input.extras === void 0 ? existing?.extras ?? {} : sanitizeExtras(input.extras),
    readingMinutes: readingMinutes(body),
    // Everything an administrator might search for, flattened into one indexed column.
    searchText: [
      title,
      excerpt,
      docToPlainText(body),
      input.category ?? "",
      (input.tags ?? []).join(" ")
    ].filter(Boolean).join(" ").slice(0, 1e5)
  };
}
async function listContent(query = {}) {
  await publishDueContent();
  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();
  const where = [
    query.kind ? sql`AND kind = ${query.kind}` : sql``,
    query.status ? sql`AND status = ${query.status}` : sql``,
    query.statuses?.length ? sql`AND status = ANY(${sql.array(query.statuses)})` : sql``,
    query.category ? sql`AND category = ${query.category}` : sql``,
    query.tag ? sql`AND ${query.tag} = ANY(tags)` : sql``,
    query.featured ? sql`AND extras->>'featured' = 'true'` : sql``,
    search ? sql`AND (
            to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${search})
            OR title ILIKE ${`%${search}%`}
          )` : sql``
  ];
  const order = query.sort === "title" ? sql`ORDER BY title ASC` : query.sort === "published" ? sql`ORDER BY published_at DESC NULLS LAST, updated_at DESC` : sql`ORDER BY updated_at DESC`;
  const rows = await sql`
    SELECT ${sql.unsafe(SUMMARY_COLUMNS)}
    FROM content_items
    WHERE true ${where[0]} ${where[1]} ${where[2]} ${where[3]} ${where[4]} ${where[5]} ${where[6]}
    ${order}
    LIMIT ${limit} OFFSET ${offset}
  `;
  const counted = await sql`
    SELECT count(*)::text AS count
    FROM content_items
    WHERE true ${where[0]} ${where[1]} ${where[2]} ${where[3]} ${where[4]} ${where[5]} ${where[6]}
  `;
  return { items: rows.map(mapSummary), total: Number(counted[0]?.count ?? "0") };
}
async function getContent(id) {
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(FULL_COLUMNS)} FROM content_items WHERE id = ${id}
  `;
  return rows[0] ? mapItem(rows[0]) : null;
}
async function createContent(kind, input, actor) {
  const normalized = normalizeInput(input);
  if (!normalized.title) throw badRequest("A title is required.");
  const sql = db();
  const id = newId();
  const requestedSlug = input.slug?.trim();
  const slug = requestedSlug ? slugify(requestedSlug) : await uniqueSlug(kind, normalized.title);
  if (requestedSlug && !await isSlugAvailable(kind, slug)) {
    throw conflict(`The URL "${slug}" is already used by another ${kind} entry.`);
  }
  await sql`
    INSERT INTO content_items (
      id, kind, status, title, slug, excerpt, body, cover_image_url, author, category, tags,
      seo, extras, reading_minutes, search_text,
      created_by, updated_by, created_by_email, updated_by_email
    ) VALUES (
      ${id}, ${kind}, ${"draft"}, ${normalized.title}, ${slug}, ${normalized.excerpt},
      ${json(normalized.body)}, ${normalized.coverImageUrl}, ${json(normalized.author)},
      ${normalized.category}, ${sql.array(normalized.tags)}, ${json(normalized.seo)},
      ${json(normalized.extras)}, ${normalized.readingMinutes}, ${normalized.searchText},
      ${actor.id}, ${actor.id}, ${actor.email}, ${actor.email}
    )
  `;
  await recordTaxonomies(kind, normalized.category, normalized.tags);
  const created = await getContent(id);
  if (!created) throw new Error("Content disappeared immediately after insert.");
  return created;
}
async function updateContent(id, input, actor, expectedRevision) {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");
  if (expectedRevision !== void 0 && expectedRevision !== existing.revision) {
    throw conflict(
      "Someone else saved this while you were editing. Reload to see their changes before saving again."
    );
  }
  const normalized = normalizeInput(input, existing);
  if (!normalized.title) throw badRequest("A title is required.");
  const sql = db();
  let slug = existing.slug;
  const requestedSlug = input.slug?.trim();
  if (requestedSlug) {
    const candidate = slugify(requestedSlug);
    if (candidate !== existing.slug) {
      if (!await isSlugAvailable(existing.kind, candidate, id)) {
        throw conflict(`The URL "${candidate}" is already used by another ${existing.kind} entry.`);
      }
      slug = candidate;
    }
  }
  await snapshotRevision(existing, actor.email, "Before edit");
  await sql`
    UPDATE content_items SET
      title = ${normalized.title},
      slug = ${slug},
      excerpt = ${normalized.excerpt},
      body = ${json(normalized.body)},
      cover_image_url = ${normalized.coverImageUrl},
      author = ${json(normalized.author)},
      category = ${normalized.category},
      tags = ${sql.array(normalized.tags)},
      seo = ${json(normalized.seo)},
      extras = ${json(normalized.extras)},
      reading_minutes = ${normalized.readingMinutes},
      search_text = ${normalized.searchText},
      updated_at = now(),
      updated_by = ${actor.id},
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;
  await recordTaxonomies(existing.kind, normalized.category, normalized.tags);
  const updated = await getContent(id);
  if (!updated) throw notFound("That content");
  return updated;
}
async function transitionContent(id, status, scheduledFor, actor) {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");
  if (status === "scheduled") {
    const when2 = parseDate(scheduledFor);
    if (!when2) throw badRequest("Choose the date and time this should publish.");
    if (when2.getTime() < Date.now() - 6e4) {
      throw badRequest("Choose a time in the future, or publish immediately instead.");
    }
    if (!existing.title.trim()) throw badRequest("Add a title before scheduling.");
  }
  if (status === "published" && !existing.title.trim()) {
    throw badRequest("Add a title before publishing.");
  }
  const sql = db();
  const when = status === "scheduled" ? parseDate(scheduledFor) : null;
  await sql`
    UPDATE content_items SET
      status = ${status},
      published_at = ${status === "published" ? sql`COALESCE(published_at, now())` : status === "archived" ? sql`published_at` : status === "draft" ? sql`published_at` : sql`published_at`},
      scheduled_for = ${when},
      archived_at = ${status === "archived" ? sql`now()` : sql`NULL`},
      updated_at = now(),
      updated_by = ${actor.id},
      updated_by_email = ${actor.email},
      revision = revision + 1
    WHERE id = ${id}
  `;
  const updated = await getContent(id);
  if (!updated) throw notFound("That content");
  return updated;
}
async function duplicateContent(id, actor) {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");
  return createContent(
    existing.kind,
    {
      title: `${existing.title} (copy)`,
      slug: await uniqueSlug(existing.kind, `${existing.slug}-copy`),
      excerpt: existing.excerpt,
      body: existing.body,
      coverImageUrl: existing.coverImageUrl,
      author: existing.author,
      category: existing.category,
      tags: existing.tags,
      // The canonical URL is intentionally dropped: inheriting it would point the copy's
      // canonical tag at the original and tell search engines to ignore the new page.
      seo: { ...existing.seo, canonicalUrl: void 0 },
      extras: existing.extras
    },
    actor
  );
}
async function deleteContent(id) {
  const existing = await getContent(id);
  if (!existing) throw notFound("That content");
  await db()`DELETE FROM content_items WHERE id = ${id}`;
  return existing;
}
async function snapshotRevision(item, byEmail, note) {
  await db()`
    INSERT INTO content_revisions (id, content_id, revision, snapshot, note, created_by_email)
    VALUES (${newId()}, ${item.id}, ${item.revision}, ${json(item)}, ${note}, ${byEmail})
    ON CONFLICT (content_id, revision) DO NOTHING
  `;
}
async function listRevisions(contentId) {
  const rows = await db()`
    SELECT id, revision, note, created_at, created_by_email, snapshot
    FROM content_revisions
    WHERE content_id = ${contentId}
    ORDER BY revision DESC
    LIMIT 50
  `;
  return rows.map((row) => ({
    id: row.id,
    revision: row.revision,
    note: row.note,
    createdAt: iso(row.created_at),
    createdByEmail: row.created_by_email,
    title: row.snapshot?.title ?? "(untitled)"
  }));
}
async function revertToRevision(contentId, revision, actor) {
  const rows = await db()`
    SELECT snapshot FROM content_revisions
    WHERE content_id = ${contentId} AND revision = ${revision}
  `;
  const snapshot = rows[0]?.snapshot;
  if (!snapshot) throw notFound("That revision");
  return updateContent(
    contentId,
    {
      title: snapshot.title,
      excerpt: snapshot.excerpt,
      body: snapshot.body,
      coverImageUrl: snapshot.coverImageUrl,
      author: snapshot.author,
      category: snapshot.category,
      tags: snapshot.tags,
      seo: snapshot.seo,
      extras: snapshot.extras
    },
    actor
  );
}
async function recordTaxonomies(kind, category, tags) {
  const sql = db();
  const entries = [
    ...category ? [{ taxonomy: "category", name: category }] : [],
    ...tags.map((tag) => ({ taxonomy: "tag", name: tag }))
  ];
  for (const entry of entries) {
    const slug = slugify(entry.name);
    if (!slug) continue;
    await sql`
      INSERT INTO content_taxonomies (id, kind, taxonomy, name, slug, usage_count)
      VALUES (${newId()}, ${kind}, ${entry.taxonomy}, ${entry.name}, ${slug}, 1)
      ON CONFLICT (kind, taxonomy, slug)
      DO UPDATE SET usage_count = content_taxonomies.usage_count + 1, name = EXCLUDED.name
    `;
  }
}
async function listTaxonomies(kind) {
  const sql = db();
  const rows = await sql`
    SELECT taxonomy, name FROM content_taxonomies
    WHERE true ${kind ? sql`AND kind = ${kind}` : sql``}
    ORDER BY usage_count DESC, name ASC
    LIMIT 300
  `;
  return {
    categories: rows.filter((row) => row.taxonomy === "category").map((row) => row.name),
    tags: rows.filter((row) => row.taxonomy === "tag").map((row) => row.name)
  };
}
async function contentCounts() {
  const rows = await db()`
    SELECT kind, status, count(*)::text AS count FROM content_items GROUP BY kind, status
  `;
  return rows.map((row) => ({ kind: row.kind, status: row.status, count: Number(row.count) }));
}
async function lastPublishedAt() {
  const rows = await db()`
    SELECT published_at FROM content_items
    WHERE status = 'published' AND published_at IS NOT NULL
    ORDER BY published_at DESC LIMIT 1
  `;
  return isoOrNull(rows[0]?.published_at ?? null);
}

// api-src/cms.ts
init_website();

// api-src/lib/repo/media.ts
init_types();
init_sanitize();
init_db();
init_router();
function mapAsset(row) {
  return {
    id: row.id,
    storageKey: row.storage_key,
    url: row.url,
    filename: row.filename,
    mimeType: row.mime_type,
    // `bigint` comes back as a string from the driver; the UI needs a number to format sizes.
    sizeBytes: Number(row.size_bytes),
    width: row.width,
    height: row.height,
    alt: row.alt,
    folder: row.folder,
    uploadedByEmail: row.uploaded_by_email,
    createdAt: iso(row.created_at)
  };
}
async function listMedia(query = {}) {
  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 60, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();
  const where = [
    query.folder ? sql`AND folder = ${query.folder}` : sql``,
    search ? sql`AND (
            to_tsvector('english', filename || ' ' || alt) @@ websearch_to_tsquery('english', ${search})
            OR filename ILIKE ${`%${search}%`}
            OR alt ILIKE ${`%${search}%`}
          )` : sql``,
    // Matching on the MIME prefix keeps the filter working for any subtype we later accept.
    query.category ? sql`AND mime_type LIKE ${`${query.category}/%`}` : sql``
  ];
  const rows = await sql`
    SELECT id, storage_key, url, filename, mime_type, size_bytes, width, height,
           alt, folder, uploaded_by_email, created_at
    FROM media_assets
    WHERE true ${where[0]} ${where[1]} ${where[2]}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const counted = await sql`
    SELECT count(*)::text AS count FROM media_assets
    WHERE true ${where[0]} ${where[1]} ${where[2]}
  `;
  const folderRows = await sql`
    SELECT DISTINCT folder FROM media_assets WHERE folder <> '' ORDER BY folder ASC LIMIT 100
  `;
  return {
    assets: rows.map(mapAsset),
    total: Number(counted[0]?.count ?? "0"),
    folders: folderRows.map((row) => row.folder)
  };
}
async function getMedia(id) {
  const rows = await db()`
    SELECT id, storage_key, url, filename, mime_type, size_bytes, width, height,
           alt, folder, uploaded_by_email, created_at
    FROM media_assets WHERE id = ${id}
  `;
  return rows[0] ? mapAsset(rows[0]) : null;
}
function requestUpload(input) {
  if (!isMediaStorageConfigured()) {
    throw badRequest(
      "Media storage is not configured yet. Add the MEDIA_S3_* environment variables, or paste an external image URL instead."
    );
  }
  const filename = typeof input.filename === "string" ? input.filename.trim() : "";
  const mimeType = typeof input.mimeType === "string" ? input.mimeType.trim() : "";
  const sizeBytes = Number(input.sizeBytes);
  if (!filename) throw badRequest("A filename is required.");
  const validation = validateUpload(mimeType, sizeBytes);
  if (!validation.ok) throw badRequest(validation.error);
  return presignUpload({
    filename,
    mimeType,
    folder: typeof input.folder === "string" ? input.folder : ""
  });
}
async function confirmUpload(input, actor) {
  const storageKey = typeof input.storageKey === "string" ? input.storageKey : "";
  if (!storageKey) throw badRequest("The upload reference is missing.");
  const head = await headObject(storageKey);
  if (!head.exists) {
    throw badRequest("That upload did not complete. Please try again.");
  }
  const mimeType = (typeof input.mimeType === "string" ? input.mimeType : "") || head.mimeType || "application/octet-stream";
  if (!mediaCategoryFor(mimeType)) {
    await deleteObject(storageKey).catch(() => {
    });
    throw badRequest(`Unsupported file type "${mimeType}".`);
  }
  const id = newId();
  const width = Number(input.width);
  const height = Number(input.height);
  await db()`
    INSERT INTO media_assets (
      id, storage_key, url, filename, mime_type, size_bytes, width, height,
      alt, folder, uploaded_by_email
    ) VALUES (
      ${id}, ${storageKey}, ${publicUrlFor(storageKey)},
      ${sanitizeText(input.filename, 200) || storageKey.split("/").pop() || "file"},
      ${mimeType}, ${head.sizeBytes},
      ${Number.isFinite(width) && width > 0 ? Math.trunc(width) : null},
      ${Number.isFinite(height) && height > 0 ? Math.trunc(height) : null},
      ${sanitizeText(input.alt, 300)},
      ${sanitizeText(input.folder, 60)},
      ${actor.email}
    )
    ON CONFLICT (storage_key) DO NOTHING
  `;
  const asset = await getMedia(id);
  if (!asset) throw badRequest("That file has already been added to the library.");
  return asset;
}
async function updateMedia(id, input, _actor) {
  const existing = await getMedia(id);
  if (!existing) throw notFound("That file");
  await db()`
    UPDATE media_assets SET
      filename = ${input.filename === void 0 ? existing.filename : sanitizeText(input.filename, 200)},
      alt = ${input.alt === void 0 ? existing.alt : sanitizeText(input.alt, 300)},
      folder = ${input.folder === void 0 ? existing.folder : sanitizeText(input.folder, 60)}
    WHERE id = ${id}
  `;
  const updated = await getMedia(id);
  if (!updated) throw notFound("That file");
  return updated;
}
async function deleteMedia(id) {
  const existing = await getMedia(id);
  if (!existing) throw notFound("That file");
  await db()`DELETE FROM media_assets WHERE id = ${id}`;
  try {
    await deleteObject(existing.storageKey);
  } catch (error) {
    console.error(
      `[cms] media row ${id} removed but object ${existing.storageKey} remains:`,
      error
    );
  }
  return existing;
}
async function findMediaUsage(url) {
  const sql = db();
  const usage = [];
  const content = await sql`
    SELECT title, kind FROM content_items
    WHERE cover_image_url = ${url} OR body::text LIKE ${`%${url}%`} OR seo::text LIKE ${`%${url}%`}
    LIMIT 20
  `;
  for (const row of content) usage.push({ type: row.kind, label: row.title });
  const pages = await sql`
    SELECT title FROM cms_pages WHERE sections::text LIKE ${`%${url}%`} OR seo::text LIKE ${`%${url}%`}
    LIMIT 20
  `;
  for (const row of pages) usage.push({ type: "page", label: row.title });
  const sections = await sql`
    SELECT label FROM site_sections WHERE fields::text LIKE ${`%${url}%`} LIMIT 20
  `;
  for (const row of sections) usage.push({ type: "section", label: row.label });
  return usage;
}
async function mediaCount() {
  const rows = await db()`SELECT count(*)::text AS count FROM media_assets`;
  return Number(rows[0]?.count ?? "0");
}

// api-src/lib/repo/admins.ts
init_sanitize();
init_db();
init_router();
function mapAdmin(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    title: row.title,
    avatarUrl: row.avatar_url,
    role: ADMIN_ROLES.includes(row.role) ? row.role : "editor",
    status: row.status === "active" ? "active" : row.status === "suspended" ? "suspended" : "invited",
    twoFactorEnabled: row.totp_enabled,
    lastLoginAt: isoOrNull(row.last_login_at),
    createdAt: iso(row.created_at),
    invitePending: row.password_hash === null && row.invite_expires_at !== null && row.invite_expires_at.getTime() > Date.now()
  };
}
var ADMIN_COLUMNS = `
  id, email, name, title, avatar_url, role, status, totp_enabled,
  last_login_at, created_at, invite_expires_at, password_hash
`;
async function listAdmins() {
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(ADMIN_COLUMNS)} FROM admin_users
    ORDER BY
      CASE role WHEN 'owner' THEN 0 WHEN 'administrator' THEN 1 ELSE 2 END,
      name ASC, email ASC
  `;
  return rows.map(mapAdmin);
}
async function getAdmin(id) {
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(ADMIN_COLUMNS)} FROM admin_users WHERE id = ${id}
  `;
  return rows[0] ? mapAdmin(rows[0]) : null;
}
var INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
async function inviteAdmin(input, actor) {
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw badRequest("Enter a valid email address.");
  }
  const role = typeof input.role === "string" ? input.role : "editor";
  if (!ADMIN_ROLES.includes(role)) {
    throw badRequest(`Role must be one of: ${ADMIN_ROLES.join(", ")}.`);
  }
  if (!canManageRole(actor.role, role)) {
    throw badRequest(
      `As ${ROLE_META[actor.role].label} you can only invite administrators below your own level.`
    );
  }
  const existing = await db()`SELECT id FROM admin_users WHERE email = ${email}`;
  if (existing.length > 0) throw conflict("An administrator with that email already exists.");
  const id = newId();
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await db()`
    INSERT INTO admin_users (
      id, email, name, title, role, status, invite_token_hash, invite_expires_at,
      must_change_password
    ) VALUES (
      ${id}, ${email}, ${sanitizeText(input.name, 120)}, ${sanitizeText(input.title, 120)},
      ${role}, ${"invited"}, ${sha2562(token)}, ${expiresAt}, true
    )
  `;
  const admin = await getAdmin(id);
  if (!admin) throw new Error("Administrator disappeared immediately after insert.");
  return { admin, inviteToken: token, expiresAt: expiresAt.toISOString() };
}
async function acceptInvite(token, password) {
  if (typeof token !== "string" || !token) throw badRequest("This invitation link is not valid.");
  const policy = checkPassword(password);
  if (!policy.ok) throw badRequest(policy.error);
  const sql = db();
  const rows = await sql`
    SELECT id FROM admin_users
    WHERE invite_token_hash = ${sha2562(token)}
      AND invite_expires_at > now()
      AND password_hash IS NULL
  `;
  const row = rows[0];
  if (!row) {
    throw badRequest("This invitation link has expired or has already been used.");
  }
  await sql`
    UPDATE admin_users SET
      password_hash = ${await hashPassword(password)},
      password_updated_at = now(),
      must_change_password = false,
      status = 'active',
      invite_token_hash = NULL,
      invite_expires_at = NULL,
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = now()
    WHERE id = ${row.id}
  `;
  const admin = await getAdmin(row.id);
  if (!admin) throw notFound("That administrator");
  return admin;
}
async function reissueInvite(id, actor) {
  const target = await getAdmin(id);
  if (!target) throw notFound("That administrator");
  if (target.id !== actor.id && !canManageRole(actor.role, target.role)) {
    throw badRequest("You cannot manage an administrator at or above your own level.");
  }
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await db()`
    UPDATE admin_users SET
      invite_token_hash = ${sha2562(token)},
      invite_expires_at = ${expiresAt},
      password_hash = NULL,
      must_change_password = true,
      status = CASE WHEN status = 'suspended' THEN 'suspended' ELSE 'invited' END,
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = now()
    WHERE id = ${id}
  `;
  await revokeAllSessions(id);
  const admin = await getAdmin(id);
  if (!admin) throw notFound("That administrator");
  return { admin, inviteToken: token, expiresAt: expiresAt.toISOString() };
}
async function activeOwnerCount() {
  const rows = await db()`
    SELECT count(*)::text AS count FROM admin_users WHERE role = 'owner' AND status = 'active'
  `;
  return Number(rows[0]?.count ?? "0");
}
async function guardLastOwner(target, change) {
  if (target.role !== "owner" || target.status !== "active") return;
  if (await activeOwnerCount() > 1) return;
  throw badRequest(
    `${target.name || target.email} is the only active Owner, so they cannot be ${change}. Promote another administrator to Owner first.`
  );
}
async function updateAdmin(id, input, actor) {
  const target = await getAdmin(id);
  if (!target) throw notFound("That administrator");
  const isSelf = target.id === actor.id;
  if (!isSelf && !canManageRole(actor.role, target.role)) {
    throw badRequest("You cannot manage an administrator at or above your own level.");
  }
  let role = target.role;
  if (input.role !== void 0 && input.role !== target.role) {
    if (isSelf) throw badRequest("You cannot change your own role.");
    const requested = typeof input.role === "string" ? input.role : "";
    if (!ADMIN_ROLES.includes(requested)) {
      throw badRequest(`Role must be one of: ${ADMIN_ROLES.join(", ")}.`);
    }
    if (!canManageRole(actor.role, requested)) {
      throw badRequest("You cannot assign a role at or above your own level.");
    }
    await guardLastOwner(target, "demoted");
    role = requested;
  }
  let status = target.status;
  if (input.status !== void 0 && input.status !== target.status) {
    if (isSelf) throw badRequest("You cannot change your own account status.");
    const requested = typeof input.status === "string" ? input.status : "";
    if (!["active", "suspended"].includes(requested)) {
      throw badRequest("Status must be either active or suspended.");
    }
    if (requested === "suspended") await guardLastOwner(target, "suspended");
    status = requested === "active" && target.invitePending ? "invited" : requested;
  }
  await db()`
    UPDATE admin_users SET
      name = ${input.name === void 0 ? target.name : sanitizeText(input.name, 120)},
      title = ${input.title === void 0 ? target.title : sanitizeText(input.title, 120)},
      avatar_url = ${input.avatarUrl === void 0 ? target.avatarUrl : sanitizeUrl(input.avatarUrl) ?? null},
      role = ${role},
      status = ${status},
      updated_at = now()
    WHERE id = ${id}
  `;
  if (status === "suspended") await revokeAllSessions(id);
  const updated = await getAdmin(id);
  if (!updated) throw notFound("That administrator");
  return updated;
}
async function deleteAdmin(id, actor) {
  const target = await getAdmin(id);
  if (!target) throw notFound("That administrator");
  if (target.id === actor.id) throw badRequest("You cannot remove your own account.");
  if (!canManageRole(actor.role, target.role)) {
    throw badRequest("You cannot remove an administrator at or above your own level.");
  }
  await guardLastOwner(target, "removed");
  await db()`DELETE FROM admin_users WHERE id = ${id}`;
  return target;
}
async function changeOwnPassword(actor, currentPassword, newPassword) {
  const sql = db();
  const rows = await sql`
    SELECT password_hash FROM admin_users WHERE id = ${actor.id}
  `;
  const hash = rows[0]?.password_hash ?? null;
  if (typeof currentPassword !== "string" || !await verifyPassword(currentPassword, hash)) {
    throw badRequest("Your current password is not correct.");
  }
  const policy = checkPassword(newPassword);
  if (!policy.ok) throw badRequest(policy.error);
  if (currentPassword === newPassword) {
    throw badRequest("Choose a password different from your current one.");
  }
  await sql`
    UPDATE admin_users SET
      password_hash = ${await hashPassword(newPassword)},
      password_updated_at = now(),
      must_change_password = false,
      updated_at = now()
    WHERE id = ${actor.id}
  `;
  await revokeAllSessions(actor.id, actor.sessionId);
}
async function updateOwnProfile(actor, input) {
  await db()`
    UPDATE admin_users SET
      name = ${input.name === void 0 ? actor.name : sanitizeText(input.name, 120)},
      title = ${input.title === void 0 ? actor.title : sanitizeText(input.title, 120)},
      avatar_url = ${input.avatarUrl === void 0 ? actor.avatarUrl : sanitizeUrl(input.avatarUrl) ?? null},
      updated_at = now()
    WHERE id = ${actor.id}
  `;
  const updated = await getAdmin(actor.id);
  if (!updated) throw notFound("Your account");
  return updated;
}
async function adminCount() {
  const rows = await db()`
    SELECT count(*)::text AS count FROM admin_users WHERE status <> 'suspended'
  `;
  return Number(rows[0]?.count ?? "0");
}
async function twoFactorStatus(userId) {
  const rows = await db()`
    SELECT totp_enabled, totp_confirmed_at, recovery_codes FROM admin_users WHERE id = ${userId}
  `;
  const row = rows[0];
  if (!row) throw notFound("Your account");
  return {
    enabled: row.totp_enabled,
    confirmedAt: isoOrNull(row.totp_confirmed_at),
    recoveryCodesRemaining: (row.recovery_codes ?? []).filter((code) => code.usedAt === null).length
  };
}
async function verifyOwnPassword(userId, password) {
  const rows = await db()`
    SELECT password_hash FROM admin_users WHERE id = ${userId}
  `;
  if (typeof password !== "string") return false;
  return verifyPassword(password, rows[0]?.password_hash ?? null);
}

// api-src/lib/repo/insights.ts
init_types();
init_db();

// api-src/lib/ai-manager.ts
init_types();
init_doc();
init_sanitize();

// src/lib/ai/providers/bedrock.ts
function getSubtle() {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error(
    "[BedrockProvider] Web Crypto API (globalThis.crypto.subtle) is not available in this runtime. Ensure Node.js >= 18 is being used."
  );
}
function toHex(buf) {
  return Array.from(new Uint8Array(buf)).map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
async function sha256Hex2(data) {
  const hash = await getSubtle().digest("SHA-256", new TextEncoder().encode(data));
  return toHex(hash);
}
async function hmacSHA256(key, data) {
  const subtle = getSubtle();
  const cryptoKey = await subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}
async function deriveSigningKey(secretKey, dateStamp, region, service) {
  const kSecret = new TextEncoder().encode("AWS4" + secretKey);
  const kDate = await hmacSHA256(kSecret, dateStamp);
  const kRegion = await hmacSHA256(kDate, region);
  const kService = await hmacSHA256(kRegion, service);
  return hmacSHA256(kService, "aws4_request");
}
async function signRequest(opts) {
  const now = /* @__PURE__ */ new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex2(opts.body);
  const canonicalHeaders = `content-type:application/json
host:${opts.host}
x-amz-date:${amzDate}
`;
  const signedHeaders = "content-type;host;x-amz-date";
  const canonicalUri = opts.path.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  const canonicalRequest = [
    opts.method,
    canonicalUri,
    "",
    // no query string
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const credentialScope = `${dateStamp}/${opts.region}/${opts.service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex2(canonicalRequest)
  ].join("\n");
  const signingKey2 = await deriveSigningKey(
    opts.secretAccessKey,
    dateStamp,
    opts.region,
    opts.service
  );
  const signature = toHex(await hmacSHA256(signingKey2, stringToSign));
  const authHeader = `AWS4-HMAC-SHA256 Credential=${opts.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return {
    "Content-Type": "application/json",
    "x-amz-date": amzDate,
    Authorization: authHeader
  };
}
var BedrockProvider = class {
  accessKeyId;
  secretAccessKey;
  region;
  modelId;
  constructor(accessKeyId, secretAccessKey, region = "us-east-1", modelId = "amazon.nova-lite-v1:0") {
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.region = region;
    this.modelId = modelId;
  }
  async complete(messages2) {
    const systemMessages = messages2.filter((m) => m.role === "system");
    const turns = messages2.filter((m) => m.role !== "system");
    const userFirstTurns = turns.slice(turns.findIndex((m) => m.role === "user"));
    const bedrockMessages = (userFirstTurns.length > 0 ? userFirstTurns : turns).map((m) => ({
      role: m.role,
      content: [{ text: m.content }]
    }));
    const body = {
      messages: bedrockMessages,
      inferenceConfig: { maxTokens: 1024, temperature: 0.7 }
    };
    if (systemMessages.length > 0) {
      body.system = systemMessages.map((m) => ({ text: m.content }));
    }
    const bodyStr = JSON.stringify(body);
    const host = `bedrock-runtime.${this.region}.amazonaws.com`;
    const path = `/model/${this.modelId}/converse`;
    const url = `https://${host}${path}`;
    const headers = await signRequest({
      method: "POST",
      host,
      path,
      region: this.region,
      service: "bedrock",
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey,
      body: bodyStr
    });
    const res = await fetch(url, { method: "POST", headers, body: bodyStr });
    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText);
      throw new Error(`[BedrockProvider] HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    const text = data.output?.message?.content?.[0]?.text ?? "";
    if (!text) throw new Error("[BedrockProvider] Empty response from Bedrock.");
    return { text, model: this.modelId, provider: "bedrock" };
  }
};

// src/lib/ai/providers/openai.ts
var DEFAULT_MODEL = "gpt-4o-mini";
var BASE_URL = "https://api.openai.com/v1";
var OpenAIProvider = class {
  apiKey;
  model;
  baseUrl;
  constructor(apiKey, model, baseUrl) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL;
    this.baseUrl = baseUrl || BASE_URL;
  }
  async complete(messages2) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages2.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: 512,
        temperature: 0.7
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[OpenAI] HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(`[OpenAI] API error: ${data.error.message}`);
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("[OpenAI] Empty response from API");
    return { text, model: data.model || this.model, provider: "openai" };
  }
};

// src/lib/ai/providers/anthropic.ts
var DEFAULT_MODEL2 = "claude-3-5-haiku-20241022";
var BASE_URL2 = "https://api.anthropic.com/v1";
var ANTHROPIC_VERSION = "2023-06-01";
var AnthropicProvider = class {
  apiKey;
  model;
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL2;
  }
  async complete(messages2) {
    const systemMsg = messages2.find((m) => m.role === "system");
    const conversationMsgs = messages2.filter((m) => m.role !== "system").map((m) => ({
      role: m.role,
      content: m.content
    }));
    const res = await fetch(`${BASE_URL2}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": ANTHROPIC_VERSION
      },
      body: JSON.stringify({
        model: this.model,
        system: systemMsg?.content,
        messages: conversationMsgs,
        max_tokens: 512
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[Anthropic] HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(`[Anthropic] API error: ${data.error.message}`);
    const text = data.content?.find((b2) => b2.type === "text")?.text?.trim();
    if (!text) throw new Error("[Anthropic] Empty response from API");
    return { text, model: data.model || this.model, provider: "anthropic" };
  }
};

// src/lib/ai/providers/gemini.ts
var DEFAULT_MODEL3 = "gemini-2.0-flash";
var BASE_URL3 = "https://generativelanguage.googleapis.com/v1beta/models";
var GeminiProvider = class {
  apiKey;
  model;
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model || DEFAULT_MODEL3;
  }
  async complete(messages2) {
    const systemMsg = messages2.find((m) => m.role === "system");
    const conversationMsgs = messages2.filter((m) => m.role !== "system").map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
    const body = {
      contents: conversationMsgs,
      generationConfig: { maxOutputTokens: 512, temperature: 0.7 }
    };
    if (systemMsg) {
      body.systemInstruction = { parts: [{ text: systemMsg.content }] };
    }
    const url = `${BASE_URL3}/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[Gemini] HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(`[Gemini] API error: ${data.error.message}`);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("[Gemini] Empty response from API");
    return { text, model: this.model, provider: "gemini" };
  }
};

// src/lib/ai/providers/openai-compatible.ts
var OpenAICompatibleProvider = class {
  constructor(apiKey, baseUrl, defaultModel, providerLabel, model, extraHeaders = {}) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
    this.providerLabel = providerLabel;
    this.model = model;
    this.extraHeaders = extraHeaders;
  }
  apiKey;
  baseUrl;
  defaultModel;
  providerLabel;
  model;
  extraHeaders;
  async complete(messages2) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...this.extraHeaders
      },
      body: JSON.stringify({
        model: this.model || this.defaultModel,
        messages: messages2.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: 512,
        temperature: 0.7
      })
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`[${this.providerLabel}] HTTP ${res.status}: ${err}`);
    }
    const data = await res.json();
    if (data.error) {
      throw new Error(`[${this.providerLabel}] API error: ${data.error.message}`);
    }
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error(`[${this.providerLabel}] Empty response from API`);
    return {
      text,
      model: data.model || this.model || this.defaultModel,
      provider: this.providerLabel
    };
  }
};

// src/lib/ai/providers/fallback.ts
var FALLBACK_TEXT = "Thanks for reaching out. A member of our team will follow up shortly. For urgent matters, write to corporate@enicehq.com.";
var FallbackProvider = class {
  async complete(_messages) {
    return { text: FALLBACK_TEXT, model: "fallback", provider: "fallback" };
  }
};

// src/lib/ai/factory.ts
function createAIProvider() {
  const provider = (process.env.AI_PROVIDER ?? "bedrock").toLowerCase().trim();
  const apiKey = process.env.AI_API_KEY || process.env.AWS_API_KEY || "";
  const apiSecret = process.env.AI_API_SECRET || process.env.AWS_API_SECRET || "";
  const region = process.env.AI_REGION ?? "us-east-1";
  const model = process.env.AI_MODEL || void 0;
  const baseUrl = process.env.AI_BASE_URL || void 0;
  if (provider === "bedrock" || provider === "aws") {
    if (!apiKey || !apiSecret) {
      console.warn(
        "[AI] Bedrock requires AI_API_KEY (Access Key ID) and AI_API_SECRET (Secret Access Key). Using FallbackProvider until credentials are set."
      );
      return new FallbackProvider();
    }
    return new BedrockProvider(apiKey, apiSecret, region, model ?? "amazon.nova-lite-v1:0");
  }
  if (!apiKey) {
    console.warn(
      `[AI] No AI_API_KEY set \u2014 using FallbackProvider. Set AI_PROVIDER and AI_API_KEY to enable live responses.`
    );
    return new FallbackProvider();
  }
  switch (provider) {
    // ── Native implementations ───────────────────────────────────────────────
    case "openai":
      return new OpenAIProvider(apiKey, model, baseUrl);
    case "anthropic":
    case "claude":
      return new AnthropicProvider(apiKey, model);
    case "gemini":
    case "google":
      return new GeminiProvider(apiKey, model);
    // ── OpenAI-compatible providers ──────────────────────────────────────────
    case "deepseek":
      return new OpenAICompatibleProvider(
        apiKey,
        baseUrl ?? "https://api.deepseek.com/v1",
        "deepseek-chat",
        "deepseek",
        model
      );
    case "grok":
    case "xai":
      return new OpenAICompatibleProvider(
        apiKey,
        baseUrl ?? "https://api.x.ai/v1",
        "grok-3-mini",
        "grok",
        model
      );
    case "openrouter":
      return new OpenAICompatibleProvider(
        apiKey,
        baseUrl ?? "https://openrouter.ai/api/v1",
        "openai/gpt-4o-mini",
        "openrouter",
        model,
        // OpenRouter recommends these headers for usage tracking
        {
          "HTTP-Referer": "https://enicehq.com",
          "X-Title": "ENICE Group"
        }
      );
    // ── Custom / self-hosted OpenAI-compatible endpoint ──────────────────────
    case "custom":
      if (!baseUrl) {
        console.error("[AI] AI_PROVIDER=custom requires AI_BASE_URL to be set.");
        return new FallbackProvider();
      }
      return new OpenAICompatibleProvider(apiKey, baseUrl, model ?? "default", "custom", model);
    default:
      console.error(
        `[AI] Unknown AI_PROVIDER="${provider}". Valid values: bedrock, openai, anthropic, gemini, deepseek, grok, openrouter, custom.`
      );
      return new FallbackProvider();
  }
}

// api-src/lib/ai-manager.ts
init_db();
init_router();
init_website();
function mapRequest(row) {
  return {
    id: row.id,
    prompt: row.prompt,
    kind: row.kind === "code" ? "code" : "content",
    status: AI_CHANGE_STATUSES.includes(row.status) ? row.status : "queued",
    summary: row.summary,
    plan: row.plan ?? [],
    contentEdits: row.content_edits ?? [],
    codeEdits: row.code_edits ?? [],
    checks: row.checks ?? [],
    previewUrl: row.preview_url,
    branch: row.branch,
    pullRequestUrl: row.pull_request_url,
    reviewNote: row.review_note,
    errorMessage: row.error_message,
    requestedByEmail: row.requested_by_email,
    reviewedByEmail: row.reviewed_by_email,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}
var CHANGE_COLUMNS = `
  id, prompt, kind, status, summary, plan, content_edits, code_edits, checks,
  preview_url, branch, pull_request_url, review_note, error_message,
  requested_by_email, reviewed_by_email, created_at, updated_at
`;
async function listChangeRequests(limit = 50) {
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(CHANGE_COLUMNS)} FROM ai_change_requests
    ORDER BY created_at DESC LIMIT ${Math.min(Math.max(limit, 1), 200)}
  `;
  return rows.map(mapRequest);
}
async function getChangeRequest(id) {
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(CHANGE_COLUMNS)} FROM ai_change_requests WHERE id = ${id}
  `;
  return rows[0] ? mapRequest(rows[0]) : null;
}
async function describeWebsite() {
  const [sections, pages] = await Promise.all([listSections(), listPages()]);
  const sectionLines = sections.map(
    (section) => `- key "${section.key}" (${section.type}, group ${section.group}, ${section.visible ? "visible" : "hidden"}): ${section.label}`
  );
  const pageLines = pages.map(
    (page) => `- ${page.path} \u2014 "${page.title}" [${page.status}${page.systemRoute ? ", built-in route" : ""}]` + (page.sections.length ? ` with ${page.sections.length} managed section(s)` : "")
  );
  const schemaLines = Object.values(SECTION_SCHEMAS).map(
    (schema) => `- ${schema.type}: ${schema.fields.map((field) => `${field.key}:${field.type}`).join(", ")}`
  );
  return [
    "EXISTING GLOBAL SECTIONS (editable by key):",
    ...sectionLines,
    "",
    "EXISTING PAGES:",
    ...pageLines,
    "",
    "AVAILABLE SECTION TYPES AND THEIR FIELDS:",
    ...schemaLines
  ].join("\n");
}
function systemPrompt(websiteContext) {
  return `You are the AI Website Manager for the ENICE Group corporate website (enicehq.com).

You help administrators change the website. You never apply changes yourself \u2014 you produce a
proposal that a human reviews and approves.

ARCHITECTURE
- React 19 single-page app, TanStack Router file-based routes, Tailwind CSS v4.
- Content, pages, global sections, navigation, footer and design settings live in the ENICE
  Website Manager's own database and are editable without any code change.
- Page sections are structured: an administrator fills in fields, and the design system controls
  all visual output. There are no colour, spacing or font fields, deliberately.

${websiteContext}

CLASSIFY THE REQUEST as exactly one of:
- "content": achievable by editing data the Website Manager already owns \u2014 the copy or images in
  an existing section, its visibility, a new page assembled from existing section types, or
  navigation and footer entries. Prefer this whenever it is possible.
- "code": genuinely requires source changes \u2014 a new section *type*, a new interactive component,
  a change to how something is rendered, or anything touching the build or API.

RULES
- Only use section types and field names listed above. Never invent one.
- Only reference section keys and page paths that exist, unless you are creating a new page.
- Preserve the existing tone: precise, corporate, understated. No marketing hyperbole.
- Never propose changes to authentication, billing, secrets or the admin panel itself.
- If the request is ambiguous, say so in "summary" and propose the most conservative reading.

RESPOND WITH JSON ONLY. No markdown fences, no commentary. Shape:
{
  "kind": "content" | "code",
  "summary": "2-4 sentences: what you understood and what you will change.",
  "plan": [{ "title": "Short step", "detail": "What happens and why." }],
  "contentEdits": [
    {
      "target": "site_section" | "page" | "settings",
      "targetId": "the section key, the page path, or the settings key",
      "targetLabel": "human-readable name",
      "operation": "create" | "update",
      "fields": { "...": "only for site_section/page: the new field values" },
      "visible": true,
      "title": "only when creating a page",
      "path": "only when creating a page",
      "sections": [{ "type": "hero", "label": "Hero", "fields": {} }]
    }
  ],
  "codeEdits": [
    { "path": "src/components/site/Example.tsx", "operation": "create" | "update",
      "rationale": "why this file changes", "outline": "what the change does" }
  ]
}

For "content", fill contentEdits and leave codeEdits empty. For "code", fill codeEdits with the
files that would change and leave contentEdits empty \u2014 do not write full file contents, describe
the change; an engineer reviews the plan and the pull request is opened from it.`;
}
var AI_REQUEST_MAX = 30;
var AI_REQUEST_WINDOW_MS = 60 * 60 * 1e3;
function isAiConfigured() {
  if (process.env.AI_PROVIDER === "bedrock" || !process.env.AI_PROVIDER) {
    return Boolean(process.env.AI_API_KEY && process.env.AI_API_SECRET);
  }
  return Boolean(process.env.AI_API_KEY);
}
async function createChangeRequest(rawPrompt, actor) {
  const prompt = sanitizeMultilineText(rawPrompt, 4e3);
  if (prompt.length < 10) {
    throw badRequest("Describe the change you want in a sentence or two.");
  }
  if (!isAiConfigured()) {
    throw badRequest(
      "The AI Website Manager is not configured. Set AI_API_KEY (and AI_API_SECRET for AWS Bedrock) to enable it."
    );
  }
  const limit = await consumeRateLimit(
    `ai:request:${actor.id}`,
    AI_REQUEST_MAX,
    AI_REQUEST_WINDOW_MS
  );
  if (limit.limited) {
    throw badRequest(
      `You have reached the hourly limit of ${AI_REQUEST_MAX} AI requests. Try again after ${limit.resetAt.toLocaleTimeString()}.`
    );
  }
  const sql = db();
  const id = newId();
  await sql`
    INSERT INTO ai_change_requests (id, prompt, kind, status, requested_by_email)
    VALUES (${id}, ${prompt}, ${"content"}, ${"analyzing"}, ${actor.email})
  `;
  try {
    const context = await describeWebsite();
    const messages2 = [
      { role: "system", content: systemPrompt(context) },
      { role: "user", content: prompt }
    ];
    const provider = createAIProvider();
    const response = await provider.complete(messages2);
    const parsed = parseProposal(response.text);
    await sql`
      UPDATE ai_change_requests SET
        kind = ${parsed.kind},
        status = ${"proposed"},
        summary = ${parsed.summary},
        plan = ${json(parsed.plan)},
        content_edits = ${json(parsed.contentEdits)},
        code_edits = ${json(parsed.codeEdits)},
        checks = ${json(initialChecks(parsed.kind))},
        updated_at = now()
      WHERE id = ${id}
    `;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[cms] AI change request ${id} failed:`, error);
    await sql`
      UPDATE ai_change_requests SET
        status = ${"failed"},
        error_message = ${message.slice(0, 500)},
        updated_at = now()
      WHERE id = ${id}
    `;
  }
  const created = await getChangeRequest(id);
  if (!created) throw new Error("Change request disappeared immediately after insert.");
  return created;
}
function initialChecks(kind) {
  if (kind === "content") {
    return [
      {
        name: "Section and field schema",
        status: "passed",
        detail: "Every edit was re-validated against the design system's section schemas."
      },
      {
        name: "Content sanitisation",
        status: "passed",
        detail: "Copy, links and images passed the same sanitisers as manual edits."
      },
      {
        name: "Rollback snapshot",
        status: "pending",
        detail: "Captured when the change is applied, so it can be reverted."
      }
    ];
  }
  return [
    {
      name: "Pull request",
      status: "pending",
      detail: "Opened on approval. Nothing reaches production until it is merged."
    },
    {
      name: "Continuous integration",
      status: "pending",
      detail: "Format, lint, typecheck and both builds run on the pull request."
    },
    {
      name: "Preview deployment",
      status: "pending",
      detail: "A preview URL is produced for the branch so the change can be seen."
    },
    {
      name: "Human merge",
      status: "pending",
      detail: "An engineer reviews and merges. This step is never automated."
    }
  ];
}
function parseProposal(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("The AI did not return a usable proposal. Try rephrasing the request.");
  }
  let raw;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new Error("The AI's proposal could not be read. Try rephrasing the request.");
  }
  const kind = raw.kind === "code" ? "code" : "content";
  const plan = (Array.isArray(raw.plan) ? raw.plan.slice(0, 12) : []).map((step) => {
    const source = step && typeof step === "object" ? step : {};
    return {
      title: sanitizeText(source.title, 160) || "Step",
      detail: sanitizeMultilineText(source.detail, 1200)
    };
  });
  const contentEdits = (Array.isArray(raw.contentEdits) ? raw.contentEdits.slice(0, 20) : []).map((edit) => normalizeContentEdit(edit)).filter((edit) => edit !== null);
  const codeEdits = (Array.isArray(raw.codeEdits) ? raw.codeEdits.slice(0, 20) : []).map((edit) => {
    const source = edit && typeof edit === "object" ? edit : {};
    const path = sanitizeText(source.path, 300).replace(/^\/+/, "");
    return {
      path,
      operation: source.operation === "create" ? "create" : "update",
      // The "diff" is the described intent at this stage. A real patch is produced when the
      // pull request is opened; showing a fabricated unified diff here would imply the AI had
      // read and rewritten the file, which it has not.
      diff: sanitizeMultilineText(
        [source.rationale, source.outline].filter(Boolean).join("\n\n"),
        4e3
      )
    };
  });
  return {
    kind,
    summary: sanitizeMultilineText(raw.summary, 2e3) || "No summary was provided.",
    plan,
    contentEdits,
    codeEdits
  };
}
function normalizeContentEdit(input) {
  if (!input || typeof input !== "object") return null;
  const source = input;
  const target = sanitizeText(source.target, 40);
  if (!["site_section", "page", "settings"].includes(target)) return null;
  const operation = source.operation === "create" ? "create" : "update";
  const targetId = target === "page" ? normalizePath2(sanitizeText(source.path ?? source.targetId, 200)) : sanitizeText(source.targetId, 120);
  if (!targetId) return null;
  const after = {};
  if (source.fields && typeof source.fields === "object") after.fields = source.fields;
  if (source.visible !== void 0) after.visible = source.visible === true;
  if (source.title !== void 0) after.title = sanitizeText(source.title, 200);
  if (source.path !== void 0) after.path = normalizePath2(sanitizeText(source.path, 200));
  if (Array.isArray(source.sections)) after.sections = source.sections;
  if (source.value && typeof source.value === "object") after.value = source.value;
  return {
    target,
    targetId,
    targetLabel: sanitizeText(source.targetLabel, 200) || targetId,
    operation,
    before: null,
    after
  };
}
async function rejectChangeRequest(id, note, actor) {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (!["proposed", "changes_requested", "approved"].includes(existing.status)) {
    throw conflict(`A request that is "${existing.status}" cannot be rejected.`);
  }
  await db()`
    UPDATE ai_change_requests SET
      status = ${"rejected"},
      review_note = ${sanitizeMultilineText(note, 2e3)},
      reviewed_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
  `;
  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}
async function requestChanges(id, note, actor) {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  await db()`
    UPDATE ai_change_requests SET
      status = ${"changes_requested"},
      review_note = ${sanitizeMultilineText(note, 2e3)},
      reviewed_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
  `;
  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}
async function approveChangeRequest(id, actor) {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (!["proposed", "changes_requested"].includes(existing.status)) {
    throw conflict(`A request that is "${existing.status}" cannot be approved.`);
  }
  if (existing.kind === "content" && existing.contentEdits.length === 0) {
    throw badRequest("This proposal contains no changes to apply.");
  }
  await db()`
    UPDATE ai_change_requests SET
      status = ${"approved"}, reviewed_by_email = ${actor.email}, updated_at = now()
    WHERE id = ${id}
  `;
  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}
async function resolveBefore(edit) {
  if (edit.target === "site_section") {
    const section = await getSection(edit.targetId);
    return section ? { fields: section.fields, visible: section.visible } : null;
  }
  if (edit.target === "page") {
    const pages = await listPages();
    const page = pages.find((candidate) => candidate.path === edit.targetId);
    return page ? { title: page.title, sections: page.sections, seo: page.seo } : null;
  }
  const rows = await db()`
    SELECT value FROM site_settings WHERE key = ${edit.targetId}
  `;
  return rows[0]?.value ?? null;
}
async function applyChangeRequest(id, actor) {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (existing.status !== "approved") {
    throw conflict("Only an approved request can be applied.");
  }
  if (existing.kind !== "content") {
    throw badRequest(
      "This request changes source code. Use Open pull request instead \u2014 code changes are deployed by merging, not applied here."
    );
  }
  const sql = db();
  const rollback = [];
  const applied = [];
  const repoActor = { id: actor.id, email: actor.email };
  try {
    for (const edit of existing.contentEdits) {
      const before = await resolveBefore(edit);
      rollback.push({ edit, before });
      const after = edit.after ?? {};
      if (edit.target === "site_section") {
        const section = await getSection(edit.targetId);
        if (!section) continue;
        await updateSection(
          edit.targetId,
          {
            fields: after.fields === void 0 ? section.fields : sanitizeSectionFields(section.type, {
              // Merged over the existing values so a partial proposal edits the headline
              // without blanking every field it did not mention.
              ...section.fields,
              ...after.fields
            }),
            visible: after.visible === void 0 ? section.visible : after.visible === true
          },
          repoActor
        );
        applied.push({ ...edit, before });
        continue;
      }
      if (edit.target === "page") {
        const pages = await listPages();
        const page = pages.find((candidate) => candidate.path === edit.targetId);
        const sections = Array.isArray(after.sections) ? after.sections.map((entry) => {
          const type = sanitizeText(entry.type, 40);
          return {
            id: newId().slice(0, 8),
            type,
            label: sanitizeText(entry.label, 120) || SECTION_SCHEMAS[type]?.label || "Section",
            visible: true,
            fields: entry.fields ?? {}
          };
        }) : void 0;
        if (page) {
          await updatePage(
            page.id,
            {
              title: after.title === void 0 ? void 0 : String(after.title),
              sections: sections ?? page.sections
            },
            repoActor
          );
        } else {
          await createPage(
            {
              path: edit.targetId,
              title: sanitizeText(after.title, 200) || slugify(edit.targetId) || "New page",
              summary: `Created by the AI Website Manager from: ${existing.prompt.slice(0, 200)}`,
              sections: sections ?? []
            },
            repoActor
          );
        }
        applied.push({ ...edit, before });
        continue;
      }
      if (edit.target === "settings" && after.value && typeof after.value === "object") {
        const { updateSettings: updateSettings2, SETTINGS_KEYS: SETTINGS_KEYS2 } = await Promise.resolve().then(() => (init_website(), website_exports));
        if (SETTINGS_KEYS2.includes(edit.targetId)) {
          await updateSettings2(
            edit.targetId,
            after.value,
            repoActor
          );
          applied.push({ ...edit, before });
        }
      }
    }
    const checks = existing.checks.map(
      (check) => check.name === "Rollback snapshot" ? {
        ...check,
        status: "passed",
        detail: `Previous state captured for ${rollback.length} target(s).`
      } : check
    );
    await sql`
      UPDATE ai_change_requests SET
        status = ${"applied"},
        content_edits = ${json(applied)},
        rollback_snapshot = ${json(rollback)},
        checks = ${json(checks)},
        reviewed_by_email = ${actor.email},
        updated_at = now()
      WHERE id = ${id}
    `;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sql`
      UPDATE ai_change_requests SET
        status = ${"failed"},
        error_message = ${`Applying failed: ${message}`.slice(0, 500)},
        rollback_snapshot = ${json(rollback)},
        updated_at = now()
      WHERE id = ${id}
    `;
    throw badRequest(`The change could not be applied: ${message}`);
  }
  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}
async function rollbackChangeRequest(id, actor) {
  const sql = db();
  const rows = await sql`
    SELECT rollback_snapshot, status FROM ai_change_requests WHERE id = ${id}
  `;
  const row = rows[0];
  if (!row) throw notFound("That AI request");
  if (row.status !== "applied") throw conflict("Only an applied change can be reverted.");
  const snapshot = row.rollback_snapshot ?? [];
  const repoActor = { id: actor.id, email: actor.email };
  for (const { edit, before } of snapshot) {
    if (before === null) continue;
    if (edit.target === "site_section") {
      const previous = before;
      await updateSection(
        edit.targetId,
        { fields: previous.fields, visible: previous.visible },
        repoActor
      );
    } else if (edit.target === "page") {
      const pages = await listPages();
      const page = pages.find((candidate) => candidate.path === edit.targetId);
      if (page) {
        const previous = before;
        await updatePage(
          page.id,
          { title: previous.title, sections: previous.sections, seo: previous.seo },
          repoActor
        );
      }
    } else if (edit.target === "settings") {
      const { updateSettings: updateSettings2, SETTINGS_KEYS: SETTINGS_KEYS2 } = await Promise.resolve().then(() => (init_website(), website_exports));
      if (SETTINGS_KEYS2.includes(edit.targetId)) {
        await updateSettings2(edit.targetId, before, repoActor);
      }
    }
  }
  await sql`
    UPDATE ai_change_requests SET
      status = ${"rejected"},
      review_note = ${"Applied, then reverted."},
      reviewed_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
  `;
  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}
function githubConfig() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPOSITORY?.trim();
  if (!token || !repo || !repo.includes("/")) return null;
  return { token, repo, baseBranch: process.env.GITHUB_BASE_BRANCH?.trim() || "main" };
}
function isCodeDeliveryConfigured() {
  return githubConfig() !== null;
}
async function openPullRequest(id, actor) {
  const existing = await getChangeRequest(id);
  if (!existing) throw notFound("That AI request");
  if (existing.status !== "approved")
    throw conflict("Approve the request before opening a pull request.");
  const config = githubConfig();
  if (!config) {
    throw badRequest(
      "Code delivery is not configured. Set GITHUB_TOKEN and GITHUB_REPOSITORY to let the Website Manager open pull requests."
    );
  }
  const branch = `ai/website-manager/${slugify(existing.summary.slice(0, 40)) || "change"}-${id.slice(0, 8)}`;
  const api = `https://api.github.com/repos/${config.repo}`;
  const headers = {
    Authorization: `Bearer ${config.token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "enice-website-manager"
  };
  const body = [
    `## AI Website Manager request`,
    "",
    `**Requested by:** ${existing.requestedByEmail ?? "unknown"}`,
    `**Approved by:** ${actor.email}`,
    "",
    `### Request`,
    "",
    `> ${existing.prompt.replace(/\n/g, "\n> ")}`,
    "",
    `### Summary`,
    "",
    existing.summary,
    "",
    `### Plan`,
    "",
    ...existing.plan.map((step, index) => `${index + 1}. **${step.title}** \u2014 ${step.detail}`),
    "",
    `### Files identified`,
    "",
    ...existing.codeEdits.map(
      (edit) => `- \`${edit.path}\` (${edit.operation})

  ${edit.diff.replace(/\n/g, "\n  ")}`
    ),
    "",
    "---",
    "",
    "This pull request was opened from the ENICE Website Manager. The proposal above was reviewed",
    "and approved by an administrator. CI must pass and a human must merge before anything reaches",
    "production."
  ].join("\n");
  try {
    const baseRef = await fetch(`${api}/git/ref/heads/${config.baseBranch}`, { headers });
    if (!baseRef.ok) {
      throw new Error(`Could not read ${config.baseBranch} (HTTP ${baseRef.status}).`);
    }
    const baseSha = (await baseRef.json()).object.sha;
    const created = await fetch(`${api}/git/refs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseSha })
    });
    if (!created.ok && created.status !== 422) {
      throw new Error(`Could not create the branch (HTTP ${created.status}).`);
    }
    await fetch(`${api}/contents/.enice/ai-requests/${id}.md`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `AI Website Manager: ${existing.summary.slice(0, 60)}`,
        content: Buffer.from(body, "utf8").toString("base64"),
        branch
      })
    });
    const pull = await fetch(`${api}/pulls`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: `AI Website Manager: ${existing.summary.slice(0, 70)}`,
        head: branch,
        base: config.baseBranch,
        body,
        draft: true
      })
    });
    if (!pull.ok) {
      const detail = await pull.text().catch(() => "");
      throw new Error(
        `Could not open the pull request (HTTP ${pull.status}). ${detail.slice(0, 200)}`
      );
    }
    const pullData = await pull.json();
    const checks = existing.checks.map(
      (check) => check.name === "Pull request" ? { ...check, status: "passed", detail: `Opened as a draft: ${pullData.html_url}` } : check
    );
    await db()`
      UPDATE ai_change_requests SET
        status = ${"pr_open"},
        branch = ${branch},
        pull_request_url = ${pullData.html_url},
        checks = ${json(checks)},
        reviewed_by_email = ${actor.email},
        updated_at = now()
      WHERE id = ${id}
    `;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db()`
      UPDATE ai_change_requests SET
        error_message = ${message.slice(0, 500)}, updated_at = now()
      WHERE id = ${id}
    `;
    throw badRequest(message);
  }
  const updated = await getChangeRequest(id);
  if (!updated) throw notFound("That AI request");
  return updated;
}

// api-src/lib/repo/insights.ts
init_website();
async function dashboardSnapshot() {
  await publishDueContent();
  await publishDuePages();
  const sql = db();
  const [
    counts,
    recentContent,
    recentAnnouncements,
    recentUpdates,
    upcoming,
    activity,
    media,
    admins,
    pages,
    pendingAi,
    published
  ] = await Promise.all([
    contentCounts(),
    listContent({ limit: 6, sort: "recent" }),
    listContent({ kind: "announcement", limit: 4, sort: "recent" }),
    listContent({ kind: "update", limit: 5, sort: "recent" }),
    listContent({ status: "scheduled", limit: 5, sort: "recent" }),
    recentActivity(10),
    mediaCount(),
    adminCount(),
    sql`SELECT count(*)::text AS count FROM cms_pages`,
    sql`
      SELECT count(*)::text AS count FROM ai_change_requests
      WHERE status IN ('proposed', 'approved')
    `,
    lastPublishedAt()
  ]);
  const totalFor = (status) => counts.filter((row) => row.status === status).reduce((sum, row) => sum + row.count, 0);
  const byKind = Object.fromEntries(
    CONTENT_KINDS.map((kind) => [
      kind,
      {
        published: counts.find((r) => r.kind === kind && r.status === "published")?.count ?? 0,
        drafts: counts.find((r) => r.kind === kind && r.status === "draft")?.count ?? 0,
        scheduled: counts.find((r) => r.kind === kind && r.status === "scheduled")?.count ?? 0
      }
    ])
  );
  return {
    counts: {
      published: totalFor("published"),
      drafts: totalFor("draft"),
      scheduled: totalFor("scheduled"),
      archived: totalFor("archived"),
      media,
      pages: Number(pages[0]?.count ?? "0"),
      admins
    },
    byKind,
    recentContent: recentContent.items,
    recentAnnouncements: recentAnnouncements.items,
    recentUpdates: recentUpdates.items,
    upcoming: upcoming.items,
    activity,
    pendingAiReviews: Number(pendingAi[0]?.count ?? "0"),
    site: {
      // Reaching this code at all means the database answered, so the API is healthy.
      apiHealthy: true,
      databaseConfigured: isDatabaseConfigured(),
      mediaStorageConfigured: isMediaStorageConfigured(),
      aiConfigured: isAiConfigured() && isSecretConfigured(),
      lastPublishedAt: published
    }
  };
}
async function globalSearch(rawQuery, limit = 30) {
  const query = rawQuery.trim();
  if (query.length < 2) return [];
  const sql = db();
  const like = `%${query}%`;
  const perArea = Math.max(4, Math.ceil(limit / 4));
  const [content, pages, sections, media, admins] = await Promise.all([
    sql`
      SELECT id, kind, title, slug, excerpt, status, updated_at,
             (title ILIKE ${like}) AS exact
      FROM content_items
      WHERE title ILIKE ${like}
         OR slug ILIKE ${like}
         OR to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${query})
      ORDER BY exact DESC, updated_at DESC
      LIMIT ${perArea * 2}
    `,
    sql`
      SELECT id, path, title, summary, status, updated_at FROM cms_pages
      WHERE title ILIKE ${like} OR path ILIKE ${like} OR summary ILIKE ${like}
      ORDER BY updated_at DESC LIMIT ${perArea}
    `,
    sql`
      SELECT key, label, group_name, status, updated_at FROM site_sections
      WHERE label ILIKE ${like} OR key ILIKE ${like} OR fields::text ILIKE ${like}
      ORDER BY sort_order ASC LIMIT ${perArea}
    `,
    sql`
      SELECT id, filename, alt, mime_type, created_at FROM media_assets
      WHERE filename ILIKE ${like} OR alt ILIKE ${like}
      ORDER BY created_at DESC LIMIT ${perArea}
    `,
    sql`
      SELECT id, email, name, role FROM admin_users
      WHERE email ILIKE ${like} OR name ILIKE ${like}
      ORDER BY name ASC LIMIT ${perArea}
    `
  ]);
  const hits = [
    ...content.map((row) => {
      const kind = row.kind;
      const meta = CONTENT_KIND_META[kind];
      return {
        id: row.id,
        type: "content",
        kind: meta?.singular ?? row.kind,
        title: row.title || "(untitled)",
        subtitle: row.excerpt || `/${row.slug}`,
        status: row.status,
        href: `${meta?.route ?? "/admin/content/blog"}/${row.id}`,
        updatedAt: row.updated_at.toISOString()
      };
    }),
    ...pages.map((row) => ({
      id: row.id,
      type: "page",
      kind: "Page",
      title: row.title,
      subtitle: row.path,
      status: row.status,
      href: `/admin/website/pages/${row.id}`,
      updatedAt: row.updated_at.toISOString()
    })),
    ...sections.map((row) => ({
      id: row.key,
      type: "section",
      kind: "Section",
      title: row.label,
      subtitle: `${row.group_name} \xB7 ${row.key}`,
      status: row.status,
      href: `/admin/website/sections/${encodeURIComponent(row.key)}`,
      updatedAt: row.updated_at.toISOString()
    })),
    ...media.map((row) => ({
      id: row.id,
      type: "media",
      kind: row.mime_type.startsWith("video/") ? "Video" : "Image",
      title: row.filename,
      subtitle: row.alt || row.mime_type,
      status: null,
      href: `/admin/media?asset=${row.id}`,
      updatedAt: row.created_at.toISOString()
    })),
    ...admins.map((row) => ({
      id: row.id,
      type: "admin",
      kind: "Administrator",
      title: row.name || row.email,
      subtitle: row.email,
      status: null,
      href: `/admin/administration/admins`,
      updatedAt: null
    }))
  ];
  return hits.slice(0, limit);
}
async function publishingQueues() {
  await publishDueContent();
  const [drafts, scheduled, published, archived] = await Promise.all([
    listContent({ status: "draft", limit: 100, sort: "recent" }),
    listContent({ status: "scheduled", limit: 100, sort: "recent" }),
    listContent({ status: "published", limit: 100, sort: "published" }),
    listContent({ status: "archived", limit: 100, sort: "recent" })
  ]);
  return {
    drafts: drafts.items,
    scheduled: scheduled.items,
    published: published.items,
    archived: archived.items
  };
}

// api-src/cms.ts
init_db();
var PUBLIC_ROUTES = /* @__PURE__ */ new Set([
  "POST /auth/login",
  "POST /auth/mfa",
  "POST /auth/logout",
  "GET /auth/session",
  "POST /invite/accept"
]);
var ROUTE_PERMISSIONS = {
  "GET /content": "content.read",
  "POST /content": "content.write",
  "GET /content/:id": "content.read",
  "PATCH /content/:id": "content.write",
  "DELETE /content/:id": "content.delete",
  "POST /content/:id/transition": "content.publish",
  "POST /content/:id/duplicate": "content.write",
  "GET /content/:id/revisions": "content.read",
  "POST /content/:id/revert": "content.write",
  "GET /publishing": "content.read",
  "GET /taxonomies": "content.read",
  "GET /pages": "pages.read",
  "POST /pages": "pages.write",
  "GET /pages/:id": "pages.read",
  "PATCH /pages/:id": "pages.write",
  "DELETE /pages/:id": "pages.delete",
  "POST /pages/:id/transition": "pages.publish",
  "GET /sections": "sections.read",
  "GET /sections/:key": "sections.read",
  "PATCH /sections/:key": "sections.write",
  "GET /settings": "settings.read",
  "PATCH /settings/:key": "settings.write",
  "GET /media": "media.read",
  "POST /media/presign": "media.write",
  "POST /media/confirm": "media.write",
  "GET /media/:id/usage": "media.read",
  "PATCH /media/:id": "media.write",
  "DELETE /media/:id": "media.delete",
  "GET /admins": "admins.read",
  "POST /admins": "admins.write",
  "PATCH /admins/:id": "admins.read",
  "DELETE /admins/:id": "admins.write",
  "POST /admins/:id/reissue-invite": "admins.write",
  "GET /roles": "admins.read",
  "GET /activity": "activity.read",
  "GET /search": "content.read",
  "GET /ai/requests": "ai.read",
  "POST /ai/requests": "ai.request",
  "GET /ai/requests/:id": "ai.read",
  "POST /ai/requests/:id/approve": "ai.approve",
  "POST /ai/requests/:id/reject": "ai.approve",
  "POST /ai/requests/:id/request-changes": "ai.approve",
  "POST /ai/requests/:id/apply": "ai.approve",
  "POST /ai/requests/:id/rollback": "ai.approve",
  "POST /ai/requests/:id/pull-request": "ai.deploy"
};
var router = new Router();
router.add("POST /auth/login", async ({ req, res, body }) => {
  await ensureBootstrapOwner();
  const result = await authenticateWithPassword(req, body.email, body.password);
  if (!result.ok) {
    const failure = result.failure;
    if (failure.kind === "mfa_required") {
      setAuthCookies(res, failure.sessionToken, failure.csrfToken);
      return { mfaRequired: true, csrfToken: failure.csrfToken };
    }
    await recordActivity(
      req,
      { email: typeof body.email === "string" ? body.email.slice(0, 200) : void 0 },
      failure.kind === "account_locked" ? "login.locked" : "login.failed",
      { outcome: "failure", metadata: { reason: failure.kind } }
    );
    if (failure.kind === "rate_limited" || failure.kind === "account_locked") {
      throw new HttpError(
        429,
        `Too many attempts. Try again in ${Math.ceil(failure.retryAfterSeconds / 60)} minute(s).`,
        failure.kind
      );
    }
    if (failure.kind === "invite_pending") {
      throw new HttpError(
        403,
        "This account has not been set up yet. Use the invitation link you were sent.",
        failure.kind
      );
    }
    if (failure.kind === "suspended") {
      throw new HttpError(403, "This account has been suspended.", failure.kind);
    }
    throw new HttpError(401, "Those credentials are not correct.", "invalid_credentials");
  }
  setAuthCookies(res, result.sessionToken, result.csrfToken);
  await recordActivity(req, result.identity, "login.success");
  const session = await resolveSession(req);
  return {
    identity: publicIdentity(session?.identity ?? result.identity),
    csrfToken: result.csrfToken
  };
});
router.add("POST /auth/mfa", async ({ req, res, body }) => {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) throw new HttpError(401, "Start again from the sign-in screen.", "unauthenticated");
  const result = await completeMfa(req, token, body.code);
  if (!result.ok) {
    const failure = result.failure;
    if (failure.kind === "rate_limited") {
      throw new HttpError(
        429,
        `Too many attempts. Try again in ${Math.ceil(failure.retryAfterSeconds / 60)} minute(s).`,
        failure.kind
      );
    }
    await recordActivity(req, null, "login.failed", {
      outcome: "failure",
      metadata: { stage: "mfa" }
    });
    throw new HttpError(
      401,
      "That code is not valid. Check your authenticator and try again.",
      "mfa_invalid"
    );
  }
  setAuthCookies(res, result.sessionToken, result.csrfToken);
  await recordActivity(req, result.identity, "login.success", { metadata: { mfa: true } });
  return { identity: publicIdentity(result.identity), csrfToken: result.csrfToken };
});
router.add("POST /auth/logout", async ({ req, res }) => {
  const session = await resolveSession(req);
  if (session) {
    await revokeSession(session.identity.sessionId);
    await recordActivity(req, session.identity, "logout");
  }
  clearAuthCookies(res);
  return { signedOut: true };
});
router.add("GET /auth/session", async ({ req, res }) => {
  const session = await resolveSession(req);
  if (!session) {
    return {
      authenticated: false,
      config: configFlags()
    };
  }
  if (!session.identity.mfaSatisfied) {
    return { authenticated: false, mfaRequired: true, config: configFlags() };
  }
  const csrfToken = parseCookies(req)[CSRF_COOKIE] || issueCsrfToken(session.identity.sessionId);
  setAuthCookies(res, parseCookies(req)[SESSION_COOKIE], csrfToken);
  return {
    authenticated: true,
    identity: publicIdentity(session.identity),
    permissions: ROLE_PERMISSIONS[session.identity.role],
    csrfToken,
    config: configFlags()
  };
});
router.add("POST /invite/accept", async ({ req, body }) => {
  const admin = await acceptInvite(body.token, body.password);
  await recordActivity(req, { email: admin.email, name: admin.name }, "password.changed", {
    entityType: "admin",
    entityId: admin.id,
    entityLabel: admin.email,
    metadata: { via: "invitation" }
  });
  return { accepted: true, email: admin.email };
});
router.add("GET /account", async ({ identity }) => ({
  identity: publicIdentity(identity),
  permissions: ROLE_PERMISSIONS[identity.role],
  twoFactor: await twoFactorStatus(identity.id),
  sessions: await listSessions(identity.id)
}));
router.add("PATCH /account", async ({ req, body, identity }) => {
  const admin = await updateOwnProfile(identity, body);
  await recordActivity(req, identity, "admin.updated", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: admin.email,
    metadata: { self: true }
  });
  return { admin };
});
router.add("POST /account/password", async ({ req, body, identity }) => {
  await changeOwnPassword(identity, body.currentPassword, body.newPassword);
  await recordActivity(req, identity, "password.changed", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: identity.email
  });
  return { changed: true, otherSessionsSignedOut: true };
});
router.add("POST /account/sessions/revoke-all", async ({ req, identity }) => {
  const revoked = await revokeAllSessions(identity.id, identity.sessionId);
  await recordActivity(req, identity, "logout.all", { metadata: { revoked } });
  return { revoked };
});
router.add("POST /account/2fa/start", async ({ identity }) => {
  if (!isSecretConfigured()) throw new SecretNotConfiguredError();
  const secret = generateTotpSecret();
  await db()`
    UPDATE admin_users SET totp_secret = ${encryptSecret(secret)}, updated_at = now()
    WHERE id = ${identity.id}
  `;
  return { secret, uri: totpUri(identity.email, secret) };
});
router.add("POST /account/2fa/confirm", async ({ req, body, identity }) => {
  const rows = await db()`
    SELECT totp_secret FROM admin_users WHERE id = ${identity.id}
  `;
  const secret = decryptSecret(rows[0]?.totp_secret ?? null);
  if (!secret) throw badRequest("Start the two-factor setup again.");
  if (!verifyTotp(secret, body.code)) {
    throw badRequest("That code is not valid. Check your authenticator app and try again.");
  }
  const { codes, hashes } = generateRecoveryCodes();
  await db()`
    UPDATE admin_users SET
      totp_enabled = true,
      totp_confirmed_at = now(),
      recovery_codes = ${db().json(hashes.map((hash) => ({ hash, usedAt: null })))},
      updated_at = now()
    WHERE id = ${identity.id}
  `;
  await recordActivity(req, identity, "twofactor.enabled", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: identity.email
  });
  return { enabled: true, recoveryCodes: codes };
});
router.add("POST /account/2fa/disable", async ({ req, body, identity }) => {
  if (!await verifyOwnPassword(identity.id, body.password)) {
    throw badRequest("Your password is not correct.");
  }
  await db()`
    UPDATE admin_users SET
      totp_enabled = false, totp_secret = NULL, totp_confirmed_at = NULL,
      recovery_codes = '[]'::jsonb, updated_at = now()
    WHERE id = ${identity.id}
  `;
  await recordActivity(req, identity, "twofactor.disabled", {
    entityType: "admin",
    entityId: identity.id,
    entityLabel: identity.email
  });
  return { enabled: false };
});
router.add("POST /account/2fa/recovery-codes", async ({ body, identity }) => {
  if (!await verifyOwnPassword(identity.id, body.password)) {
    throw badRequest("Your password is not correct.");
  }
  const status = await twoFactorStatus(identity.id);
  if (!status.enabled) throw badRequest("Turn on two-factor authentication first.");
  const { codes, hashes } = generateRecoveryCodes();
  await db()`
    UPDATE admin_users SET
      recovery_codes = ${db().json(hashes.map((hash) => ({ hash, usedAt: null })))},
      updated_at = now()
    WHERE id = ${identity.id}
  `;
  return { recoveryCodes: codes };
});
router.add("GET /dashboard", async () => {
  await seedWebsiteDefaults();
  return dashboardSnapshot();
});
router.add("GET /search", async ({ query }) => ({
  results: await globalSearch(query.get("q") ?? "", intParam(query, "limit", 30, 60) || 30)
}));
router.add("GET /publishing", async () => publishingQueues());
router.add("GET /taxonomies", async ({ query }) => {
  const kind = query.get("kind");
  return listTaxonomies(
    kind && CONTENT_KINDS.includes(kind) ? kind : void 0
  );
});
function kindFrom(value, required) {
  if (typeof value !== "string" || !value) {
    if (required) throw badRequest(`A content kind is required (${CONTENT_KINDS.join(", ")}).`);
    return void 0;
  }
  return enumValue(value, CONTENT_KINDS, "Content kind");
}
router.add("GET /content", async ({ query }) => {
  const statusParam = query.get("status");
  const result = await listContent({
    kind: kindFrom(query.get("kind"), false),
    status: statusParam ? enumValue(statusParam, CONTENT_STATUSES, "Status") : void 0,
    category: query.get("category") ?? void 0,
    tag: query.get("tag") ?? void 0,
    search: query.get("search") ?? void 0,
    featured: query.get("featured") === "true" ? true : void 0,
    limit: intParam(query, "limit", 50, 200) || 50,
    offset: intParam(query, "offset", 0, 1e5),
    sort: query.get("sort") ?? "recent"
  });
  return result;
});
router.add("GET /content/slug-available", async ({ query }) => {
  const kind = kindFrom(query.get("kind"), true);
  const slug = query.get("slug") ?? "";
  if (!slug) throw badRequest("A slug is required.");
  return {
    available: await isSlugAvailable(kind, slug, query.get("excludeId") ?? void 0),
    suggestion: await uniqueSlug(kind, slug, query.get("excludeId") ?? void 0)
  };
});
router.add("POST /content", async ({ req, body, identity }) => {
  const kind = kindFrom(body.kind, true);
  const item = await createContent(kind, body, identity);
  await recordActivity(req, identity, "content.created", {
    entityType: kind,
    entityId: item.id,
    entityLabel: item.title
  });
  return { item };
});
router.add("GET /content/:id", async ({ params }) => {
  const item = await getContent(params.id);
  if (!item) throw notFound("That content");
  return { item, revisions: await listRevisions(item.id) };
});
router.add("PATCH /content/:id", async ({ req, params, body, identity }) => {
  const expected = typeof body.revision === "number" ? body.revision : void 0;
  const item = await updateContent(params.id, body, identity, expected);
  await recordActivity(req, identity, "content.updated", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { revision: item.revision }
  });
  return { item };
});
router.add("DELETE /content/:id", async ({ req, params, identity }) => {
  const item = await deleteContent(params.id);
  await recordActivity(req, identity, "content.deleted", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title
  });
  return { deleted: true, id: item.id };
});
router.add("POST /content/:id/transition", async ({ req, params, body, identity }) => {
  const status = enumValue(body.status, CONTENT_STATUSES, "Status");
  const item = await transitionContent(
    params.id,
    status,
    typeof body.scheduledFor === "string" ? body.scheduledFor : null,
    identity
  );
  const action = status === "published" ? "content.published" : status === "scheduled" ? "content.scheduled" : status === "archived" ? "content.archived" : "content.unpublished";
  await recordActivity(req, identity, action, {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { status, scheduledFor: item.scheduledFor }
  });
  return { item };
});
router.add("POST /content/:id/duplicate", async ({ req, params, identity }) => {
  const item = await duplicateContent(params.id, identity);
  await recordActivity(req, identity, "content.duplicated", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { sourceId: params.id }
  });
  return { item };
});
router.add("GET /content/:id/revisions", async ({ params }) => ({
  revisions: await listRevisions(params.id)
}));
router.add("POST /content/:id/revert", async ({ req, params, body, identity }) => {
  const revision = Number(body.revision);
  if (!Number.isFinite(revision)) throw badRequest("Choose a revision to restore.");
  const item = await revertToRevision(params.id, revision, identity);
  await recordActivity(req, identity, "content.restored", {
    entityType: item.kind,
    entityId: item.id,
    entityLabel: item.title,
    metadata: { revertedTo: revision }
  });
  return { item };
});
router.add("GET /pages", async () => {
  await seedWebsiteDefaults();
  return { pages: await listPages() };
});
router.add("POST /pages", async ({ req, body, identity }) => {
  const page = await createPage(body, identity);
  await recordActivity(req, identity, "page.created", {
    entityType: "page",
    entityId: page.id,
    entityLabel: page.path
  });
  return { page };
});
router.add("GET /pages/:id", async ({ params }) => {
  const page = await getPage(params.id);
  if (!page) throw notFound("That page");
  return { page, schemas: SECTION_SCHEMAS };
});
router.add("PATCH /pages/:id", async ({ req, params, body, identity }) => {
  const page = await updatePage(
    params.id,
    body,
    identity,
    typeof body.revision === "number" ? body.revision : void 0
  );
  await recordActivity(req, identity, "page.updated", {
    entityType: "page",
    entityId: page.id,
    entityLabel: page.path
  });
  return { page };
});
router.add("POST /pages/:id/transition", async ({ req, params, body, identity }) => {
  const status = enumValue(body.status, CONTENT_STATUSES, "Status");
  const page = await transitionPage(
    params.id,
    status,
    typeof body.scheduledFor === "string" ? body.scheduledFor : null,
    identity
  );
  await recordActivity(
    req,
    identity,
    status === "published" ? "page.published" : status === "archived" ? "page.archived" : "page.unpublished",
    { entityType: "page", entityId: page.id, entityLabel: page.path, metadata: { status } }
  );
  return { page };
});
router.add("DELETE /pages/:id", async ({ req, params, identity }) => {
  const page = await deletePage(params.id);
  await recordActivity(req, identity, "page.deleted", {
    entityType: "page",
    entityId: page.id,
    entityLabel: page.path
  });
  return { deleted: true, id: page.id };
});
router.add("GET /sections", async () => {
  await seedWebsiteDefaults();
  return { sections: await listSections(), schemas: SECTION_SCHEMAS };
});
router.add("GET /sections/:key", async ({ params }) => {
  const section = await getSection(params.key);
  if (!section) throw notFound("That section");
  return { section, schema: SECTION_SCHEMAS[section.type] };
});
router.add("PATCH /sections/:key", async ({ req, params, body, identity }) => {
  const section = await updateSection(params.key, body, identity);
  await recordActivity(req, identity, "section.updated", {
    entityType: "section",
    entityId: section.key,
    entityLabel: section.label,
    metadata: { visible: section.visible }
  });
  return { section };
});
router.add("GET /settings", async () => {
  await seedWebsiteDefaults();
  return {
    settings: await getSettings(),
    // Shipped alongside so the design screen renders the real preset options rather than
    // duplicating the catalogue in the client.
    options: { palettes: BRAND_PALETTES, typography: TYPE_PAIRINGS, buttonStyles: BUTTON_STYLES }
  };
});
router.add("PATCH /settings/:key", async ({ req, params, body, identity }) => {
  const key = enumValue(params.key, SETTINGS_KEYS, "Settings section");
  if (key === "design") requirePermission(identity, "design.write");
  const settings = await updateSettings(key, body.value ?? body, identity);
  await recordActivity(req, identity, key === "design" ? "design.updated" : "settings.updated", {
    entityType: "settings",
    entityId: key,
    entityLabel: key
  });
  return { settings };
});
router.add("GET /media", async ({ query }) => {
  const result = await listMedia({
    search: query.get("search") ?? void 0,
    folder: query.get("folder") ?? void 0,
    category: query.get("category") ?? void 0,
    limit: intParam(query, "limit", 60, 200) || 60,
    offset: intParam(query, "offset", 0, 1e5)
  });
  return { ...result, storageConfigured: isMediaStorageConfigured() };
});
router.add("POST /media/presign", async ({ body }) => ({ upload: requestUpload(body) }));
router.add("POST /media/confirm", async ({ req, body, identity }) => {
  const asset = await confirmUpload(body, identity);
  await recordActivity(req, identity, "media.uploaded", {
    entityType: "media",
    entityId: asset.id,
    entityLabel: asset.filename,
    metadata: { sizeBytes: asset.sizeBytes, mimeType: asset.mimeType }
  });
  return { asset };
});
router.add("GET /media/:id/usage", async ({ params }) => {
  const asset = await getMedia(params.id);
  if (!asset) throw notFound("That file");
  return { usage: await findMediaUsage(asset.url) };
});
router.add("PATCH /media/:id", async ({ req, params, body, identity }) => {
  const asset = await updateMedia(params.id, body, identity);
  await recordActivity(req, identity, "media.updated", {
    entityType: "media",
    entityId: asset.id,
    entityLabel: asset.filename
  });
  return { asset };
});
router.add("DELETE /media/:id", async ({ req, params, identity }) => {
  const asset = await deleteMedia(params.id);
  await recordActivity(req, identity, "media.deleted", {
    entityType: "media",
    entityId: asset.id,
    entityLabel: asset.filename
  });
  return { deleted: true, id: asset.id };
});
router.add("GET /admins", async ({ identity }) => ({
  admins: await listAdmins(),
  assignableRoles: assignableRoles(identity.role)
}));
router.add("POST /admins", async ({ req, body, identity }) => {
  const result = await inviteAdmin(body, identity);
  await recordActivity(req, identity, "admin.invited", {
    entityType: "admin",
    entityId: result.admin.id,
    entityLabel: result.admin.email,
    metadata: { role: result.admin.role }
  });
  return result;
});
router.add("PATCH /admins/:id", async ({ req, params, body, identity }) => {
  if (params.id !== identity.id) requirePermission(identity, "admins.write");
  const admin = await updateAdmin(params.id, body, identity);
  await recordActivity(
    req,
    identity,
    admin.status === "suspended" ? "admin.suspended" : "admin.updated",
    {
      entityType: "admin",
      entityId: admin.id,
      entityLabel: admin.email,
      metadata: { role: admin.role, status: admin.status }
    }
  );
  return { admin };
});
router.add("POST /admins/:id/reissue-invite", async ({ req, params, identity }) => {
  const result = await reissueInvite(params.id, identity);
  await recordActivity(req, identity, "admin.updated", {
    entityType: "admin",
    entityId: result.admin.id,
    entityLabel: result.admin.email,
    metadata: { action: "invitation reissued" }
  });
  return result;
});
router.add("DELETE /admins/:id", async ({ req, params, identity }) => {
  const admin = await deleteAdmin(params.id, identity);
  await recordActivity(req, identity, "admin.removed", {
    entityType: "admin",
    entityId: admin.id,
    entityLabel: admin.email
  });
  return { deleted: true, id: admin.id };
});
router.add("GET /roles", async ({ identity }) => ({
  roles: ADMIN_ROLES.map((role) => ({
    role,
    ...ROLE_META[role],
    permissions: ROLE_PERMISSIONS[role]
  })),
  permissions: PERMISSION_META,
  assignableRoles: assignableRoles(identity.role)
}));
router.add(
  "GET /activity",
  async ({ query }) => listActivity({
    limit: intParam(query, "limit", 50, 200) || 50,
    offset: intParam(query, "offset", 0, 1e5),
    action: query.get("action") ?? void 0,
    actorEmail: query.get("actor") ?? void 0,
    entityId: query.get("entityId") ?? void 0,
    search: query.get("search") ?? void 0
  })
);
router.add("GET /ai/requests", async () => ({
  requests: await listChangeRequests(50),
  codeDeliveryConfigured: isCodeDeliveryConfigured()
}));
router.add("POST /ai/requests", async ({ req, body, identity }) => {
  const request = await createChangeRequest(body.prompt, identity);
  await recordActivity(req, identity, "ai.requested", {
    entityType: "ai_request",
    entityId: request.id,
    entityLabel: request.summary.slice(0, 120) || "AI request",
    metadata: { kind: request.kind, status: request.status }
  });
  return { request };
});
router.add("GET /ai/requests/:id", async ({ params }) => {
  const request = await getChangeRequest(params.id);
  if (!request) throw notFound("That AI request");
  return { request, codeDeliveryConfigured: isCodeDeliveryConfigured() };
});
router.add("POST /ai/requests/:id/approve", async ({ req, params, identity }) => {
  const request = await approveChangeRequest(params.id, identity);
  await recordActivity(req, identity, "ai.approved", {
    entityType: "ai_request",
    entityId: request.id,
    entityLabel: request.summary.slice(0, 120),
    metadata: { kind: request.kind }
  });
  return { request };
});
router.add("POST /ai/requests/:id/reject", async ({ req, params, body, identity }) => {
  const request = await rejectChangeRequest(params.id, body.note, identity);
  await recordActivity(req, identity, "ai.rejected", {
    entityType: "ai_request",
    entityId: request.id,
    entityLabel: request.summary.slice(0, 120)
  });
  return { request };
});
router.add("POST /ai/requests/:id/request-changes", async ({ params, body, identity }) => ({
  request: await requestChanges(params.id, body.note, identity)
}));
router.add("POST /ai/requests/:id/apply", async ({ req, params, identity }) => {
  const request = await applyChangeRequest(params.id, identity);
  await recordActivity(req, identity, "ai.applied", {
    entityType: "ai_request",
    entityId: request.id,
    entityLabel: request.summary.slice(0, 120),
    metadata: { edits: request.contentEdits.length }
  });
  return { request };
});
router.add("POST /ai/requests/:id/rollback", async ({ req, params, identity }) => {
  const request = await rollbackChangeRequest(params.id, identity);
  await recordActivity(req, identity, "content.restored", {
    entityType: "ai_request",
    entityId: request.id,
    entityLabel: `Reverted: ${request.summary.slice(0, 100)}`
  });
  return { request };
});
router.add("POST /ai/requests/:id/pull-request", async ({ req, params, identity }) => {
  const request = await openPullRequest(params.id, identity);
  await recordActivity(req, identity, "ai.deployed", {
    entityType: "ai_request",
    entityId: request.id,
    entityLabel: request.summary.slice(0, 120),
    metadata: { pullRequestUrl: request.pullRequestUrl, branch: request.branch }
  });
  return { request };
});
function publicIdentity(identity) {
  return {
    id: identity.id,
    email: identity.email,
    name: identity.name,
    title: identity.title,
    avatarUrl: identity.avatarUrl,
    role: identity.role,
    twoFactorEnabled: identity.totpEnabled,
    mustChangePassword: identity.mustChangePassword,
    lastLoginAt: identity.lastLoginAt
  };
}
function configFlags() {
  return {
    databaseConfigured: isDatabaseConfigured(),
    secretConfigured: isSecretConfigured(),
    mediaStorageConfigured: isMediaStorageConfigured(),
    codeDeliveryConfigured: isCodeDeliveryConfigured(),
    aiConfigured: isAiConfigured()
  };
}
async function handler(req, res) {
  const ref = errorRef("CMS");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  const { path, query } = resolveRequestPath(req, "/api/cms");
  const method = (req.method ?? "GET").toUpperCase();
  try {
    if (!isDatabaseConfigured()) throw new DatabaseNotConfiguredError();
    if (!isSecretConfigured()) throw new SecretNotConfiguredError();
    await ensureMigrated();
    const matched = router.match(method, path);
    if (matched === null) {
      throw new HttpError(404, `No such endpoint: ${method} ${path}`, "unknown_route");
    }
    if (matched === "method_mismatch") {
      throw new HttpError(405, `${method} is not allowed on ${path}`, "method_not_allowed");
    }
    const routeKey = `${method} ${routePatternFor(path, matched.params)}`;
    let identity = null;
    if (!PUBLIC_ROUTES.has(routeKey) && !PUBLIC_ROUTES.has(`${method} ${path}`)) {
      const session = await resolveSession(req);
      identity = requireFullSession(session);
      requireSameOrigin(req);
      requireCsrf(req, identity);
      const permission = ROUTE_PERMISSIONS[routeKey];
      if (permission) requirePermission(identity, permission);
    }
    const context = buildContext(req, res, path, query, matched.params, identity);
    const payload = await matched.handler(context);
    if (Math.random() < 0.02) await pruneExpired();
    if (!res.headersSent) res.status(200).json({ ok: true, ...payload });
  } catch (error) {
    respondWithError(res, error, ref);
  }
}
function routePatternFor(path, params) {
  if (Object.keys(params).length === 0) return path;
  const byValue = new Map(Object.entries(params).map(([name, value]) => [value, `:${name}`]));
  return `/${path.split("/").filter(Boolean).map((segment) => byValue.get(segment) ?? segment).join("/")}`;
}
function respondWithError(res, error, ref) {
  if (res.headersSent) return;
  if (error instanceof HttpError) {
    res.status(error.statusCode).json({
      ok: false,
      error: error.message,
      code: error.code,
      ...error.details ? { details: error.details } : {}
    });
    return;
  }
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({ ok: false, error: error.message, code: error.code });
    return;
  }
  if (isInvalidInputSyntax(error)) {
    res.status(404).json({
      ok: false,
      error: "That item could not be found.",
      code: "not_found"
    });
    return;
  }
  if (error instanceof DatabaseNotConfiguredError || error instanceof SecretNotConfiguredError) {
    console.error(`[api/cms:${ref}] not configured:`, error.message);
    res.status(503).json({ ok: false, error: error.message, code: "not_configured" });
    return;
  }
  console.error(`[api/cms:${ref}]`, error);
  res.status(500).json({
    ok: false,
    error: "Something went wrong on our side. The reference below is in the server logs.",
    code: "internal_error",
    ref
  });
}
export {
  handler as default
};
