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
    industries: data.industries ?? [],
    finalCta: data.final_cta,
  });
}

export async function PUT(request: Request) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.heroHeadline !== "string" || typeof body.primaryCtaText !== "string") {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { error } = await supabase
    .from("homepage_content")
    .update({
      hero_badge: body.heroBadge,
      hero_headline: body.heroHeadline,
      hero_rotating_words: body.heroRotatingWords,
      hero_subheadline: body.heroSubheadline,
      primary_cta_text: body.primaryCtaText,
      primary_cta_link: body.primaryCtaLink,
      secondary_cta_text: body.secondaryCtaText,
      secondary_cta_link: body.secondaryCtaLink,
      stats: body.stats,
      growth_steps: body.growthSteps,
      industries: body.industries,
      final_cta: body.finalCta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
