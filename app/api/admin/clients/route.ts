import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";
import { isNonEmptyString, isValidUrlOrPath } from "@/lib/validate";

export async function GET() {
  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("clients")
    .select("id, name, logo_url, website_url, industry, needs_light_hover, scale, order_index, is_visible")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[clients] List failed:", error.message);
    return NextResponse.json({ error: "Could not load clients." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!isNonEmptyString(body.name, 200)) {
    return NextResponse.json({ error: "Name is required (max 200 characters)." }, { status: 400 });
  }
  if (typeof body.logo_url === "string" && body.logo_url && !isValidUrlOrPath(body.logo_url)) {
    return NextResponse.json({ error: "Logo URL must be a valid URL or path." }, { status: 400 });
  }
  if (typeof body.website_url === "string" && body.website_url && !isValidUrlOrPath(body.website_url)) {
    return NextResponse.json({ error: "Website URL must be a valid URL." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name: body.name,
      logo_url: typeof body.logo_url === "string" ? body.logo_url : null,
      website_url: typeof body.website_url === "string" ? body.website_url : null,
      industry: typeof body.industry === "string" ? body.industry : null,
      needs_light_hover: typeof body.needs_light_hover === "boolean" ? body.needs_light_hover : false,
      scale: typeof body.scale === "number" ? body.scale : null,
      order_index: typeof body.order_index === "number" ? body.order_index : 0,
      is_visible: typeof body.is_visible === "boolean" ? body.is_visible : true,
    })
    .select()
    .single();

  if (error) {
    console.error("[clients] Create failed:", error.message);
    return NextResponse.json({ error: "Could not create client." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "clients",
    entityId: data.id,
    metadata: { op: "create" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json(data);
}
