import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";
import { isValidUrlOrPath } from "@/lib/validate";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.cta_href === "string" && body.cta_href && !isValidUrlOrPath(body.cta_href)) {
    return NextResponse.json({ error: "CTA link must be a valid URL or path." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.slug === "string") update.slug = body.slug;
  if (typeof body.name === "string") update.name = body.name;
  if (typeof body.problem === "string") update.problem = body.problem;
  if (typeof body.solution === "string") update.solution = body.solution;
  if (typeof body.cta_text === "string") update.cta_text = body.cta_text;
  if (typeof body.cta_href === "string") update.cta_href = body.cta_href;
  if (typeof body.order_index === "number") update.order_index = body.order_index;
  if (typeof body.is_visible === "boolean") update.is_visible = body.is_visible;

  const { data, error } = await supabase
    .from("industry_cards")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[industry-cards] Update failed:", error.message);
    return NextResponse.json({ error: "Could not update industry card." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "industry_cards",
    entityId: id,
    metadata: { op: "update" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;
  const { id } = await params;

  const { error } = await supabase.from("industry_cards").delete().eq("id", id);

  if (error) {
    console.error("[industry-cards] Delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete industry card." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "industry_cards",
    entityId: id,
    metadata: { op: "delete" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
