/**
 * Small, dependency-free validation helpers shared across API routes.
 * Every admin/public route already did this kind of check ad hoc (its own
 * copy of an email regex, etc.) — this centralizes the common ones instead
 * of adding a schema-validation library for a codebase this size.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ABSOLUTE_URL_RE = /^https?:\/\/[^\s]+$/i;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

/** Accepts absolute http(s) URLs or a site-relative path (e.g. "/process", "#contact"). */
export function isValidUrlOrPath(value: string): boolean {
  if (value === "") return true;
  if (value.startsWith("/") || value.startsWith("#")) return true;
  return ABSOLUTE_URL_RE.test(value);
}

/** True for any string up to maxLength — use for required free-text fields. */
export function isSafeString(value: unknown, maxLength = 5000): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

/** Like isSafeString, but also rejects empty/whitespace-only — use for required fields. */
export function isNonEmptyString(value: unknown, maxLength = 5000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

export function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

// ── List/array shape helpers ──────────────────────────────────────────────
// Shared by every CMS route that stores a repeatable list (stats, growth
// steps, bullets, cards, feedback items, guarantees, services, FAQs, case
// studies, industries) so "is this a list" and "is each item shaped right"
// aren't reimplemented slightly differently per route.

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isArrayOfStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

export function isArrayOfRecords(value: unknown): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isRecord);
}

/** Generic "every item in this array passes `check`" — use for typed lists. */
export function isArrayOf<T>(value: unknown, check: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(check);
}

export type StatItem = { value: string | number; label: string; suffix?: string };
export type GrowthStepItem = { num: string; title: string; text: string };

/** Homepage stat card: value (string or number), label (string), suffix (optional string). */
export function isValidStatItem(value: unknown): value is StatItem {
  if (!isRecord(value)) return false;
  const validValue = typeof value.value === "string" || typeof value.value === "number";
  const validLabel = typeof value.label === "string";
  const validSuffix = value.suffix === undefined || typeof value.suffix === "string";
  return validValue && validLabel && validSuffix;
}

/** Homepage/process growth step: num, title, text — all strings. */
export function isValidGrowthStepItem(value: unknown): value is GrowthStepItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.num === "string" &&
    typeof value.title === "string" &&
    typeof value.text === "string"
  );
}
