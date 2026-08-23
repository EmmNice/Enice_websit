/**
 * S3-compatible object storage for the media library.
 *
 * ## Why object storage and not the database
 *
 * Media bytes never touch Postgres. A 200 MB video in a `bytea` column bloats every backup,
 * defeats connection pooling while it streams, and cannot be served from a CDN edge. Only
 * metadata is stored in `media_assets`; the bytes live in a bucket and are served directly.
 *
 * ## Why presigned uploads
 *
 * The browser uploads straight to the bucket using a short-lived signed URL. The alternative —
 * proxying bytes through a serverless function — would hit Vercel's request body limit (4.5 MB)
 * and burn function time on transferring data. The trade-off is that the signature must
 * constrain what can be uploaded, which is why the content type is a *signed* header: the
 * bucket rejects an upload whose `Content-Type` differs from the one the server approved, so a
 * URL issued for a PNG cannot be used to plant an HTML file.
 *
 * ## Why SigV4 by hand
 *
 * `@aws-sdk/client-s3` is a large dependency tree for two operations. The signing algorithm is
 * about eighty lines with `node:crypto`, and the codebase already signs Bedrock requests the
 * same way in `src/lib/ai/providers/bedrock.ts`. Doing it directly also keeps the CMS portable:
 * this works unchanged against AWS S3, Cloudflare R2, Backblaze B2, MinIO and DigitalOcean
 * Spaces.
 */

import { createHash, createHmac } from "node:crypto";
import { BlobNotFoundError, del, head, issueSignedToken, presignUrl } from "@vercel/blob";
import { mediaCategoryFor, MEDIA_LIMITS } from "../../src/lib/cms/types";
import { findEnv } from "./env";

// ─── Backends ────────────────────────────────────────────────────────────────

/**
 * Where uploaded media lives.
 *
 * Two backends, because the two have genuinely different costs. `s3` speaks the S3 API and works
 * against AWS, Cloudflare R2, Backblaze B2, MinIO and DigitalOcean Spaces, but the operator has
 * to create a bucket, mint keys and set five variables. `blob` is Vercel's own store: a couple of
 * clicks in the dashboard and the credential is injected automatically, with no keys to copy.
 *
 * Both are driven through the same three-step contract — presign, the browser uploads directly,
 * then confirm — so nothing above this module needs to know which one is in use. In particular,
 * the bytes never pass through a function in either case, which matters because Vercel caps a
 * function request body at 4.5 MB and the media library accepts video up to 200 MB.
 */
export type MediaBackend = "s3" | "blob";

/**
 * Which backend to use, or null when neither is configured.
 *
 * S3 wins when both are present. Configuring S3 takes deliberate effort — a bucket and three
 * secrets — whereas a Blob token can appear simply because someone connected a store to the
 * project, so treating S3 as the more specific intent is the less surprising rule. It is also the
 * safer one: existing media rows hold S3 URLs, and silently starting to write new uploads
 * somewhere else would leave a library split across two providers.
 */
export function mediaBackend(): MediaBackend | null {
  if (storageConfig() !== null) return "s3";
  if (blobConfig() !== null) return "blob";
  return null;
}

// ─── Configuration ───────────────────────────────────────────────────────────

export interface StorageConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** Host only, no scheme. Defaults to AWS S3 for the configured region. */
  endpoint: string;
  /** Path-style addressing (`host/bucket/key`), required by MinIO and simpler on R2. */
  forcePathStyle: boolean;
  /** Base URL objects are publicly readable from — a CDN domain, ideally. */
  publicBaseUrl: string;
}

/**
 * Reads storage configuration from the environment.
 *
 * Returns null when incomplete rather than throwing, so the rest of the CMS works without a
 * bucket configured: the media library then explains what to set instead of erroring, and
 * content can still reference external image URLs.
 */
export function storageConfig(): StorageConfig | null {
  const bucket = process.env.MEDIA_S3_BUCKET?.trim();
  const accessKeyId = process.env.MEDIA_S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.MEDIA_S3_SECRET_ACCESS_KEY?.trim();
  if (!bucket || !accessKeyId || !secretAccessKey) return null;

  const region = process.env.MEDIA_S3_REGION?.trim() || "us-east-1";
  const rawEndpoint = process.env.MEDIA_S3_ENDPOINT?.trim();
  // Accept a full URL or a bare host, since providers document it both ways.
  const endpoint = rawEndpoint
    ? rawEndpoint.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    : `s3.${region}.amazonaws.com`;

  // R2 and MinIO need path-style; AWS works either way but virtual-hosted is canonical.
  const forcePathStyle =
    process.env.MEDIA_S3_FORCE_PATH_STYLE === "true" ||
    Boolean(rawEndpoint && !isAwsEndpoint(endpoint));

  const configuredPublicBase = process.env.MEDIA_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  const publicBaseUrl =
    configuredPublicBase ||
    (forcePathStyle ? `https://${endpoint}/${bucket}` : `https://${bucket}.${endpoint}`);

  return { bucket, region, accessKeyId, secretAccessKey, endpoint, forcePathStyle, publicBaseUrl };
}

function isAwsEndpoint(endpoint: string): boolean {
  return /(^|\.)amazonaws\.com$/.test(endpoint);
}

export function isMediaStorageConfigured(): boolean {
  return mediaBackend() !== null;
}

/** Thrown when a media operation runs without storage configured. */
export class StorageNotConfiguredError extends Error {
  constructor() {
    super(
      "Media storage is not configured. Either connect a Vercel Blob store to this project, " +
        "or set MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY_ID and MEDIA_S3_SECRET_ACCESS_KEY (plus " +
        "MEDIA_S3_ENDPOINT for non-AWS providers).",
    );
    this.name = "StorageNotConfiguredError";
  }
}

// ─── Vercel Blob configuration ───────────────────────────────────────────────

export interface BlobConfig {
  /** Long-lived read-write token, when that is how the store was connected. */
  token?: string;
  /** OIDC pair, which is how Vercel connects a store by default. */
  oidcToken?: string;
  storeId?: string;
  /** Public objects get a URL the site can render directly; private ones do not. */
  access: "public" | "private";
}

/**
 * Reads Blob configuration from the environment.
 *
 * Credentials are resolved through `findEnv` rather than read directly, so a store attached under
 * a prefix works — `MEDIA_BLOB_READ_WRITE_TOKEN` as readily as `BLOB_READ_WRITE_TOKEN`. Whatever
 * is found is then passed to the SDK *explicitly*, because the SDK's own fallback reads only the
 * bare names from `process.env` and would not see a prefixed variable at all.
 *
 * Vercel connects a store with OIDC by default (`BLOB_STORE_ID` plus a rotating
 * `VERCEL_OIDC_TOKEN`) and adds a static read-write token alongside. Either is enough here.
 */
export function blobConfig(): BlobConfig | null {
  const token = findEnv(["BLOB_READ_WRITE_TOKEN"])?.value;
  const storeId = findEnv(["BLOB_STORE_ID"])?.value;
  const oidcToken = findEnv(["VERCEL_OIDC_TOKEN"])?.value;

  const hasOidc = Boolean(storeId && oidcToken);
  if (!token && !hasOidc) return null;

  // Objects must be publicly readable for the website to render them. Overridable because a
  // deployment might front the store with something else, but public is the only default that
  // produces a working media library.
  const access = process.env.MEDIA_BLOB_ACCESS?.trim() === "private" ? "private" : "public";

  return {
    ...(token ? { token } : {}),
    ...(hasOidc ? { oidcToken, storeId } : {}),
    access,
  };
}

/** Credentials in the shape every Blob SDK call takes. */
function blobCredentials(config: BlobConfig): {
  token?: string;
  oidcToken?: string;
  storeId?: string;
} {
  return {
    ...(config.token ? { token: config.token } : {}),
    ...(config.oidcToken ? { oidcToken: config.oidcToken } : {}),
    ...(config.storeId ? { storeId: config.storeId } : {}),
  };
}

function requireBlobConfig(): BlobConfig {
  const config = blobConfig();
  if (!config) throw new StorageNotConfiguredError();
  return config;
}

// ─── SigV4 helpers ───────────────────────────────────────────────────────────

/**
 * URI-encodes a value per AWS's rules.
 *
 * `encodeURIComponent` leaves `!`, `'`, `(`, `)` and `*` alone, but SigV4 requires them
 * percent-encoded. A key containing an apostrophe would otherwise produce a signature that
 * does not match what the service computes, and fail with an opaque 403.
 */
function uriEncode(value: string, encodeSlash = true): string {
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

function sha256Hex(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac("sha256", key).update(value, "utf8").digest();
}

/** Derives the date/region/service scoped signing key. */
function signingKey(secret: string, dateStamp: string, region: string, service: string): Buffer {
  return hmac(hmac(hmac(hmac(`AWS4${secret}`, dateStamp), region), service), "aws4_request");
}

/** `20260823T102431Z` and `20260823`, the two timestamp formats SigV4 uses. */
function amzDates(now = new Date()): { amzDate: string; dateStamp: string } {
  const amzDate = `${now.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  return { amzDate, dateStamp: amzDate.slice(0, 8) };
}

function hostFor(config: StorageConfig): string {
  return config.forcePathStyle ? config.endpoint : `${config.bucket}.${config.endpoint}`;
}

function canonicalPathFor(config: StorageConfig, key: string): string {
  const encodedKey = uriEncode(key, false);
  return config.forcePathStyle ? `/${config.bucket}/${encodedKey}` : `/${encodedKey}`;
}

// ─── Keys ────────────────────────────────────────────────────────────────────

/**
 * Builds a collision-proof, path-traversal-proof storage key.
 *
 * The original filename is slugified and kept — a bucket full of UUIDs is miserable to
 * administer — but prefixed with a date folder and a random suffix so two uploads of
 * `logo.png` cannot overwrite each other. Directory separators and `..` are stripped rather
 * than escaped, because there is no legitimate reason for either in an uploaded filename.
 */
export function buildStorageKey(filename: string, folder = ""): string {
  const cleanedFolder = folder
    .split("/")
    .map((segment) => segment.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 40))
    .filter(Boolean)
    .join("/");

  // Reduce to a bare filename before anything else. Splitting the extension first would read
  // "../../etc/passwd" as an eight-character extension, producing a valid but nonsensical key.
  const basename = filename.split(/[/\\]/).pop() ?? "";
  const lastDot = basename.lastIndexOf(".");
  const rawBase = lastDot > 0 ? basename.slice(0, lastDot) : basename;
  const rawExtension = lastDot > 0 ? basename.slice(lastDot + 1) : "";

  const base =
    rawBase
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file";

  const extension = rawExtension
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const suffix = createHash("sha256")
    .update(`${filename}:${Date.now()}:${Math.random()}`)
    .digest("hex")
    .slice(0, 8);

  const now = new Date();
  const datePrefix = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const name = extension ? `${base}-${suffix}.${extension}` : `${base}-${suffix}`;

  return [cleanedFolder, datePrefix, name].filter(Boolean).join("/");
}

export function publicUrlFor(key: string): string {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();
  return `${config.publicBaseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

// ─── Presigned upload ────────────────────────────────────────────────────────

export interface PresignedUpload {
  /** The URL the browser issues a PUT against. */
  uploadUrl: string;
  /** Headers the browser must send verbatim — they are part of the signature. */
  headers: Record<string, string>;
  storageKey: string;
  /** Where the object will be readable once the upload finishes. */
  publicUrl: string;
  expiresInSeconds: number;
}

/** What the store reports about an object after an upload. */
export interface HeadResult {
  exists: boolean;
  sizeBytes: number;
  mimeType: string | null;
  /** The store's own URL for the object, authoritative on both backends. */
  url: string | null;
}

/** Validation outcome for a requested upload. */
export type UploadValidation = { ok: true } | { ok: false; error: string };

/**
 * Checks a requested upload against the media allowlist before anything is signed.
 *
 * Enforced here, server-side, because the signature is the authorisation: once issued, the
 * bucket will accept whatever the signature permits. Checking the declared size matters too —
 * signing an unbounded PUT would let one upload fill the bucket.
 */
export function validateUpload(mimeType: string, sizeBytes: number): UploadValidation {
  const category = mediaCategoryFor(mimeType);
  if (!category) {
    const permitted = Object.values(MEDIA_LIMITS)
      .flatMap((spec) => spec.mimeTypes as readonly string[])
      .join(", ");
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

/**
 * Signs a single-object PUT.
 *
 * `Content-Type` is included in `SignedHeaders`, which binds the declared type into the
 * signature — the upload fails if the browser sends anything else. `UNSIGNED-PAYLOAD` is used
 * for the body hash because the server never sees the bytes.
 *
 * Five minutes is deliberately short: long enough for a large file on a slow connection to
 * *start*, short enough that a leaked URL is nearly worthless.
 */
function presignS3Upload(options: {
  filename: string;
  mimeType: string;
  folder?: string;
  expiresInSeconds?: number;
}): PresignedUpload {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();

  const expiresInSeconds = Math.min(Math.max(options.expiresInSeconds ?? 300, 60), 3600);
  const storageKey = buildStorageKey(options.filename, options.folder);
  const host = hostFor(config);
  const canonicalUri = canonicalPathFor(config, storageKey);
  const { amzDate, dateStamp } = amzDates();

  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const signedHeaders = "content-type;host";

  // Query parameters must be sorted by key for the canonical request.
  const query = new Map<string, string>([
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${config.accessKeyId}/${credentialScope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresInSeconds)],
    ["X-Amz-SignedHeaders", signedHeaders],
  ]);
  const canonicalQuery = [...query.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${uriEncode(key)}=${uriEncode(value)}`)
    .join("&");

  const canonicalHeaders = `content-type:${options.mimeType}\nhost:${host}\n`;
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signature = createHmac(
    "sha256",
    signingKey(config.secretAccessKey, dateStamp, config.region, "s3"),
  )
    .update(stringToSign, "utf8")
    .digest("hex");

  return {
    uploadUrl: `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`,
    headers: { "Content-Type": options.mimeType },
    storageKey,
    publicUrl: publicUrlFor(storageKey),
    expiresInSeconds,
  };
}

// ─── Server-side delete ──────────────────────────────────────────────────────

/**
 * Deletes an object, signing with an `Authorization` header rather than a presigned URL.
 *
 * Deletion is never delegated to the browser: a presigned DELETE that leaked would let anyone
 * remove media. The request is made from the function, where the credentials stay.
 */
async function deleteS3Object(storageKey: string): Promise<void> {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();

  const host = hostFor(config);
  const canonicalUri = canonicalPathFor(config, storageKey);
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = sha256Hex("");

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "DELETE",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signature = createHmac(
    "sha256",
    signingKey(config.secretAccessKey, dateStamp, config.region, "s3"),
  )
    .update(stringToSign, "utf8")
    .digest("hex");

  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: "DELETE",
    headers: {
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  });

  // S3 answers 204 for a successful delete and also for a key that was never there, which is
  // the idempotent behaviour we want. Anything else is a real failure worth surfacing.
  if (!response.ok && response.status !== 404) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(
      `Object storage refused the delete (${response.status}): ${detail.slice(0, 300)}`,
    );
  }
}

/**
 * Reads an object's bytes back from the bucket, signing with an `Authorization` header.
 *
 * Uploads go straight from the browser to storage, so the bytes never pass through a function
 * on the way in. When the server needs them afterwards — to extract the text of an uploaded PDF
 * for the knowledge base — it fetches them here with a signed GET, so the read works whether or
 * not the bucket is publicly readable.
 */
async function getS3Object(storageKey: string): Promise<Uint8Array> {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();

  const host = hostFor(config);
  const canonicalUri = canonicalPathFor(config, storageKey);
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = sha256Hex("");

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "GET",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signature = createHmac(
    "sha256",
    signingKey(config.secretAccessKey, dateStamp, config.region, "s3"),
  )
    .update(stringToSign, "utf8")
    .digest("hex");

  const response = await fetch(`https://${host}${canonicalUri}`, {
    headers: {
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(
      `Object storage refused the read (${response.status}): ${detail.slice(0, 300)}`,
    );
  }

  return new Uint8Array(await response.arrayBuffer());
}

/**
 * Confirms an object exists and reports its size.
 *
 * Called after a presigned upload so the recorded size is the bucket's own figure rather than
 * the number the client claimed, and so a row is never created for an upload that silently
 * failed.
 */
async function headS3Object(storageKey: string): Promise<HeadResult> {
  const config = storageConfig();
  if (!config) throw new StorageNotConfiguredError();

  const host = hostFor(config);
  const canonicalUri = canonicalPathFor(config, storageKey);
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = sha256Hex("");

  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "HEAD",
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signature = createHmac(
    "sha256",
    signingKey(config.secretAccessKey, dateStamp, config.region, "s3"),
  )
    .update(stringToSign, "utf8")
    .digest("hex");

  const response = await fetch(`https://${host}${canonicalUri}`, {
    method: "HEAD",
    headers: {
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
  });

  if (!response.ok) return { exists: false, sizeBytes: 0, mimeType: null, url: null };

  return {
    exists: true,
    sizeBytes: Number(response.headers.get("content-length") ?? "0"),
    mimeType: response.headers.get("content-type"),
    url: publicUrlFor(storageKey),
  };
}

// ─── Vercel Blob operations ──────────────────────────────────────────────────

/**
 * Mints a signed PUT URL for a single object.
 *
 * Signed URLs are what let Blob fit the same contract as S3: the browser receives a URL scoped to
 * one operation on one pathname, uploads straight to the store, and the long-lived credential
 * never leaves the function.
 *
 * `allowedContentTypes` and `maximumSizeInBytes` are the important part. The signature *is* the
 * authorisation — once issued, the store honours whatever it permits — so the media allowlist and
 * the per-category size ceiling are bound into it, exactly as the S3 path binds `Content-Type`
 * into `SignedHeaders`. Without the size bound, one upload could fill the store.
 *
 * `addRandomSuffix` is off because `buildStorageKey` has already added one; letting Blob add a
 * second would mean the pathname we signed is not the pathname we could later look up.
 * `allowOverwrite` is off so a replayed URL cannot clobber an existing object.
 */
async function presignBlobUpload(options: {
  filename: string;
  mimeType: string;
  folder?: string;
  sizeBytes?: number;
  expiresInSeconds?: number;
}): Promise<PresignedUpload> {
  const config = requireBlobConfig();
  const credentials = blobCredentials(config);

  const expiresInSeconds = Math.min(Math.max(options.expiresInSeconds ?? 300, 60), 3600);
  const storageKey = buildStorageKey(options.filename, options.folder);
  const validUntil = Date.now() + expiresInSeconds * 1000;

  const category = mediaCategoryFor(options.mimeType);
  const declared = Number(options.sizeBytes);
  const ceiling = category ? MEDIA_LIMITS[category].maxBytes : undefined;
  const maximumSizeInBytes =
    Number.isFinite(declared) && declared > 0 && ceiling
      ? Math.min(Math.trunc(declared), ceiling)
      : ceiling;

  // Scoped to this pathname and this operation, so the token cannot be repurposed even before
  // it is turned into a URL.
  const signedToken = await issueSignedToken({
    ...credentials,
    pathname: storageKey,
    operations: ["put"],
    validUntil,
    allowedContentTypes: [options.mimeType],
    ...(maximumSizeInBytes ? { maximumSizeInBytes } : {}),
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    operation: "put",
    access: config.access,
    pathname: storageKey,
    validUntil,
    allowedContentTypes: [options.mimeType],
    ...(maximumSizeInBytes ? { maximumSizeInBytes } : {}),
    addRandomSuffix: false,
    allowOverwrite: false,
  });

  return {
    uploadUrl: presignedUrl,
    headers: { "Content-Type": options.mimeType },
    storageKey,
    // Blob decides the final URL, and it is only knowable once the object exists. The confirm
    // step reads it from the store rather than guessing, so this is a best-effort value for a
    // caller that wants to show something immediately; nothing persists it.
    publicUrl: "",
    expiresInSeconds,
  };
}

async function deleteBlobObject(storageKey: string): Promise<void> {
  const config = requireBlobConfig();
  try {
    await del(storageKey, blobCredentials(config));
  } catch (error) {
    // Deleting something already gone is the outcome we wanted, and matches the S3 path, which
    // treats a 404 as success.
    if (error instanceof BlobNotFoundError) return;
    throw error;
  }
}

async function headBlobObject(storageKey: string): Promise<HeadResult> {
  const config = requireBlobConfig();
  try {
    const result = await head(storageKey, blobCredentials(config));
    return {
      exists: true,
      sizeBytes: result.size,
      mimeType: result.contentType ?? null,
      url: result.url,
    };
  } catch (error) {
    if (error instanceof BlobNotFoundError) {
      return { exists: false, sizeBytes: 0, mimeType: null, url: null };
    }
    throw error;
  }
}

async function getBlobObject(storageKey: string): Promise<Uint8Array> {
  const config = requireBlobConfig();
  // `head` returns a `downloadUrl` that carries its own access, so a private store is readable
  // here without exposing a public URL.
  const meta = await head(storageKey, blobCredentials(config));
  const response = await fetch(meta.downloadUrl ?? meta.url);
  if (!response.ok) {
    throw new Error(`Blob refused the read (${response.status}).`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

// ─── Backend dispatch ────────────────────────────────────────────────────────

/**
 * Signs an upload the browser can perform directly.
 *
 * Async for both backends even though the S3 signature is pure computation, so the contract does
 * not change shape depending on which store is configured.
 */
export async function presignUpload(options: {
  filename: string;
  mimeType: string;
  folder?: string;
  sizeBytes?: number;
  expiresInSeconds?: number;
}): Promise<PresignedUpload> {
  switch (mediaBackend()) {
    case "s3":
      return presignS3Upload(options);
    case "blob":
      return presignBlobUpload(options);
    default:
      throw new StorageNotConfiguredError();
  }
}

/**
 * Deletes an object.
 *
 * Never delegated to the browser on either backend: a leaked delete URL would let anyone remove
 * media, so the request is always made from the function where the credentials stay.
 */
export async function deleteObject(storageKey: string): Promise<void> {
  switch (mediaBackend()) {
    case "s3":
      return deleteS3Object(storageKey);
    case "blob":
      return deleteBlobObject(storageKey);
    default:
      throw new StorageNotConfiguredError();
  }
}

/**
 * Confirms an object exists, and reports the store's own view of it.
 *
 * The size comes from the store rather than from the client, and the URL likewise — Blob assigns
 * the final URL itself, so asking is the only way to know it.
 */
export async function headObject(storageKey: string): Promise<HeadResult> {
  switch (mediaBackend()) {
    case "s3":
      return headS3Object(storageKey);
    case "blob":
      return headBlobObject(storageKey);
    default:
      throw new StorageNotConfiguredError();
  }
}

/**
 * Reads an object's raw bytes back from storage.
 *
 * Used after a browser-direct upload, when the server needs the content it never saw — extracting
 * the text of an uploaded PDF for the knowledge base. Works regardless of backend or public
 * readability, because both paths authenticate the read.
 */
export async function getObject(storageKey: string): Promise<Uint8Array> {
  switch (mediaBackend()) {
    case "s3":
      return getS3Object(storageKey);
    case "blob":
      return getBlobObject(storageKey);
    default:
      throw new StorageNotConfiguredError();
  }
}
