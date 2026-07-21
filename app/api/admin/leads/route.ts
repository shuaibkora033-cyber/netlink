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

// Columns the table view is allowed to sort by — a text/enum column like
// `status` is deliberately excluded: its values ('new', 'contacted', ...)
// have no meaningful alphabetical order, so sorting by it wouldn't reflect
// real pipeline progression. Same reasoning excludes budget/service/industry
// (fixed option lists in lib/leads.ts, not alphabetically ordered either).
const SORT_COLUMNS = new Set(["full_name", "lead_score", "created_at"]);
type SortColumn = "full_name" | "lead_score" | "created_at";

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

  // Pagination is strictly opt-in via `page` — omitting it preserves the
  // exact prior behavior (every matching row, single array response, no
  // count query). The CSV export flow relies on that: it always calls this
  // route without `page`, so it keeps exporting the full filtered set,
  // never just one page, with zero changes to its own code.
  const pageParam = url.searchParams.get("page");
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : null;
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20));

  const sortByParam = url.searchParams.get("sortBy");
  const sortBy: SortColumn = sortByParam && SORT_COLUMNS.has(sortByParam) ? (sortByParam as SortColumn) : "created_at";
  const sortDir = url.searchParams.get("sortDir") === "asc" ? "asc" : "desc";

  let query = supabase
    .from("consultation_leads")
    .select(
      "id, full_name, email, phone, company_name, website_url, service_needed, industry, monthly_marketing_budget, current_lead_source, main_problem, preferred_contact_method, status, lead_score, admin_notes, follow_up_date, last_contacted_at, archived, created_at",
      page !== null ? { count: "exact" } : undefined
    )
    .order(sortBy, { ascending: sortDir === "asc" });

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

  if (page !== null) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[leads] List failed:", error.message);
    return NextResponse.json({ error: "Could not load leads." }, { status: 500 });
  }

  if (page !== null) {
    return NextResponse.json({ leads: data ?? [], total: count ?? 0, page, pageSize });
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
