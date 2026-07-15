import { getPublicSupabase } from "@/lib/supabase/client";
import { clients as staticClients, type Client } from "@/lib/clients";

export const DEFAULT_CLIENTS: Client[] = staticClients;

type ClientRow = {
  id: string;
  name: string;
  logo_url: string | null;
  needs_light_hover: boolean;
  scale: number | null;
};

/** Reads the admin-editable client logo list, falling back to the static marquee otherwise. */
export async function getClients(): Promise<Client[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_CLIENTS;

  try {
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, logo_url, needs_light_hover, scale")
      .eq("is_visible", true)
      .order("order_index", { ascending: true })
      .returns<ClientRow[]>();

    if (error || !data || data.length === 0) return DEFAULT_CLIENTS;

    return data.map((row) => ({
      name: row.name,
      logo: row.logo_url ?? "",
      alt: row.name,
      needsLightHover: row.needs_light_hover,
      scale: row.scale ?? undefined,
    }));
  } catch {
    return DEFAULT_CLIENTS;
  }
}
