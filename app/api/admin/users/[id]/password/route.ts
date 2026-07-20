import { NextResponse } from "next/server";
import { requireFreshRole, assertSameOrigin } from "@/lib/admin/api";
import { hashPassword, validatePassword } from "@/lib/admin/password";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireFreshRole(["owner"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;
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
    console.error("[users/password] Load failed:", fetchError.message);
    return NextResponse.json({ error: "Could not load user." }, { status: 500 });
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
    console.error("[users/password] Update failed:", error.message);
    return NextResponse.json({ error: "Could not change password." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "user_password_change",
    entityType: "admin_user",
    entityId: id,
    metadata: {},
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
