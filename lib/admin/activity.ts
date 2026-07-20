import "server-only";
import { getAdminSupabase } from "@/lib/supabase/server";

/**
 * The fixed set of actions we log — medium-detail auditing of important
 * admin actions only (not every click/page view), per the approved plan.
 */
export type ActivityAction =
  | "login_success"
  | "login_failed"
  | "logout"
  | "user_create"
  | "user_update"
  | "user_deactivate"
  | "user_activate"
  | "user_delete"
  | "user_password_change"
  | "media_upload"
  | "media_delete"
  | "cms_update"
  | "lead_status_update"
  | "lead_notes_update"
  | "lead_follow_up_update"
  | "leads_export";

type LogParams = {
  adminUserId: string | null;
  action: ActivityAction;
  entityType?: string;
  entityId?: string | null;
  /** Must be built from an explicit allow-list of fields by the caller —
   * never pass a raw request body here. Never include passwords, password
   * hashes, API keys, session secrets, or full lead payloads. */
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") ?? "unknown";
}

/**
 * Best-effort activity logging — never throws and never blocks the
 * caller's actual response on failure (a logging outage must not break the
 * admin dashboard). Callers pass an explicit, already-scrubbed `metadata`
 * object; this function does not inspect or filter it further.
 */
export async function logAdminActivity(params: LogParams): Promise<void> {
  try {
    const supabase = getAdminSupabase();
    if (!supabase) return;

    const { error } = await supabase.from("admin_activity_logs").insert({
      admin_user_id: params.adminUserId,
      action: params.action,
      entity_type: params.entityType ?? null,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? {},
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    });

    if (error) {
      console.error("[logAdminActivity] Insert failed:", error.message);
    }
  } catch (err) {
    console.error("[logAdminActivity] Unexpected error:", err);
  }
}
