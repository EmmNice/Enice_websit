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

// src/lib/site.ts
var SITE_URL = "https://enicehq.com";

// src/lib/cms/seo-resolve.ts
var MAX_TITLE_LENGTH = 60;
var MAX_DESCRIPTION_LENGTH = 160;
function truncate(value, maxLength) {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  const window = collapsed.slice(0, maxLength - 1);
  const lastSpace = window.lastIndexOf(" ");
  return `${(lastSpace > maxLength * 0.6 ? window.slice(0, lastSpace) : window).trimEnd()}\u2026`;
}
function absoluteUrl(siteUrl, path) {
  const origin = siteUrl.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(path)) return path;
  return `${origin}/${path.replace(/^\/+/, "")}`;
}
function resolveSeo(fields, source, context) {
  const seo = fields ?? {};
  const { defaults, siteUrl } = context;
  const baseTitle = seo.title?.trim() || source.title.trim();
  const suffix = defaults.titleSuffix?.trim() ?? "";
  const withSuffix = suffix && !baseTitle.toLowerCase().includes(suffix.toLowerCase().replace(/^[\s|·—-]+/, "")) ? `${baseTitle}${suffix.startsWith(" ") ? suffix : ` ${suffix}`}` : baseTitle;
  const title = truncate(withSuffix, MAX_TITLE_LENGTH + suffix.length);
  const description = truncate(
    seo.description?.trim() || source.excerpt?.trim() || defaults.defaultDescription,
    MAX_DESCRIPTION_LENGTH
  );
  const image = seo.ogImage?.trim() || source.image || defaults.defaultOgImage;
  return {
    title,
    description,
    canonicalUrl: seo.canonicalUrl?.trim() || absoluteUrl(siteUrl, source.path),
    ogTitle: seo.ogTitle?.trim() || title,
    ogDescription: seo.ogDescription?.trim() || description,
    ogImage: absoluteUrl(siteUrl, image),
    // A site-wide noindex is authoritative; an item can only ever be more restrictive.
    index: defaults.indexSite === false ? false : seo.index !== false
  };
}
var FALLBACK_SEO_DEFAULTS = {
  titleSuffix: " | ENICE Group",
  defaultDescription: "ENICE Group builds, owns, and operates technology products for financial services, commerce, and business communication.",
  defaultOgImage: "/og.png",
  indexSite: true,
  robotsExtra: ""
};

// api-src/lib/http.ts
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
function isoOrNull(value) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
function iso(value) {
  return isoOrNull(value) ?? (/* @__PURE__ */ new Date()).toISOString();
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

// src/lib/cms/doc.ts
function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96).replace(/-+$/g, "");
}
function normalizePath2(value) {
  const segments = value.split("/").map((segment) => slugify(segment)).filter(Boolean);
  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
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
    RETURNING id, title, kind
  `;
  if (rows.length > 0) {
    console.log(`[cms] auto-published ${rows.length} scheduled item(s)`);
  }
  return rows.map((row) => row.id);
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
async function getContentBySlug(kind, slug, publishedOnly = true) {
  if (publishedOnly) await publishDueContent();
  const sql = db();
  const rows = await sql`
    SELECT ${sql.unsafe(FULL_COLUMNS)} FROM content_items
    WHERE kind = ${kind} AND slug = ${slug}
      ${publishedOnly ? sql`AND status = 'published'` : sql``}
    LIMIT 1
  `;
  return rows[0] ? mapItem(rows[0]) : null;
}

// api-src/lib/repo/website.ts
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

// api-src/site.ts
var CACHE_CONTENT = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";
var CACHE_SETTINGS = "public, max-age=0, s-maxage=300, stale-while-revalidate=3600";
var router = new Router();
async function seoContext() {
  const settings = await getSettings();
  return { siteUrl: SITE_URL, defaults: settings.seo ?? FALLBACK_SEO_DEFAULTS };
}
function kindParam(value) {
  return enumValue(value, CONTENT_KINDS, "Content type");
}
function publicPath(kind, slug) {
  const prefix = CONTENT_KIND_META[kind].publicPrefix;
  return prefix ? `${prefix}/${slug}` : `/news#${slug}`;
}
router.add("GET /bootstrap", async ({ res }) => {
  res.setHeader("Cache-Control", CACHE_SETTINGS);
  const [settings, sections] = await Promise.all([getSettings(), listSections()]);
  const visible = sections.filter((section) => section.visible && section.status === "published").map((section) => ({
    key: section.key,
    type: section.type,
    label: section.label,
    group: section.group,
    fields: section.fields
  }));
  const announcements = await listContent({
    kind: "announcement",
    status: "published",
    limit: 3,
    sort: "published"
  });
  const now = Date.now();
  const live = announcements.items.filter((item) => {
    const startsAt = item.extras.startsAt ? Date.parse(item.extras.startsAt) : null;
    const endsAt = item.extras.endsAt ? Date.parse(item.extras.endsAt) : null;
    if (startsAt && Number.isFinite(startsAt) && startsAt > now) return false;
    if (endsAt && Number.isFinite(endsAt) && endsAt < now) return false;
    return true;
  });
  return {
    header: settings.header,
    footer: settings.footer,
    design: settings.design,
    seoDefaults: settings.seo,
    announcementBarEnabled: settings.announcementBarEnabled,
    maintenanceNotice: settings.maintenanceNotice,
    sections: visible,
    announcements: live.map((item) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      slug: item.slug,
      url: publicPath("announcement", item.slug),
      cta: item.extras.cta ?? null,
      coverImageUrl: item.coverImageUrl,
      publishedAt: item.publishedAt
    }))
  };
});
router.add("GET /content/:kind", async ({ res, params, query }) => {
  res.setHeader("Cache-Control", CACHE_CONTENT);
  const kind = kindParam(params.kind);
  const { items, total } = await listContent({
    kind,
    status: "published",
    category: query.get("category") ?? void 0,
    tag: query.get("tag") ?? void 0,
    limit: intParam(query, "limit", 24, 100) || 24,
    offset: intParam(query, "offset", 0, 1e4),
    sort: "published"
  });
  return {
    items: items.map((item) => ({ ...item, url: publicPath(kind, item.slug) })),
    total,
    // Derived from what is actually published, so a filter bar never offers an empty category.
    categories: [...new Set(items.map((item) => item.category).filter(Boolean))]
  };
});
router.add("GET /feed", async ({ res, query }) => {
  res.setHeader("Cache-Control", CACHE_CONTENT);
  const limit = intParam(query, "limit", 40, 100) || 40;
  const [news, updates, announcements] = await Promise.all([
    listContent({ kind: "news", status: "published", limit, sort: "published" }),
    listContent({ kind: "update", status: "published", limit, sort: "published" }),
    listContent({ kind: "announcement", status: "published", limit, sort: "published" })
  ]);
  const entries = [...news.items, ...updates.items, ...announcements.items].map((item) => ({
    id: item.id,
    kind: item.kind,
    title: item.title,
    excerpt: item.excerpt,
    slug: item.slug,
    url: publicPath(item.kind, item.slug),
    category: item.category,
    coverImageUrl: item.coverImageUrl,
    icon: item.extras.icon ?? null,
    cta: item.extras.cta ?? null,
    featured: item.extras.featured === true,
    publishedAt: item.publishedAt,
    readingMinutes: item.readingMinutes
  })).sort((a, b2) => {
    if (a.featured !== b2.featured) return a.featured ? -1 : 1;
    return Date.parse(b2.publishedAt ?? "") - Date.parse(a.publishedAt ?? "");
  }).slice(0, limit);
  return { entries, total: entries.length };
});
router.add("GET /content/:kind/:slug", async ({ res, params }) => {
  res.setHeader("Cache-Control", CACHE_CONTENT);
  const kind = kindParam(params.kind);
  const item = await getContentBySlug(kind, params.slug, true);
  if (!item) throw notFound("That article");
  const path = publicPath(kind, item.slug);
  const seo = resolveSeo(
    item.seo,
    { title: item.title, excerpt: item.excerpt, image: item.coverImageUrl, path },
    await seoContext()
  );
  const related = await listContent({
    kind,
    status: "published",
    category: item.category ?? void 0,
    limit: 4,
    sort: "published"
  });
  return {
    item: { ...item, url: path },
    seo,
    related: related.items.filter((candidate) => candidate.id !== item.id).slice(0, 3).map((candidate) => ({ ...candidate, url: publicPath(kind, candidate.slug) }))
  };
});
router.add("GET /page", async ({ res, query }) => {
  res.setHeader("Cache-Control", CACHE_SETTINGS);
  await publishDuePages();
  const path = query.get("path") ?? "/";
  const page = await getPageByPath(path, true);
  if (!page) throw notFound("That page");
  const seo = resolveSeo(
    page.seo,
    { title: page.title, excerpt: page.summary, path: page.path },
    await seoContext()
  );
  return {
    page: {
      path: page.path,
      title: page.title,
      summary: page.summary,
      // Hidden sections are filtered out server-side, as with global sections.
      sections: page.sections.filter((section) => section.visible),
      publishedAt: page.publishedAt,
      updatedAt: page.updatedAt
    },
    seo
  };
});
router.add("GET /urls", async ({ res }) => {
  res.setHeader("Cache-Control", CACHE_SETTINGS);
  const [blog, news, announcements, pagesSettings] = await Promise.all([
    listContent({ kind: "blog", status: "published", limit: 200, sort: "published" }),
    listContent({ kind: "news", status: "published", limit: 200, sort: "published" }),
    listContent({ kind: "announcement", status: "published", limit: 200, sort: "published" }),
    getSettings()
  ]);
  const context = { siteUrl: SITE_URL, defaults: pagesSettings.seo };
  const entries = [...blog.items, ...news.items, ...announcements.items].map((item) => {
    const path = publicPath(item.kind, item.slug);
    const seo = resolveSeo(
      item.seo,
      { title: item.title, excerpt: item.excerpt, image: item.coverImageUrl, path },
      context
    );
    return {
      path,
      kind: item.kind,
      title: item.title,
      excerpt: item.excerpt,
      image: seo.ogImage,
      seoTitle: seo.title,
      seoDescription: seo.description,
      index: seo.index,
      publishedAt: item.publishedAt,
      updatedAt: item.updatedAt
    };
  });
  return { urls: entries };
});
function degradedPayload(path) {
  const base = { degraded: true };
  if (path === "/bootstrap") {
    return { ...base, header: null, footer: null, design: null, sections: [], announcements: [] };
  }
  if (path === "/feed") return { ...base, entries: [], total: 0 };
  if (path === "/urls") return { ...base, urls: [] };
  if (path.startsWith("/content")) return { ...base, items: [], total: 0, categories: [] };
  return base;
}
async function handler(req, res) {
  const ref = errorRef("SITE");
  const { path, query } = resolveRequestPath(req, "/api/site");
  const method = (req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("Cache-Control", "no-store");
    res.status(405).json({ ok: false, error: "This endpoint is read-only." });
    return;
  }
  try {
    if (!isDatabaseConfigured()) {
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30");
      res.status(200).json({ ok: true, ...degradedPayload(path) });
      return;
    }
    await ensureMigrated();
    const matched = router.match(method, path);
    if (matched === null || matched === "method_mismatch") {
      res.setHeader("Cache-Control", "no-store");
      res.status(404).json({ ok: false, error: `No such endpoint: ${method} ${path}` });
      return;
    }
    const context = buildContext(req, res, path, query, matched.params, null);
    const payload = await matched.handler(context);
    if (!res.headersSent) res.status(200).json({ ok: true, ...payload });
  } catch (error) {
    if (res.headersSent) return;
    if (error instanceof HttpError) {
      res.setHeader("Cache-Control", "no-store");
      res.status(error.statusCode).json({ ok: false, error: error.message, code: error.code });
      return;
    }
    console.error(`[api/site:${ref}] falling back to a degraded response:`, error);
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=15");
    res.status(200).json({ ok: true, ...degradedPayload(path), ref });
  }
}
export {
  handler as default
};
