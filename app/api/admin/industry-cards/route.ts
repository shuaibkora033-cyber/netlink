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
    .from("industry_cards")
    .select("id, slug, name, problem, solution, cta_text, cta_href, order_index, is_visible")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[industry-cards] List failed:", error.message);
    return NextResponse.json({ error: "Could not load industry cards." }, { status: 500 });
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
  if (typeof body.cta_href === "string" && body.cta_href && !isValidUrlOrPath(body.cta_href)) {
    return NextResponse.json({ error: "CTA link must be a valid URL or path." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("industry_cards")
    .insert({
      slug: typeof body.slug === "string" ? body.slug : "",
      name: body.name,
      problem: typeof body.problem === "string" ? body.problem : "",
      solution: typeof body.solution === "string" ? body.solution : "",
      cta_text: typeof body.cta_text === "string" ? body.cta_text : "Book a Free Growth Consultation",
      cta_href: typeof body.cta_href === "string" ? body.cta_href : "/book-consultation",
      order_index: typeof body.order_index === "number" ? body.order_index : 0,
      is_visible: typeof body.is_visible === "boolean" ? body.is_visible : true,
    })
    .select()
    .single();

  if (error) {
    console.error("[industry-cards] Create failed:", error.message);
    return NextResponse.json({ error: "Could not create industry card." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "industry_cards",
    entityId: data.id,
    metadata: { op: "create" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json(data);
}
