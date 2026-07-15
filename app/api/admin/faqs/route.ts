import { NextResponse } from "next/server";
import { requireAdminSupabase } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";

export async function GET() {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("faqs")
    .select("id, question, answer, related_page, order_index, is_visible")
    .order("order_index", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.question !== "string" || !body.question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
