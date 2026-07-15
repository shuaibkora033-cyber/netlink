import { getPublicSupabase } from "@/lib/supabase/client";
import { services as staticServices } from "@/lib/content";

export type ServiceItem = {
  id: string;
  iconKey: string;
  title: string;
  text: string;
  features: string[];
  span: 1 | 2;
  linkHref: string | null;
};

export const DEFAULT_SERVICES: ServiceItem[] = staticServices.map((s) => ({
  id: s.id,
  iconKey: s.id,
  title: s.title,
  text: s.text,
  features: [...s.features],
  span: s.span,
  linkHref: null,
}));

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  icon_key: string | null;
  link_href: string | null;
};

/**
 * Reads the admin-editable services list (title/description/link), falling
 * back to the static bento grid otherwise. The `features` pills and `span`
 * (wide vs. standard card) aren't part of the admin's editable field set —
 * they're carried over from the matching static entry (joined on icon_key,
 * which the seed data already sets to the same id used in lib/content.ts),
 * so the bento layout's visual design is preserved. A brand-new service
 * added only in the admin (no static match) renders as a standard-width
 * card with no feature pills instead of guessing a layout for it.
 */
export async function getServices(): Promise<ServiceItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_SERVICES;

  try {
    const { data, error } = await supabase
      .from("services")
      .select("id, title, description, icon_key, link_href")
      .eq("is_visible", true)
      .order("order_index", { ascending: true })
      .returns<ServiceRow[]>();

    if (error || !data || data.length === 0) return DEFAULT_SERVICES;

    return data.map((row) => {
      const staticMatch = staticServices.find((s) => s.id === row.icon_key);
      return {
        id: row.id,
        iconKey: row.icon_key ?? staticMatch?.id ?? "",
        title: row.title,
        text: row.description,
        features: staticMatch ? [...staticMatch.features] : [],
        span: staticMatch ? staticMatch.span : 1,
        linkHref: row.link_href,
      };
    });
  } catch {
    return DEFAULT_SERVICES;
  }
}
