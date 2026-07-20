import "server-only";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminSession, type AdminSession } from "@/lib/admin/session";
import { getAdminSupabase } from "@/lib/supabase/server";
import type { Role } from "@/lib/admin/roles";

type AuthResult =
  | { ok: true; supabase: SupabaseClient; session: AdminSession }
  | { ok: false; response: NextResponse };

/**
 * Every app/api/admin/* route handler calls this first. It independently
 * re-verifies the session cookie (proxy.ts only does an optimistic redirect
 * for page navigation) and hands back a service-role Supabase client that
 * bypasses RLS, plus the caller's session (userId/email/name/role).
 */
export async function requireAdminSupabase(): Promise<AuthResult> {
  const session = await requireAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Supabase is not configured on the server. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      ),
    };
  }

  return { ok: true, supabase, session };
}

/**
 * Same as requireAdminSupabase, but also rejects with 403 when the caller's
 * role isn't in `allowedRoles`. Use for routes with role-specific access.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthResult> {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth;

  if (!allowedRoles.includes(auth.session.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "You don't have permission to do this." }, { status: 403 }),
    };
  }

  return auth;
}

/**
 * For DB-backed sessions (userId set), re-reads role/is_active fresh from
 * admin_users instead of trusting the JWT — guards the highest-sensitivity
 * routes (user management itself) against an already-issued session
 * outliving a role change or deactivation. Env-fallback sessions (userId
 * null) have no DB row to check and are trusted as-is.
 */
export async function requireFreshRole(allowedRoles: Role[]): Promise<AuthResult> {
  const auth = await requireRole(allowedRoles);
  if (!auth.ok) return auth;

  const { session, supabase } = auth;
  if (session.userId === null) return auth;

  const { data, error } = await supabase
    .from("admin_users")
    .select("role, is_active")
    .eq("id", session.userId)
    .maybeSingle();

  if (error || !data || !data.is_active || !allowedRoles.includes(data.role as Role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Your access has changed. Please sign in again." }, { status: 403 }),
    };
  }

  return auth;
}

/**
 * Lightweight CSRF defense for admin mutation routes (POST/PATCH/PUT/
 * DELETE): rejects the request when its Origin doesn't match the site's own
 * Host. sameSite=lax on the session cookie already blocks the classic
 * cross-site form/fetch attack in modern browsers — this is an explicit,
 * independent second layer. Requests with no Origin header (e.g. some
 * same-origin navigations, non-browser tooling) are allowed through; the
 * session cookie check remains the real authorization boundary. Always
 * returns a JSON response, never a redirect, so API auth failures never
 * surface as an HTML redirect to a caller expecting JSON.
 */
export function assertSameOrigin(request: Request): NextResponse | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const host = request.headers.get("host");
  if (!host) return null;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  if (originHost !== host) {
    return NextResponse.json({ error: "Cross-site requests are not allowed." }, { status: 403 });
  }

  return null;
}
