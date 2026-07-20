import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { DEFAULT_HOMEPAGE_CONTENT, DEFAULT_CASE_STUDIES } from "@/lib/data/homepage";
import { DEFAULT_INDUSTRY_CARDS } from "@/lib/data/industryCards";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

/**
 * Explicit, admin-triggered reset — never run automatically. Overwrites the
 * homepage_content singleton row and replaces all case_studies and
 * industry_cards rows with the current code defaults (lib/content.ts). Used
 * to push a positioning change (like agency → lead-gen) into Supabase
 * without hand-retyping every field through the section forms.
 *
 * Scoped to owner/admin only (not editor) — unlike routine section saves,
 * this bulk-deletes and replaces every case study and industry card row.
 */
export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;

  const d = DEFAULT_HOMEPAGE_CONTENT;

  const { error: homepageError } = await supabase
    .from("homepage_content")
    .update({
      hero_badge: d.heroBadge,
      hero_headline: d.heroHeadline,
      hero_rotating_words: d.heroRotatingWords,
      hero_subheadline: d.heroSubheadline,
      primary_cta_text: d.primaryCtaText,
      primary_cta_link: d.primaryCtaLink,
      secondary_cta_text: d.secondaryCtaText,
      secondary_cta_link: d.secondaryCtaLink,
      stats: d.stats,
      growth_steps: d.growthSteps,
      final_cta: d.finalCta,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (homepageError) {
    console.error("[homepage/reset] Homepage update failed:", homepageError.message);
    return NextResponse.json({ error: "Reset failed. Please try again." }, { status: 500 });
  }

  const { error: deleteError } = await supabase
    .from("case_studies")
    .delete()
    .not("id", "is", null);

  if (deleteError) {
    console.error("[homepage/reset] Case studies delete failed:", deleteError.message);
    return NextResponse.json({ error: "Reset failed. Please try again." }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("case_studies").insert(
    DEFAULT_CASE_STUDIES.map((c, i) => ({
      industry: c.industry,
      title: c.title,
      body: c.body,
      metrics: c.metrics,
      order_index: i,
      is_visible: true,
    }))
  );

  if (insertError) {
    console.error("[homepage/reset] Case studies insert failed:", insertError.message);
    return NextResponse.json({ error: "Reset failed. Please try again." }, { status: 500 });
  }

  const { error: deleteIndustriesError } = await supabase
    .from("industry_cards")
    .delete()
    .not("id", "is", null);

  if (deleteIndustriesError) {
    console.error("[homepage/reset] Industry cards delete failed:", deleteIndustriesError.message);
    return NextResponse.json({ error: "Reset failed. Please try again." }, { status: 500 });
  }

  const { error: insertIndustriesError } = await supabase.from("industry_cards").insert(
    DEFAULT_INDUSTRY_CARDS.map((c, i) => ({
      slug: c.slug,
      name: c.name,
      problem: c.problem,
      solution: c.solution,
      cta_text: c.ctaText,
      cta_href: c.ctaHref,
      order_index: i,
      is_visible: true,
    }))
  );

  if (insertIndustriesError) {
    console.error("[homepage/reset] Industry cards insert failed:", insertIndustriesError.message);
    return NextResponse.json({ error: "Reset failed. Please try again." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "homepage_content",
    entityId: "reset",
    metadata: { op: "reset_to_defaults" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
