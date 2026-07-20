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
