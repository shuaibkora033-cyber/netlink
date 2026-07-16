/**
 * Shared constants and scoring for the consultation lead system. Imported by
 * both the public form (BookConsultationForm.tsx, to render <select> options)
 * and the submission API route (to validate values against the same
 * allow-lists and compute lead_score) — one source of truth so the dropdown
 * options and the scoring rules can never drift apart.
 *
 * Each dropdown option is a stable `value` (also what's stored in Supabase
 * and what computeLeadScore() below matches against — never admin-editable)
 * plus a `label` (what's shown in the <option> — the ONLY part the Book
 * Consultation CMS editor's "Form" section is allowed to override, via a
 * value→label map). `value` is byte-identical to the string this project
 * used everywhere before this file had labels at all, so existing rows in
 * consultation_leads and this scoring logic never needed to change.
 */

export type LeadOption = { value: string; label: string };

function options(values: readonly string[]): LeadOption[] {
  return values.map((value) => ({ value, label: value }));
}

export const SERVICE_NEEDED_OPTIONS: LeadOption[] = options([
  "Lead Generation",
  "Appointment Setting",
  "Full Growth System",
  "Not Sure Yet",
]);

export const INDUSTRY_OPTIONS: LeadOption[] = options([
  "Solar",
  "Roofing / Home Improvement",
  "Real Estate",
  "Medical / Clinics",
  "Legal",
  "Financial Services",
  "B2B Services",
  "Local Services",
  "Other",
]);

export const BUDGET_OPTIONS: LeadOption[] = options([
  "Less than $1,000",
  "$1,000 - $3,000",
  "$3,000 - $5,000",
  "$5,000 - $10,000",
  "$10,000+",
]);

export const LEAD_SOURCE_OPTIONS: LeadOption[] = options([
  "Referrals",
  "Facebook / Instagram Ads",
  "Google Ads",
  "SEO",
  "Cold Outreach",
  "No consistent lead source",
  "Other",
]);

export const MAIN_PROBLEM_OPTIONS: LeadOption[] = options([
  "Not enough leads",
  "Low-quality leads",
  "Leads do not book calls",
  "Slow follow-up",
  "No tracking or CRM",
  "Need a full system",
]);

export const CONTACT_METHOD_OPTIONS: LeadOption[] = options(["Phone", "Email", "WhatsApp"]);

/** All 6 option groups, keyed by the form field name — used to build the
 * CMS "Form" editor's option-label override UI generically. */
export const LEAD_OPTION_GROUPS = {
  service_needed: SERVICE_NEEDED_OPTIONS,
  industry: INDUSTRY_OPTIONS,
  monthly_marketing_budget: BUDGET_OPTIONS,
  current_lead_source: LEAD_SOURCE_OPTIONS,
  main_problem: MAIN_PROBLEM_OPTIONS,
  preferred_contact_method: CONTACT_METHOD_OPTIONS,
} as const;

export type LeadOptionFieldKey = keyof typeof LEAD_OPTION_GROUPS;

/** value → admin-overridden label, per field. Falls back to the option's
 * own default label when a field/value isn't present in the override map. */
export type OptionLabelOverrides = Partial<Record<LeadOptionFieldKey, Record<string, string>>>;

export function resolveOptionLabel(
  field: LeadOptionFieldKey,
  option: LeadOption,
  overrides: OptionLabelOverrides | undefined
): string {
  return overrides?.[field]?.[option.value] ?? option.label;
}

export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "booked", label: "Booked" },
  { value: "not_qualified", label: "Not Qualified" },
  { value: "lost", label: "Lost" },
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number]["value"];

export const DEFAULT_LEAD_STATUS: LeadStatus = "new";

// ── Lead quality (derived from lead_score, not stored) ────────────────────────
// Distinct from `status` — status is the manual pipeline stage an admin sets;
// quality is an automatic score bucket. Both can say "Qualified" at once (see
// LEAD_QUALITIES below) — that's intentional, they're shown in separately
// captioned "Status" / "Quality" slots with different colors everywhere in
// the admin UI so they never read as the same value.
export const LEAD_QUALITIES = [
  { value: "low_fit", label: "Low Fit", min: 0, max: 20 },
  { value: "needs_review", label: "Needs Review", min: 21, max: 40 },
  { value: "qualified", label: "Qualified", min: 41, max: 60 },
  { value: "hot_lead", label: "Hot Lead", min: 61, max: Infinity },
] as const;

export type LeadQuality = (typeof LEAD_QUALITIES)[number]["value"];

export function getLeadQuality(score: number): { value: LeadQuality; label: string } {
  const tier = LEAD_QUALITIES.find((t) => score >= t.min && score <= t.max) ?? LEAD_QUALITIES[0];
  return { value: tier.value, label: tier.label };
}

const HIGH_BUDGET_TIERS = new Set<string>(["$5,000 - $10,000", "$10,000+"]);
const HIGH_INTENT_INDUSTRIES = new Set<string>(["Solar", "Roofing / Home Improvement", "B2B Services"]);

/**
 * +30 if monthly budget is $5,000+
 * +20 if service_needed is Full Growth System
 * +15 if main_problem is "Leads do not book calls"
 * +15 if website_url exists
 * +10 if industry is Solar / Roofing / B2B Services
 */
export function computeLeadScore(input: {
  monthly_marketing_budget?: string | null;
  service_needed?: string | null;
  main_problem?: string | null;
  website_url?: string | null;
  industry?: string | null;
}): number {
  let score = 0;
  if (input.monthly_marketing_budget && HIGH_BUDGET_TIERS.has(input.monthly_marketing_budget)) score += 30;
  if (input.service_needed === "Full Growth System") score += 20;
  if (input.main_problem === "Leads do not book calls") score += 15;
  if (input.website_url && input.website_url.trim().length > 0) score += 15;
  if (input.industry && HIGH_INTENT_INDUSTRIES.has(input.industry)) score += 10;
  return score;
}
