import { getPublicSupabase } from "@/lib/supabase/client";

export type PageSectionsMap = Record<string, Record<string, unknown>>;

/**
 * Fetches every saved, visible content_sections row for a page, keyed by
 * section_key. Returns {} on any failure or when Supabase isn't configured
 * — callers always merge this against their own static fallback per
 * section, so a missing/broken row never breaks the page.
 */
export async function getPageSections(slug: string): Promise<PageSectionsMap> {
  const supabase = getPublicSupabase();
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from("content_sections")
      .select("section_key, content")
      .eq("page_slug", slug)
      .eq("is_visible", true);

    if (error || !data) return {};

    const sections: PageSectionsMap = {};
    for (const row of data) {
      if (row.content && typeof row.content === "object" && Object.keys(row.content).length > 0) {
        sections[row.section_key as string] = row.content as Record<string, unknown>;
      }
    }
    return sections;
  } catch {
    return {};
  }
}

/** Returns the Supabase-saved section content if present, else `fallback`. */
export function pickSection<T>(sections: PageSectionsMap, key: string, fallback: T): T {
  const found = sections[key];
  return found ? (found as unknown as T) : fallback;
}
