import { getPublicSupabase } from "@/lib/supabase/client";
import { hero, stats, process as growthProcess, industries, contact, caseStudies } from "@/lib/content";
import { getIndustryCards } from "@/lib/data/industryCards";

export type Stat = { value: number; suffix: string; label: string };
export type GrowthStep = { num: string; title: string; text: string };
export type IndustryItem = { id: string; name: string };
export type FinalCta = { eyebrow: string; title: string; text: string; bullets: string[] };

export type HomepageContent = {
  heroBadge: string;
  heroHeadline: string;
  heroRotatingWords: string[];
  heroSubheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  stats: Stat[];
  growthSteps: GrowthStep[];
  industries: IndustryItem[];
  finalCta: FinalCta;
};

export type CaseStudy = {
  id: string;
  industry: string;
  title: string;
  body: string;
  metrics: { value: string; label: string }[];
};

export const DEFAULT_HOMEPAGE_CONTENT: HomepageContent = {
  heroBadge: hero.eyebrow,
  heroHeadline: hero.headlineStart,
  heroRotatingWords: [...hero.rotatingWords],
  heroSubheadline: hero.subheadline,
  primaryCtaText: hero.primaryCta,
  primaryCtaLink: "/book-consultation",
  secondaryCtaText: hero.secondaryCta,
  secondaryCtaLink: "/book-consultation",
  stats: stats.map((s) => ({ value: s.value, suffix: s.suffix, label: s.label })),
  growthSteps: growthProcess.steps.map((s) => ({ num: s.num, title: s.title, text: s.text })),
  industries: industries.map((i) => ({ id: i.id, name: i.name })),
  finalCta: {
    eyebrow: contact.eyebrow,
    title: contact.title,
    text: contact.text,
    bullets: [...contact.bullets],
  },
};

export const DEFAULT_CASE_STUDIES: CaseStudy[] = caseStudies.map((c, i) => ({
  id: `default-${i}`,
  industry: c.industry,
  title: c.title,
  body: c.text,
  metrics: c.metrics.map((m) => ({ value: m.value, label: m.label })),
}));

type HomepageContentRow = {
  hero_badge: string;
  hero_headline: string;
  hero_rotating_words: string[] | null;
  hero_subheadline: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
  stats: Stat[] | null;
  growth_steps: GrowthStep[] | null;
  final_cta: FinalCta | null;
};

export async function getHomepageContent(): Promise<HomepageContent> {
  const supabase = getPublicSupabase();
  // Industries are now a single shared dataset (industry_cards table, via
  // getIndustryCards) also used by the /industries page — the
  // homepage_content.industries column below is no longer written to and is
  // only kept for backward compatibility with old rows; it's never read.
  const industriesPromise = getIndustryCards().then((cards) =>
    cards.map((c) => ({ id: c.slug, name: c.name }))
  );

  if (!supabase) {
    return { ...DEFAULT_HOMEPAGE_CONTENT, industries: await industriesPromise };
  }

  try {
    const [{ data, error }, sharedIndustries] = await Promise.all([
      supabase
        .from("homepage_content")
        .select(
          "hero_badge, hero_headline, hero_rotating_words, hero_subheadline, primary_cta_text, primary_cta_link, secondary_cta_text, secondary_cta_link, stats, growth_steps, final_cta"
        )
        .eq("id", 1)
        .maybeSingle<HomepageContentRow>(),
      industriesPromise,
    ]);

    if (error || !data) return { ...DEFAULT_HOMEPAGE_CONTENT, industries: sharedIndustries };

    return {
      heroBadge: data.hero_badge ?? DEFAULT_HOMEPAGE_CONTENT.heroBadge,
      heroHeadline: data.hero_headline ?? DEFAULT_HOMEPAGE_CONTENT.heroHeadline,
      heroRotatingWords:
        data.hero_rotating_words && data.hero_rotating_words.length > 0
          ? data.hero_rotating_words
          : DEFAULT_HOMEPAGE_CONTENT.heroRotatingWords,
      heroSubheadline: data.hero_subheadline ?? DEFAULT_HOMEPAGE_CONTENT.heroSubheadline,
      primaryCtaText: data.primary_cta_text ?? DEFAULT_HOMEPAGE_CONTENT.primaryCtaText,
      primaryCtaLink: data.primary_cta_link ?? DEFAULT_HOMEPAGE_CONTENT.primaryCtaLink,
      secondaryCtaText: data.secondary_cta_text ?? DEFAULT_HOMEPAGE_CONTENT.secondaryCtaText,
      secondaryCtaLink: data.secondary_cta_link ?? DEFAULT_HOMEPAGE_CONTENT.secondaryCtaLink,
      stats: data.stats && data.stats.length > 0 ? data.stats : DEFAULT_HOMEPAGE_CONTENT.stats,
      growthSteps:
        data.growth_steps && data.growth_steps.length > 0
          ? data.growth_steps
          : DEFAULT_HOMEPAGE_CONTENT.growthSteps,
      industries: sharedIndustries,
      finalCta: data.final_cta ?? DEFAULT_HOMEPAGE_CONTENT.finalCta,
    };
  } catch {
    return { ...DEFAULT_HOMEPAGE_CONTENT, industries: await industriesPromise.catch(() => DEFAULT_HOMEPAGE_CONTENT.industries) };
  }
}

type CaseStudyRow = {
  id: string;
  industry: string;
  title: string;
  body: string;
  metrics: { value: string; label: string }[] | null;
};

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return DEFAULT_CASE_STUDIES;

  try {
    const { data, error } = await supabase
      .from("case_studies")
      .select("id, industry, title, body, metrics")
      .eq("is_visible", true)
      .order("order_index", { ascending: true })
      .returns<CaseStudyRow[]>();

    if (error || !data || data.length === 0) return DEFAULT_CASE_STUDIES;

    return data.map((row) => ({
      id: row.id,
      industry: row.industry,
      title: row.title,
      body: row.body,
      metrics: row.metrics ?? [],
    }));
  } catch {
    return DEFAULT_CASE_STUDIES;
  }
}
