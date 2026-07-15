import { getPublicSupabase } from "@/lib/supabase/client";
import { faqs as staticFaqs } from "@/lib/content";

export type FaqItem = { id: string; q: string; a: string; relatedPage: string | null };

export const DEFAULT_FAQS: FaqItem[] = staticFaqs.map((f, i) => ({
  id: `default-${i}`,
  q: f.q,
  a: f.a,
  relatedPage: null,
}));

type FaqRow = { id: string; question: string; answer: string; related_page: string | null };

/** Reads the admin-editable FAQ list, falling back to the static list otherwise. */
export async function getFaqs(): Promise<FaqItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_FAQS;

  try {
    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, related_page")
      .eq("is_visible", true)
      .order("order_index", { ascending: true })
      .returns<FaqRow[]>();

    if (error || !data || data.length === 0) return DEFAULT_FAQS;

    return data.map((row) => ({ id: row.id, q: row.question, a: row.answer, relatedPage: row.related_page }));
  } catch {
    return DEFAULT_FAQS;
  }
}
