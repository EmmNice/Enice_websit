import { createClient } from "@sanity/client";

export const PROJECT_ID = "v87jayow";
export const DATASET = "production";
export const API_VERSION = "2025-01-01";

// Use CDN in production for fast reads; disable in dev so localhost isn't
// blocked by Sanity's CDN CORS policy (dev API calls use the direct API).
const isProduction =
  typeof window !== "undefined"
    ? !window.location.hostname.includes("localhost") &&
      !window.location.hostname.includes("127.0.0.1")
    : true;

export const sanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  useCdn: isProduction,
  apiVersion: API_VERSION,
  perspective: "published",
});

// ─── GROQ queries ──────────────────────────────────────────────────────────

/** Fetch all posts for the listing page (no body content — keep it light). */
export const ALL_POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    category,
    publishedAt,
    excerpt,
    "mainImageUrl": mainImage.asset->url
  }
`;

/** Fetch a single post by slug for the article page. */
export const POST_BY_SLUG_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    category,
    publishedAt,
    excerpt,
    "mainImageUrl": mainImage.asset->url,
    body
  }
`;

/** Fetch changelog entries only. */
export const CHANGELOG_QUERY = `
  *[_type == "post" && category in ["CHANGELOG", "UPDATE"]] | order(publishedAt desc) {
    _id,
    title,
    slug,
    category,
    publishedAt,
    excerpt
  }
`;
