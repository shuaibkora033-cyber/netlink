import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { LEAD_QUALITIES } from "@/lib/leads";

export type DashboardStats = {
  newThisWeek: number;
  hotLeads: number;
  awaitingReply: number;
  bookedThisMonth: number;
};

const HOT_LEAD_MIN_SCORE = LEAD_QUALITIES.find((tier) => tier.value === "hot_lead")!.min;

/** Most recent Monday 00:00:00.000 UTC — the app has no stored per-admin
 * timezone anywhere in the schema, so every boundary here is UTC, giving
 * every admin the same number regardless of their own browser timezone. */
function startOfIsoWeekUTC(now: Date): string {
  const day = now.getUTCDay(); // 0 = Sunday .. 6 = Saturday
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday, 0, 0, 0, 0)
  ).toISOString();
}

function startOfMonthUTC(now: Date): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

/**
 * Four independent count-only queries (head: true — no rows transferred,
 * just the match count) against the existing consultation_leads table. No
 * new table, no schema change, no unbounded row fetch. See the KPI
 * definitions table in the Phase 3 plan for exactly what each one means:
 *
 *  - newThisWeek:     created_at >= this ISO week's Monday 00:00 UTC
 *  - hotLeads:        lead_score >= the "hot_lead" tier min from lib/leads.ts
 *  - awaitingReply:   status = 'contacted' AND follow_up_date IS NULL
 *  - bookedThisMonth: status = 'booked' AND created_at >= this month's start (UTC)
 *
 * bookedThisMonth caveat: consultation_leads has no booked_at / status-change
 * timestamp — only created_at (submission time) and a generic updated_at
 * that any field edit bumps (notes, follow-up date, etc.), so it can't be
 * used as a booking-date proxy without false positives. This metric is
 * therefore "submitted this month AND currently Booked," not "became Booked
 * this month" — a lead submitted last month that got booked today is not
 * counted. The UI hint text ("Submitted & booked this month") says this
 * explicitly so the number is never misread as a true booking date.
 *
 * All four exclude archived = true, matching the leads list's own default
 * ("hide archived" is the default view there too).
 */
export async function getDashboardStats(supabase: SupabaseClient): Promise<DashboardStats> {
  const now = new Date();
  const weekStart = startOfIsoWeekUTC(now);
  const monthStart = startOfMonthUTC(now);

  const base = () => supabase.from("consultation_leads").select("id", { count: "exact", head: true }).eq("archived", false);

  const [newThisWeek, hotLeads, awaitingReply, bookedThisMonth] = await Promise.all([
    base().gte("created_at", weekStart),
    base().gte("lead_score", HOT_LEAD_MIN_SCORE),
    base().eq("status", "contacted").is("follow_up_date", null),
    base().eq("status", "booked").gte("created_at", monthStart),
  ]);

  for (const result of [newThisWeek, hotLeads, awaitingReply, bookedThisMonth]) {
    if (result.error) throw new Error(result.error.message);
  }

  return {
    newThisWeek: newThisWeek.count ?? 0,
    hotLeads: hotLeads.count ?? 0,
    awaitingReply: awaitingReply.count ?? 0,
    bookedThisMonth: bookedThisMonth.count ?? 0,
  };
}
