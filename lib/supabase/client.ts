import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Public, read-only Supabase client (anon key). Safe to use from server
 * components for public data fetches — RLS restricts it to visible rows.
 *
 * Returns null when Supabase isn't configured, so callers can fall back to
 * static content instead of throwing during local development.
 */
export function getPublicSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
