/**
 * PDF text extraction for the knowledge base.
 *
 * ## Why `unpdf`
 *
 * `unpdf` is a serverless-oriented build of Mozilla's pdf.js with zero runtime dependencies, so
 * it bundles cleanly into the ESM function output (verified against the `build:api` flags). The
 * more common `pdf-parse` reads a test fixture from disk at import time, which breaks once
 * bundled; a full `@aws-sdk`-scale tree would be the kind of heavy dependency the rest of this
 * codebase deliberately avoids (see the SigV4 note in `storage.ts`).
 *
 * ## What it does and does not do
 *
 * This pulls the *text layer* out of a PDF. A PDF that is really a scan of paper — images with no
 * embedded text — has no text layer to extract, and yields little or nothing. That is a property
 * of the file, not a failure here, so the caller checks the result and tells the operator when a
 * document produced no usable text rather than storing an empty entry.
 */

import { extractText, getDocumentProxy } from "unpdf";
import { KNOWLEDGE_MAX_CHARS } from "../../src/lib/cms/types";

export interface PdfExtraction {
  text: string;
  pages: number;
  truncated: boolean;
}

/**
 * Extracts and normalises the text of a PDF.
 *
 * Whitespace is collapsed because pdf.js emits text positioned glyph-by-glyph, which otherwise
 * leaves ragged runs of spaces and newlines that waste retrieval budget and read poorly.
 */
export async function extractPdfText(bytes: Uint8Array): Promise<PdfExtraction> {
  const pdf = await getDocumentProxy(bytes);
  const { text, totalPages } = await extractText(pdf, { mergePages: true });

  const merged = Array.isArray(text) ? text.join("\n") : text;
  const normalised = merged
    // Drop NUL bytes without a control-character regex (which the linter forbids); Postgres
    // rejects NUL in text anyway, so this must go before the row is written.
    .split("\u0000")
    .join("")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const truncated = normalised.length > KNOWLEDGE_MAX_CHARS;
  return {
    text: truncated ? normalised.slice(0, KNOWLEDGE_MAX_CHARS) : normalised,
    pages: totalPages ?? 0,
    truncated,
  };
}
