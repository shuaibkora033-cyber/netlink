import { NextResponse } from "next/server";
import { requireAdminSupabase } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
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
  if (typeof body.question === "string") update.question = body.question;
  if (typeof body.answer === "string") update.answer = body.answer;
  if (typeof body.related_page === "string") update.related_page = body.related_page;
  if (typeof body.order_index === "number") update.order_index = body.order_index;
  if (typeof body.is_visible === "boolean") update.is_visible = body.is_visible;

  const { data, error } = await supabase
    .from("faqs")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await params;

  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
