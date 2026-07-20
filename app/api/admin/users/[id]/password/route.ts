import { NextResponse } from "next/server";
import { requireFreshRole } from "@/lib/admin/api";
import { hashPassword, validatePassword } from "@/lib/admin/password";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireFreshRole(["owner"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await params;

  let body: { password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const passwordHash = await hashPassword(password);

  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
