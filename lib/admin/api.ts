import "server-only";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminSupabase } from "@/lib/supabase/server";

type AuthResult =
  | { ok: true; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

/**
 * Every app/api/admin/* route handler calls this first. It independently
 * re-verifies the session cookie (proxy.ts only does an optimistic redirect
 * for page navigation) and hands back a service-role Supabase client that
 * bypasses RLS.
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

  return { ok: true, supabase };
}
