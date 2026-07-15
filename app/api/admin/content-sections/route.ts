import { NextResponse } from "next/server";
import { requireAdminSupabase } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";

// Generic editor for every multi-page-site route except the homepage (which
// keeps its own dedicated homepage_content table/route). One row per
// (page_slug, section_key) in content_sections — GET returns every section
// saved for a page, PATCH upserts exactly one section's row, so saving one
// section can never touch another.

export async function GET(request: Request) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("content_sections")
    .select("section_key, content, is_visible, order_index, updated_at")
    .eq("page_slug", slug);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sections: Record<
    string,
    { content: unknown; isVisible: boolean; orderIndex: number; updatedAt: string }
  > = {};
  for (const row of data ?? []) {
    sections[row.section_key] = {
      content: row.content,
      isVisible: row.is_visible,
      orderIndex: row.order_index,
      updatedAt: row.updated_at,
    };
  }

  return NextResponse.json(sections);
}

export async function PATCH(request: Request) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: { pageSlug?: unknown; sectionKey?: unknown; content?: unknown; isVisible?: unknown };
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = raw as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { pageSlug, sectionKey, content, isVisible } = body;
  if (typeof pageSlug !== "string" || !pageSlug) {
    return NextResponse.json({ error: "Missing pageSlug." }, { status: 400 });
  }
  if (typeof sectionKey !== "string" || !sectionKey) {
    return NextResponse.json({ error: "Missing sectionKey." }, { status: 400 });
  }
  if (!content || typeof content !== "object") {
    return NextResponse.json({ error: "Missing section content." }, { status: 400 });
  }

  const row: Record<string, unknown> = {
    page_slug: pageSlug,
    section_key: sectionKey,
    content: deepNormalize(content as Record<string, unknown>),
    updated_at: new Date().toISOString(),
  };
  // Only included (and therefore only overwritten on conflict) when the
  // caller explicitly sends it — omitting it here leaves an existing row's
  // visibility untouched instead of resetting it to the column default.
  if (typeof isVisible === "boolean") row.is_visible = isVisible;

  const { error } = await supabase
    .from("content_sections")
    .upsert(row, { onConflict: "page_slug,section_key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
