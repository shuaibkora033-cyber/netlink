import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import {
  LEAD_STATUSES,
  LEAD_QUALITIES,
  SERVICE_NEEDED_OPTIONS,
  BUDGET_OPTIONS,
  INDUSTRY_OPTIONS,
} from "@/lib/leads";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

const STATUS_VALUES = new Set<string>(LEAD_STATUSES.map((s) => s.value));
const SERVICE_VALUES = new Set<string>(SERVICE_NEEDED_OPTIONS.map((o) => o.value));
const BUDGET_VALUES = new Set<string>(BUDGET_OPTIONS.map((o) => o.value));
const INDUSTRY_VALUES = new Set<string>(INDUSTRY_OPTIONS.map((o) => o.value));

export async function GET(request: Request) {
  const auth = await requireRole(["owner", "admin", "sales", "viewer"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const quality = url.searchParams.get("quality");
  const service = url.searchParams.get("service");
  const budget = url.searchParams.get("budget");
  const industry = url.searchParams.get("industry");
  const showArchived = url.searchParams.get("archived") === "1";
  const q = url.searchParams.get("q")?.trim();

  let query = supabase
    .from("consultation_leads")
    .select(
      "id, full_name, email, phone, company_name, website_url, service_needed, industry, monthly_marketing_budget, current_lead_source, main_problem, preferred_contact_method, status, lead_score, admin_notes, follow_up_date, last_contacted_at, archived, created_at"
    )
    .order("created_at", { ascending: false });

  if (status && STATUS_VALUES.has(status)) {
    query = query.eq("status", status);
  }
  if (service && SERVICE_VALUES.has(service)) {
    query = query.eq("service_needed", service);
  }
  if (budget && BUDGET_VALUES.has(budget)) {
    query = query.eq("monthly_marketing_budget", budget);
  }
  if (industry && INDUSTRY_VALUES.has(industry)) {
    query = query.eq("industry", industry);
  }
  if (quality) {
    const tier = LEAD_QUALITIES.find((t) => t.value === quality);
    if (tier) {
      query = query.gte("lead_score", tier.min);
      if (tier.max !== Infinity) query = query.lte("lead_score", tier.max);
    }
  }
  // "Hide archived" is the default — only an explicit ?archived=1 removes the filter.
  if (!showArchived) {
    query = query.eq("archived", false);
  }

  if (q) {
    // PostgREST .or() filter syntax treats "," and "()" as structural, so
    // strip them from the raw search term before interpolating it in.
    const safe = q.replace(/[,()]/g, "");
    if (safe) {
      query = query.or(
        `full_name.ilike.%${safe}%,company_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("[leads] List failed:", error.message);
    return NextResponse.json({ error: "Could not load leads." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

// Fired by the "Export CSV" button in the admin leads UI — the CSV itself is
// built client-side from already-fetched rows (no server round trip for the
// file), so this just records that an export happened.
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin", "sales", "viewer"]);
  if (!auth.ok) return auth.response;
  const { session } = auth;

  let count: number | undefined;
  try {
    const raw = await request.json();
    if (raw && typeof raw === "object" && typeof (raw as { count?: unknown }).count === "number") {
      count = (raw as { count: number }).count;
    }
  } catch {
    // Body is optional — a missing/invalid one just means we log without a count.
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "leads_export",
    entityType: "consultation_leads",
    metadata: count === undefined ? {} : { count },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
