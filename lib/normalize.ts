/**
 * Normalizes unicode whitespace in admin-submitted text before it's stored:
 * NFKC-normalizes the string, folds exotic space characters (non-breaking,
 * zero-width, full-width, etc.) down to a plain space, strips invisible
 * zero-width characters entirely, and collapses repeated whitespace.
 *
 * Applied automatically to every string field in admin API routes so pasted
 * content (e.g. from Word or Google Docs) never introduces invisible
 * formatting artifacts into the database.
 *
 * Implemented via numeric code points (not literal characters in a regex)
 * so the source file never embeds actual invisible/exotic unicode bytes.
 */

// NBSP, Ogham space, en quad..hair space, line/paragraph separator,
// narrow NBSP, medium mathematical space, ideographic space.
const EXOTIC_SPACE_CODES = new Set<number>([
  0x00a0, 0x1680,
  0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005,
  0x2006, 0x2007, 0x2008, 0x2009, 0x200a,
  0x2028, 0x2029, 0x202f, 0x205f, 0x3000,
]);

// Zero-width space, zero-width non-joiner, zero-width joiner, BOM.
const ZERO_WIDTH_CODES = new Set<number>([0x200b, 0x200c, 0x200d, 0xfeff]);

export function normalizeWhitespace(value: string): string {
  const normalized = value.normalize("NFKC");
  let out = "";
  for (const ch of normalized) {
    const code = ch.codePointAt(0)!;
    if (ZERO_WIDTH_CODES.has(code)) continue;
    out += EXOTIC_SPACE_CODES.has(code) ? " " : ch;
  }
  return out
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Recursively applies normalizeWhitespace to every string value in an object/array. */
export function deepNormalize<T>(value: T): T {
  if (typeof value === "string") {
    return normalizeWhitespace(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => deepNormalize(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = deepNormalize(v);
    }
    return out as T;
  }
  return value;
}
