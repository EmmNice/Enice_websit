import{createRequire as __nodeCreateRequire}from'node:module';const require=__nodeCreateRequire(import.meta.url);

// src/lib/cms/types.ts
var CONTENT_KINDS = ["blog", "announcement", "update", "news"];
var CONTENT_KIND_META = {
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
var CONTENT_STATUSES = ["draft", "scheduled", "published", "archived"];
var CONTENT_KIND_SEGMENT = {
  blog: "blog",
  announcement: "announcements",
  update: "updates",
  news: "news"
};
var KIND_BY_SEGMENT = new Map(
  Object.entries(CONTENT_KIND_SEGMENT).map(([kind, segment]) => [segment, kind])
);
var SECTION_SCHEMAS = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Page-opening headline with supporting copy and up to two actions.",
    icon: "Sparkles",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small label above the headline." },
      {
        key: "heading",
        label: "Headline",
        type: "text",
        required: true,
        help: "Style with **bold** and [[highlight]] (highlight shows in the accent colour). A new line splits the headline."
      },
      {
        key: "subheading",
        label: "Supporting copy",
        type: "textarea",
        help: "Supports **bold** and [[highlight]]."
      },
      { key: "primaryCtaLabel", label: "Primary button label", type: "text" },
      { key: "primaryCtaUrl", label: "Primary button URL", type: "url" },
      { key: "secondaryCtaLabel", label: "Secondary button label", type: "text" },
      { key: "secondaryCtaUrl", label: "Secondary button URL", type: "url" },
      { key: "image", label: "Accompanying image", type: "image" }
    ]
  },
  /**
   * A heading with plain paragraphs.
   *
   * Distinct from `richText`, which uses the full block editor and its own article typography.
   * These bands are body copy inside a page's existing layout, so they must inherit that layout's
   * type styling exactly — a paragraph here is text, not a document. Editing is a single textarea,
   * which is also less work than a block editor for what is only ever a few paragraphs.
   */
  prose: {
    type: "prose",
    label: "Text band",
    description: "A heading with one or more paragraphs.",
    icon: "AlignLeft",
    fields: [
      // `hero`, `featureGrid` and `faq` all carry an eyebrow; `prose` and `cta` did not, which
      // meant the small label above a text or hiring band was the one string on those sections an
      // editor could not change. Optional, so an existing section without one is unaffected.
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small label above the heading." },
      {
        key: "heading",
        label: "Heading",
        type: "text",
        help: "Style with **bold** and [[highlight]]."
      },
      {
        key: "body",
        label: "Paragraphs",
        type: "textarea",
        required: true,
        help: "Leave a blank line between paragraphs. Supports **bold** and [[highlight]]."
      }
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
      {
        key: "heading",
        label: "Heading",
        type: "text",
        required: true,
        help: "Style with **bold** and [[highlight]]. A new line splits the heading."
      },
      {
        key: "subheading",
        label: "Supporting copy",
        type: "textarea",
        help: "Supports **bold** and [[highlight]]."
      },
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
          { key: "kicker", label: "Kicker", type: "text", help: "Small label above the title." },
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
          {
            key: "bullets",
            label: "Bullet points",
            type: "textarea",
            help: "One per line. Rendered as a ticked list."
          },
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
          { key: "tagline", label: "Tagline (sub-line)", type: "text" },
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
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small label above the heading." },
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
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small label above the heading." },
      {
        key: "heading",
        label: "Heading",
        type: "text",
        help: "Style with **bold** and [[highlight]]."
      },
      {
        key: "subheading",
        label: "Supporting copy",
        type: "textarea",
        help: "Supports **bold** and [[highlight]]."
      },
      {
        key: "items",
        label: "Questions",
        type: "repeater",
        max: 30,
        of: [
          { key: "question", label: "Question", type: "text", required: true },
          {
            key: "answer",
            label: "Answer",
            type: "textarea",
            required: true,
            help: "Plain text. These answers are also published as FAQ search markup, so keep them factual and avoid styling."
          }
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
      { key: "eyebrow", label: "Eyebrow", type: "text", help: "Small label above the heading." },
      {
        key: "heading",
        label: "Heading",
        type: "text",
        help: "Style with **bold** and [[highlight]]."
      },
      {
        key: "subheading",
        label: "Supporting copy",
        type: "textarea",
        help: "Supports **bold** and [[highlight]]."
      },
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
        // Raised from 8. The roadmap is a `steps` section and already has nine milestones, so the
        // old ceiling silently dropped the last one on a fresh-install seed and would have dropped
        // it again on the first admin save of that section — `sanitizeSectionFields` trims to `max`.
        type: "repeater",
        max: 16,
        of: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" }
        ]
      }
    ]
  }
};
var MEDIA_LIMITS = {
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
var KNOWLEDGE_MAX_CHARS = 2e5;

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
  // AI assistant knowledge base (what the public chatbot is trained on).
  "ai.knowledge.read",
  "ai.knowledge.write"
];
var ROLE_PERMISSIONS = {
  owner: PERMISSIONS,
  administrator: [
    "content.read",
    "content.write",
    "content.publish",
    "content.delete",
    "ai.knowledge.read",
    "ai.knowledge.write"
  ],
  editor: ["content.read", "content.write", "content.publish", "ai.knowledge.read"]
};
function can(role, permission) {
  if (!role) return false;
  const granted = ROLE_PERMISSIONS[role];
  return granted ? granted.includes(permission) : false;
}

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

// api-src/lib/db.ts
import { randomUUID } from "node:crypto";

// node_modules/postgres/src/index.js
import os from "os";
import fs from "fs";

// node_modules/postgres/src/query.js
var originCache = /* @__PURE__ */ new Map();
var originStackCache = /* @__PURE__ */ new Map();
var originError = /* @__PURE__ */ Symbol("OriginError");
var CLOSE = {};
var Query = class extends Promise {
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
function cachedError(xs) {
  if (originCache.has(xs))
    return originCache.get(xs);
  const x = Error.stackTraceLimit;
  Error.stackTraceLimit = 4;
  originCache.set(xs, new Error());
  Error.stackTraceLimit = x;
  return originCache.get(xs);
}

// node_modules/postgres/src/errors.js
var PostgresError = class extends Error {
  constructor(x) {
    super(x.message);
    this.name = this.constructor.name;
    Object.assign(this, x);
  }
};
var Errors = {
  connection,
  postgres,
  generic,
  notSupported
};
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

// node_modules/postgres/src/types.js
var types = {
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
var NotTagged = class {
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
var Identifier = class extends NotTagged {
  constructor(value) {
    super();
    this.value = escapeIdentifier(value);
  }
};
var Parameter = class extends NotTagged {
  constructor(value, type, array) {
    super();
    this.value = value;
    this.type = type;
    this.array = array;
  }
};
var Builder = class extends NotTagged {
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
var defaultHandlers = typeHandlers(types);
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
var builders = Object.entries({
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
function notTagged() {
  throw Errors.generic("NOT_TAGGED_CALL", "Query not called as a tagged template literal");
}
var serializers = defaultHandlers.serializers;
var parsers = defaultHandlers.parsers;
function firstIsString(x) {
  if (Array.isArray(x))
    return firstIsString(x[0]);
  return typeof x === "string" ? 1009 : 0;
}
var mergeUserTypes = function(types2) {
  const user = typeHandlers(types2 || {});
  return {
    serializers: Object.assign({}, serializers, user.serializers),
    parsers: Object.assign({}, parsers, user.parsers)
  };
};
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
var escapeIdentifier = function escape(str) {
  return '"' + str.replace(/"/g, '""').replace(/\./g, '"."') + '"';
};
var inferType = function inferType2(x) {
  return x instanceof Parameter ? x.type : x instanceof Date ? 1184 : x instanceof Uint8Array ? 17 : x === true || x === false ? 16 : typeof x === "bigint" ? 20 : Array.isArray(x) ? inferType2(x[0]) : 0;
};
var escapeBackslash = /\\/g;
var escapeQuote = /"/g;
function arrayEscape(x) {
  return x.replace(escapeBackslash, "\\\\").replace(escapeQuote, '\\"');
}
var arraySerializer = function arraySerializer2(xs, serializer, options, typarray) {
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
var arrayParserState = {
  i: 0,
  char: null,
  str: "",
  quoted: false,
  last: 0
};
var arrayParser = function arrayParser2(x, parser, typarray) {
  arrayParserState.i = arrayParserState.last = 0;
  return arrayParserLoop(arrayParserState, x, parser, typarray);
};
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
var toCamel = (x) => {
  let str = x[0];
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toPascal = (x) => {
  let str = x[0].toUpperCase();
  for (let i = 1; i < x.length; i++)
    str += x[i] === "_" ? x[++i].toUpperCase() : x[i];
  return str;
};
var toKebab = (x) => x.replace(/_/g, "-");
var fromCamel = (x) => x.replace(/([A-Z])/g, "_$1").toLowerCase();
var fromPascal = (x) => (x.slice(0, 1) + x.slice(1).replace(/([A-Z])/g, "_$1")).toLowerCase();
var fromKebab = (x) => x.replace(/-/g, "_");
function createJsonTransform(fn) {
  return function jsonTransform(x, column) {
    return typeof x === "object" && x !== null && (column.type === 114 || column.type === 3802) ? Array.isArray(x) ? x.map((x2) => jsonTransform(x2, column)) : Object.entries(x).reduce((acc, [k, v]) => Object.assign(acc, { [fn(k)]: jsonTransform(v, column) }), {}) : x;
  };
}
toCamel.column = { from: toCamel };
toCamel.value = { from: createJsonTransform(toCamel) };
fromCamel.column = { to: fromCamel };
var camel = { ...toCamel };
camel.column.to = fromCamel;
toPascal.column = { from: toPascal };
toPascal.value = { from: createJsonTransform(toPascal) };
fromPascal.column = { to: fromPascal };
var pascal = { ...toPascal };
pascal.column.to = fromPascal;
toKebab.column = { from: toKebab };
toKebab.value = { from: createJsonTransform(toKebab) };
fromKebab.column = { to: fromKebab };
var kebab = { ...toKebab };
kebab.column.to = fromKebab;

// node_modules/postgres/src/connection.js
import net from "net";
import tls from "tls";
import crypto from "crypto";
import Stream from "stream";
import { performance } from "perf_hooks";

// node_modules/postgres/src/result.js
var Result = class extends Array {
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

// node_modules/postgres/src/queue.js
var queue_default = Queue;
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

// node_modules/postgres/src/bytes.js
var size = 256;
var buffer = Buffer.allocUnsafe(size);
var messages = "BCcDdEFfHPpQSX".split("").reduce((acc, x) => {
  const v = x.charCodeAt(0);
  acc[x] = () => {
    buffer[0] = v;
    b.i = 5;
    return b;
  };
  return acc;
}, {});
var b = Object.assign(reset, messages, {
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
var bytes_default = b;
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

// node_modules/postgres/src/connection.js
var connection_default = Connection;
var uid = 1;
var Sync = bytes_default().S().end();
var Flush = bytes_default().H().end();
var SSLRequest = bytes_default().i32(8).i32(80877103).end(8);
var ExecuteUnnamed = Buffer.concat([bytes_default().E().str(bytes_default.N).i32(0).end(), Sync]);
var DescribeUnnamed = bytes_default().D().str("S").str(bytes_default.N).end();
var noop = () => {
};
var retryRoutines = /* @__PURE__ */ new Set([
  "FetchPreparedStatement",
  "RevalidateCachedQuery",
  "transformAssignedExpr"
]);
var errorFields = {
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

// node_modules/postgres/src/subscribe.js
var noop2 = () => {
};
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

// node_modules/postgres/src/index.js
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
var src_default = Postgres;
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

// api-src/lib/env.ts
function findEnv(names, accept = () => true, env = process.env) {
  for (const name of names) {
    const matches = Object.keys(env).filter((key) => key === name || key.endsWith(`_${name}`)).filter((key) => {
      const value = (env[key] ?? "").trim();
      return value !== "" && accept(value);
    }).sort((a, b2) => a.length - b2.length || a.localeCompare(b2));
    const match = matches[0];
    if (match !== void 0) return { name: match, value: env[match].trim() };
  }
  return null;
}

// api-src/lib/schema.ts
var MIGRATIONS = [
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
  },
  {
    id: 2,
    name: "knowledge_base",
    sql: (
      /* sql */
      `
-- \u2500\u2500\u2500 AI assistant knowledge base \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
-- Curated facts the PUBLIC chatbot (api/chat) grounds its answers in, so the site owner
-- can teach the assistant without a code change to the static system prompt.
--
-- An entry is either a typed note or the text extracted from an uploaded PDF; 'source_kind'
-- records which. The bytes of a PDF live in object storage like any other media \u2014 only the
-- extracted text is stored here, because that is what retrieval needs.
--
-- Retrieval is native Postgres full-text search over 'search_text' (title + body), exactly as
-- content_items and media_assets already do. Deliberately NOT pgvector: that needs
-- CREATE EXTENSION, which managed Postgres may refuse, and would break the zero-extension
-- guarantee the rest of this schema keeps. 'english' is a core dictionary, no extension needed.
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id                uuid PRIMARY KEY,
  title             text NOT NULL DEFAULT '',
  body              text NOT NULL DEFAULT '',
  -- 'note' (typed) | 'pdf' (extracted). Kept as text, not an enum, so a new source needs
  -- no migration.
  source_kind       text NOT NULL DEFAULT 'note',
  -- Original filename for a PDF, so the UI can show what an entry came from.
  source_name       text,
  -- Where the uploaded document is readable, when the entry came from one.
  source_url        text,
  storage_key       text,
  -- 'active' entries are eligible for retrieval; 'disabled' are kept but never surfaced to
  -- the assistant, so an entry can be parked without deleting it.
  status            text NOT NULL DEFAULT 'active',
  tags              text[] NOT NULL DEFAULT '{}',
  -- Derived on write (title || ' ' || body). Never selected back; only fed to to_tsvector.
  search_text       text NOT NULL DEFAULT '',
  created_by_email  text,
  updated_by_email  text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_entries_search_idx
  ON knowledge_entries USING gin (to_tsvector('english', search_text));
CREATE INDEX IF NOT EXISTS knowledge_entries_status_idx
  ON knowledge_entries (status, updated_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_entries_recent_idx
  ON knowledge_entries (updated_at DESC);
`
    )
  },
  {
    id: 3,
    name: "seed_partner_logos",
    sql: (
      /* sql */
      `
-- Populate the homepage partners strip with the infrastructure providers, each with a
-- self-hosted brand logo (public/partners/*.svg). Before this, the strip's default content was
-- empty, so once the homepage was wired to the CMS it showed only whatever an administrator had
-- typed. This seeds the providers so the strip looks complete out of the box, while leaving any
-- partners the administrator already added in place \u2014 their entries are kept, the providers are
-- prepended. Guarded on the AWS entry so re-running (or an operator who already added AWS) is a
-- no-op rather than creating duplicates.
UPDATE site_sections
SET fields = jsonb_set(
  COALESCE(fields, '{}'::jsonb),
  '{items}',
  '[
    {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
    {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
    {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
    {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
    {"name":"AWS Activate","tagline":"Startup Program","logo":"/partners/aws-activate.svg","url":"https://aws.amazon.com/activate/"},
    {"name":"Resend","tagline":"Transactional Email","logo":"/partners/resend.svg","url":"https://resend.com"}
  ]'::jsonb || COALESCE(fields->'items', '[]'::jsonb)
)
WHERE key = 'home.partners'
  AND NOT (COALESCE(fields->'items', '[]'::jsonb) @> '[{"name":"Amazon Web Services"}]'::jsonb);
`
    )
  },
  {
    id: 4,
    name: "repair_partners_section",
    sql: (
      /* sql */
      `
-- Repair the homepage partners strip so it is present, visible and populated regardless of the
-- state it was left in while editing. Migration 3 only updated an existing row's items; if the
-- row was missing or had been hidden/unpublished, the strip would still not appear once the
-- homepage reads it from the CMS. This upserts the section: it creates it if absent, forces it
-- back to visible + published, and ensures the infrastructure providers are present (prepended,
-- keeping any partners already added). Idempotent \u2014 providers are only added when absent.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES (
  'home.partners', 'Partners strip', 'Home', 'logoStrip', true, 'published',
  '{"heading":"Working with","items":[
    {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
    {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
    {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
    {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
    {"name":"AWS Activate","tagline":"Startup Program","logo":"/partners/aws-activate.svg","url":"https://aws.amazon.com/activate/"},
    {"name":"Resend","tagline":"Transactional Email","logo":"/partners/resend.svg","url":"https://resend.com"}
  ]}'::jsonb,
  40
)
ON CONFLICT (key) DO UPDATE SET
  visible = true,
  status = 'published',
  fields = jsonb_set(
    COALESCE(site_sections.fields, '{}'::jsonb),
    '{items}',
    CASE
      WHEN COALESCE(site_sections.fields->'items', '[]'::jsonb) @> '[{"name":"Amazon Web Services"}]'::jsonb
        THEN site_sections.fields->'items'
      ELSE '[
        {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
        {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
        {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
        {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
        {"name":"AWS Activate","tagline":"Startup Program","logo":"/partners/aws-activate.svg","url":"https://aws.amazon.com/activate/"},
        {"name":"Resend","tagline":"Transactional Email","logo":"/partners/resend.svg","url":"https://resend.com"}
      ]'::jsonb || COALESCE(site_sections.fields->'items', '[]'::jsonb)
    END
  ),
  updated_at = now();
`
    )
  },
  {
    id: 5,
    name: "hero_current_copy",
    sql: (
      /* sql */
      `
-- The homepage hero is now rendered from this section. Set its content to the copy the site
-- already displays, so wiring it changes nothing visible. Only applied when the hero still holds
-- the original generic seed heading, so an operator who has edited it is left untouched. In the
-- heading, a newline splits the line and [[...]] marks the phrase shown in the accent colour.
UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "Technology Group \xB7 Building for Africa",
  "heading": "We build the technology\\n[[behind Africa''s next]]\\ngeneration of\\nbusinesses.",
  "subheading": "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
  "primaryCtaLabel": "Explore our products",
  "primaryCtaUrl": "/portfolio",
  "secondaryCtaLabel": "What we build",
  "secondaryCtaUrl": "/about"
}'::jsonb,
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'Technology products for financial services, commerce, and communication';
`
    )
  },
  {
    id: 6,
    name: "home_bands_current_copy",
    sql: (
      /* sql */
      `
-- The hero's statistics strip and the product band's heading are now rendered from these
-- sections, so set them to the copy the site already displays \u2014 wiring them changes nothing
-- visible. Each is guarded on its original seed value, so a band an operator has already edited
-- is left alone.
UPDATE site_sections
SET fields = fields || '{
  "heading": "Built for scale",
  "items": [
    {"value":"4","label":"Products in Ecosystem"},
    {"value":"99.99%","label":"Infrastructure SLA"},
    {"value":"< 14ms","label":"API Latency P50"},
    {"value":"AES-256","label":"Encryption Standard"}
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Products in the portfolio"}]'::jsonb;

UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "What we''re building",
  "heading": "Products and platforms.\\nBuilt to one standard.",
  "subheading": "ENICE Group takes hard problems in financial services and business communication and turns them into products people can rely on."
}'::jsonb,
    updated_at = now()
WHERE key = 'home.products'
  AND fields->>'heading' = 'What we build';
`
    )
  },
  {
    id: 7,
    name: "home_product_cards",
    sql: (
      /* sql */
      `
-- The homepage product band renders its cards from this section's items. Its seeded items were a
-- five-entry product list that the homepage never rendered, so set them to the three cards the
-- band actually shows \u2014 wiring the cards changes nothing visible, and they become editable.
-- Guarded on the original seed (the PulsePay entry), so a list an operator has already edited is
-- left untouched. Bullets are newline-separated in one field; card numbering is positional.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
  {
    "icon": "Banknote",
    "kicker": "Fintech",
    "title": "Financial Infrastructure Systems",
    "description": "Transaction networks, ledger databases, and virtual card infrastructure built for Nigeria''s digital economy, with room to expand across the region.",
    "bullets": "Virtual Card Issuance\\nTreasury and Ledger\\nKYC and Compliance Tooling"
  },
  {
    "icon": "BrainCircuit",
    "kicker": "Artificial Intelligence",
    "title": "Autonomous Enterprise AI",
    "description": "Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
    "bullets": "Autonomous Customer Support\\nPolicy-Bound AI Agents\\nWorkflow Automation"
  },
  {
    "icon": "Boxes",
    "kicker": "Product Engineering",
    "title": "Products built to operate",
    "description": "We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
    "bullets": "Product Ownership\\nPlatform Engineering\\nContinuous Operation"
  }
]'::jsonb),
    updated_at = now()
WHERE key = 'home.products'
  AND fields->'items' @> '[{"title":"PulsePay"}]'::jsonb;
`
    )
  },
  {
    id: 8,
    name: "home_faq_current_copy",
    sql: (
      /* sql */
      `
-- The homepage FAQ is now rendered from this section, and its FAQPage search markup is generated
-- from the same questions, so the two can never describe different things. Seed the section with
-- the questions the page already shows. Guarded on the items list still being empty, so an FAQ an
-- operator has already written is left untouched.
UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "Frequently asked",
  "heading": "Questions, answered.",
  "subheading": "A plain look at the company, the products, and the technology behind them.",
  "items": [
    {
      "question": "What does ENICE Group build?",
      "answer": "ENICE Group builds and operates technology products for financial services, commerce, and business communication. PulsePay is our digital financial platform. PulseAssist handles AI-powered business communication and customer support."
    },
    {
      "question": "Which problems are ENICE products built to solve?",
      "answer": "Our products focus on financial services, telecommunications, and business operations. PulsePay covers digital finance, PulseAssist covers business communication and customer support, and ePulse and PulseX extend the ecosystem into digital banking and digital assets."
    },
    {
      "question": "What does the ENICE Core provide?",
      "answer": "A shared AI and automation pipeline, a fast ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Every product inherits the same scale, security, and observability from day one."
    },
    {
      "question": "How does ENICE Group approach security and compliance?",
      "answer": "We run a zero-trust architecture with per-tenant database isolation, row-level security, audit logging, and continuous monitoring. Every system is built for regulatory readiness from day one and aligned with SOC 2 control objectives."
    },
    {
      "question": "How can businesses access ENICE products?",
      "answer": "Businesses and institutions can reach the ENICE team through the Contact page to ask about product access, licensing, or integration requirements."
    }
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'home.faq'
  AND COALESCE(jsonb_array_length(fields->'items'), 0) = 0;
`
    )
  },
  {
    id: 9,
    name: "about_contact_current_copy",
    sql: (
      /* sql */
      `
-- The About page header and principles band, and the Contact page header, now render from these
-- sections. Seed them with the copy those pages already show, so wiring changes nothing visible.
-- 'about.hero' did not exist before, so it is inserted; the other two are updated only while they
-- still hold their original seed values, leaving an edited band untouched.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.hero', 'About page header', 'About', 'hero', true, 'published',
  '{
  "eyebrow": "About ENICE Group",
  "heading": "We build technology products. [[Then we operate them.]]",
  "subheading": "ENICE Group is the parent company behind a growing set of software products. We find real problems in financial services, commerce, and business communication, then build and run the platforms that solve them."
}'::jsonb, 105)
ON CONFLICT (key) DO NOTHING;

UPDATE site_sections
SET fields = fields || '{
  "heading": "Our Principles",
  "subheading": "These aren''t aspirational values written for a careers page. They''re the standards we hold every decision, every system, and every person on the team to.",
  "items": [
    {
      "title": "Long-Term Thinking",
      "description": "We evaluate decisions against decades, not quarters. We want companies that outlast trends and survive economic cycles. We won''t trade long-term integrity for short-term convenience."
    },
    {
      "title": "Engineering Excellence",
      "description": "We hold our engineering to the standards of regulated industries. Our codebases are documented, our APIs are versioned and backward-compatible, and our system designs favour resilience over novelty."
    },
    {
      "title": "Security by Design",
      "description": "Security isn''t added after a product ships. It''s built in from the start. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard across every product we run. We treat our partners'' data as our responsibility."
    },
    {
      "title": "Customer Obsession",
      "description": "We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it."
    },
    {
      "title": "Institutional Quality",
      "description": "We build for enterprise, not for early adopters willing to tolerate rough edges. Our documentation, onboarding, support, and SLA commitments are built to satisfy legal, compliance, and procurement teams at serious organisations."
    },
    {
      "title": "Responsible AI",
      "description": "AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don''t release a capability until we''re confident in its reliability and we can explain how it works."
    },
    {
      "title": "Continuous Innovation",
      "description": "Staying relevant takes sustained investment in research and experimentation. It isn''t one team''s job, it''s built into how every product team works. We set aside engineering time for exploratory work because what we build in five years doesn''t have a name yet."
    },
    {
      "title": "Ownership Mentality",
      "description": "Everyone at ENICE, from engineers to operations leads, is expected to think like an owner: accountable, deeply knowledgeable in their domain, and biased toward action. We trust people to lead, and we hold them to that standard."
    }
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'about.values'
  AND COALESCE(jsonb_array_length(fields->'items'), 0) = 0;

UPDATE site_sections
SET fields = fields || '{
  "eyebrow": "Corporate Engagement",
  "heading": "Get in Touch",
  "subheading": "Reach the ENICE Group team about product access, platform integration, enterprise licensing, or technology partnerships."
}'::jsonb,
    updated_at = now()
WHERE key = 'contact.details'
  AND fields->>'heading' = 'Contact ENICE Group';
`
    )
  },
  {
    id: 10,
    name: "about_prose_bands",
    sql: (
      /* sql */
      `
-- The About page's five numbered prose bands now render from these sections. Create them with the
-- copy those bands already show, so wiring changes nothing visible. ON CONFLICT DO NOTHING means a
-- band an operator has already written is never overwritten, and re-running is a no-op.
--
-- Paragraphs are separated by a blank line inside 'body'. Note the doubled backslashes: this SQL
-- lives in a JavaScript template literal, where a lone backslash-n would become a real newline and
-- Postgres rejects an unescaped newline inside a JSON string.
--
-- 'about.intro' was seeded as an unused richText section with an empty body, rendering nowhere.
-- Remove it (only while still empty) so the About group carries no dead section; 'about.story'
-- replaces it, using a plain-paragraph type that inherits the page's own typography.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.story', 'Our Story', 'About', 'prose', true, 'published', '{
  "heading": "Our Story",
  "body": "ENICE Group started from one observation: the biggest problems facing African businesses aren''t problems of ambition, they''re problems of infrastructure. The software systems and financial rails that large organisations rely on elsewhere have historically been too expensive, too inaccessible, or simply missing for businesses in emerging markets.\\n\\nWe''re building more than one product on the same foundation. The same engineering standards and shared infrastructure can support multiple purpose-built platforms, each serving a distinct need and strengthening the system around it.\\n\\nThis isn''t a collection of separate experiments. It''s a deliberate approach: shared infrastructure compounds in value, and the quality of one product raises the bar for whatever we build next."
}'::jsonb, 130)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.mission', 'Our Mission', 'About', 'prose', true, 'published', '{
  "heading": "Our Mission",
  "body": "We want to build the technology layer that lets businesses, institutions, and developers across Africa, and eventually beyond, operate at real scale. Not software that works well enough, but software built with the reliability, security, and performance that institutional operations require.\\n\\nOur customers aren''t test users. They''re financial service providers, enterprise operations teams, and technology builders who need infrastructure they can stake their business on. We serve them with platforms that are secure by design and built to hold up under real commercial volume.\\n\\nWe''re aiming for structural impact, not just features. When payment infrastructure is reliable, commerce expands. When enterprise AI is trustworthy, teams get more done. When developer tools are solid, the next generation of companies gets built faster. That''s the impact we''re here for."
}'::jsonb, 140)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.vision', 'Our Vision', 'About', 'prose', true, 'published', '{
  "heading": "Our Vision",
  "body": "Over the next ten to twenty years, we want to build what Africa doesn''t yet have: a home-grown technology infrastructure group that competes globally, not one that just follows trends.\\n\\nWe''re building toward a future where African-originated financial infrastructure is trusted across multiple continents, where enterprise AI built here sets the regional standard for reliability, and where developer tools from our ecosystem are chosen by builders worldwide because they''re simply good.\\n\\nThat''s a ten-to-twenty-year project. It takes discipline and patience most organisations aren''t built to sustain. We''re structured for the long run, not the short cycle of a typical startup."
}'::jsonb, 150)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.ecosystem', 'Our Ecosystem', 'About', 'prose', true, 'published', '{
  "heading": "Our Ecosystem",
  "body": "The most important part of the ENICE Group model isn''t any single product, it''s the infrastructure they share. Every product we build runs on the same engineering foundation: the same security architecture, the same zero-trust access model, the same data isolation standards, and the same deployment pipeline.\\n\\nThat shared foundation pays off twice. Each new product reaches production-grade reliability faster, because the hard infrastructure problems are already solved at the group level. And each existing product gets stronger as we add new ones, through shared investment and shared operational standards.\\n\\nThe result is a set of products that gets more capable with each addition. Security improvements spread across the ecosystem. Infrastructure work lifts every product. Compliance work done once serves every regulated platform.\\n\\nThat''s why we call it an ecosystem rather than a collection of products. They''re built to compound."
}'::jsonb, 160)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.outlook', 'Looking Ahead', 'About', 'prose', true, 'published', '{
  "heading": "Looking Ahead",
  "body": "The financial and technological infrastructure African businesses depend on is still largely being built. That''s not a criticism, it''s just where things stand, and it''s the opportunity we''re focused on.\\n\\nWe want to build the systems businesses on this continent will run on for the next generation. This isn''t charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it.\\n\\nWe''re also building for a global market. What we build will scale across regions, meet international compliance standards, and compete with any equivalent platform anywhere. We''re not trying to be the best option in Nigeria or in Africa. We''re trying to be the best option, period.\\n\\nTo the businesses that use our products, and the engineers and operators who build with us: we''re committed to building technology that matters, to a standard that matters, and taking the time it takes to do it properly."
}'::jsonb, 170)
ON CONFLICT (key) DO NOTHING;

DELETE FROM site_sections
WHERE key = 'about.intro'
  AND COALESCE(jsonb_array_length(fields->'body'->'blocks'), 0) = 0;
`
    )
  },
  {
    id: 11,
    name: "portfolio_page_headers",
    sql: (
      /* sql */
      `
-- Each portfolio page's header (eyebrow, headline, supporting copy) now renders from its own
-- section. Create them with the copy those pages already show, so wiring changes nothing visible.
-- ON CONFLICT DO NOTHING leaves a header an operator has edited untouched and makes re-runs a no-op.
--
-- Two headings carry a [[\u2026]] marker: the ePulse and PulseX wordmarks style part of the name in the
-- accent colour, and that is expressed in the text rather than in markup so it stays editable.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.index', 'Products page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "ENICE Products",
  "heading": "Products built by ENICE Group",
  "subheading": "Payments, financial services, business communication, and digital commerce. Each product runs on the same infrastructure and is built to operate at scale."
}'::jsonb, 200)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay', 'PulsePay page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "Fintech Infrastructure Platform",
  "heading": "PulsePay",
  "subheading": "A virtual payment platform that issues Naira and USD cards, handles KYC verification, moves funds between users, and delivers value-added services with speed and reliability."
}'::jsonb, 210)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist', 'PulseAssist page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "Enterprise Conversational SaaS",
  "heading": "PulseAssist",
  "subheading": "A multi-tenant AI operations platform for telecoms and financial networks. It handles customer support routing, provides API-driven account management, and hands calls to live agents in real time when needed."
}'::jsonb, 220)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse', 'ePulse page', 'Portfolio', 'hero', true, 'published', '{
  "heading": "e[[Pulse]]",
  "subheading": "ePulse is ENICE Group''s upcoming global financial platform, built for people who **earn, send, and spend money across borders**. Designed for freelancers, remote workers, creators, and global businesses, ePulse aims to make international finance *simple and accessible*."
}'::jsonb, 230)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsex', 'PulseX page', 'Portfolio', 'hero', true, 'published', '{
  "heading": "Pulse[[X]]",
  "subheading": "PulseX is ENICE Group''s digital asset platform, designed to make cryptocurrency and digital finance **simple, secure, and accessible**. The platform will let users manage digital assets easily, while staying connected to the broader ENICE ecosystem."
}'::jsonb, 240)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection', 'Payment Collection page', 'Portfolio', 'hero', true, 'published', '{
  "heading": "PulsePay Payment Collection",
  "subheading": "Simple, reliable payment infrastructure for modern businesses. Accept and manage customer payments through a single, developer friendly integration."
}'::jsonb, 250)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 12,
    name: "home_bands_made_editable",
    sql: (
      /* sql */
      `
-- Seven homepage bands were hardcoded in React and could only be changed by a deploy: the featured
-- products, the ENICE Core, the technology stack, the company band, the founders' letter and the
-- hiring band. They are now sections, seeded here with the copy those bands already render, so
-- wiring them changes nothing visible and the next edit does not need an engineer.
--
-- ON CONFLICT DO NOTHING throughout, so this is a no-op on re-run and never overwrites an edit.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.portfolio', 'Featured products', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "Built and operated by ENICE",
  "heading": "The products we run.\\nNot a services menu.",
  "subheading": "Each one began as a problem we hit ourselves, and each one is a platform we operate day to day rather than hand over.",
  "items": [
    {"icon":"CreditCard","kicker":"Fintech infrastructure","title":"PulsePay","description":"A virtual payment platform for modern commerce: instant Naira card issuance, programmable wallets, embedded KYC, and peer-to-peer transfers built for Nigerian institutions.","bullets":"Cards: Naira & USD\\nMarket: Nigeria","url":"/portfolio/pulsepay"},
    {"icon":"BrainCircuit","kicker":"Enterprise AI","title":"PulseAssist","description":"An AI operations platform for banking, fintech, and telecoms, with automated queue handling, live agent handoff, and policy-bound workflow automation.","bullets":"Channels: WhatsApp, web, email, SMS, voice\\nTenancy: Multi-tenant","url":"/portfolio/pulseassist"},
    {"icon":"Banknote","kicker":"Fintech infrastructure","title":"PulsePay Payment Collection","description":"Payment infrastructure for businesses to accept and manage customer payments through a single, developer friendly API, with real time updates and webhook notifications.","bullets":"Launch: Q1 2027\\nIntegration: One API","url":"/portfolio/payment-collection"}
  ]
}'::jsonb, 32)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.core', 'The ENICE Core', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "What powers our products",
  "heading": "The ENICE Core.",
  "subheading": "Every product we operate runs on a shared infrastructure core, so the software customers use inherits scale, compliance, and reliability from the ground up.",
  "items": [
    {"icon":"Cpu","title":"Unified AI and Automation Pipeline","description":"Centralized LLM orchestration and vector search routing that powers products like PulseAssist across every tenant."},
    {"icon":"Database","title":"High-Velocity Ledger and Payment Core","description":"A fast transaction engine and virtual account infrastructure that anchors PulsePay and the financial products we build next."},
    {"icon":"FileCheck2","title":"Automated Compliance and KYC Layer","description":"Identity verification, fraud detection, and regulatory screening, run in real time and shared across every product."},
    {"icon":"Globe","title":"Global Cloud Grid","description":"Managed database clustering and serverless edge delivery, so the same infrastructure serves every product without each one reinventing it."}
  ]
}'::jsonb, 34)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.infrastructure', 'Technology stack', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "Technology foundation",
  "heading": "The stack underneath.",
  "subheading": "Every ENICE Group product runs on the same backbone. We chose it for reliability, compliance, and scale, not because it was the easy option.",
  "items": [
    {"kicker":"AWS","title":"Amazon Web Services","description":"Our main cloud backbone. It handles compute, storage, and edge delivery across every ENICE Group platform.","bullets":"Cloud infrastructure and security"},
    {"kicker":"GCP","title":"Google Cloud","description":"Runs PulseAssist''s AI pipeline: LLM orchestration and workflow automation across tenants, with Gemini as the model layer.","bullets":"Core AI engine and computational intelligence"},
    {"kicker":"PG","title":"Supabase","description":"Row-level security, real-time data streams, and managed Postgres for PulsePay''s transaction systems.","bullets":"Database infrastructure and auth"}
  ]
}'::jsonb, 36)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.company', 'Company band', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "The company",
  "heading": "ENICE Group is a product company.",
  "subheading": "We are the parent company behind a growing set of software platforms. We find real problems in financial services, commerce, and business communication, then build and run the products that solve them.",
  "items": [
    {"title":"We start from the friction","description":"Every product traces back to something that failed in ordinary use: a payment that should have been simple, a support queue nobody answered. We build from the specific problem outward, not from a category we want to be in."},
    {"title":"One core, many products","description":"Ledgers, identity, AI orchestration and compliance are solved once and shared. A new product inherits that foundation on its first day instead of rebuilding it, which is what makes a small team''s output look like a much larger one."},
    {"title":"We operate what we ship","description":"We own the products end to end \u2014 engineering, launch, and the day-to-day running of them. Nothing is handed to someone else to keep alive, which keeps the cost of a bad decision with the people who made it."},
    {"title":"Built to still be here","description":"We design for the version of these systems that exists in ten years: versioned APIs, documented internals, and infrastructure choices made for reliability rather than novelty. Regulated markets do not reward clever."}
  ]
}'::jsonb, 38)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.founders', 'Founders'' letter', 'Home', 'prose', true, 'published', '{
  "eyebrow": "From the founders",
  "heading": "A letter from the founders",
  "body": "Every good business runs on good infrastructure. That''s the idea behind ENICE Group. We don''t build technology for its own sake. We build products that solve real problems and give people and businesses infrastructure they can depend on for years.\\n\\nThat idea didn''t start in a boardroom. It came from everyday life in Nigeria: calling a company for help and waiting too long, dealing with poor service, hitting friction that shouldn''t exist. It came from financial platforms that failed exactly when we needed them, from declined international cards to simple payments that turned into a headache.\\n\\nWe decided that shouldn''t be normal. ENICE Group exists because African businesses and consumers deserve technology that is reliable, secure, and built to the same standard as anywhere else. Every product we launch is a step toward that, for Africa first, and for the world as we grow."
}'::jsonb, 40)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.careers', 'Hiring band', 'Home', 'cta', true, 'published', '{
  "eyebrow": "Join the builders",
  "heading": "Build products that matter.",
  "subheading": "We work with people who care about product quality, solid engineering, and technology that holds up at real scale. If that sounds like you, we want to hear from you.",
  "ctaLabel": "Meet the team",
  "ctaUrl": "/contact",
  "style": "standard"
}'::jsonb, 60)
ON CONFLICT (key) DO NOTHING;

-- The stats strip carried three claims nothing backs \u2014 a 99.99% SLA, a < 14ms p50 latency and an
-- encryption standard as a headline metric \u2014 plus a product count that was wrong (4 for five).
-- All four were deleted from the page long ago, but this section still served them, so any site
-- reading the CMS published them again. Replaced only while the row still holds those exact seeded
-- values, so an operator who has already curated this band is left alone.
UPDATE site_sections
SET fields = fields || '{
  "items": [
    {"value": "5", "label": "Products in the ecosystem"},
    {"value": "2", "label": "Offices in Nigeria"}
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Infrastructure SLA"}]'::jsonb;

-- The hero headline's hardcoded line breaks were tuned for one viewport and ragged at every other,
-- and the [[highlight]] put two lines of display-size accent colour at the top of the page. Both
-- are still available to an editor; the shipped copy simply no longer uses them. Guarded on the
-- original string, so an edited headline is untouched.
UPDATE site_sections
SET fields = jsonb_set(
      fields,
      '{heading}',
      '"We build the technology behind Africa''s next generation of businesses."'::jsonb
    ),
    updated_at = now()
WHERE key = 'home.hero'
  AND fields->>'heading' = 'We build the technology
[[behind Africa''s next]]
generation of
businesses.';
`
    )
  },
  {
    id: 13,
    name: "product_page_bands_and_roadmap_made_editable",
    sql: (
      /* sql */
      `
-- Migration 11 made each product page's *header* editable and stopped there. Everything below the
-- header stayed hardcoded in React: the capability grids, the facts strips, the sector tiles, the
-- compliance pills, the launch framing on the three unlaunched products, the homepage's platform
-- capabilities band, and the roadmap. Those are the most perishable things on the site \u2014 a
-- milestone slips, a channel is added, a mechanism lands \u2014 and every one of them needed an engineer
-- and a deploy to change.
--
-- Each band below is now a section, using an existing section type so the admin form and the
-- sanitiser already understand it, and seeded here with exactly the copy the page already renders.
-- Wiring therefore changes nothing visible; the next edit simply no longer needs a deploy. Each
-- component also keeps its built-in copy as a fallback, which is what paints before the CMS answers
-- and what survives an outage.
--
-- ON CONFLICT (key) DO NOTHING throughout, so this is a no-op on re-run and never overwrites an
-- edit an administrator has already made.
--
-- Two conventions are worth stating, because the code parses them back out:
--
--   * Launch-fact strips are \`statistics\` sections, which carry a value and a label and nothing
--     else. Which row carries the accent is a styling decision, not content, so it is not stored:
--     the first row is the status row and the component accents it by position.
--
--   * Roadmap milestones are \`steps\` rows, which carry a title and a description. A milestone needs
--     four more things, so they are written as \`label: value\` lines at the top of the description,
--     with the body after a blank line:
--
--         when: Q4 2026
--         status: in-progress
--         product: PulseAssist
--         tags: AI, B2B, Telecom
--
--         First rollout of support automation \u2026
--
--     Only leading lines matching when/status/product/tags are read as metadata; the first line
--     that does not starts the body. \`status\` accepts completed, in-progress or planned, and
--     anything else \u2014 including a missing status \u2014 resolves to planned rather than throwing. See
--     \`parseMilestone\` in src/components/site/Roadmap.tsx.

-- \u2500\u2500\u2500 Home \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.capabilities', 'Platform capabilities', 'Home', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform capabilities",
  "heading": "How the platform is built.",
  "subheading": "Mechanisms in place across every product. Current availability is reported on the status page.",
  "items": [
    {"icon":"Gauge","kicker":"API delivery","title":"Edge","description":"Multi-region, served from the nearest edge"},
    {"icon":"Activity","kicker":"Tenant isolation","title":"Row-level","description":"Enforced in the database, not the application"},
    {"icon":"ShieldCheck","kicker":"Data encryption","title":"TLS + at rest","description":"Managed database and object storage"},
    {"icon":"Zap","kicker":"Card issuance","title":"< 5s","description":"Virtual card provisioning"},
    {"icon":"Lock","kicker":"KYC verification","title":"Real-time","description":"Automated compliance checks"}
  ]
}'::jsonb, 35)
ON CONFLICT (key) DO NOTHING;

-- Nine milestones. \`SECTION_SCHEMAS.steps\` caps its repeater at eight rows, which only bites on a
-- write path: this insert writes the JSON directly, so every milestone survives here.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.roadmap', 'Strategic roadmap', 'Home', 'steps', true, 'published', '{
  "heading": "Built step by step, for the long run.",
  "subheading": "Our roadmap follows the maturity of the platforms we operate, sequenced so each step builds on the last.",
  "items": [
    {"title":"Shared Ecosystem Framework","description":"when: Q1 2026\\nstatus: completed\\nproduct: ENICE Core\\ntags: Infrastructure, AI, Compliance\\n\\nThe unified AI pipeline, ledger, and compliance backbone that now underpins every ENICE product."},
    {"title":"Extended Pilot with Regional Treasury Partners","description":"when: Q3 2026\\nstatus: completed\\nproduct: PulsePay\\ntags: Fintech, Wallets, KYC\\n\\nProgrammable wallets, instant virtual card issuance, and embedded compliance controls, rolled out to a wider pilot group across West Africa."},
    {"title":"Enterprise B2B Launch","description":"when: Q4 2026\\nstatus: in-progress\\nproduct: PulseAssist\\ntags: AI, B2B, Telecom\\n\\nFirst rollout of support automation to banking, fintech, and telecom partners, with policy-bound agents and live-agent failover."},
    {"title":"Developer API Public Beta","description":"when: Q2 2026\\nstatus: in-progress\\nproduct: PulsePay\\ntags: API, Developer, Fintech\\n\\nThe ENICE Core API opens to verified integration partners, with wallet issuance, ledger, KYC, and Assist endpoints available in a sandbox."},
    {"title":"Multi-Currency Expansion","description":"when: Q3 2026\\nstatus: planned\\nproduct: PulsePay\\ntags: Fintech, Multi-Currency, Treasury\\n\\nMulti-currency wallet rails, programmable spend controls, and embedded treasury operations for the payment platform."},
    {"title":"Payment Collection Launch","description":"when: Q1 2027\\nstatus: planned\\nproduct: PulsePay\\ntags: Fintech, Payments, API\\n\\nPulsePay Payment Collection launches: a unified API for businesses to accept and manage customer payments, with real time status updates and webhook notifications."},
    {"title":"Global Digital Asset Exchange Private Beta","description":"when: Q3 2027\\nstatus: planned\\nproduct: PulseX\\ntags: Crypto, Exchange, Global\\n\\nPulseX opens to institutional and qualified retail participants, with support for major digital asset pairs, custody, and compliance reporting."},
    {"title":"Digital Banking Infrastructure Closed Alpha","description":"when: Q4 2027\\nstatus: planned\\nproduct: ePulse\\ntags: Banking, Alpha\\n\\nePulse begins closed alpha with select institutional partners: digital banking core, account management, and statement APIs."},
    {"title":"Universal Financial Hub","description":"when: 2027\\nstatus: planned\\nproduct: ENICE Core\\ntags: Infrastructure, Global, Liquidity\\n\\nA global virtual-dollar and asset infrastructure layer connecting institutional liquidity across markets through a single API."}
  ]
}'::jsonb, 45)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulsePay \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay.stats', 'PulsePay facts strip', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulsePay at a glance",
  "items": [
    {"value":"Naira & USD","label":"Card currencies"},
    {"value":"2","label":"Currency rails (NGN + USD)"},
    {"value":"Every account","label":"KYC screening"}
  ]
}'::jsonb, 211)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay.features', 'PulsePay capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform Capabilities",
  "heading": "Everything a modern payments stack should be.",
  "subheading": "PulsePay covers the full payments stack: issuance, compliance, transfers, and spending controls, in one integrated platform.",
  "items": [
    {"icon":"CreditCard","title":"Instant virtual card issuance","description":"Issue Naira and USD virtual cards in seconds for individuals and teams."},
    {"icon":"ShieldCheck","title":"Built-in KYC verification","description":"Identity verification and compliance checks built directly into the onboarding flow."},
    {"icon":"Users","title":"Peer-to-peer transfers","description":"Move funds between users and fund wallets instantly with no friction."},
    {"icon":"Lock","title":"Programmable spend controls","description":"Set granular limits and rules for individuals, teams, and departments."},
    {"icon":"Zap","title":"Value-added services","description":"Bill payments, airtime, utilities, and more built directly into the platform."},
    {"icon":"BarChart3","title":"Enterprise fraud monitoring","description":"Real-time transaction screening and anomaly detection at every step."}
  ]
}'::jsonb, 212)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsepay.compliance', 'PulsePay compliance', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Compliance & Regulation",
  "heading": "Built for regulated markets from the ground up.",
  "subheading": "PulsePay operates within Nigeria''s regulatory framework, with row-level security, KYC screening on every account, and audit logging of privileged actions. PulsePay holds no third-party security certification today, and we will tell you so directly rather than imply otherwise.",
  "items": [
    {"title":"Row-Level Security"},
    {"title":"Tenant Isolation"},
    {"title":"Audit Logging"},
    {"title":"KYC Screening"}
  ]
}'::jsonb, 213)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulseAssist \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.stats', 'PulseAssist facts strip', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulseAssist at a glance",
  "items": [
    {"value":"WhatsApp \xB7 Web \xB7 Email \xB7 SMS \xB7 Voice","label":"Channels"},
    {"value":"Multi-tenant","label":"Architecture"}
  ]
}'::jsonb, 221)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.features', 'PulseAssist capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform Capabilities",
  "heading": "Operations that run themselves.",
  "subheading": "PulseAssist covers the full customer operations lifecycle, from first contact to resolution, without needing a human for every interaction.",
  "items": [
    {"icon":"Inbox","title":"Five channels, one inbox","description":"WhatsApp, web chat, email, SMS and voice answered from a single shared inbox, so support is consistent wherever people reach you."},
    {"icon":"MessageSquare","title":"Autonomous support routing","description":"AI-driven triage and routing that resolves common queries without human intervention."},
    {"icon":"ShieldCheck","title":"Policy-bound agents","description":"Conversational agents that operate strictly within configurable organisational policies."},
    {"icon":"Zap","title":"Real-time live-agent handoff","description":"Escalation to a human agent mid-conversation, with full context preserved."},
    {"icon":"Globe","title":"API-driven account management","description":"Agents can query and update account state through secure, scoped API integrations."},
    {"icon":"Network","title":"Multi-tenant architecture","description":"Enterprise-grade isolation between clients with dedicated model and routing configs."},
    {"icon":"FileCheck2","title":"Compliance-ready audit trails","description":"Every interaction is logged, timestamped, and exportable for regulatory review."}
  ]
}'::jsonb, 222)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.sectors', 'PulseAssist sectors served', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Sectors Served",
  "heading": "Built for businesses that put customer communication first.",
  "items": [
    {"icon":"CreditCard","title":"Fintech"},
    {"icon":"ShoppingBag","title":"E-commerce & Retail"},
    {"icon":"HeartPulse","title":"Healthcare & Wellness"},
    {"icon":"Cloud","title":"Technology & SaaS"}
  ]
}'::jsonb, 223)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist.compliance', 'PulseAssist compliance', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Enterprise Compliance",
  "heading": "Every interaction is compliant by design.",
  "subheading": "PulseAssist maintains comprehensive audit trails of every agent interaction. Policy configurations are version-controlled, every model decision is logged, and all data is tenant-isolated, meeting the regulatory requirements of banking and telecom in Africa and beyond.",
  "items": [
    {"title":"Tenant Isolation"},
    {"title":"Audit Logs"},
    {"title":"Policy Versioning"},
    {"title":"Row-Level Security"}
  ]
}'::jsonb, 224)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 ePulse \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse.facts', 'ePulse launch facts', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "ePulse launch framing",
  "items": [
    {"value":"In Development","label":"Status"},
    {"value":"To Be Announced","label":"Expected Launch"}
  ]
}'::jsonb, 231)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse.audience', 'ePulse audience', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Built For",
  "heading": "People who live and work globally.",
  "items": [
    {"icon":"Briefcase","title":"Freelancers","description":"Get paid in USD, GBP, or EUR directly from international clients."},
    {"icon":"Users","title":"Remote Workers","description":"Receive your salary, save in multiple currencies, spend globally."},
    {"icon":"CreditCard","title":"Creators","description":"Monetise your content globally and manage earnings in one place."},
    {"icon":"Globe2","title":"Global Businesses","description":"Pay international suppliers and accept payments from anywhere."}
  ]
}'::jsonb, 232)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.epulse.vision', 'ePulse vision', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "The Vision",
  "heading": "International finance, made simple.",
  "subheading": "The ePulse platform includes everything you need to live your financial life without borders, from day-to-day spending to long-distance transfers to lifestyle services.",
  "items": [
    {"icon":"Wallet","title":"Multi-currency accounts","description":"Hold and manage balances in the currencies that matter to you: NGN, USD, GBP, EUR and more, from a single account."},
    {"icon":"Building2","title":"Dedicated receiving accounts","description":"Local account details for supported countries, including the US, UK, and Europe. Get paid like a local from anywhere."},
    {"icon":"Send","title":"Fast international transfers","description":"Send money across borders with predictable timing, transparent fees, and clear pricing. No surprises."},
    {"icon":"Globe2","title":"Global payment solutions","description":"Pay and get paid anywhere your work takes you, from client invoices to vendor payments across continents."},
    {"icon":"Gift","title":"Gift card marketplace","description":"Buy and redeem gift cards from trusted global and local brands, all within the ePulse platform."},
    {"icon":"Plane","title":"Lifestyle services","description":"Book hotels, plan travel, and access premium experiences. Good finance should make life easier too."}
  ]
}'::jsonb, 233)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulseX \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsex.facts', 'PulseX launch facts', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulseX launch framing",
  "items": [
    {"value":"Planned Project","label":"Status"},
    {"value":"Q3 2027","label":"Launch"},
    {"value":"Digital Assets","label":"Category"}
  ]
}'::jsonb, 241)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulsex.highlights', 'PulseX capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Platform Capabilities",
  "heading": "Digital assets, without the friction.",
  "subheading": "PulseX will let users manage digital assets easily, fully integrated across the broader ENICE Group ecosystem.",
  "items": [
    {"icon":"BarChart3","title":"Multi-asset trading","description":"Trade major digital assets with deep liquidity and institutional-grade execution: Bitcoin, Ethereum, and beyond."},
    {"icon":"Lock","title":"Secure custody","description":"Cold storage, multi-signature protection, and continuous on-chain monitoring for every asset in your portfolio."},
    {"icon":"Layers","title":"Ecosystem-native","description":"Move between PulseX, PulsePay, and ePulse without leaving the ENICE stack: one account, every service."},
    {"icon":"Globe","title":"Built for scale","description":"Global access with compliance and reporting designed for regulated markets from day one, in Africa, Europe, and beyond."},
    {"icon":"Zap","title":"Instant settlement","description":"Near-instant on-chain and off-chain settlement rails so your capital moves as fast as the market does."},
    {"icon":"ShieldCheck","title":"Regulatory-ready","description":"Compliance built in from the ground up: KYC, AML, and transaction monitoring at the core."}
  ]
}'::jsonb, 242)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 PulsePay Payment Collection \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection.facts', 'Payment Collection launch facts', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "Payment Collection launch framing",
  "items": [
    {"value":"Planned","label":"Status"},
    {"value":"Q1 2027","label":"Launch"},
    {"value":"Payments","label":"Category"}
  ]
}'::jsonb, 251)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection.audience', 'Payment Collection audience', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Built For",
  "heading": "From online businesses to growing enterprises.",
  "items": [
    {"icon":"Globe2","title":"Online Businesses","description":"Accept customer payments without stitching together separate providers."},
    {"icon":"Code2","title":"SaaS Platforms","description":"Add payment collection to your product through one integration."},
    {"icon":"ShoppingCart","title":"Marketplaces","description":"Manage payments across many sellers and transactions from one place."},
    {"icon":"TrendingUp","title":"Growing Enterprises","description":"Infrastructure built to scale with transaction volume, not against it."}
  ]
}'::jsonb, 252)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.payment-collection.capabilities', 'Payment Collection capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "Key Capabilities",
  "heading": "Payments, made easier to collect and scale.",
  "subheading": "Payment Collection is being built as part of ENICE Group''s broader financial infrastructure, giving businesses the tools to run modern payment experiences.",
  "items": [
    {"icon":"Code2","title":"Unified payment API","description":"Accept payments through a single, developer friendly integration."},
    {"icon":"Zap","title":"Real time status updates","description":"Track transactions and payment status as they happen, not after the fact."},
    {"icon":"Webhook","title":"Webhook notifications","description":"Get notified the moment a payment is received, so your product can react instantly."},
    {"icon":"Store","title":"Merchant management","description":"View and manage merchants and transactions from a single, clear dashboard."},
    {"icon":"Users","title":"Built for platforms","description":"Designed for businesses that collect payments on behalf of others, at any scale."},
    {"icon":"CheckCircle2","title":"Reliable by design","description":"Payment infrastructure built to stay dependable as transaction volume grows."}
  ]
}'::jsonb, 253)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 14,
    name: "homepage_and_about_remaining_bands_made_editable",
    sql: (
      /* sql */
      `
-- The last content arrays still living in React on the two most-read pages. Migration 13 did this
-- for the product pages and the roadmap; these six bands were what it left behind:
--
--   home.principles     the three "Built around real problems" cards under the product grid
--   home.mechanisms     the mechanisms strip at the foot of the ENICE Core band, its sentence
--                       included \u2014 and, with it, the hero's trust-signal list
--   about.build         the "What We Build" paragraphs
--   about.verticals     the six sector tiles beneath them
--   about.leadership    the founding-team cards and the executive-contact note
--   about.closing       the closing statement and its attribution
--
-- Each uses an existing section type, so the admin form and \`sanitizeSectionFields\` already
-- understand every field, and each is seeded with exactly the copy the page already renders.
-- Wiring therefore changes nothing visible; the next edit simply no longer needs a deploy. Every
-- component also keeps its built-in copy as a fallback, which is what paints before the CMS answers
-- and what survives an outage \u2014 \`useSectionFields\` treats a degraded bootstrap as "not loaded".
--
-- ON CONFLICT (key) DO NOTHING throughout, so this is a no-op on re-run and never overwrites an
-- edit an administrator has already made.
--
-- Four conventions are worth stating, because the components read them back out:
--
--   * \`home.principles\` and \`about.verticals\` render no heading of their own, and neither does the
--     mechanisms strip. Their \`heading\` is seeded for the admin section list only \u2014 a row with no
--     heading is unnavigable there, and \`featureGrid\` requires the field regardless.
--
--   * The hero's trust-signal strip renders the *first three* rows of \`home.mechanisms\`. It was a
--     second hardcoded copy of the same three strings ("Row-level security", "Per-tenant
--     isolation", "Audit logging"), and \`hero\` has neither a repeater nor a spare text field to
--     put them on, so folding them in here is what makes them editable at all. The hero paints a
--     fixed tick against each one: that icon is the strip's design, not content.
--
--   * \`about.build\` interpolates \`{liveProducts}\` with the number of products whose stage is
--     \`available\`, read from the product registry. The figure used to be written by hand, which is
--     how it went stale the day a product shipped, and a seeded literal would go stale the same
--     way. \`**PulsePay**\` and \`**PulseAssist**\` are \`StyledText\`'s bold marker: a text field
--     cannot carry a \`<strong>\`, and should not be able to.
--
--   * \`about.leadership\`'s \`subheading\` is the note *under* the cards, not the lead above them.
--     \`featureGrid\` has one supporting-copy field and the note is the sentence that changes,
--     because it carries the contact address. The anchor stays in code: whichever part of the
--     sentence is the email address is rendered as a mailto link, so an edit can neither break the
--     link nor inject markup. The lead paragraph above the cards is still in React.

-- \u2500\u2500\u2500 Home \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.principles', 'Build principles', 'Home', 'featureGrid', true, 'published', '{
  "heading": "Build principles",
  "items": [
    {"title":"Built around real problems","description":"We start with problems people and businesses actually face."},
    {"title":"Built to grow","description":"Our products are designed to support users as their needs grow."},
    {"title":"Built in Africa","description":"We understand the realities of African markets and build with those realities in mind."}
  ]
}'::jsonb, 31)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('home.mechanisms', 'Platform mechanisms', 'Home', 'featureGrid', true, 'published', '{
  "heading": "Platform mechanisms",
  "subheading": "Regulated in the Federal Republic of Nigeria. These are mechanisms the platform implements, not certifications we hold.",
  "items": [
    {"icon":"ShieldCheck","title":"Row-level security"},
    {"icon":"Lock","title":"Per-tenant isolation"},
    {"icon":"Check","title":"Audit logging"},
    {"icon":"Wifi","title":"Encrypted in transit and at rest"}
  ]
}'::jsonb, 33)
ON CONFLICT (key) DO NOTHING;

-- \u2500\u2500\u2500 About \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.build', 'What We Build', 'About', 'prose', true, 'published', '{
  "heading": "What We Build",
  "body": "We find a real gap, design a product around what it takes to close it, build it to a high standard, launch it, and then operate it with the same discipline we used to build it. We don''t hand products off. We own the full lifecycle.\\n\\nWe work across areas where technical complexity meets real-world consequence: financial infrastructure and digital banking, AI-powered enterprise communication and automation, developer tools and API infrastructure, digital commerce systems, cloud infrastructure, and longer-horizon research.\\n\\nOur {liveProducts} current products are the foundation of this. **PulsePay** is our financial infrastructure platform, a Naira-native payment processing and digital banking system built for Nigerian businesses, from high-frequency transactions to compliance. **PulseAssist** is our enterprise AI platform, a communication and automation layer that helps enterprise teams cut down on procedural overhead.\\n\\nThese are the first two products in a lineup we plan to grow the same way: deliberately, and to a high standard."
}'::jsonb, 152)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.verticals', 'Sectors we build in', 'About', 'featureGrid', true, 'published', '{
  "heading": "Sectors we build in",
  "items": [
    {"title":"Financial Infrastructure","description":"Core transaction rails, digital banking architecture, and payment processing systems."},
    {"title":"Enterprise AI","description":"Automated communication and process automation for enterprise teams."},
    {"title":"Developer Infrastructure","description":"APIs, SDKs, and tooling that give builders a reliable foundation to scale on."},
    {"title":"Digital Commerce","description":"Commerce platforms built for high transaction volume and institutional standards."},
    {"title":"Cloud Infrastructure","description":"Region-aware deployment systems with security and compliance built into the architecture."},
    {"title":"Future Technology","description":"Long-horizon research programmes exploring what comes after our current products."}
  ]
}'::jsonb, 153)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.leadership', 'The Founding Team', 'About', 'featureGrid', true, 'published', '{
  "heading": "The Founding Team",
  "subheading": "Our founding team prefers to let the work speak. Executive contact is available through corporate@enicehq.com for qualified enterprise and partnership inquiries.",
  "items": [
    {"kicker":"CEO","title":"Founder & Chief Executive Officer","description":"Corporate strategy, venture direction, and ecosystem growth."},
    {"kicker":"CTO","title":"Chief Technology Officer","description":"Platform architecture, engineering standards, and infrastructure design."},
    {"kicker":"COO","title":"Chief Operations Officer","description":"Product delivery, partner operations, and compliance execution."}
  ]
}'::jsonb, 154)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.closing', 'Closing statement', 'About', 'prose', true, 'published', '{
  "heading": "\u2014 The Founders, ENICE Group",
  "body": "\\"The infrastructure a society depends on is the most durable thing it can build. That''s what we''re here to build.\\""
}'::jsonb, 172)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 15,
    name: "stored_header_and_footer_follow_the_new_information_architecture",
    sql: (
      /* sql */
      `
-- The header and footer are now read from the CMS instead of from hardcoded arrays in React, and
-- \`defaultSettings()\` was rewritten to the site's real information architecture at the same time:
-- a grouped header (Products with five children \xB7 Company \xB7 Resources with five children, CTA
-- "Contact") and four footer columns (Products \xB7 Developers \xB7 Company \xB7 Legal).
--
-- A database with no stored 'header' or 'footer' row needs nothing at all \u2014 \`getSettings()\` merges
-- stored values over \`defaultSettings()\`, so a fresh install already serves the new IA. This
-- migration exists solely for databases seeded or saved *before* that rewrite, which hold a
-- settings document that would otherwise keep overriding the new defaults and leave the live site
-- on the old four-link header and three-column footer.
--
-- Both statements are guarded on the *previous defaults* being still intact \u2014 the retired
-- \`nav-home\` item with a list of exactly four, and the retired \`Updates\` column with exactly three
-- \u2014 so an operator who has added, removed or reordered anything is left completely alone. The
-- guards also make this idempotent: once applied, neither marker is present, so a re-run matches
-- nothing.
--
-- \`value ||\` merges rather than replaces, so the header's \`showCta\` / \`sticky\` toggles and the
-- footer's tagline, copyright and \`showSocials\` survive untouched. \`site_settings\` stores one
-- JSONB document per key in \`value\` (the section tables use \`fields\`; this table does not).
--
-- The JSON below is field-for-field identical to \`defaultSettings()\` in
-- api-src/lib/repo/website.ts \u2014 same ids, labels, urls, order and children. A migrated database
-- that disagreed with a fresh install is precisely the bug this migration exists to prevent, so
-- the two must be edited together.
UPDATE site_settings
SET value = value || '{
  "items": [
    {"id":"nav-products","label":"Products","url":"/portfolio","visible":true,"children":[
      {"id":"nav-pulsepay","label":"PulsePay","url":"/portfolio/pulsepay","visible":true},
      {"id":"nav-pulseassist","label":"PulseAssist","url":"/portfolio/pulseassist","visible":true},
      {"id":"nav-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true},
      {"id":"nav-collection","label":"Payment Collection","url":"/portfolio/payment-collection","visible":true},
      {"id":"nav-epulse","label":"ePulse","url":"/portfolio/epulse","visible":true},
      {"id":"nav-pulsex","label":"PulseX","url":"/portfolio/pulsex","visible":true}
    ]},
    {"id":"nav-company","label":"Company","url":"/about","visible":true},
    {"id":"nav-resources","label":"Resources","url":"#","visible":true,"children":[
      {"id":"nav-docs","label":"Documentation","url":"/docs","visible":true},
      {"id":"nav-roadmap","label":"Roadmap","url":"/roadmap","visible":true},
      {"id":"nav-blog","label":"Blog","url":"/blog/","visible":true},
      {"id":"nav-news","label":"News & Changelog","url":"/news/","visible":true},
      {"id":"nav-status","label":"System Status","url":"/status","visible":true}
    ]}
  ],
  "ctaLabel": "Contact",
  "ctaUrl": "/contact"
}'::jsonb,
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND jsonb_array_length(value->'items') = 4
  AND value->'items' @> '[{"id":"nav-home"}]'::jsonb;

UPDATE site_settings
SET value = value || '{
  "columns": [
    {"id":"col-products","heading":"Products","links":[
      {"id":"f-pulsepay","label":"PulsePay","url":"/portfolio/pulsepay","visible":true},
      {"id":"f-pulseassist","label":"PulseAssist","url":"/portfolio/pulseassist","visible":true},
      {"id":"f-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true},
      {"id":"f-collection","label":"Payment Collection","url":"/portfolio/payment-collection","visible":true},
      {"id":"f-epulse","label":"ePulse","url":"/portfolio/epulse","visible":true},
      {"id":"f-pulsex","label":"PulseX","url":"/portfolio/pulsex","visible":true},
      {"id":"f-all-products","label":"All products","url":"/portfolio","visible":true}
    ]},
    {"id":"col-developers","heading":"Developers","links":[
      {"id":"f-docs","label":"API documentation","url":"/docs","visible":true},
      {"id":"f-roadmap","label":"Product roadmap","url":"/roadmap","visible":true},
      {"id":"f-status","label":"System status","url":"/status","visible":true}
    ]},
    {"id":"col-company","heading":"Company","links":[
      {"id":"f-about","label":"About ENICE Group","url":"/about","visible":true},
      {"id":"f-contact","label":"Contact","url":"/contact","visible":true},
      {"id":"f-blog","label":"Blog","url":"/blog/","visible":true},
      {"id":"f-news","label":"News & changelog","url":"/news/","visible":true},
      {"id":"f-announcements","label":"Announcements","url":"/announcements/","visible":true}
    ]},
    {"id":"col-legal","heading":"Legal","links":[
      {"id":"f-privacy","label":"Privacy policy","url":"/privacy","visible":true},
      {"id":"f-terms","label":"Terms of service","url":"/terms","visible":true},
      {"id":"f-compliance","label":"Regulatory compliance","url":"/compliance","visible":true}
    ]}
  ]
}'::jsonb,
    updated_at = now()
WHERE key = 'footer'
  AND jsonb_typeof(value->'columns') = 'array'
  AND jsonb_array_length(value->'columns') = 3
  AND value->'columns' @> '[{"heading":"Updates"}]'::jsonb;
`
    )
  },
  {
    id: 16,
    name: "pulseassist_email_product_page",
    sql: (
      /* sql */
      `
-- PulseAssist Email is a shipping ENICE product that had no page on the company's own website,
-- while this site's own transactional mail -- contact replies, early-access confirmations -- has
-- been sent through it since #31. A product ENICE runs, sells and depends on, missing from its own
-- portfolio, is an omission rather than a decision.
--
-- It is framed as a PulseAssist product, the same way Payment Collection is a PulsePay product:
-- the product's own page presents it as part of the PulseAssist platform. The copy below is
-- condensed from that page (getpulseassist.com/email) and is identical to the in-code fallback in
-- DEFAULT_SECTIONS, verified string-for-string whenever either side is edited.
--
-- ON CONFLICT DO NOTHING throughout: safe to re-run, and it never overwrites an edit.

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email', 'PulseAssist Email page', 'Portfolio', 'hero', true, 'published', '{
  "eyebrow": "PulseAssist Email",
  "heading": "Professional email, on your own domain.",
  "subheading": "Send and receive email from the domain your customers already know. Mailboxes, templates, campaigns and automations in one console, with a REST API, signed webhooks and delivery analytics when you would rather run it from your own systems."
}'::jsonb, 225)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email.facts', 'PulseAssist Email facts strip', 'Portfolio', 'statistics', true, 'published', '{
  "heading": "PulseAssist Email at a glance",
  "items": [
    {
      "value": "Your domain",
      "label": "Verified in live DNS"
    },
    {
      "value": "Send + receive",
      "label": "Inbound routing included"
    },
    {
      "value": "REST API",
      "label": "Scoped, rotatable keys"
    },
    {
      "value": "Webhooks",
      "label": "Signed delivery events"
    }
  ]
}'::jsonb, 226)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email.capabilities', 'PulseAssist Email capabilities', 'Portfolio', 'featureGrid', true, 'published', '{
  "eyebrow": "What you get",
  "heading": "Everything the product actually does.",
  "subheading": "This is the implementation rather than a roadmap. If something is missing from the list, it is because it has not been built yet.",
  "items": [
    {
      "icon": "Globe2",
      "title": "Your own sending domain",
      "description": "Mail goes out from your domain, not ours. The DKIM, SPF and MAIL FROM records are generated for you, then checked against public DNS \u2014 a domain is only marked connected once those records genuinely resolve."
    },
    {
      "icon": "Send",
      "title": "Transactional and bulk sending",
      "description": "A single message and a campaign run through the same pipeline, each with its own delivery status. Sends are recorded with the idempotency key you supplied, so a retried request cannot become a duplicate email."
    },
    {
      "icon": "Inbox",
      "title": "Inbound email and routing",
      "description": "Receive mail on your own domain and route it by recipient, sender or subject \u2014 to a mailbox, a team, or your own webhook. Inbound is part of the product rather than a forwarding workaround."
    },
    {
      "icon": "AtSign",
      "title": "Mailboxes and sending addresses",
      "description": "Mailboxes that receive and addresses that send, each tied to a verified domain. An address is claimed once across the platform, so two workspaces cannot share an identity."
    },
    {
      "icon": "Layers",
      "title": "Templates with version history",
      "description": "Write a template once and use it from the console or the API. Versions are append-only, so a campaign keeps sending the wording it was reviewed with even after the template moves on."
    },
    {
      "icon": "Sparkles",
      "title": "Automations and sequences",
      "description": "Multi-step sequences with delays between steps. Consent is re-checked when each step sends rather than when someone was enrolled, so an unsubscribe takes effect mid-sequence."
    },
    {
      "icon": "BarChart3",
      "title": "Delivery analytics",
      "description": "Delivered, bounced and complained totals with the rates behind them, measured against what the provider accepted rather than what was attempted. Rates are withheld until the sample is large enough to mean anything."
    },
    {
      "icon": "ShieldCheck",
      "title": "Suppression and deliverability protection",
      "description": "Hard bounces and complaints are suppressed automatically and permanently, and a suppressed address is refused before it costs another bounce. The list is yours to inspect, search and export."
    },
    {
      "icon": "KeyRound",
      "title": "REST API with scoped keys",
      "description": "A documented API for sending, addresses, suppressions, analytics and events. Keys carry scopes \u2014 a key that reads analytics cannot send mail \u2014 and any key can be rotated or revoked without downtime."
    },
    {
      "icon": "Webhook",
      "title": "Signed delivery webhooks",
      "description": "Register endpoints and receive delivery, bounce and complaint events as they happen, signed and deduplicated. Failed deliveries are retried and visible, so a broken endpoint does not fail quietly."
    },
    {
      "icon": "BrainCircuit",
      "title": "AI drafting and classification",
      "description": "Draft, rewrite, summarise and classify mail using the same AI that answers support in PulseAssist. It draws on its own credit pool, so ordinary sending never consumes it."
    },
    {
      "icon": "Code2",
      "title": "Usage you can see coming",
      "description": "Live usage against your plan''s allowances \u2014 sent this month, addresses, domains, endpoints \u2014 read from your entitlements rather than estimated, so a limit is visible while there is still time to act."
    }
  ]
}'::jsonb, 227)
ON CONFLICT (key) DO NOTHING;

INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('portfolio.pulseassist-email.setup', 'PulseAssist Email setup steps', 'Portfolio', 'steps', true, 'published', '{
  "heading": "Four steps, and the hard one is checked for you.",
  "subheading": "DNS is where email setup usually goes wrong, so the console names the records that are still outstanding and the ones that are published but wrong \u2014 the ones that never fix themselves while you wait.",
  "items": [
    {
      "title": "Add your domain",
      "description": "Enter the domain you want to send from. It is registered with the sending provider and the exact records it needs are generated for you."
    },
    {
      "title": "Publish the records",
      "description": "Add the DKIM, SPF and MAIL FROM records at your DNS provider. Each is shown with its host and value, and the console tells you which are still outstanding."
    },
    {
      "title": "Verification against real DNS",
      "description": "The records are looked up in public DNS, not just requested from the provider. A record that is published but wrong \u2014 a stale value, a proxied CNAME, a second SPF line \u2014 is reported as exactly that."
    },
    {
      "title": "Send, receive and watch it",
      "description": "Once the records agree, sending is live. Add mailboxes and routing rules for inbound, then follow delivery, bounces and complaints from the first message onward."
    }
  ]
}'::jsonb, 228)
ON CONFLICT (key) DO NOTHING;

-- Register the route as a system page so its SEO is manageable like every other built-in route.
INSERT INTO cms_pages (id, path, title, summary, status, sections, seo, system_route, published_at)
SELECT md5(random()::text || clock_timestamp()::text)::uuid, '/portfolio/pulseassist-email',
       'PulseAssist Email', 'Transactional and marketing email on a verified domain.',
       'published', '[]'::jsonb, '{}'::jsonb, true, now()
ON CONFLICT (path) DO NOTHING;

-- Add the product to the header's Products menu and the footer's Products column, but only where
-- they still hold the shipped structure and do not already list it -- so a navigation an operator
-- has customised is left alone, and a database that arrived via migration 15 (whose payload already
-- includes the link) is a no-op here.
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT jsonb_agg(
               CASE WHEN item->>'id' = 'nav-products'
                 THEN jsonb_set(item, '{children}',
                        COALESCE(item->'children', '[]'::jsonb)
                        || '[{"id":"nav-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true}]'::jsonb)
                 ELSE item END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
    )),
    updated_at = now()
WHERE key = 'header'
  AND value->'items' @> '[{"id":"nav-products"}]'::jsonb
  AND position('nav-pulseassist-email' in value::text) = 0;

UPDATE site_settings
SET value = jsonb_set(value, '{columns}', (
      SELECT jsonb_agg(
               CASE WHEN col->>'id' = 'col-products'
                 THEN jsonb_set(col, '{links}',
                        COALESCE(col->'links', '[]'::jsonb)
                        || '[{"id":"f-pulseassist-email","label":"PulseAssist Email","url":"/portfolio/pulseassist-email","visible":true}]'::jsonb)
                 ELSE col END
               ORDER BY ord)
      FROM jsonb_array_elements(value->'columns') WITH ORDINALITY AS t(col, ord)
    )),
    updated_at = now()
WHERE key = 'footer'
  AND value->'columns' @> '[{"id":"col-products"}]'::jsonb
  AND position('f-pulseassist-email' in value::text) = 0;

-- The ecosystem is six products now. Corrected only where the strip still reads the seeded five,
-- so an edited band is untouched. The code derives this figure from the product registry; the
-- section only has to agree with it.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
    {"value": "6", "label": "Products in the ecosystem"},
    {"value": "2", "label": "Offices in Nigeria"}
  ]'::jsonb),
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"value":"5","label":"Products in the ecosystem"}]'::jsonb;
`
    )
  },
  {
    id: 17,
    name: "rename_payment_collection_to_devapay",
    sql: (
      /* sql */
      `
-- PulsePay Payment Collection is now DevaPay: its own brand rather than a PulsePay sub-product.
-- The route moved from /portfolio/payment-collection to /portfolio/devapay (with a 308 redirect in
-- vercel.json so the old address keeps working), so the section keys, the page record and every
-- stored label and URL have to follow. Without this an existing database would keep serving the
-- old name from the CMS over the new code.
--
-- Section keys are renamed rather than re-inserted, so any copy an operator has already edited
-- moves across with them. Guarded on the old key still existing, which also makes it idempotent.

UPDATE site_sections SET key = 'portfolio.devapay',
       label = 'DevaPay page', updated_at = now()
WHERE key = 'portfolio.payment-collection'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay');

UPDATE site_sections SET key = 'portfolio.devapay.facts',
       label = 'DevaPay launch facts', updated_at = now()
WHERE key = 'portfolio.payment-collection.facts'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay.facts');

UPDATE site_sections SET key = 'portfolio.devapay.audience',
       label = 'DevaPay audience', updated_at = now()
WHERE key = 'portfolio.payment-collection.audience'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay.audience');

UPDATE site_sections SET key = 'portfolio.devapay.capabilities',
       label = 'DevaPay capabilities', updated_at = now()
WHERE key = 'portfolio.payment-collection.capabilities'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.devapay.capabilities');

-- The product name inside the seeded copy, wherever it was stored as the old brand.
UPDATE site_sections
SET fields = replace(replace(fields::text, 'PulsePay Payment Collection', 'DevaPay'), 'Payment Collection', 'DevaPay')::jsonb,
    updated_at = now()
WHERE fields::text LIKE '%Payment Collection%';

-- The managed page record and its address.
UPDATE cms_pages
SET path = '/portfolio/devapay', title = 'DevaPay',
    summary = 'Payment infrastructure for businesses, on one developer-friendly API.',
    updated_at = now()
WHERE path = '/portfolio/payment-collection'
  AND NOT EXISTS (SELECT 1 FROM cms_pages WHERE path = '/portfolio/devapay');

-- Navigation and footer: the stored label and URL both carried the old brand.
UPDATE site_settings
SET value = replace(
      replace(
        replace(value::text, '/portfolio/payment-collection', '/portfolio/devapay'),
        'PulsePay Payment Collection', 'DevaPay'),
      'Payment Collection', 'DevaPay')::jsonb,
    updated_at = now()
WHERE key IN ('header', 'footer')
  AND (position('payment-collection' in value::text) > 0
       OR position('Payment Collection' in value::text) > 0);

-- The About page's "What We Build" band interpolated a {liveProducts} count beside a sentence that
-- names PulsePay and PulseAssist. PulsePay is in pilot rather than generally available, so the
-- derived figure no longer matched the products the words name, and a number that contradicts the
-- sentence beside it is worse than no number. Dropped only where the token is still present.
UPDATE site_sections
SET fields = jsonb_set(fields, '{body}',
      to_jsonb(replace(fields->>'body', 'Our {liveProducts} current products', 'Our current products'))),
    updated_at = now()
WHERE key = 'about.build'
  AND position('{liveProducts}' in COALESCE(fields->>'body', '')) > 0;
`
    )
  },
  {
    id: 18,
    name: "partners_strip_current_providers",
    sql: (
      /* sql */
      `
-- The partners strip lists the providers the platform actually runs on: AWS, Google Cloud,
-- Supabase, Vercel, PulseAssist and Railway.
--
-- PulseAssist is in the list because the site genuinely runs on it: transactional email goes out
-- through PulseAssist Email (#31) and the assistant is the PulseAssist widget. It being an ENICE
-- product does not make it less of a dependency.
--
-- Removed: Resend, which PulseAssist Email replaced in #31, and AWS Activate, because a startup
-- credits programme is not infrastructure and listing it beside AWS itself read as two
-- partnerships where there is one. PulseAssist is deliberately not added: it is ENICE's own
-- product, and a company does not belong in its own partners strip.
--
-- This is needed because migrations 3 and 4 seed the retired set, so a database that ran those
-- would keep publishing Resend and AWS Activate over the new defaults. Guarded on one of the
-- retired entries still being present, which leaves a curated list alone and makes a re-run a
-- no-op.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
    {"name":"Amazon Web Services","tagline":"Cloud Infrastructure","logo":"/partners/aws.svg","url":"https://aws.amazon.com"},
    {"name":"Google Cloud","tagline":"AI & Compute","logo":"/partners/googlecloud.svg","url":"https://cloud.google.com"},
    {"name":"Supabase","tagline":"Database & Auth","logo":"/partners/supabase.svg","url":"https://supabase.com"},
    {"name":"Vercel","tagline":"Edge Delivery","logo":"/partners/vercel.svg","url":"https://vercel.com"},
    {"name":"PulseAssist","tagline":"Support & Email Infrastructure","logo":"/partners/pulseassist.svg","url":"https://getpulseassist.com"},
    {"name":"Railway","tagline":"Application & Database Hosting","logo":"/partners/railway.svg","url":"https://railway.com"}
  ]'::jsonb),
    updated_at = now()
WHERE key = 'home.partners'
  AND (fields->'items' @> '[{"name":"AWS Activate"}]'::jsonb
       OR fields->'items' @> '[{"name":"Resend"}]'::jsonb
       OR NOT fields->'items' @> '[{"name":"PulseAssist"}]'::jsonb);

-- The homepage's "The stack underneath" band is gone: it restated the partners strip in longer
-- form, so the page named the same providers twice. Its section has no renderer left, and an admin
-- screen that edits copy nothing displays is a trap, so the row goes with the band.
DELETE FROM site_sections WHERE key = 'home.infrastructure';

-- Copy that read as machine-written: a "Built X / Built Y / Built Z" run of headings, two
-- sentence-fragment headlines, and em-dashed asides. Each is corrected only where the original
-- string is still in place, so an edited band is untouched.
UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"Three areas we build in."'::jsonb), updated_at = now()
WHERE key = 'home.products' AND fields->>'heading' LIKE 'Products and platforms.%';

UPDATE site_sections
SET fields = jsonb_set(fields, '{heading}', '"The products we build and run."'::jsonb), updated_at = now()
WHERE key = 'home.portfolio' AND fields->>'heading' LIKE 'The products we run.%';

UPDATE site_sections
SET fields = replace(replace(replace(fields::text,
      '"Built around real problems"', '"Problems before products"'),
      '"Built to grow"', '"Room to grow"'),
      '"Built in Africa"', '"Grounded in African markets"')::jsonb,
    updated_at = now()
WHERE key = 'home.principles' AND fields::text LIKE '%Built around real problems%';

UPDATE site_sections
SET fields = replace(fields::text,
      'We own the products end to end \u2014 engineering, launch, and the day-to-day running of them.',
      'We own the products end to end: engineering, launch, and the day-to-day running of them.')::jsonb,
    updated_at = now()
WHERE key = 'home.company' AND position('end to end \u2014' in fields::text) > 0;
`
    )
  },
  {
    id: 19,
    name: "about_page_acronym_band",
    sql: (
      /* sql */
      `
-- The About page now opens, straight after the hero, by saying what the name is built from:
-- Empower, Nurture, Innovate, Create, Elevate. The page never explained its own acronym.
--
-- \`featureGrid\` because every other multi-item About band is one, and its row shape \u2014 \`title\` plus
-- \`description\` \u2014 is already word plus gloss. \`sanitizeSectionFields\` and the admin form therefore
-- need no changes.
--
-- Two conventions the component reads back out:
--
--   * The initial shown beside each word is derived from the word, not stored. A stored letter could
--     drift from editable text until the page claimed an acronym it no longer formed, and there is no
--     field for it in any case.
--
--   * Every \`description\` is deliberately empty. The five words are the company's own; a sentence
--     written here to pad each letter would be invented meaning dressed as brand copy. The field is
--     seeded so the owner can add one per letter from the Website Manager without a deploy, and the
--     component renders a row's gloss only when it is non-empty.
--
-- ON CONFLICT (key) DO NOTHING, so a re-run is a no-op and an administrator's edits are never
-- overwritten. The component keeps the same five words as its built-in fallback, which is what paints
-- before the CMS answers and what survives an outage.
INSERT INTO site_sections (key, label, group_name, type, visible, status, fields, sort_order)
VALUES ('about.acronym', 'What the name stands for', 'About', 'featureGrid', true, 'published', '{
  "heading": "What the name stands for",
  "items": [
    {"title":"Empower","description":""},
    {"title":"Nurture","description":""},
    {"title":"Innovate","description":""},
    {"title":"Create","description":""},
    {"title":"Elevate","description":""}
  ]
}'::jsonb, 110)
ON CONFLICT (key) DO NOTHING;
`
    )
  },
  {
    id: 20,
    name: "trim_redundant_home_and_about_copy",
    sql: (
      /* sql */
      `
-- An editorial pass to cut repetition, not information. The About page carried five prose bands
-- that circled the same three ideas, and the home page repeated them. Every statement is guarded
-- so an administrator's own edits are left alone, and a re-run is a no-op.

-- "Our Vision" and "Our Ecosystem" were standalone bands that restated "Our Story" (shared
-- infrastructure compounds) and each other (a ten-to-twenty-year global ambition). Vision's
-- distinct point is folded into "Looking Ahead" below; both standalone bands go.
DELETE FROM site_sections WHERE key IN ('about.vision', 'about.ecosystem');

-- "Looking Ahead" absorbs the vision point and drops the overlap. Guarded on the old closing line.
UPDATE site_sections
SET fields = jsonb_set(fields, '{body}', '"The infrastructure African businesses depend on is still largely being built, and that gap is what we''re focused on \u2014 over a ten-to-twenty-year horizon most organisations aren''t structured to sustain. We''re building a home-grown technology group that competes globally, not one that follows trends.\\n\\nThis isn''t charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it \u2014 with systems businesses on this continent can run on for the next generation.\\n\\nWhat we build is made for a global market: it scales across regions, meets international compliance standards, and is built to compete with any equivalent platform anywhere. To the businesses and builders who rely on us \u2014 we''re committed to technology that matters, to a standard that matters, and to taking the time to do it properly."'::jsonb),
    updated_at = now()
WHERE key = 'about.outlook'
  AND position('best option, period' in COALESCE(fields->>'body', '')) > 0;

-- "Our Principles" was eight cards, a wall of text. Trimmed to five, dropping the three that
-- overlapped others: Institutional Quality, Continuous Innovation, Ownership Mentality.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[
    {"title":"Long-Term Thinking","description":"We evaluate decisions against decades, not quarters. We want companies that outlast trends and survive economic cycles. We won''t trade long-term integrity for short-term convenience."},
    {"title":"Engineering Excellence","description":"We hold our engineering to the standards of regulated industries. Our codebases are documented, our APIs are versioned and backward-compatible, and our system designs favour resilience over novelty."},
    {"title":"Security by Design","description":"Security isn''t added after a product ships. It''s built in from the start. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard across every product we run. We treat our partners'' data as our responsibility."},
    {"title":"Customer Obsession","description":"We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it."},
    {"title":"Responsible AI","description":"AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don''t release a capability until we''re confident in its reliability and we can explain how it works."}
  ]'::jsonb),
    updated_at = now()
WHERE key = 'about.values'
  AND jsonb_array_length(fields->'items') > 5;

-- The founders' letter dropped from three paragraphs to two.
UPDATE site_sections
SET fields = jsonb_set(fields, '{body}', '"Every good business runs on good infrastructure \u2014 that''s the idea behind ENICE Group. We don''t build technology for its own sake; we build products that solve real problems and give businesses something they can depend on for years.\\n\\nThe idea came from everyday life in Nigeria: support queues nobody answered, payments that failed exactly when they mattered, cards declined for no reason. We decided that shouldn''t be normal. African businesses and consumers deserve technology built to the same standard as anywhere else \u2014 for Africa first, and the world as we grow."'::jsonb),
    updated_at = now()
WHERE key = 'home.founders'
  AND position('didn''t start in a boardroom' in COALESCE(fields->>'body', '')) > 0;

-- The "2 Offices in Nigeria" figure implied a physical office the company does not have yet. Only
-- the (real) product count remains in the hero stats strip.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[{"value":"6","label":"Products in the ecosystem"}]'::jsonb),
    updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Offices in Nigeria"}]'::jsonb;

-- PulseAssist page: it described only the AI support platform, so the "Compliance-ready audit
-- trails" capability card is replaced with the PulseAssist Email platform. The audit-trail claim
-- was also only partly true \u2014 logging exists, but "comprehensive audit trails of every agent
-- interaction / every model decision is logged" overstated it \u2014 so the compliance band is reworded
-- to the mechanisms actually in place (tenant isolation, row-level security, policy versioning) and
-- the "Audit Logs" pill is dropped. Migration 13 seeded the original strings, so these correct any
-- database that ran it; guarded on the old text so an edited band is left alone.
UPDATE site_sections
SET fields = jsonb_set(
      fields,
      '{items}',
      ((fields->'items') - 6) || '[{"icon":"Mail","title":"Email on your own domain","description":"PulseAssist Email sends transactional and marketing email from your own verified domain, with deliverability and sending reputation managed for you."}]'::jsonb
    ),
    updated_at = now()
WHERE key = 'portfolio.pulseassist.features'
  AND fields->'items' @> '[{"title":"Compliance-ready audit trails"}]'::jsonb;

UPDATE site_sections
SET fields = jsonb_set(
      jsonb_set(fields, '{subheading}', '"Policy configurations are version-controlled and every conversation runs with per-tenant data isolation and row-level security, built to meet the regulatory requirements of banking and telecom in Africa and beyond."'::jsonb),
      '{items}',
      '[{"title":"Tenant Isolation"},{"title":"Policy Versioning"},{"title":"Row-Level Security"}]'::jsonb
    ),
    updated_at = now()
WHERE key = 'portfolio.pulseassist.compliance'
  AND position('comprehensive audit trails' in COALESCE(fields->>'subheading', '')) > 0;
`
    )
  },
  {
    id: 21,
    name: "enice_acronym_updated",
    sql: (
      /* sql */
      `
-- The ENICE acronym now reads "Enabling Next-Generation Innovations in Customer Experience",
-- replacing the earlier Empower / Nurture / Innovate / Create / Elevate that migration 19 seeded.
-- The five list words carry the initials E, N, I, C, E; the connective "in" lives only in the
-- subheading, which the page shows as a lead above the list. Guarded on the old first word, so an
-- administrator's own edit is left alone and a re-run is a no-op.
UPDATE site_sections
SET fields = jsonb_set(
      jsonb_set(fields, '{subheading}', '"Enabling Next-Generation Innovations in Customer Experience."'::jsonb),
      '{items}',
      '[
        {"title":"Enabling","description":""},
        {"title":"Next-Generation","description":""},
        {"title":"Innovations","description":""},
        {"title":"Customer","description":""},
        {"title":"Experience","description":""}
      ]'::jsonb
    ),
    updated_at = now()
WHERE key = 'about.acronym'
  AND fields->'items' @> '[{"title":"Empower"}]'::jsonb;
`
    )
  },
  {
    id: 22,
    name: "drop_epulse_rename_pulsex_to_pride_devapay_2028",
    sql: (
      /* sql */
      `
-- Three product changes, applied to existing databases so the CMS cannot serve the old state over
-- the new code (the same reason migration 17 exists for the DevaPay rename):
--
--   * ePulse is discontinued. Its page, sections, roadmap entry and nav/footer links are removed,
--     and /portfolio/epulse redirects to /portfolio in vercel.json.
--   * PulseX is now PRIDE, at /portfolio/pride (with a 308 from /portfolio/pulsex).
--   * DevaPay's launch moves from Q1 2027 to 2028.
--
-- Also clears the homepage "Products in the ecosystem" figure, which the site no longer shows.
--
-- Every statement is guarded on the old state still being present, so a re-run is a no-op and
-- an administrator's own later edit is left alone.

-- ePulse: page sections and the managed page record.
DELETE FROM site_sections WHERE key = 'portfolio.epulse' OR key LIKE 'portfolio.epulse.%';
DELETE FROM cms_pages WHERE path = '/portfolio/epulse';

-- PulseX -> PRIDE: section keys are renamed rather than re-inserted, so edited copy moves across.
UPDATE site_sections SET key = 'portfolio.pride', label = 'PRIDE page', updated_at = now()
WHERE key = 'portfolio.pulsex'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.pride');
UPDATE site_sections SET key = 'portfolio.pride.facts', label = 'PRIDE launch facts', updated_at = now()
WHERE key = 'portfolio.pulsex.facts'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.pride.facts');
UPDATE site_sections SET key = 'portfolio.pride.highlights', label = 'PRIDE highlights', updated_at = now()
WHERE key = 'portfolio.pulsex.highlights'
  AND NOT EXISTS (SELECT 1 FROM site_sections WHERE key = 'portfolio.pride.highlights');

UPDATE cms_pages SET path = '/portfolio/pride', title = 'PRIDE', updated_at = now()
WHERE path = '/portfolio/pulsex'
  AND NOT EXISTS (SELECT 1 FROM cms_pages WHERE path = '/portfolio/pride');

-- Copy that names the products. ePulse's sentence fragments go first so the PulseX replacement
-- does not leave "PRIDE, PulsePay, and ePulse" behind.
UPDATE site_sections
SET fields = replace(replace(replace(replace(fields::text,
      'PulseX, PulsePay, and ePulse', 'PRIDE and PulsePay'),
      'deeply integrated with PulsePay and ePulse', 'built into the same ecosystem as PulsePay'),
      'and ePulse and PulseX extend the ecosystem into digital banking and digital assets',
      'DevaPay covers payment collection, and PRIDE extends the ecosystem into digital assets'),
      'PulseX', 'PRIDE')::jsonb,
    updated_at = now()
WHERE position('PulseX' in fields::text) > 0 OR position('ePulse' in fields::text) > 0;

-- Roadmap: drop the ePulse milestone, move DevaPay to 2028.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN item->>'title' = 'DevaPay Launch'
                    THEN jsonb_set(item, '{description}',
                           to_jsonb(replace(item->>'description', 'when: Q1 2027', 'when: 2028')))
                    ELSE item END
               ORDER BY (item->>'title' = 'DevaPay Launch'), ord), '[]'::jsonb)
      FROM jsonb_array_elements(fields->'items') WITH ORDINALITY AS t(item, ord)
      WHERE position('product: ePulse' in COALESCE(item->>'description', '')) = 0
    )),
    updated_at = now()
WHERE fields->'items' @> '[{"title":"DevaPay Launch"}]'::jsonb
  AND (position('product: ePulse' in fields::text) > 0 OR position('when: Q1 2027' in fields::text) > 0);

-- DevaPay's other launch figures: the facts strip and the homepage product tile.
-- In these two sections "Q1 2027" only ever appears as DevaPay's launch, so the value itself is
-- replaced rather than a serialised object (whose key order is Postgres's choice, not ours).
-- The homepage product tiles live under 'home.portfolio'.
UPDATE site_sections
SET fields = replace(fields::text, 'Q1 2027', '2028')::jsonb,
    updated_at = now()
WHERE key IN ('portfolio.devapay.facts', 'home.portfolio')
  AND position('Q1 2027' in fields::text) > 0;

-- Homepage statistics: the product count is no longer shown.
UPDATE site_sections
SET fields = jsonb_set(fields, '{items}', '[]'::jsonb), updated_at = now()
WHERE key = 'home.statistics'
  AND fields->'items' @> '[{"label":"Products in the ecosystem"}]'::jsonb;

-- Header: drop ePulse from every menu's children, then rename PulseX. Structured rather than a
-- text replace, because removing an object from a jsonb array by string surgery depends on the
-- key order Postgres chose when it stored it.
UPDATE site_settings
SET value = jsonb_set(value, '{items}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(item->'children') = 'array'
                    THEN jsonb_set(item, '{children}', (
                           SELECT COALESCE(jsonb_agg(child ORDER BY cord), '[]'::jsonb)
                           FROM jsonb_array_elements(item->'children') WITH ORDINALITY AS c(child, cord)
                           WHERE child->>'url' IS DISTINCT FROM '/portfolio/epulse'))
                    ELSE item END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'items') WITH ORDINALITY AS t(item, ord)
      WHERE item->>'url' IS DISTINCT FROM '/portfolio/epulse'
    )),
    updated_at = now()
WHERE key = 'header'
  AND jsonb_typeof(value->'items') = 'array'
  AND position('/portfolio/epulse' in value::text) > 0;

-- Footer: the same, one level down in each column's links.
UPDATE site_settings
SET value = jsonb_set(value, '{columns}', (
      SELECT COALESCE(jsonb_agg(
               CASE WHEN jsonb_typeof(col->'links') = 'array'
                    THEN jsonb_set(col, '{links}', (
                           SELECT COALESCE(jsonb_agg(link ORDER BY lord), '[]'::jsonb)
                           FROM jsonb_array_elements(col->'links') WITH ORDINALITY AS l(link, lord)
                           WHERE link->>'url' IS DISTINCT FROM '/portfolio/epulse'))
                    ELSE col END
               ORDER BY ord), '[]'::jsonb)
      FROM jsonb_array_elements(value->'columns') WITH ORDINALITY AS t(col, ord)
    )),
    updated_at = now()
WHERE key = 'footer'
  AND jsonb_typeof(value->'columns') = 'array'
  AND position('/portfolio/epulse' in value::text) > 0;

-- Both: PulseX's label and address. A plain replace is safe here \u2014 it rewrites values in place
-- without adding or removing anything.
UPDATE site_settings
SET value = replace(replace(replace(value::text,
      '/portfolio/pulsex', '/portfolio/pride'),
      '-pulsex"', '-pride"'),
      'PulseX', 'PRIDE')::jsonb,
    updated_at = now()
WHERE key IN ('header', 'footer')
  AND (position('pulsex' in value::text) > 0 OR position('PulseX' in value::text) > 0);
`
    )
  },
  {
    id: 23,
    name: "use_legal_entity_in_default_footer_copyright",
    sql: (
      /* sql */
      `
-- ENICE Group is the public brand; copyright belongs to ENICE Technology Limited. Update only
-- untouched generated copyright strings so an administrator's custom legal wording is preserved.
UPDATE site_settings
SET value = jsonb_set(
      value,
      '{copyright}',
      to_jsonb(replace(value->>'copyright', 'ENICE Group', 'ENICE Technology Limited'))
    ),
    updated_at = now()
WHERE key = 'footer'
  AND value->>'copyright' ~ '^\xA9 [0-9]{4} ENICE Group\\. All rights reserved\\.$';
`
    )
  }
];
var MIGRATIONS_TABLE_SQL = (
  /* sql */
  `
CREATE TABLE IF NOT EXISTS cms_migrations (
  id         integer PRIMARY KEY,
  name       text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);
`
);
var MIGRATION_LOCK_KEY = "8324119407551002";

// api-src/lib/db.ts
var DatabaseNotConfiguredError = class extends Error {
  constructor() {
    super(
      "The Website Manager database is not configured. Set DATABASE_URL to a Postgres connection string (a pooled endpoint is recommended). If the database was attached through a Vercel integration under a prefix, the prefixed name is also accepted \u2014 the value simply has to begin with postgres:// or postgresql://."
    );
    this.name = "DatabaseNotConfiguredError";
  }
};
function isInvalidInputSyntax(error) {
  return Boolean(error) && error.code === "22P02";
}
var client = null;
var POSTGRES_URL = /^postgres(ql)?:\/\/[^\s]/i;
function isPostgresUrl(value) {
  return POSTGRES_URL.test(value);
}
var URL_VARIABLES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "DATABASE_URL_UNPOOLED",
  "POSTGRES_URL_NON_POOLING"
];
function resolveDatabaseUrl(env = process.env) {
  const match = findEnv(URL_VARIABLES, isPostgresUrl, env);
  return match === null ? null : { url: match.value, variable: match.name };
}
function isDatabaseConfigured() {
  return resolveDatabaseUrl() !== null;
}
function sslOptions(url) {
  if (/[?&]sslmode=/i.test(url)) return {};
  try {
    const { hostname } = new URL(url);
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return { ssl: false };
    }
  } catch {
  }
  return { ssl: "require" };
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
    // Spread, never assigned: see sslOptions on why `ssl: undefined` would disable TLS.
    ...sslOptions(url),
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
var migrationPromise = null;
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

// api-src/lib/router.ts
var Router = class {
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
var ROUTE_PARAM = "__route";
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
var HttpError = class extends Error {
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

// src/lib/cms/sanitize.ts
var ALLOWED_TAGS = {
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
var VOID_TAGS = /* @__PURE__ */ new Set(["br"]);
var DROP_CONTENT_TAGS = /* @__PURE__ */ new Set([
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
var SAFE_PROTOCOLS = /* @__PURE__ */ new Set(["http:", "https:", "mailto:", "tel:"]);
var MAX_INLINE_LENGTH = 2e5;
var MAX_NESTING = 8;
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

// src/lib/cms/doc.ts
var BLOCK_TYPES = [
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
var HEADING_LEVELS = [2, 3, 4];
var CALLOUT_VARIANTS = ["info", "success", "warning", "danger"];
var MAX_BLOCKS = 600;
var MAX_LIST_ITEMS = 200;
var MAX_TABLE_COLUMNS = 10;
var MAX_TABLE_ROWS = 200;
var MAX_CODE_LENGTH = 4e4;
var CODE_LANGUAGES = [
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

// src/lib/site.ts
var SITE_URL = "https://enicehq.com";

// api-src/lib/search-discovery.ts
var INDEXNOW_KEY = "67be4fa08925c8ad447fb92b3774d1ac";
var INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
var INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
var REQUEST_TIMEOUT_MS = 2500;
var MAX_URLS_PER_REQUEST = 1e4;
function publicContentPath(kind, slug) {
  const prefix = CONTENT_KIND_META[kind].publicPrefix;
  return prefix ? `${prefix}/${slug}` : `/news#${slug}`;
}
function ownedUrls(values2) {
  const expectedOrigin = new URL(SITE_URL).origin;
  const urls = /* @__PURE__ */ new Set();
  for (const value of values2) {
    try {
      const url = new URL(value, `${SITE_URL}/`);
      if (url.origin !== expectedOrigin) continue;
      url.hash = "";
      urls.add(url.href);
    } catch {
    }
  }
  return [...urls];
}
async function notifySearchEngines(values2, event) {
  if (process.env.VERCEL_ENV !== "production") return;
  const urls = ownedUrls(values2);
  if (urls.length === 0) return;
  for (let offset = 0; offset < urls.length; offset += MAX_URLS_PER_REQUEST) {
    const urlList = urls.slice(offset, offset + MAX_URLS_PER_REQUEST);
    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(SITE_URL).host,
          key: INDEXNOW_KEY,
          keyLocation: INDEXNOW_KEY_LOCATION,
          urlList
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      });
      if (!response.ok) {
        console.warn(
          `[search-discovery] IndexNow ${event} notification returned ${response.status} for ${urlList.length} URL(s)`
        );
        continue;
      }
      console.log(
        `[search-discovery] IndexNow accepted ${urlList.length} ${event} URL notification(s)`
      );
    } catch (error) {
      const reason = error instanceof Error ? error.name : "UnknownError";
      console.warn(
        `[search-discovery] IndexNow ${event} notification failed for ${urlList.length} URL(s): ${reason}`
      );
    }
  }
}

// api-src/lib/repo/content.ts
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
    RETURNING id, title, kind, slug, seo
  `;
  if (rows.length > 0) {
    console.log(`[cms] auto-published ${rows.length} scheduled item(s)`);
    await notifySearchEngines(
      rows.filter((row) => row.seo?.index !== false).map((row) => publicContentPath(toKind(row.kind), row.slug)),
      "scheduled-publish"
    );
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
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 500);
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
  if (existing.status === "published") {
    await notifySearchEngines(
      [
        publicContentPath(existing.kind, existing.slug),
        publicContentPath(updated.kind, updated.slug)
      ],
      "content-update"
    );
  }
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
  if (existing.status === "published" || status === "published") {
    await notifySearchEngines([publicContentPath(updated.kind, updated.slug)], `content-${status}`);
  }
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
  if (existing.status === "published") {
    await notifySearchEngines([publicContentPath(existing.kind, existing.slug)], "content-delete");
  }
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

// src/lib/cms/seo-resolve.ts
var FALLBACK_SEO_DEFAULTS = {
  titleSuffix: " | ENICE Group",
  defaultDescription: "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
  defaultOgImage: "/og.png",
  indexSite: true,
  robotsExtra: ""
};

// api-src/lib/repo/website.ts
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
    /*
     * Grouped, matching the header the site actually renders.
     *
     * The previous default was a flat `Home · Products · About · Contact`, which left ten real
     * pages reachable only from the footer and named Contact twice — once as a link and again as
     * the CTA. `Home` is gone because the wordmark is the home link. The model has always allowed
     * one level of `children`; the header renders those as a menu.
     */
    header: {
      items: [
        {
          id: "nav-products",
          label: "Products",
          url: "/portfolio",
          visible: true,
          children: [
            { id: "nav-pulsepay", label: "PulsePay", url: "/portfolio/pulsepay", visible: true },
            {
              id: "nav-pulseassist",
              label: "PulseAssist",
              url: "/portfolio/pulseassist",
              visible: true
            },
            {
              id: "nav-pulseassist-email",
              label: "PulseAssist Email",
              url: "/portfolio/pulseassist-email",
              visible: true
            },
            {
              id: "nav-devapay",
              label: "DevaPay",
              url: "/portfolio/devapay",
              visible: true
            },
            { id: "nav-pride", label: "PRIDE", url: "/portfolio/pride", visible: true }
          ]
        },
        { id: "nav-company", label: "Company", url: "/about", visible: true },
        {
          id: "nav-resources",
          label: "Resources",
          url: "#",
          visible: true,
          children: [
            { id: "nav-docs", label: "Documentation", url: "/docs", visible: true },
            { id: "nav-roadmap", label: "Roadmap", url: "/roadmap", visible: true },
            { id: "nav-blog", label: "Blog", url: "/blog/", visible: true },
            { id: "nav-news", label: "News & Changelog", url: "/news/", visible: true },
            { id: "nav-status", label: "System Status", url: "/status", visible: true }
          ]
        }
      ],
      ctaLabel: "Contact",
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
              id: "f-pulseassist-email",
              label: "PulseAssist Email",
              url: "/portfolio/pulseassist-email",
              visible: true
            },
            {
              id: "f-devapay",
              label: "DevaPay",
              url: "/portfolio/devapay",
              visible: true
            },
            { id: "f-pride", label: "PRIDE", url: "/portfolio/pride", visible: true },
            { id: "f-all-products", label: "All products", url: "/portfolio", visible: true }
          ]
        },
        {
          id: "col-developers",
          heading: "Developers",
          links: [
            { id: "f-docs", label: "API documentation", url: "/docs", visible: true },
            { id: "f-roadmap", label: "Product roadmap", url: "/roadmap", visible: true },
            { id: "f-status", label: "System status", url: "/status", visible: true }
          ]
        },
        {
          id: "col-company",
          heading: "Company",
          links: [
            { id: "f-about", label: "About ENICE Group", url: "/about", visible: true },
            { id: "f-contact", label: "Contact", url: "/contact", visible: true },
            { id: "f-blog", label: "Blog", url: "/blog/", visible: true },
            { id: "f-news", label: "News & changelog", url: "/news/", visible: true },
            {
              id: "f-announcements",
              label: "Announcements",
              url: "/announcements/",
              visible: true
            }
          ]
        },
        // Legal was mixed in with Company, which gave the privacy policy the same weight as the
        // About page. Splitting it also evens the column count.
        {
          id: "col-legal",
          heading: "Legal",
          links: [
            { id: "f-privacy", label: "Privacy policy", url: "/privacy", visible: true },
            { id: "f-terms", label: "Terms of service", url: "/terms", visible: true },
            {
              id: "f-compliance",
              label: "Regulatory compliance",
              url: "/compliance",
              visible: true
            }
          ]
        }
      ],
      tagline: "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
      copyright: `\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} ENICE Technology Limited. All rights reserved.`,
      showSocials: true
    },
    seo: FALLBACK_SEO_DEFAULTS,
    announcementBarEnabled: false,
    maintenanceNotice: ""
  };
}
var DEFAULT_SECTIONS = [
  {
    key: "home.hero",
    label: "Homepage hero",
    group: "Home",
    type: "hero",
    order: 10,
    fields: {
      eyebrow: "Technology Group \xB7 Building for Africa",
      /*
       * No manual line breaks and no [[highlight]] in the default.
       *
       * The breaks were tuned for one viewport and ragged badly at every other; the headline is
       * now balanced by the browser. The highlight is dropped because at display size it put two
       * lines of the accent at the top of the page — the accent is for small emphasis, and a 60px
       * phrase in the brand blue stops reading as an accent. Both remain available to an editor
       * (\n splits a line, [[…]] renders a phrase in the accent colour); they are simply not what
       * the shipped copy uses.
       */
      heading: "We build the technology behind Africa's next generation of businesses.",
      subheading: "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
      primaryCtaLabel: "Explore our products",
      primaryCtaUrl: "/portfolio",
      secondaryCtaLabel: "What we build",
      secondaryCtaUrl: "/about"
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
      /*
       * Only figures that can be checked.
       *
       * This seed still carried `99.99% Infrastructure SLA`, `< 14ms API Latency P50` and
       * `AES-256 Encryption Standard` long after those claims were deleted from the homepage —
       * so a fresh install re-published all three, and the page's built-in copy was the only
       * thing keeping them off the site. There is no uptime SLA, no published latency benchmark,
       * and an encryption standard is not a headline metric. The product count was also simply
       * wrong (4 for five products), which is why the code derives it from the product registry
       * rather than storing it.
       */
      items: []
    }
  },
  {
    key: "home.products",
    label: "Product grid",
    group: "Home",
    type: "featureGrid",
    order: 30,
    fields: {
      eyebrow: "What we're building",
      heading: "Three areas we build in.",
      subheading: "ENICE Group takes hard problems in financial services and business communication and turns them into products people can rely on.",
      // The three cards the homepage product band renders. `index` numbering is derived from
      // position, and bullets are one per line.
      items: [
        {
          icon: "Banknote",
          kicker: "Fintech",
          title: "Financial Infrastructure Systems",
          description: "Transaction networks, ledger databases, and virtual card infrastructure built for Nigeria's digital economy, with room to expand across the region.",
          bullets: "Virtual Card Issuance\nTreasury and Ledger\nKYC and Compliance Tooling"
        },
        {
          icon: "BrainCircuit",
          kicker: "Artificial Intelligence",
          title: "Autonomous Enterprise AI",
          description: "Conversational AI that handles customer support, compliance monitoring, and daily operations for banks, fintechs, and telecoms.",
          bullets: "Autonomous Customer Support\nPolicy-Bound AI Agents\nWorkflow Automation"
        },
        {
          icon: "Boxes",
          kicker: "Product Engineering",
          title: "Products built to operate",
          description: "We build, own, and operate full-stack products. Each platform starts from a real customer problem and goes through engineering, launch, and day-to-day operation.",
          bullets: "Product Ownership\nPlatform Engineering\nContinuous Operation"
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
    fields: {
      heading: "Working with",
      // The infrastructure providers, each with a self-hosted brand logo (public/partners/*.svg),
      // so the strip is populated on a fresh install. Existing databases are seeded the same set
      // by migration 3. An administrator can edit, reorder or remove any of these.
      items: [
        {
          name: "Amazon Web Services",
          tagline: "Cloud Infrastructure",
          logo: "/partners/aws.svg",
          url: "https://aws.amazon.com"
        },
        {
          name: "Google Cloud",
          tagline: "AI & Compute",
          logo: "/partners/googlecloud.svg",
          url: "https://cloud.google.com"
        },
        {
          name: "Supabase",
          tagline: "Database & Auth",
          logo: "/partners/supabase.svg",
          url: "https://supabase.com"
        },
        {
          name: "Vercel",
          tagline: "Edge Delivery",
          logo: "/partners/vercel.svg",
          url: "https://vercel.com"
        },
        {
          name: "PulseAssist",
          tagline: "Support & Email Infrastructure",
          logo: "/partners/pulseassist.svg",
          url: "https://getpulseassist.com"
        },
        {
          name: "Railway",
          tagline: "Application & Database Hosting",
          logo: "/partners/railway.svg",
          url: "https://railway.com"
        }
      ]
    }
  },
  /*
   * The bands below were hardcoded in the page components until now.
   *
   * Seven sections of the homepage — the product line-up, the infrastructure core, the company
   * story, the founders' letter, the stack, the hiring band — could only be changed by editing
   * React and shipping a deploy, while the four beside them were editable. That split is not a
   * design: it is just where the CMS work stopped. Every one of these describes a product or a
   * position that changes without the code changing, which is exactly the content that must not
   * require an engineer.
   *
   * Each uses an existing section type, so the admin form and its sanitiser already understand
   * them, and each component keeps its built-in copy as the fallback — so an unseeded or
   * unreachable section renders precisely what it renders today.
   */
  {
    key: "home.portfolio",
    label: "Featured products",
    group: "Home",
    type: "featureGrid",
    order: 32,
    fields: {
      eyebrow: "Built and operated by ENICE",
      heading: "The products we build and run.",
      subheading: "Each one began as a problem we hit ourselves, and each one is a platform we operate day to day rather than hand over.",
      // `bullets` carries the product's checkable facts, one `Label: Value` pair per line, and
      // `url` is the product page. See `parseFacts` in src/routes/index.tsx.
      items: [
        {
          icon: "CreditCard",
          kicker: "Fintech infrastructure",
          title: "PulsePay",
          description: "A virtual payment platform for modern commerce: instant Naira card issuance, programmable wallets, embedded KYC, and peer-to-peer transfers built for Nigerian institutions.",
          bullets: "Cards: Naira & USD\nMarket: Nigeria",
          url: "/portfolio/pulsepay"
        },
        {
          icon: "BrainCircuit",
          kicker: "Enterprise AI",
          title: "PulseAssist",
          description: "An AI operations platform for banking, fintech, and telecoms, with automated queue handling, live agent handoff, and policy-bound workflow automation.",
          bullets: "Channels: WhatsApp, web, email, SMS, voice\nTenancy: Multi-tenant",
          url: "/portfolio/pulseassist"
        },
        {
          icon: "Banknote",
          kicker: "Fintech infrastructure",
          title: "DevaPay",
          description: "Payment infrastructure for businesses to accept and manage customer payments through a single, developer friendly API, with real time updates and webhook notifications.",
          bullets: "Launch: 2028\nIntegration: One API",
          url: "/portfolio/devapay"
        }
      ]
    }
  },
  {
    key: "home.core",
    label: "The ENICE Core",
    group: "Home",
    type: "featureGrid",
    order: 34,
    fields: {
      eyebrow: "What powers our products",
      heading: "The ENICE Core.",
      subheading: "Every product we operate runs on a shared infrastructure core, so the software customers use inherits scale, compliance, and reliability from the ground up.",
      items: [
        {
          icon: "Cpu",
          title: "Unified AI and Automation Pipeline",
          description: "Centralized LLM orchestration and vector search routing that powers products like PulseAssist across every tenant."
        },
        {
          icon: "Database",
          title: "High-Velocity Ledger and Payment Core",
          description: "A fast transaction engine and virtual account infrastructure that anchors PulsePay and the financial products we build next."
        },
        {
          icon: "FileCheck2",
          title: "Automated Compliance and KYC Layer",
          description: "Identity verification, fraud detection, and regulatory screening, run in real time and shared across every product."
        },
        {
          icon: "Globe",
          title: "Global Cloud Grid",
          description: "Managed database clustering and serverless edge delivery, so the same infrastructure serves every product without each one reinventing it."
        }
      ]
    }
  },
  {
    key: "home.company",
    label: "Company band",
    group: "Home",
    type: "featureGrid",
    order: 38,
    fields: {
      eyebrow: "The company",
      heading: "ENICE Group is a product company.",
      subheading: "We are the parent company behind a growing set of software platforms. We find real problems in financial services, commerce, and business communication, then build and run the products that solve them.",
      items: [
        {
          title: "We start from the friction",
          description: "Every product traces back to something that failed in ordinary use: a payment that should have been simple, a support queue nobody answered. We build from the specific problem outward, not from a category we want to be in."
        },
        {
          title: "One core, many products",
          description: "Ledgers, identity, AI orchestration and compliance are solved once and shared. A new product inherits that foundation on its first day instead of rebuilding it, which is what makes a small team's output look like a much larger one."
        },
        {
          title: "We operate what we ship",
          description: "We own the products end to end: engineering, launch, and the day-to-day running of them. Nothing is handed to someone else to keep alive, which keeps the cost of a bad decision with the people who made it."
        },
        {
          title: "Built to still be here",
          description: "We design for the version of these systems that exists in ten years: versioned APIs, documented internals, and infrastructure choices made for reliability rather than novelty. Regulated markets do not reward clever."
        }
      ]
    }
  },
  {
    key: "home.founders",
    label: "Founders' letter",
    group: "Home",
    type: "prose",
    order: 40,
    fields: {
      eyebrow: "From the founders",
      heading: "A letter from the founders",
      // Blank lines separate paragraphs; see `fieldParagraphs` in src/lib/cms/use-section.ts.
      body: "Every good business runs on good infrastructure \u2014 that's the idea behind ENICE Group. We don't build technology for its own sake; we build products that solve real problems and give businesses something they can depend on for years.\n\nThe idea came from everyday life in Nigeria: support queues nobody answered, payments that failed exactly when they mattered, cards declined for no reason. We decided that shouldn't be normal. African businesses and consumers deserve technology built to the same standard as anywhere else \u2014 for Africa first, and the world as we grow."
    }
  },
  {
    key: "home.careers",
    label: "Hiring band",
    group: "Home",
    type: "cta",
    order: 60,
    fields: {
      eyebrow: "Join the builders",
      heading: "Build products that matter.",
      subheading: "We work with people who care about product quality, solid engineering, and technology that holds up at real scale. If that sounds like you, we want to hear from you.",
      ctaLabel: "Meet the team",
      ctaUrl: "/contact",
      style: "standard"
    }
  },
  /*
   * PulseAssist Email.
   *
   * A shipping ENICE product that had no page on the company's own site, while this site's
   * transactional mail has been sent through it since #31. Copy is condensed from the product's own
   * page at getpulseassist.com/email; it is framed as a PulseAssist product because that page
   * presents it as part of the PulseAssist platform.
   */
  {
    key: "portfolio.pulseassist-email",
    label: "PulseAssist Email page",
    group: "Portfolio",
    type: "hero",
    order: 225,
    fields: {
      eyebrow: "PulseAssist Email",
      heading: "Professional email, on your own domain.",
      subheading: "Send and receive email from the domain your customers already know. Mailboxes, templates, campaigns and automations in one console, with a REST API, signed webhooks and delivery analytics when you would rather run it from your own systems."
    }
  },
  {
    key: "portfolio.pulseassist-email.facts",
    label: "PulseAssist Email facts strip",
    group: "Portfolio",
    type: "statistics",
    order: 226,
    fields: {
      heading: "PulseAssist Email at a glance",
      items: [
        { value: "Your domain", label: "Verified in live DNS" },
        { value: "Send + receive", label: "Inbound routing included" },
        { value: "REST API", label: "Scoped, rotatable keys" },
        { value: "Webhooks", label: "Signed delivery events" }
      ]
    }
  },
  {
    key: "portfolio.pulseassist-email.capabilities",
    label: "PulseAssist Email capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 227,
    fields: {
      eyebrow: "What you get",
      heading: "Everything the product actually does.",
      subheading: "This is the implementation rather than a roadmap. If something is missing from the list, it is because it has not been built yet.",
      items: [
        {
          icon: "Globe2",
          title: "Your own sending domain",
          description: "Mail goes out from your domain, not ours. The DKIM, SPF and MAIL FROM records are generated for you, then checked against public DNS. A domain is only marked connected once those records genuinely resolve."
        },
        {
          icon: "Send",
          title: "Transactional and bulk sending",
          description: "A single message and a campaign run through the same pipeline, each with its own delivery status. Sends are recorded with the idempotency key you supplied, so a retried request cannot become a duplicate email."
        },
        {
          icon: "Inbox",
          title: "Inbound email and routing",
          description: "Receive mail on your own domain and route it by recipient, sender or subject: to a mailbox, a team, or your own webhook. Inbound is part of the product rather than a forwarding workaround."
        },
        {
          icon: "AtSign",
          title: "Mailboxes and sending addresses",
          description: "Mailboxes that receive and addresses that send, each tied to a verified domain. An address is claimed once across the platform, so two workspaces cannot share an identity."
        },
        {
          icon: "Layers",
          title: "Templates with version history",
          description: "Write a template once and use it from the console or the API. Versions are append-only, so a campaign keeps sending the wording it was reviewed with even after the template moves on."
        },
        {
          icon: "Sparkles",
          title: "Automations and sequences",
          description: "Multi-step sequences with delays between steps. Consent is re-checked when each step sends rather than when someone was enrolled, so an unsubscribe takes effect mid-sequence."
        },
        {
          icon: "BarChart3",
          title: "Delivery analytics",
          description: "Delivered, bounced and complained totals with the rates behind them, measured against what the provider accepted rather than what was attempted. Rates are withheld until the sample is large enough to mean anything."
        },
        {
          icon: "ShieldCheck",
          title: "Suppression and deliverability protection",
          description: "Hard bounces and complaints are suppressed automatically and permanently, and a suppressed address is refused before it costs another bounce. The list is yours to inspect, search and export."
        },
        {
          icon: "KeyRound",
          title: "REST API with scoped keys",
          description: "A documented API for sending, addresses, suppressions, analytics and events. Keys carry scopes, so a key that reads analytics cannot send mail, and any key can be rotated or revoked without downtime."
        },
        {
          icon: "Webhook",
          title: "Signed delivery webhooks",
          description: "Register endpoints and receive delivery, bounce and complaint events as they happen, signed and deduplicated. Failed deliveries are retried and visible, so a broken endpoint does not fail quietly."
        },
        {
          icon: "BrainCircuit",
          title: "AI drafting and classification",
          description: "Draft, rewrite, summarise and classify mail using the same AI that answers support in PulseAssist. It draws on its own credit pool, so ordinary sending never consumes it."
        },
        {
          icon: "Code2",
          title: "Usage you can see coming",
          description: "Live usage against your plan's allowances (sent this month, addresses, domains, endpoints), read from your entitlements rather than estimated, so a limit is visible while there is still time to act."
        }
      ]
    }
  },
  {
    key: "portfolio.pulseassist-email.setup",
    label: "PulseAssist Email setup steps",
    group: "Portfolio",
    type: "steps",
    order: 228,
    fields: {
      heading: "Four steps, and the hard one is checked for you.",
      subheading: "DNS is where email setup usually goes wrong, so the console names the records that are still outstanding and the ones that are published but wrong, which never fix themselves while you wait.",
      items: [
        {
          title: "Add your domain",
          description: "Enter the domain you want to send from. It is registered with the sending provider and the exact records it needs are generated for you."
        },
        {
          title: "Publish the records",
          description: "Add the DKIM, SPF and MAIL FROM records at your DNS provider. Each is shown with its host and value, and the console tells you which are still outstanding."
        },
        {
          title: "Verification against real DNS",
          description: "The records are looked up in public DNS, not just requested from the provider. A record that is published but wrong, whether a stale value, a proxied CNAME or a second SPF line, is reported as exactly that."
        },
        {
          title: "Send, receive and watch it",
          description: "Once the records agree, sending is live. Add mailboxes and routing rules for inbound, then follow delivery, bounces and complaints from the first message onward."
        }
      ]
    }
  },
  {
    key: "home.faq",
    label: "Frequently asked questions",
    group: "Home",
    type: "faq",
    order: 50,
    fields: {
      eyebrow: "Frequently asked",
      heading: "Questions, answered.",
      subheading: "A plain look at the company, the products, and the technology behind them.",
      items: [
        {
          question: "What does ENICE Group build?",
          answer: "ENICE Group builds and operates technology products for financial services, commerce, and business communication. PulsePay is our digital financial platform. PulseAssist handles AI-powered business communication and customer support."
        },
        {
          question: "Which problems are ENICE products built to solve?",
          answer: "Our products focus on financial services, telecommunications, and business operations. PulsePay covers digital finance, PulseAssist covers business communication and customer support, DevaPay covers payment collection, and PRIDE extends the ecosystem into digital assets."
        },
        {
          question: "What does the ENICE Core provide?",
          answer: "A shared AI and automation pipeline, a fast ledger and payment core, an automated KYC and compliance layer, and a global cloud grid. Every product inherits the same scale, security, and observability from day one."
        },
        {
          question: "How does ENICE Group approach security and compliance?",
          answer: "We run a zero-trust architecture with per-tenant database isolation, row-level security, audit logging, and continuous monitoring. Every system is built for regulatory readiness from day one and aligned with SOC 2 control objectives."
        },
        {
          question: "How can businesses access ENICE products?",
          answer: "Businesses and institutions can reach the ENICE team through the Contact page to ask about product access, licensing, or integration requirements."
        }
      ]
    }
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
  /*
   * The platform-capabilities band and the roadmap, previously hardcoded in their components.
   *
   * Both describe things that change on their own schedule — a mechanism the platform gains, a
   * milestone that ships or slips — and neither needed source code to say so. Migration 13 seeds
   * the same two rows into existing databases.
   */
  {
    key: "home.capabilities",
    label: "Platform capabilities",
    group: "Home",
    type: "featureGrid",
    order: 35,
    fields: {
      eyebrow: "Platform capabilities",
      heading: "How the platform is built.",
      subheading: "Mechanisms in place across every product. Current availability is reported on the status page.",
      // `kicker` is the small uppercase label, `title` the figure beneath it, `description` the
      // supporting line. See src/components/site/NetworkMetrics.tsx.
      items: [
        {
          icon: "Gauge",
          kicker: "API delivery",
          title: "Edge",
          description: "Multi-region, served from the nearest edge"
        },
        {
          icon: "Activity",
          kicker: "Tenant isolation",
          title: "Row-level",
          description: "Enforced in the database, not the application"
        },
        {
          icon: "ShieldCheck",
          kicker: "Data encryption",
          title: "TLS + at rest",
          description: "Managed database and object storage"
        },
        {
          icon: "Zap",
          kicker: "Card issuance",
          title: "< 5s",
          description: "Virtual card provisioning"
        },
        {
          icon: "Lock",
          kicker: "KYC verification",
          title: "Real-time",
          description: "Automated compliance checks"
        }
      ]
    }
  },
  {
    key: "home.roadmap",
    label: "Strategic roadmap",
    group: "Home",
    type: "steps",
    order: 45,
    fields: {
      heading: "Built step by step, for the long run.",
      subheading: "Our roadmap follows the maturity of the platforms we operate, sequenced so each step builds on the last.",
      /*
       * Each milestone is one step. A step carries a title and a description, so the four things a
       * milestone needs beyond those — timeframe, status, product and tags — are written as
       * `label: value` lines at the top of the description, with the body after a blank line:
       *
       *   when: Q4 2026
       *   status: in-progress
       *   product: PulseAssist
       *   tags: AI, B2B, Telecom
       *
       *   First rollout of support automation …
       *
       * `status` is one of `completed`, `in-progress` or `planned`; anything else resolves to
       * `planned`. See `parseMilestone` in src/components/site/Roadmap.tsx.
       *
       * Note the ceiling: `SECTION_SCHEMAS.steps` caps its repeater at 8 rows, and there are nine
       * milestones, so this seed is trimmed to eight by `sanitizeSectionFields` on a fresh install
       * and the ninth ("Universal Financial Hub") arrives only via migration 13, which writes the
       * JSON directly. Raising that cap to 12 — the figure `featureGrid` already uses — is a
       * one-line change in `src/lib/cms/types.ts` and is the real fix; it is deliberately not made
       * here because this change set does not touch the shared schema.
       */
      items: [
        {
          title: "Shared Ecosystem Framework",
          description: "when: Q1 2026\nstatus: completed\nproduct: ENICE Core\ntags: Infrastructure, AI, Compliance\n\nThe unified AI pipeline, ledger, and compliance backbone that now underpins every ENICE product."
        },
        {
          title: "Extended Pilot with Regional Treasury Partners",
          description: "when: Q3 2026\nstatus: completed\nproduct: PulsePay\ntags: Fintech, Wallets, KYC\n\nProgrammable wallets, instant virtual card issuance, and embedded compliance controls, rolled out to a wider pilot group across West Africa."
        },
        {
          title: "Enterprise B2B Launch",
          description: "when: Q4 2026\nstatus: in-progress\nproduct: PulseAssist\ntags: AI, B2B, Telecom\n\nFirst rollout of support automation to banking, fintech, and telecom partners, with policy-bound agents and live-agent failover."
        },
        {
          title: "Developer API Public Beta",
          description: "when: Q2 2026\nstatus: in-progress\nproduct: PulsePay\ntags: API, Developer, Fintech\n\nThe ENICE Core API opens to verified integration partners, with wallet issuance, ledger, KYC, and Assist endpoints available in a sandbox."
        },
        {
          title: "Multi-Currency Expansion",
          description: "when: Q3 2026\nstatus: planned\nproduct: PulsePay\ntags: Fintech, Multi-Currency, Treasury\n\nMulti-currency wallet rails, programmable spend controls, and embedded treasury operations for the payment platform."
        },
        {
          title: "Global Digital Asset Exchange Private Beta",
          description: "when: Q3 2027\nstatus: planned\nproduct: PRIDE\ntags: Crypto, Exchange, Global\n\nPRIDE opens to institutional and qualified retail participants, with support for major digital asset pairs, custody, and compliance reporting."
        },
        {
          title: "Universal Financial Hub",
          description: "when: 2027\nstatus: planned\nproduct: ENICE Core\ntags: Infrastructure, Global, Liquidity\n\nA global virtual-dollar and asset infrastructure layer connecting institutional liquidity across markets through a single API."
        },
        {
          title: "DevaPay Launch",
          description: "when: 2028\nstatus: planned\nproduct: PulsePay\ntags: Fintech, Payments, API\n\nDevaPay launches: a unified API for businesses to accept and manage customer payments, with real time status updates and webhook notifications."
        }
      ]
    }
  },
  /*
   * The last two hardcoded bands on the homepage: the three principles under the product grid, and
   * the mechanisms strip at the foot of the ENICE Core band.
   *
   * Neither band renders a heading of its own, so both seed one for the admin list only — a section
   * with no label in the section list is unnavigable, and `featureGrid` requires the field anyway.
   * Nothing on the page reads it. Migration 14 seeds the same two rows into existing databases.
   */
  {
    key: "home.principles",
    label: "Build principles",
    group: "Home",
    type: "featureGrid",
    order: 31,
    fields: {
      // Admin-facing only; the band renders the cards and nothing above them.
      heading: "Build principles",
      // `title` is the card heading, `description` the line beneath it.
      items: [
        {
          title: "Problems before products",
          description: "We start with problems people and businesses actually face."
        },
        {
          title: "Room to grow",
          description: "Our products are designed to support users as their needs grow."
        },
        {
          title: "Grounded in African markets",
          description: "We understand the realities of African markets and build with those realities in mind."
        }
      ]
    }
  },
  {
    key: "home.mechanisms",
    label: "Platform mechanisms",
    group: "Home",
    type: "featureGrid",
    order: 33,
    fields: {
      // Admin-facing only; the band renders the sentence and the pills, with no heading.
      heading: "Platform mechanisms",
      subheading: "Regulated in the Federal Republic of Nigeria. These are mechanisms the platform implements, not certifications we hold.",
      /*
       * `title` is the pill's label and `icon` its glyph.
       *
       * The hero's trust-signal strip renders the first three of these rows: it was a second
       * hardcoded copy of the same three strings, and `hero` has neither a repeater nor a spare
       * text field to hold them. See `COMPLIANCE_BADGES` in src/routes/index.tsx.
       */
      items: [
        { icon: "ShieldCheck", title: "Row-level security" },
        { icon: "Lock", title: "Per-tenant isolation" },
        { icon: "Check", title: "Audit logging" },
        { icon: "Wifi", title: "Encrypted in transit and at rest" }
      ]
    }
  },
  {
    key: "about.hero",
    label: "About page header",
    group: "About",
    type: "hero",
    order: 105,
    fields: {
      eyebrow: "About ENICE Group",
      heading: "We build technology products. [[Then we operate them.]]",
      subheading: "ENICE Group is the parent company behind a growing set of software products. We find real problems in financial services, commerce, and business communication, then build and run the platforms that solve them."
    }
  },
  {
    key: "about.acronym",
    label: "What the name stands for",
    group: "About",
    type: "featureGrid",
    order: 110,
    fields: {
      heading: "What the name stands for",
      // The full phrase, shown as a lead above the per-letter list, which cannot carry the "in".
      subheading: "Enabling Next-Generation Innovations in Customer Experience.",
      // `title` is the word; the initial the page shows beside it is derived from that word rather
      // than stored, so the column of letters always spells whatever the words spell.
      //
      // `description` is intentionally blank on every row: the words already form the phrase in the
      // subheading, and a gloss per letter would be invented filler. The field exists so the brand
      // owner can add one per letter later without a deploy.
      items: [
        { title: "Enabling", description: "" },
        { title: "Next-Generation", description: "" },
        { title: "Innovations", description: "" },
        { title: "Customer", description: "" },
        { title: "Experience", description: "" }
      ]
    }
  },
  {
    key: "about.story",
    label: "Our Story",
    group: "About",
    type: "prose",
    order: 130,
    fields: {
      heading: "Our Story",
      body: "ENICE Group started from one observation: the biggest problems facing African businesses aren't problems of ambition, they're problems of infrastructure. The software systems and financial rails that large organisations rely on elsewhere have historically been too expensive, too inaccessible, or simply missing for businesses in emerging markets.\n\nWe're building more than one product on the same foundation. The same engineering standards and shared infrastructure can support multiple purpose-built platforms, each serving a distinct need and strengthening the system around it.\n\nThis isn't a collection of separate experiments. It's a deliberate approach: shared infrastructure compounds in value, and the quality of one product raises the bar for whatever we build next."
    }
  },
  {
    key: "about.mission",
    label: "Our Mission",
    group: "About",
    type: "prose",
    order: 140,
    fields: {
      heading: "Our Mission",
      body: "We want to build the technology layer that lets businesses, institutions, and developers across Africa, and eventually beyond, operate at real scale. Not software that works well enough, but software built with the reliability, security, and performance that institutional operations require.\n\nOur customers aren't test users. They're financial service providers, enterprise operations teams, and technology builders who need infrastructure they can stake their business on. We serve them with platforms that are secure by design and built to hold up under real commercial volume.\n\nWe're aiming for structural impact, not just features. When payment infrastructure is reliable, commerce expands. When enterprise AI is trustworthy, teams get more done. When developer tools are solid, the next generation of companies gets built faster. That's the impact we're here for."
    }
  },
  {
    key: "about.outlook",
    label: "Looking Ahead",
    group: "About",
    type: "prose",
    order: 170,
    fields: {
      heading: "Looking Ahead",
      body: "The infrastructure African businesses depend on is still largely being built, and that gap is what we're focused on \u2014 over a ten-to-twenty-year horizon most organisations aren't structured to sustain. We're building a home-grown technology group that competes globally, not one that follows trends.\n\nThis isn't charity. Demand for institutional-quality infrastructure is large, growing, and underserved, and we intend to supply it \u2014 with systems businesses on this continent can run on for the next generation.\n\nWhat we build is made for a global market: it scales across regions, meets international compliance standards, and is built to compete with any equivalent platform anywhere. To the businesses and builders who rely on us \u2014 we're committed to technology that matters, to a standard that matters, and to taking the time to do it properly."
    }
  },
  {
    key: "about.values",
    label: "How we work",
    group: "About",
    type: "featureGrid",
    order: 120,
    fields: {
      heading: "Our Principles",
      subheading: "These aren't aspirational values written for a careers page. They're the standards we hold every decision, every system, and every person on the team to.",
      items: [
        {
          title: "Long-Term Thinking",
          description: "We evaluate decisions against decades, not quarters. We want companies that outlast trends and survive economic cycles. We won't trade long-term integrity for short-term convenience."
        },
        {
          title: "Engineering Excellence",
          description: "We hold our engineering to the standards of regulated industries. Our codebases are documented, our APIs are versioned and backward-compatible, and our system designs favour resilience over novelty."
        },
        {
          title: "Security by Design",
          description: "Security isn't added after a product ships. It's built in from the start. Zero-trust architecture, per-tenant data isolation, end-to-end encryption, and continuous threat modelling are standard across every product we run. We treat our partners' data as our responsibility."
        },
        {
          title: "Customer Obsession",
          description: "We measure ourselves by outcomes for the people we serve, not feature counts. Every product decision traces back to a real constraint facing a specific type of business, and our job is to remove it."
        },
        {
          title: "Responsible AI",
          description: "AI can help or cause real harm. Our AI systems ship with clear guardrails, full auditability, and ongoing human oversight. We don't release a capability until we're confident in its reliability and we can explain how it works."
        }
      ]
    }
  },
  /*
   * The last four hardcoded bands on the About page: "What We Build" and its sector tiles, the
   * founding team, and the closing statement. Migration 14 seeds the same rows into existing
   * databases.
   */
  {
    key: "about.build",
    label: "What We Build",
    group: "About",
    type: "prose",
    order: 152,
    fields: {
      heading: "What We Build",
      /*
       * Blank lines separate paragraphs; see `fieldParagraphs` in src/lib/cms/use-section.ts.
       *
       * Two markers in this copy are read at render:
       *
       *   * `{liveProducts}` is replaced with the number of products whose stage is `available`,
       *     derived from the product registry. Writing the figure by hand is how it goes stale the
       *     day a product ships, which is what it used to do.
       *   * `**PulsePay**` and `**PulseAssist**` render as the band's bold runs. A text field
       *     cannot carry HTML — `StyledText` interprets none — so the marker carries the emphasis.
       */
      body: "We find a real gap, design a product around what it takes to close it, build it to a high standard, launch it, and then operate it with the same discipline we used to build it. We don't hand products off. We own the full lifecycle.\n\nWe work across areas where technical complexity meets real-world consequence: financial infrastructure and digital banking, AI-powered enterprise communication and automation, developer tools and API infrastructure, digital commerce systems, cloud infrastructure, and longer-horizon research.\n\nOur {liveProducts} current products are the foundation of this. **PulsePay** is our financial infrastructure platform, a Naira-native payment processing and digital banking system built for Nigerian businesses, from high-frequency transactions to compliance. **PulseAssist** is our enterprise AI platform, a communication and automation layer that helps enterprise teams cut down on procedural overhead.\n\nThese are the first two products in a lineup we plan to grow the same way: deliberately, and to a high standard."
    }
  },
  {
    key: "about.verticals",
    label: "Sectors we build in",
    group: "About",
    type: "featureGrid",
    order: 153,
    fields: {
      // Admin-facing only; the grid sits under the "What We Build" band and renders no heading.
      heading: "Sectors we build in",
      // `title` is the small uppercase label, `description` the line beneath it.
      items: [
        {
          title: "Financial Infrastructure",
          description: "Core transaction rails, digital banking architecture, and payment processing systems."
        },
        {
          title: "Enterprise AI",
          description: "Automated communication and process automation for enterprise teams."
        },
        {
          title: "Developer Infrastructure",
          description: "APIs, SDKs, and tooling that give builders a reliable foundation to scale on."
        },
        {
          title: "Digital Commerce",
          description: "Commerce platforms built for high transaction volume and institutional standards."
        },
        {
          title: "Cloud Infrastructure",
          description: "Region-aware deployment systems with security and compliance built into the architecture."
        },
        {
          title: "Future Technology",
          description: "Long-horizon research programmes exploring what comes after our current products."
        }
      ]
    }
  },
  {
    key: "about.leadership",
    label: "The Founding Team",
    group: "About",
    type: "featureGrid",
    order: 154,
    fields: {
      heading: "The Founding Team",
      /*
       * The note under the cards, not the lead above them.
       *
       * `featureGrid` carries one supporting-copy field and this sentence is the one that changes,
       * because it carries the contact address. The link itself stays in code: whichever part of
       * this sentence is the email address is rendered as a `mailto:` anchor, so an edit cannot
       * break the link and cannot inject markup. The lead paragraph above the cards is therefore
       * still in src/routes/about.tsx. See that file.
       */
      subheading: "Our founding team prefers to let the work speak. Executive contact is available through corporate@enicehq.com for qualified enterprise and partnership inquiries.",
      // `title` is the role, `description` the scope, `kicker` the letters in the avatar tile.
      items: [
        {
          kicker: "CEO",
          title: "Founder & Chief Executive Officer",
          description: "Corporate strategy, venture direction, and ecosystem growth."
        },
        {
          kicker: "CTO",
          title: "Chief Technology Officer",
          description: "Platform architecture, engineering standards, and infrastructure design."
        },
        {
          kicker: "COO",
          title: "Chief Operations Officer",
          description: "Product delivery, partner operations, and compliance execution."
        }
      ]
    }
  },
  {
    key: "about.closing",
    label: "Closing statement",
    group: "About",
    type: "prose",
    order: 172,
    fields: {
      // A `prose` section has a heading and a body, so the attribution is the heading — otherwise
      // the quote would be editable and the signature under it would not.
      heading: "\u2014 The Founders, ENICE Group",
      body: `"The infrastructure a society depends on is the most durable thing it can build. That's what we're here to build."`
    }
  },
  {
    key: "portfolio.index",
    label: "Products page",
    group: "Portfolio",
    type: "hero",
    order: 200,
    fields: {
      eyebrow: "ENICE Products",
      heading: "Products built by ENICE Group",
      subheading: "Payments, financial services, business communication, and digital commerce. Each product runs on the same infrastructure and is built to operate at scale."
    }
  },
  {
    key: "portfolio.pulsepay",
    label: "PulsePay page",
    group: "Portfolio",
    type: "hero",
    order: 210,
    fields: {
      eyebrow: "Fintech Infrastructure Platform",
      heading: "PulsePay",
      subheading: "A virtual payment platform that issues Naira and USD cards, handles KYC verification, moves funds between users, and delivers value-added services with speed and reliability."
    }
  },
  {
    key: "portfolio.pulseassist",
    label: "PulseAssist page",
    group: "Portfolio",
    type: "hero",
    order: 220,
    fields: {
      eyebrow: "Enterprise Conversational SaaS",
      heading: "PulseAssist",
      subheading: "A multi-tenant AI operations platform for telecoms and financial networks. It handles customer support routing, provides API-driven account management, and hands calls to live agents in real time when needed."
    }
  },
  {
    key: "portfolio.pride",
    label: "PRIDE page",
    group: "Portfolio",
    type: "hero",
    order: 240,
    fields: {
      heading: "Pulse[[X]]",
      subheading: "PRIDE is ENICE Group's digital asset platform, designed to make cryptocurrency and digital finance **simple, secure, and accessible**. The platform will let users manage digital assets easily, while staying connected to the broader ENICE ecosystem."
    }
  },
  {
    key: "portfolio.devapay",
    label: "DevaPay page",
    group: "Portfolio",
    type: "hero",
    order: 250,
    fields: {
      heading: "DevaPay",
      subheading: "Simple, reliable payment infrastructure for modern businesses. Accept and manage customer payments through a single, developer friendly integration."
    }
  },
  /*
   * The bands *inside* each product page, previously hardcoded in the route components.
   *
   * Migration 11 made each product page's header editable and stopped there, so the capability
   * grids, the facts strips, the sector tiles and the compliance pills below them still needed a
   * deploy to change — which is the content that moves most on a product page. Each band is an
   * existing section type, so the admin form and the sanitiser already understand it, and each
   * component keeps its built-in copy as the fallback. Migration 13 seeds the same rows into
   * existing databases.
   *
   * `sort_order` follows the order the bands appear on their page, inside the block already
   * reserved for that page by migration 11 (210 PulsePay, 220 PulseAssist, 230 ePulse — since removed — 240 PRIDE, formerly
   * PulseX, 250 DevaPay).
   */
  {
    key: "portfolio.pulsepay.stats",
    label: "PulsePay facts strip",
    group: "Portfolio",
    type: "statistics",
    order: 211,
    fields: {
      heading: "PulsePay at a glance",
      // Only figures that can be checked: `< 5s — Card issuance time` was removed from this strip
      // because there is no published benchmark behind it.
      items: [
        { value: "Naira & USD", label: "Card currencies" },
        { value: "2", label: "Currency rails (NGN + USD)" },
        { value: "Every account", label: "KYC screening" }
      ]
    }
  },
  {
    key: "portfolio.pulsepay.features",
    label: "PulsePay capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 212,
    fields: {
      eyebrow: "Platform Capabilities",
      heading: "Everything a modern payments stack should be.",
      subheading: "PulsePay covers the full payments stack: issuance, compliance, transfers, and spending controls, in one integrated platform.",
      items: [
        {
          icon: "CreditCard",
          title: "Instant virtual card issuance",
          description: "Issue Naira and USD virtual cards in seconds for individuals and teams."
        },
        {
          icon: "ShieldCheck",
          title: "Built-in KYC verification",
          description: "Identity verification and compliance checks built directly into the onboarding flow."
        },
        {
          icon: "Users",
          title: "Peer-to-peer transfers",
          description: "Move funds between users and fund wallets instantly with no friction."
        },
        {
          icon: "Lock",
          title: "Programmable spend controls",
          description: "Set granular limits and rules for individuals, teams, and departments."
        },
        {
          icon: "Zap",
          title: "Value-added services",
          description: "Bill payments, airtime, utilities, and more built directly into the platform."
        },
        {
          icon: "BarChart3",
          title: "Enterprise fraud monitoring",
          description: "Real-time transaction screening and anomaly detection at every step."
        }
      ]
    }
  },
  {
    key: "portfolio.pulsepay.compliance",
    label: "PulsePay compliance",
    group: "Portfolio",
    type: "featureGrid",
    order: 213,
    fields: {
      eyebrow: "Compliance & Regulation",
      heading: "Built for regulated markets from the ground up.",
      subheading: "PulsePay operates within Nigeria's regulatory framework, with row-level security, KYC screening on every account, and audit logging of privileged actions. PulsePay holds no third-party security certification today, and we will tell you so directly rather than imply otherwise.",
      // A plain list of mechanism names rendered as pills, so only each row's title is read.
      items: [
        { title: "Row-Level Security" },
        { title: "Tenant Isolation" },
        { title: "Audit Logging" },
        { title: "KYC Screening" }
      ]
    }
  },
  {
    key: "portfolio.pulseassist.stats",
    label: "PulseAssist facts strip",
    group: "Portfolio",
    type: "statistics",
    order: 221,
    fields: {
      heading: "PulseAssist at a glance",
      // `∞ — Concurrent sessions` and `100% — Audit coverage` were removed from this strip: one is
      // an invented capacity claim, the other a measured figure nothing measures.
      items: [
        { value: "WhatsApp \xB7 Web \xB7 Email \xB7 SMS \xB7 Voice", label: "Channels" },
        { value: "Multi-tenant", label: "Architecture" }
      ]
    }
  },
  {
    key: "portfolio.pulseassist.features",
    label: "PulseAssist capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 222,
    fields: {
      eyebrow: "Platform Capabilities",
      heading: "Operations that run themselves.",
      subheading: "PulseAssist covers the full customer operations lifecycle, from first contact to resolution, without needing a human for every interaction.",
      items: [
        {
          icon: "Inbox",
          title: "Five channels, one inbox",
          description: "WhatsApp, web chat, email, SMS and voice answered from a single shared inbox, so support is consistent wherever people reach you."
        },
        {
          icon: "MessageSquare",
          title: "Autonomous support routing",
          description: "AI-driven triage and routing that resolves common queries without human intervention."
        },
        {
          icon: "ShieldCheck",
          title: "Policy-bound agents",
          description: "Conversational agents that operate strictly within configurable organisational policies."
        },
        {
          icon: "Zap",
          title: "Real-time live-agent handoff",
          description: "Escalation to a human agent mid-conversation, with full context preserved."
        },
        {
          icon: "Globe",
          title: "API-driven account management",
          description: "Agents can query and update account state through secure, scoped API integrations."
        },
        {
          icon: "Network",
          title: "Multi-tenant architecture",
          description: "Enterprise-grade isolation between clients with dedicated model and routing configs."
        },
        {
          icon: "Mail",
          title: "Email on your own domain",
          description: "PulseAssist Email sends transactional and marketing email from your own verified domain, with deliverability and sending reputation managed for you."
        }
      ]
    }
  },
  {
    key: "portfolio.pulseassist.sectors",
    label: "PulseAssist sectors served",
    group: "Portfolio",
    type: "featureGrid",
    order: 223,
    fields: {
      eyebrow: "Sectors Served",
      heading: "Built for businesses that put customer communication first.",
      // Icon tiles with a name only, so each row's title is the tile's label. The icon names must
      // exist in `CARD_ICONS` in src/routes/portfolio.pulseassist.tsx — that map is curated rather
      // than the whole of lucide, so an unlisted name silently degrades to a neutral tile.
      items: [
        { icon: "CreditCard", title: "Fintech" },
        { icon: "ShoppingBag", title: "E-commerce & Retail" },
        { icon: "HeartPulse", title: "Healthcare & Wellness" },
        { icon: "Cloud", title: "Technology & SaaS" }
      ]
    }
  },
  {
    key: "portfolio.pulseassist.compliance",
    label: "PulseAssist compliance",
    group: "Portfolio",
    type: "featureGrid",
    order: 224,
    fields: {
      eyebrow: "Enterprise Compliance",
      heading: "Every interaction is compliant by design.",
      subheading: "Policy configurations are version-controlled and every conversation runs with per-tenant data isolation and row-level security, built to meet the regulatory requirements of banking and telecom in Africa and beyond.",
      items: [
        { title: "Tenant Isolation" },
        { title: "Policy Versioning" },
        { title: "Row-Level Security" }
      ]
    }
  },
  {
    key: "portfolio.pride.facts",
    label: "PRIDE launch facts",
    group: "Portfolio",
    type: "statistics",
    order: 241,
    fields: {
      heading: "PRIDE launch framing",
      items: [
        { value: "Planned Project", label: "Status" },
        { value: "Q3 2027", label: "Launch" },
        { value: "Digital Assets", label: "Category" }
      ]
    }
  },
  {
    key: "portfolio.pride.highlights",
    label: "PRIDE capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 242,
    fields: {
      eyebrow: "Platform Capabilities",
      heading: "Digital assets, without the friction.",
      subheading: "PRIDE will let users manage digital assets easily, fully integrated across the broader ENICE Group ecosystem.",
      items: [
        {
          icon: "BarChart3",
          title: "Multi-asset trading",
          description: "Trade major digital assets with deep liquidity and institutional-grade execution: Bitcoin, Ethereum, and beyond."
        },
        {
          icon: "Lock",
          title: "Secure custody",
          description: "Cold storage, multi-signature protection, and continuous on-chain monitoring for every asset in your portfolio."
        },
        {
          icon: "Layers",
          title: "Ecosystem-native",
          description: "Move between PRIDE and PulsePay without leaving the ENICE stack: one account, every service."
        },
        {
          icon: "Globe",
          title: "Built for scale",
          description: "Global access with compliance and reporting designed for regulated markets from day one, in Africa, Europe, and beyond."
        },
        {
          icon: "Zap",
          title: "Instant settlement",
          description: "Near-instant on-chain and off-chain settlement rails so your capital moves as fast as the market does."
        },
        {
          icon: "ShieldCheck",
          title: "Regulatory-ready",
          description: "Compliance built in from the ground up: KYC, AML, and transaction monitoring at the core."
        }
      ]
    }
  },
  {
    key: "portfolio.devapay.facts",
    label: "DevaPay launch facts",
    group: "Portfolio",
    type: "statistics",
    order: 251,
    fields: {
      heading: "DevaPay launch framing",
      items: [
        { value: "Planned", label: "Status" },
        { value: "2028", label: "Launch" },
        { value: "Payments", label: "Category" }
      ]
    }
  },
  {
    key: "portfolio.devapay.audience",
    label: "DevaPay audience",
    group: "Portfolio",
    type: "featureGrid",
    order: 252,
    fields: {
      eyebrow: "Built For",
      heading: "From online businesses to growing enterprises.",
      items: [
        {
          icon: "Globe2",
          title: "Online Businesses",
          description: "Accept customer payments without stitching together separate providers."
        },
        {
          icon: "Code2",
          title: "SaaS Platforms",
          description: "Add payment collection to your product through one integration."
        },
        {
          icon: "ShoppingCart",
          title: "Marketplaces",
          description: "Manage payments across many sellers and transactions from one place."
        },
        {
          icon: "TrendingUp",
          title: "Growing Enterprises",
          description: "Infrastructure built to scale with transaction volume, not against it."
        }
      ]
    }
  },
  {
    key: "portfolio.devapay.capabilities",
    label: "DevaPay capabilities",
    group: "Portfolio",
    type: "featureGrid",
    order: 253,
    fields: {
      eyebrow: "Key Capabilities",
      heading: "Payments, made easier to collect and scale.",
      subheading: "DevaPay is being built as part of ENICE Group's broader financial infrastructure, giving businesses the tools to run modern payment experiences.",
      items: [
        {
          icon: "Code2",
          title: "Unified payment API",
          description: "Accept payments through a single, developer friendly integration."
        },
        {
          icon: "Zap",
          title: "Real time status updates",
          description: "Track transactions and payment status as they happen, not after the fact."
        },
        {
          icon: "Webhook",
          title: "Webhook notifications",
          description: "Get notified the moment a payment is received, so your product can react instantly."
        },
        {
          icon: "Store",
          title: "Merchant management",
          description: "View and manage merchants and transactions from a single, clear dashboard."
        },
        {
          icon: "Users",
          title: "Built for platforms",
          description: "Designed for businesses that collect payments on behalf of others, at any scale."
        },
        {
          icon: "CheckCircle2",
          title: "Reliable by design",
          description: "Payment infrastructure built to stay dependable as transaction volume grows."
        }
      ]
    }
  },
  {
    key: "contact.details",
    label: "Contact details",
    group: "Contact",
    type: "contact",
    order: 210,
    fields: {
      eyebrow: "Corporate Engagement",
      heading: "Get in Touch",
      subheading: "Reach the ENICE Group team about product access, platform integration, enterprise licensing, or technology partnerships.",
      email: "corporate@enicehq.com",
      showForm: true
    }
  }
];
var SYSTEM_PAGES = [
  { path: "/", title: "Home", summary: "The ENICE Group homepage." },
  { path: "/about", title: "About ENICE Group", summary: "Company story, mission, and approach." },
  { path: "/portfolio", title: "Products", summary: "The ENICE Group product portfolio." },
  { path: "/portfolio/pulsepay", title: "PulsePay", summary: "Virtual payment platform." },
  {
    path: "/portfolio/pulseassist",
    title: "PulseAssist",
    summary: "Enterprise AI operations platform."
  },
  {
    path: "/portfolio/pulseassist-email",
    title: "PulseAssist Email",
    summary: "Transactional and marketing email on a verified domain."
  },
  { path: "/portfolio/pride", title: "PRIDE", summary: "Digital asset platform." },
  {
    path: "/portfolio/devapay",
    title: "DevaPay",
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

// api-src/lib/repo/admins.ts
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
async function getAdmin(id) {
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(ADMIN_COLUMNS)} FROM admin_users WHERE id = ${id}
  `;
  return rows[0] ? mapAdmin(rows[0]) : null;
}
var INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
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

// api-src/lib/repo/knowledge.ts
var COLUMNS = `id, title, body, source_kind, source_name, source_url, storage_key,
  status, tags, created_by_email, updated_by_email, created_at, updated_at`;
function mapEntry(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    sourceKind: row.source_kind,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    status: row.status,
    tags: row.tags ?? [],
    characters: row.body.length,
    createdByEmail: row.created_by_email,
    updatedByEmail: row.updated_by_email,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}
function sanitizeTags2(value) {
  if (!Array.isArray(value)) return [];
  const seen = /* @__PURE__ */ new Set();
  for (const entry of value.slice(0, 30)) {
    const tag = sanitizeText(entry, 40);
    if (tag) seen.add(tag);
  }
  return [...seen];
}
function buildSearchText(title, body) {
  return `${title} ${title} ${body}`.trim();
}
async function listKnowledge(query = {}) {
  const sql = db();
  const limit = Math.min(Math.max(query.limit ?? 50, 1), 200);
  const offset = Math.max(query.offset ?? 0, 0);
  const search = query.search?.trim();
  const where = [
    query.status ? sql`AND status = ${query.status}` : sql``,
    search ? sql`AND (
            to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${search})
            OR title ILIKE ${`%${search}%`}
          )` : sql``
  ];
  const rows = await sql`
    SELECT ${sql.unsafe(COLUMNS)} FROM knowledge_entries
    WHERE true ${where[0]} ${where[1]}
    ORDER BY updated_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  const counted = await sql`
    SELECT count(*)::text AS count FROM knowledge_entries
    WHERE true ${where[0]} ${where[1]}
  `;
  return { entries: rows.map(mapEntry), total: Number(counted[0]?.count ?? "0") };
}
async function getKnowledge(id) {
  const rows = await db()`
    SELECT ${db().unsafe(COLUMNS)} FROM knowledge_entries WHERE id = ${id}
  `;
  return rows[0] ? mapEntry(rows[0]) : null;
}
async function knowledgeStats() {
  const rows = await db()`
    SELECT count(*)::text AS total,
           count(*) FILTER (WHERE status = 'active')::text AS active
    FROM knowledge_entries
  `;
  return { total: Number(rows[0]?.total ?? "0"), active: Number(rows[0]?.active ?? "0") };
}
function cleanStatus(value, fallback) {
  return value === "active" || value === "disabled" ? value : fallback;
}
async function createKnowledge(input, actor) {
  const title = sanitizeText(input.title, 200);
  const body = sanitizeMultilineText(input.body, KNOWLEDGE_MAX_CHARS);
  if (!title && !body) {
    throw badRequest("A knowledge entry needs a title or some text.");
  }
  const sql = db();
  const id = newId();
  const rows = await sql`
    INSERT INTO knowledge_entries (
      id, title, body, source_kind, source_name, source_url, storage_key,
      status, tags, search_text, created_by_email, updated_by_email
    ) VALUES (
      ${id}, ${title}, ${body}, ${input.sourceKind ?? "note"},
      ${input.sourceName ?? null}, ${input.sourceUrl ?? null}, ${input.storageKey ?? null},
      ${cleanStatus(input.status, "active")}, ${sanitizeTags2(input.tags)},
      ${buildSearchText(title, body)}, ${actor.email}, ${actor.email}
    )
    RETURNING ${sql.unsafe(COLUMNS)}
  `;
  return mapEntry(rows[0]);
}
async function updateKnowledge(id, input, actor) {
  const existing = await getKnowledge(id);
  if (!existing) throw notFound("That knowledge entry");
  const title = input.title === void 0 ? existing.title : sanitizeText(input.title, 200);
  const body = input.body === void 0 ? existing.body : sanitizeMultilineText(input.body, KNOWLEDGE_MAX_CHARS);
  const tags = input.tags === void 0 ? existing.tags : sanitizeTags2(input.tags);
  const status = input.status === void 0 ? existing.status : cleanStatus(input.status, existing.status);
  if (!title && !body) {
    throw badRequest("A knowledge entry needs a title or some text.");
  }
  const sql = db();
  const rows = await sql`
    UPDATE knowledge_entries SET
      title = ${title},
      body = ${body},
      tags = ${tags},
      status = ${status},
      search_text = ${buildSearchText(title, body)},
      updated_by_email = ${actor.email},
      updated_at = now()
    WHERE id = ${id}
    RETURNING ${sql.unsafe(COLUMNS)}
  `;
  return mapEntry(rows[0]);
}
async function deleteKnowledge(id) {
  const rows = await db()`
    DELETE FROM knowledge_entries WHERE id = ${id}
    RETURNING ${db().unsafe(COLUMNS)}
  `;
  if (!rows[0]) throw notFound("That knowledge entry");
  return { entry: mapEntry(rows[0]), storageKey: rows[0].storage_key };
}

// api-src/lib/repo/insights.ts
async function dashboardSnapshot() {
  await publishDueContent();
  const [
    counts,
    recentContent,
    recentAnnouncements,
    recentUpdates,
    upcoming,
    activity,
    knowledge,
    published
  ] = await Promise.all([
    contentCounts(),
    listContent({ limit: 6, sort: "recent" }),
    listContent({ kind: "announcement", limit: 4, sort: "recent" }),
    listContent({ kind: "update", limit: 5, sort: "recent" }),
    listContent({ status: "scheduled", limit: 5, sort: "recent" }),
    recentActivity(10),
    knowledgeStats(),
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
      knowledge: knowledge.active
    },
    byKind,
    recentContent: recentContent.items,
    recentAnnouncements: recentAnnouncements.items,
    recentUpdates: recentUpdates.items,
    upcoming: upcoming.items,
    activity,
    site: {
      // Reaching this code at all means the database answered, so the API is healthy.
      apiHealthy: true,
      databaseConfigured: isDatabaseConfigured(),
      lastPublishedAt: published
    }
  };
}
async function globalSearch(rawQuery, limit = 30) {
  const query = rawQuery.trim();
  if (query.length < 2) return [];
  const sql = db();
  const like = `%${query}%`;
  const perArea = Math.max(6, Math.ceil(limit / 2));
  const [content, knowledge] = await Promise.all([
    sql`
      SELECT id, kind, title, slug, excerpt, status, updated_at,
             (title ILIKE ${like}) AS exact
      FROM content_items
      WHERE title ILIKE ${like}
         OR slug ILIKE ${like}
         OR to_tsvector('english', search_text) @@ websearch_to_tsquery('english', ${query})
      ORDER BY exact DESC, updated_at DESC
      LIMIT ${perArea}
    `,
    sql`
      SELECT id, title, tags, updated_at FROM knowledge_entries
      WHERE title ILIKE ${like} OR body ILIKE ${like}
      ORDER BY updated_at DESC LIMIT ${perArea}
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
    ...knowledge.map((row) => ({
      id: row.id,
      type: "knowledge",
      kind: "Knowledge",
      title: row.title || "(untitled)",
      subtitle: row.tags?.length ? row.tags.join(" \xB7 ") : "Assistant knowledge",
      status: null,
      href: "/admin/knowledge",
      updatedAt: row.updated_at.toISOString()
    }))
  ];
  return hits.slice(0, limit);
}

// api-src/cms.ts
var PUBLIC_ROUTES = /* @__PURE__ */ new Set([
  "POST /auth/login",
  "POST /auth/mfa",
  "POST /auth/logout",
  "GET /auth/session"
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
  "GET /taxonomies": "content.read",
  "GET /search": "content.read",
  "GET /knowledge": "ai.knowledge.read",
  "POST /knowledge": "ai.knowledge.write",
  "GET /knowledge/:id": "ai.knowledge.read",
  "PATCH /knowledge/:id": "ai.knowledge.write",
  "DELETE /knowledge/:id": "ai.knowledge.write"
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
router.add("GET /knowledge", async ({ query }) => {
  const statusParam = query.get("status");
  const result = await listKnowledge({
    search: query.get("search") ?? void 0,
    status: statusParam === "active" || statusParam === "disabled" ? statusParam : void 0,
    limit: intParam(query, "limit", 50, 200) || 50,
    offset: intParam(query, "offset", 0, 1e5)
  });
  return { ...result, stats: await knowledgeStats() };
});
router.add("POST /knowledge", async ({ req, body, identity }) => {
  const entry = await createKnowledge({ ...body, sourceKind: "note" }, identity);
  await recordActivity(req, identity, "knowledge.created", {
    entityType: "knowledge",
    entityId: entry.id,
    entityLabel: entry.title || "Untitled note",
    metadata: { sourceKind: "note", characters: entry.characters }
  });
  return { entry };
});
router.add("GET /knowledge/:id", async ({ params }) => {
  const entry = await getKnowledge(params.id);
  if (!entry) throw notFound("That knowledge entry");
  return { entry };
});
router.add("PATCH /knowledge/:id", async ({ req, params, body, identity }) => {
  const entry = await updateKnowledge(params.id, body, identity);
  await recordActivity(req, identity, "knowledge.updated", {
    entityType: "knowledge",
    entityId: entry.id,
    entityLabel: entry.title || "Untitled entry",
    metadata: { status: entry.status }
  });
  return { entry };
});
router.add("DELETE /knowledge/:id", async ({ req, params, identity }) => {
  const { entry } = await deleteKnowledge(params.id);
  await recordActivity(req, identity, "knowledge.deleted", {
    entityType: "knowledge",
    entityId: entry.id,
    entityLabel: entry.title || "Untitled entry"
  });
  return { deleted: true, id: entry.id };
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
    secretConfigured: isSecretConfigured()
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
    error: `Something went wrong on our side. ${faultSummary(error)}`,
    code: "internal_error",
    fault: faultFields(error),
    ref
  });
}
function faultFields(error) {
  const e = error ?? {};
  const fields = {};
  const set = (key, value) => {
    if (typeof value === "string" && value !== "") fields[key] = value.slice(0, 80);
    else if (typeof value === "number") fields[key] = String(value);
  };
  set("name", e.name);
  set("code", e.code);
  set("constraint", e.constraint_name);
  set("table", e.table_name);
  set("column", e.column_name);
  set("routine", e.routine);
  set("syscall", e.syscall);
  return fields;
}
function faultSummary(error) {
  const fields = faultFields(error);
  const parts = Object.entries(fields).map(([key, value]) => `${key}=${value}`);
  if (!fields.code && error instanceof Error && error.message) {
    parts.push(`message=${error.message.slice(0, 160)}`);
  }
  return parts.length === 0 ? "No detail was available." : `Fault: ${parts.join(" ")}.`;
}
export {
  handler as default
};
