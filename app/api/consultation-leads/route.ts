import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/server";
import { deepNormalize } from "@/lib/normalize";
import { sendLeadNotification } from "@/lib/email/sendLeadNotification";
import {
  SERVICE_NEEDED_OPTIONS,
  INDUSTRY_OPTIONS,
  BUDGET_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  MAIN_PROBLEM_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  computeLeadScore,
} from "@/lib/leads";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Basic in-memory rate limiting ────────────────────────────────────────────
// This VPS runs `next start` as one long-lived Node process (not per-request
// serverless), so an in-memory map persists across requests within that
// process — good enough for "don't overcomplicate" basic abuse protection.
// It resets on deploy/restart and isn't shared across multiple instances,
// which is an accepted tradeoff for this phase.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;
const submissionsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissionsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  submissionsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function optionalEnum(value: unknown, allowed: readonly { value: string }[]): string | null {
  return typeof value === "string" && allowed.some((opt) => opt.value === value) ? value : null;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a minute." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot — legitimate visitors never fill this hidden field. Bots that do
  // get a generic success response with no insert, so they get no useful signal.
  if (typeof body.hp_token === "string" && body.hp_token.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const fullName = typeof body.full_name === "string" ? body.full_name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const companyName = typeof body.company_name === "string" ? body.company_name : "";
  const serviceNeeded = typeof body.service_needed === "string" ? body.service_needed : "";
  const monthlyBudget = typeof body.monthly_marketing_budget === "string" ? body.monthly_marketing_budget : "";
  const mainProblem = typeof body.main_problem === "string" ? body.main_problem : "";

  if (!fullName || !email || !phone || !companyName || !serviceNeeded || !monthlyBudget || !mainProblem) {
    return NextResponse.json(
      { error: "Full name, email, phone, company, service needed, budget, and main problem are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (!SERVICE_NEEDED_OPTIONS.some((opt) => opt.value === serviceNeeded)) {
    return NextResponse.json({ error: "Invalid service needed value." }, { status: 400 });
  }
  if (!BUDGET_OPTIONS.some((opt) => opt.value === monthlyBudget)) {
    return NextResponse.json({ error: "Invalid budget value." }, { status: 400 });
  }
  if (!MAIN_PROBLEM_OPTIONS.some((opt) => opt.value === mainProblem)) {
    return NextResponse.json({ error: "Invalid main problem value." }, { status: 400 });
  }

  const websiteUrl = typeof body.website_url === "string" ? body.website_url : null;
  const industry = optionalEnum(body.industry, INDUSTRY_OPTIONS);
  const currentLeadSource = optionalEnum(body.current_lead_source, LEAD_SOURCE_OPTIONS);
  const preferredContactMethod = optionalEnum(body.preferred_contact_method, CONTACT_METHOD_OPTIONS);
  const message = typeof body.message === "string" ? body.message : null;

  const leadScore = computeLeadScore({
    monthly_marketing_budget: monthlyBudget,
    service_needed: serviceNeeded,
    main_problem: mainProblem,
    website_url: websiteUrl,
    industry,
  });

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Submissions are temporarily unavailable. Please try again later." }, { status: 500 });
  }

  const { data: inserted, error } = await supabase
    .from("consultation_leads")
    .insert({
      full_name: fullName,
      email,
      phone,
      company_name: companyName,
      website_url: websiteUrl,
      service_needed: serviceNeeded,
      industry,
      monthly_marketing_budget: monthlyBudget,
      current_lead_source: currentLeadSource,
      main_problem: mainProblem,
      preferred_contact_method: preferredContactMethod,
      message,
      lead_score: leadScore,
      utm_source: typeof body.utm_source === "string" ? body.utm_source || null : null,
      utm_medium: typeof body.utm_medium === "string" ? body.utm_medium || null : null,
      utm_campaign: typeof body.utm_campaign === "string" ? body.utm_campaign || null : null,
      utm_term: typeof body.utm_term === "string" ? body.utm_term || null : null,
      utm_content: typeof body.utm_content === "string" ? body.utm_content || null : null,
      page_url: typeof body.page_url === "string" ? body.page_url || null : null,
      referrer: typeof body.referrer === "string" ? body.referrer || null : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Something went wrong saving your request. Please try again." }, { status: 500 });
  }

  // The lead is already saved at this point — a notification problem must
  // never turn into a failed submission for the visitor. sendLeadNotification
  // already catches and logs internally; this try/catch is belt-and-suspenders
  // against a truly unexpected throw.
  try {
    await sendLeadNotification(inserted);
  } catch (notifyError) {
    console.error("[consultation-leads] Failed to send lead notification email:", notifyError);
  }

  return NextResponse.json({ ok: true });
}
