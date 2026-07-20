import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

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

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.industry === "string") update.industry = body.industry;
  if (typeof body.title === "string") update.title = body.title;
  if (typeof body.body === "string") update.body = body.body;
  if (typeof body.challenge === "string") update.challenge = body.challenge;
  if (typeof body.solution === "string") update.solution = body.solution;
  if (typeof body.result === "string") update.result = body.result;
  if (Array.isArray(body.metrics)) update.metrics = body.metrics;
  if (typeof body.order_index === "number") update.order_index = body.order_index;
  if (typeof body.is_visible === "boolean") update.is_visible = body.is_visible;

  const { data, error } = await supabase
    .from("case_studies")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[case-studies] Update failed:", error.message);
    return NextResponse.json({ error: "Could not update case study." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "case_studies",
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

  const { error } = await supabase.from("case_studies").delete().eq("id", id);

  if (error) {
    console.error("[case-studies] Delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete case study." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "case_studies",
    entityId: id,
    metadata: { op: "delete" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
