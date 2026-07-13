import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin-only Supabase client (service role key). Bypasses RLS entirely.
 *
 * Must never be imported from client components — the `server-only` import
 * above makes any accidental client-bundle inclusion a build error.
 * Only call this from app/api/admin/* route handlers, after verifying the
 * admin session.
 */
export function getAdminSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
