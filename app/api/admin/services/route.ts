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
    .from("services")
    .select("id, title, description, icon_key, link_href, order_index, is_visible")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[services] List failed:", error.message);
    return NextResponse.json({ error: "Could not load services." }, { status: 500 });
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

  if (!isNonEmptyString(body.title, 200)) {
    return NextResponse.json({ error: "Title is required (max 200 characters)." }, { status: 400 });
  }
  if (typeof body.link_href === "string" && body.link_href && !isValidUrlOrPath(body.link_href)) {
    return NextResponse.json({ error: "Link must be a valid URL or path." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("services")
    .insert({
      title: body.title,
      description: typeof body.description === "string" ? body.description : "",
      icon_key: typeof body.icon_key === "string" ? body.icon_key : null,
      link_href: typeof body.link_href === "string" ? body.link_href : null,
      order_index: typeof body.order_index === "number" ? body.order_index : 0,
      is_visible: typeof body.is_visible === "boolean" ? body.is_visible : true,
    })
    .select()
    .single();

  if (error) {
    console.error("[services] Create failed:", error.message);
    return NextResponse.json({ error: "Could not create service." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "services",
    entityId: data.id,
    metadata: { op: "create" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json(data);
}
