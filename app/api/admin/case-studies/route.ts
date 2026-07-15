import { NextResponse } from "next/server";
import { requireAdminSupabase } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";

export async function GET() {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("case_studies")
    .select("id, industry, title, body, challenge, solution, result, metrics, order_index, is_visible")
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

  if (typeof body.title !== "string" || typeof body.body !== "string") {
    return NextResponse.json({ error: "Title and body are required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("case_studies")
    .insert({
      industry: typeof body.industry === "string" ? body.industry : "",
      title: body.title,
      body: body.body,
      challenge: typeof body.challenge === "string" ? body.challenge : null,
      solution: typeof body.solution === "string" ? body.solution : null,
      result: typeof body.result === "string" ? body.result : null,
      metrics: Array.isArray(body.metrics) ? body.metrics : [],
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
