import { NextResponse } from "next/server";
import { requireAdminSupabase } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";

export async function GET() {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("homepage_content")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Homepage content not found." }, { status: 500 });
  }

  return NextResponse.json({
    heroBadge: data.hero_badge,
    heroHeadline: data.hero_headline,
    heroRotatingWords: data.hero_rotating_words ?? [],
    heroSubheadline: data.hero_subheadline,
    primaryCtaText: data.primary_cta_text,
    primaryCtaLink: data.primary_cta_link,
    secondaryCtaText: data.secondary_cta_text,
    secondaryCtaLink: data.secondary_cta_link,
    stats: data.stats ?? [],
    growthSteps: data.growth_steps ?? [],
    finalCta: data.final_cta,
  });
}

// Each key here owns a disjoint set of columns, so a PATCH for one section
// can never touch another section's data — there is no read-modify-write
// step and no full-object overwrite path.
const SECTION_COLUMNS: Record<string, (d: Record<string, unknown>) => Record<string, unknown>> = {
  hero: (d) => ({
    hero_badge: d.heroBadge,
    hero_headline: d.heroHeadline,
    hero_rotating_words: d.heroRotatingWords,
    hero_subheadline: d.heroSubheadline,
    primary_cta_text: d.primaryCtaText,
    primary_cta_link: d.primaryCtaLink,
    secondary_cta_text: d.secondaryCtaText,
    secondary_cta_link: d.secondaryCtaLink,
  }),
  stats: (d) => ({ stats: d.stats }),
  growthSteps: (d) => ({ growth_steps: d.growthSteps }),
  finalCta: (d) => ({ final_cta: d.finalCta }),
};

function validateSection(section: string, d: Record<string, unknown>): string | null {
  switch (section) {
    case "hero":
      if (typeof d.heroBadge !== "string" || typeof d.heroHeadline !== "string") {
        return "Badge and headline are required.";
      }
      if (!Array.isArray(d.heroRotatingWords)) return "Rotating words must be a list.";
      return null;
    case "stats":
      if (!Array.isArray(d.stats)) return "Stats must be a list.";
      return null;
    case "growthSteps":
      if (!Array.isArray(d.growthSteps)) return "Growth steps must be a list.";
      return null;
    case "finalCta":
      if (!d.finalCta || typeof d.finalCta !== "object") return "Final CTA is required.";
      return null;
    default:
      return "Unknown section.";
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: { section?: unknown; data?: unknown };
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = raw as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const section = body.section;
  if (typeof section !== "string" || !(section in SECTION_COLUMNS)) {
    return NextResponse.json({ error: "Unknown section." }, { status: 400 });
  }
  if (!body.data || typeof body.data !== "object") {
    return NextResponse.json({ error: "Missing section data." }, { status: 400 });
  }

  const data = deepNormalize(body.data as Record<string, unknown>);
  const validationError = validateSection(section, data);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const columns = SECTION_COLUMNS[section](data);

  const { error } = await supabase
    .from("homepage_content")
    .update({ ...columns, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
