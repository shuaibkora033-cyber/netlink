import { cache } from "react";
import { getPublicSupabase } from "@/lib/supabase/client";
import { industries, industryDetails } from "@/lib/content";

export type IndustryCard = {
  id: string;
  slug: string;
  name: string;
  problem: string;
  solution: string;
  ctaText: string;
  ctaHref: string;
};

export const DEFAULT_INDUSTRY_CARDS: IndustryCard[] = industries.map((ind) => ({
  id: `default-${ind.id}`,
  slug: ind.id,
  name: ind.name,
  problem: industryDetails[ind.id]?.problem ?? "",
  solution: industryDetails[ind.id]?.solution ?? "",
  ctaText: "Book a Free Growth Consultation",
  ctaHref: "/book-consultation",
}));

type IndustryCardRow = {
  id: string;
  slug: string;
  name: string;
  problem: string;
  solution: string;
  cta_text: string;
  cta_href: string;
};

/**
 * Single source of truth for industries — feeds both the homepage's compact
 * grid and the full /industries page. `cache()`-wrapped so a single request
 * that renders both (there isn't one today, but the homepage and
 * /industries could share a layout later) only queries once.
 */
export const getIndustryCards = cache(async function getIndustryCards(): Promise<IndustryCard[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_INDUSTRY_CARDS;

  try {
    const { data, error } = await supabase
      .from("industry_cards")
      .select("id, slug, name, problem, solution, cta_text, cta_href")
      .eq("is_visible", true)
      .order("order_index", { ascending: true })
      .returns<IndustryCardRow[]>();

    if (error || !data || data.length === 0) return DEFAULT_INDUSTRY_CARDS;

    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      problem: row.problem,
      solution: row.solution,
      ctaText: row.cta_text,
      ctaHref: row.cta_href,
    }));
  } catch {
    return DEFAULT_INDUSTRY_CARDS;
  }
});
