import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";
import {
  isRecord,
  isArrayOf,
  isArrayOfStrings,
  isValidStatItem,
  isValidGrowthStepItem,
} from "@/lib/validate";

export async function GET() {
  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("homepage_content")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[homepage] Load failed:", error.message);
    return NextResponse.json({ error: "Could not load homepage content." }, { status: 500 });
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
//
// `data` is the section's own value exactly as the editor sends it (see
// HomepageEditor.tsx's saveSection: `{ section: key, data: section.data }`)
// — for "stats"/"growthSteps" that's a bare array, for "hero"/"finalCta"
// that's a flat object. It is NOT wrapped again under a same-named key, so
// column mappers/validators below read `d` directly rather than `d.stats`
// etc. (that mismatch was the "Stats must be a list" bug — `d.stats` on an
// array is always undefined, so the array check always failed).
const SECTION_COLUMNS: Record<string, (d: unknown) => Record<string, unknown>> = {
  hero: (d) => {
    const hero = d as Record<string, unknown>;
    return {
      hero_badge: hero.heroBadge,
      hero_headline: hero.heroHeadline,
      hero_rotating_words: hero.heroRotatingWords,
      hero_subheadline: hero.heroSubheadline,
      primary_cta_text: hero.primaryCtaText,
      primary_cta_link: hero.primaryCtaLink,
      secondary_cta_text: hero.secondaryCtaText,
      secondary_cta_link: hero.secondaryCtaLink,
    };
  },
  stats: (d) => ({ stats: d }),
  growthSteps: (d) => ({ growth_steps: d }),
  finalCta: (d) => ({ final_cta: d }),
};

function validateSection(section: string, d: unknown): string | null {
  switch (section) {
    case "hero": {
      if (!isRecord(d)) return "Invalid hero data.";
      if (typeof d.heroBadge !== "string" || typeof d.heroHeadline !== "string") {
        return "Badge and headline are required.";
      }
      if (!isArrayOfStrings(d.heroRotatingWords)) return "Rotating words must be a list.";
      return null;
    }
    case "stats":
      if (!Array.isArray(d)) return "Stats must be a list.";
      if (!isArrayOf(d, isValidStatItem)) {
        return "Each stat needs a value and label (suffix is optional).";
      }
      return null;
    case "growthSteps":
      if (!Array.isArray(d)) return "Growth steps must be a list.";
      if (!isArrayOf(d, isValidGrowthStepItem)) {
        return "Each growth step needs a num, title, and text.";
      }
      return null;
    case "finalCta": {
      if (!isRecord(d)) return "Final CTA is required.";
      if (typeof d.eyebrow !== "string" || typeof d.title !== "string" || typeof d.text !== "string") {
        return "Final CTA eyebrow, title, and text are required.";
      }
      if (!isArrayOfStrings(d.bullets)) return "Final CTA bullets must be a list.";
      return null;
    }
    default:
      return "Unknown section.";
  }
}

export async function PATCH(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;

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

  const data = deepNormalize(body.data);
  const validationError = validateSection(section, data);
  if (validationError) {
    // Temporary diagnostic for the stats-validation investigation — shape
    // only (keys/types), never the actual field values.
    if (section === "stats") {
      console.error("[homepage] Invalid stats payload:", {
        receivedType: Array.isArray(data) ? "array" : typeof data,
        itemCount: Array.isArray(data) ? data.length : undefined,
        itemShapes: Array.isArray(data)
          ? data.map((item) =>
              item && typeof item === "object" && !Array.isArray(item)
                ? Object.fromEntries(
                    Object.entries(item as Record<string, unknown>).map(([k, v]) => [k, typeof v])
                  )
                : typeof item
            )
          : undefined,
      });
    }
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const columns = SECTION_COLUMNS[section](data);

  const { error } = await supabase
    .from("homepage_content")
    .update({ ...columns, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    console.error("[homepage] Update failed:", error.message);
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "homepage_content",
    entityId: section,
    metadata: { op: "update", section },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
