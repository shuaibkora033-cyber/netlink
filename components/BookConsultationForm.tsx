"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  SERVICE_NEEDED_OPTIONS,
  INDUSTRY_OPTIONS,
  BUDGET_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  MAIN_PROBLEM_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  resolveOptionLabel,
  type OptionLabelOverrides,
} from "@/lib/leads";

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-fg placeholder:text-muted/60 outline-none transition-all duration-200 focus:border-neon/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-neon/20";
const errorInputCls = "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20";

// Minimum time between two successful submits from the same form instance —
// on top of disabling the button while a request is in flight, this stops a
// second rapid submit right after a first one completes.
const SUBMIT_COOLDOWN_MS = 4000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BookConsultationFormConfig = {
  formTitle: string;
  formNote: string;
  submitLabel: string;
};

export const DEFAULT_BOOK_CONSULTATION_FORM: BookConsultationFormConfig = {
  formTitle: "Book your free consultation",
  formNote: "No spam. We reply within one business day.",
  submitLabel: "Book Consultation",
};

export type FieldLabels = {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  website_url: string;
  service_needed: string;
  industry: string;
  monthly_marketing_budget: string;
  current_lead_source: string;
  main_problem: string;
  preferred_contact_method: string;
  message: string;
};

export const DEFAULT_FIELD_LABELS: FieldLabels = {
  full_name: "Full name",
  email: "Email",
  phone: "Phone",
  company_name: "Company name",
  website_url: "Website",
  service_needed: "Service needed",
  industry: "Industry",
  monthly_marketing_budget: "Monthly marketing budget",
  current_lead_source: "Current lead source",
  main_problem: "Main problem",
  preferred_contact_method: "Preferred contact method",
  message: "Notes",
};

type FieldErrors = Record<string, string>;

function str(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function validate(values: Record<string, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.full_name) errors.full_name = "Full name is required.";
  if (!values.email) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(values.email)) errors.email = "Enter a valid email address.";
  if (!values.phone) errors.phone = "Phone number is required.";
  if (!values.company_name) errors.company_name = "Company name is required.";
  if (!values.service_needed) errors.service_needed = "Please select a service.";
  if (!values.monthly_marketing_budget) errors.monthly_marketing_budget = "Please select a budget range.";
  if (!values.main_problem) errors.main_problem = "Please select your main problem.";
  return errors;
}

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <label className="text-xs font-medium text-muted">
      {children}
      {required && <span className="ml-0.5 text-neon/70">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-400">{message}</p>;
}

/**
 * Real consultation lead form for /book-consultation. Submits to
 * POST /api/consultation-leads, which validates, scores, and stores the
 * lead in Supabase — visible to admins at /admin/leads. Enum field options
 * (service/industry/budget/lead source/main problem/contact method) are
 * fixed in code (lib/leads.ts) rather than admin-editable, since lead
 * scoring keys off their exact string values.
 */
export function BookConsultationForm({
  config = DEFAULT_BOOK_CONSULTATION_FORM,
  fieldLabels = DEFAULT_FIELD_LABELS,
  optionLabelOverrides,
}: {
  config?: BookConsultationFormConfig;
  fieldLabels?: FieldLabels;
  optionLabelOverrides?: OptionLabelOverrides;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [contactMethod, setContactMethod] = useState("");

  const lastSubmitAt = useRef(0);
  const trackingRef = useRef({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    page_url: "",
    referrer: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    trackingRef.current = {
      utm_source: params.get("utm_source") ?? "",
      utm_medium: params.get("utm_medium") ?? "",
      utm_campaign: params.get("utm_campaign") ?? "",
      utm_term: params.get("utm_term") ?? "",
      utm_content: params.get("utm_content") ?? "",
      page_url: window.location.href,
      referrer: document.referrer,
    };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    if (Date.now() - lastSubmitAt.current < SUBMIT_COOLDOWN_MS) return;

    // Everything up to the fetch call is wrapped in try/catch too — a thrown
    // error here previously meant the button did nothing with no visible
    // feedback and no network request, which is exactly what silently broke
    // the form (see investigation notes). Now any unexpected error surfaces
    // the same way a failed request would.
    try {
      const data = new FormData(e.currentTarget);

      // Honeypot — real visitors never see or fill this field (display:none,
      // so browser autofill never targets it either — unlike the previous
      // off-screen-positioning approach, which Chrome's contact-form autofill
      // was filling in on real visits, silently blocking every submission).
      if (str(data.get("hp_token"))) return;

      const values = {
        full_name: str(data.get("full_name")),
        email: str(data.get("email")),
        phone: str(data.get("phone")),
        company_name: str(data.get("company_name")),
        website_url: str(data.get("website_url")),
        service_needed: str(data.get("service_needed")),
        industry: str(data.get("industry")),
        monthly_marketing_budget: str(data.get("monthly_marketing_budget")),
        current_lead_source: str(data.get("current_lead_source")),
        main_problem: str(data.get("main_problem")),
        preferred_contact_method: str(data.get("preferred_contact_method")),
        message: str(data.get("message")),
      };

      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      setErrors({});
      setSubmitError(null);
      setSubmitting(true);

      const res = await fetch("/api/consultation-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...trackingRef.current }),
      });
      const json = await res.json().catch(() => ({}) as { error?: string });
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");

      lastSubmitAt.current = Date.now();
      // Leave `submitting` true (button stays disabled/spinning) through the
      // redirect — there's nothing to reset it for since this component is
      // about to unmount, and it avoids any chance of a second submit while
      // the navigation is in flight.
      router.push("/thank-you");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border border-line glass p-5 sm:p-9">
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <div className="mb-1">
            <h3 className="text-lg font-semibold">{config.formTitle}</h3>
            <p className="mt-1 text-xs text-muted">{config.formNote}</p>
          </div>

          {/* Honeypot — display:none so it's excluded from layout/focus AND
              from browser autofill targeting (autofill does consider
              off-screen-but-rendered fields, which previously caused Chrome's
              contact-form autofill to silently fill this and block every
              real submission). Real visitors never see or fill it; simple
              bots that blindly fill every <input> still get caught. */}
          <input
            type="text"
            name="hp_token"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{fieldLabels.full_name}</FieldLabel>
              <input
                name="full_name"
                placeholder="Jane Doe"
                className={`${inputCls} ${errors.full_name ? errorInputCls : ""}`}
              />
              <FieldError message={errors.full_name} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{fieldLabels.email}</FieldLabel>
              <input
                name="email"
                type="email"
                placeholder="jane@company.com"
                className={`${inputCls} ${errors.email ? errorInputCls : ""}`}
              />
              <FieldError message={errors.email} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{fieldLabels.phone}</FieldLabel>
              <input
                name="phone"
                type="tel"
                placeholder="(202) 474-4630"
                className={`${inputCls} ${errors.phone ? errorInputCls : ""}`}
              />
              <FieldError message={errors.phone} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{fieldLabels.company_name}</FieldLabel>
              <input
                name="company_name"
                placeholder="Company name"
                className={`${inputCls} ${errors.company_name ? errorInputCls : ""}`}
              />
              <FieldError message={errors.company_name} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{fieldLabels.website_url}</FieldLabel>
              <input name="website_url" placeholder="yourcompany.com" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{fieldLabels.service_needed}</FieldLabel>
              <select
                name="service_needed"
                defaultValue=""
                className={`${inputCls} cursor-pointer ${errors.service_needed ? errorInputCls : ""}`}
              >
                <option value="" disabled>Select a service</option>
                {SERVICE_NEEDED_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {resolveOptionLabel("service_needed", opt, optionLabelOverrides)}
                  </option>
                ))}
              </select>
              <FieldError message={errors.service_needed} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{fieldLabels.industry}</FieldLabel>
              <select name="industry" defaultValue="" className={`${inputCls} cursor-pointer`}>
                <option value="" disabled>Select an industry</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {resolveOptionLabel("industry", opt, optionLabelOverrides)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{fieldLabels.monthly_marketing_budget}</FieldLabel>
              <select
                name="monthly_marketing_budget"
                defaultValue=""
                className={`${inputCls} cursor-pointer ${errors.monthly_marketing_budget ? errorInputCls : ""}`}
              >
                <option value="" disabled>Select range</option>
                {BUDGET_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {resolveOptionLabel("monthly_marketing_budget", opt, optionLabelOverrides)}
                  </option>
                ))}
              </select>
              <FieldError message={errors.monthly_marketing_budget} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{fieldLabels.current_lead_source}</FieldLabel>
              <select name="current_lead_source" defaultValue="" className={`${inputCls} cursor-pointer`}>
                <option value="" disabled>Select current source</option>
                {LEAD_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {resolveOptionLabel("current_lead_source", opt, optionLabelOverrides)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{fieldLabels.main_problem}</FieldLabel>
              <select
                name="main_problem"
                defaultValue=""
                className={`${inputCls} cursor-pointer ${errors.main_problem ? errorInputCls : ""}`}
              >
                <option value="" disabled>Select main problem</option>
                {MAIN_PROBLEM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {resolveOptionLabel("main_problem", opt, optionLabelOverrides)}
                  </option>
                ))}
              </select>
              <FieldError message={errors.main_problem} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{fieldLabels.preferred_contact_method}</FieldLabel>
            <input type="hidden" name="preferred_contact_method" value={contactMethod} />
            <div className="flex flex-wrap gap-2">
              {CONTACT_METHOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setContactMethod((v) => (v === opt.value ? "" : opt.value))}
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200",
                    contactMethod === opt.value
                      ? "border-neon/50 bg-neon/12 text-neon"
                      : "border-line bg-white/[0.02] text-muted hover:border-neon/25 hover:text-fg",
                  ].join(" ")}
                >
                  {resolveOptionLabel("preferred_contact_method", opt, optionLabelOverrides)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{fieldLabels.message}</FieldLabel>
            <textarea
              name="message"
              rows={4}
              placeholder="Tell us about your business and goals…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {submitError && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {submitError}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={submitting ? undefined : { y: -2 }}
            whileTap={submitting ? undefined : { scale: 0.98 }}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon to-neon-soft px-6 py-4 text-sm font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(13,253,209,0.55)] transition-shadow hover:shadow-[0_14px_50px_-8px_rgba(13,253,209,0.75)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                Submitting…
              </>
            ) : (
              <>
                {config.submitLabel || DEFAULT_BOOK_CONSULTATION_FORM.submitLabel}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </>
            )}
          </motion.button>
        </form>
    </div>
  );
}
