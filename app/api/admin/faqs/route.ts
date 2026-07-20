import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";
import { isNonEmptyString } from "@/lib/validate";

export async function GET() {
  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, related_page, order_index, is_visible")
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[faqs] List failed:", error.message);
    return NextResponse.json({ error: "Could not load FAQs." }, { status: 500 });
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

  if (!isNonEmptyString(body.question, 500)) {
    return NextResponse.json({ error: "Question is required (max 500 characters)." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("faqs")
    .insert({
      question: body.question,
      answer: typeof body.answer === "string" ? body.answer : "",
      related_page: typeof body.related_page === "string" ? body.related_page : null,
      order_index: typeof body.order_index === "number" ? body.order_index : 0,
      is_visible: typeof body.is_visible === "boolean" ? body.is_visible : true,
    })
    .select()
    .single();

  if (error) {
    console.error("[faqs] Create failed:", error.message);
    return NextResponse.json({ error: "Could not create FAQ." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "faqs",
    entityId: data.id,
    metadata: { op: "create" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json(data);
}
