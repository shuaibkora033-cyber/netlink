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

  if (typeof body.logo_url === "string" && body.logo_url && !isValidUrlOrPath(body.logo_url)) {
    return NextResponse.json({ error: "Logo URL must be a valid URL or path." }, { status: 400 });
  }
  if (typeof body.website_url === "string" && body.website_url && !isValidUrlOrPath(body.website_url)) {
    return NextResponse.json({ error: "Website URL must be a valid URL." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.name === "string") update.name = body.name;
  if (typeof body.logo_url === "string") update.logo_url = body.logo_url;
  if (typeof body.website_url === "string") update.website_url = body.website_url;
  if (typeof body.industry === "string") update.industry = body.industry;
  if (typeof body.needs_light_hover === "boolean") update.needs_light_hover = body.needs_light_hover;
  if (typeof body.scale === "number") update.scale = body.scale;
  if (typeof body.order_index === "number") update.order_index = body.order_index;
  if (typeof body.is_visible === "boolean") update.is_visible = body.is_visible;

  const { data, error } = await supabase
    .from("clients")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[clients] Update failed:", error.message);
    return NextResponse.json({ error: "Could not update client." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "clients",
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

  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    console.error("[clients] Delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete client." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "clients",
    entityId: id,
    metadata: { op: "delete" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
