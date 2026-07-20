import { NextResponse } from "next/server";
import { requireFreshRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { hashPassword, validatePassword } from "@/lib/admin/password";
import { isRole } from "@/lib/admin/roles";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

const USER_COLUMNS = "id, name, email, role, is_active, last_login_at, created_at, updated_at";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  const auth = await requireFreshRole(["owner"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("admin_users")
    .select(USER_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[users] List failed:", error.message);
    return NextResponse.json({ error: "Could not load users." }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireFreshRole(["owner"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = raw as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Password is normalized separately (never whitespace-folded — it must be
  // hashed exactly as typed) so only the non-secret fields go through
  // deepNormalize.
  const { name, email, role, is_active } = deepNormalize({
    name: body.name,
    email: body.email,
    role: body.role,
    is_active: body.is_active,
  } as Record<string, unknown>);
  const password = typeof body.password === "string" ? body.password : "";

  if (typeof name !== "string" || !name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (typeof email !== "string" || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!isRole(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role,
      is_active: typeof is_active === "boolean" ? is_active : true,
    })
    .select(USER_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    console.error("[users] Create failed:", error.message);
    return NextResponse.json({ error: "Could not create user." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "user_create",
    entityType: "admin_user",
    entityId: data.id,
    metadata: { email: data.email, role: data.role },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json(data);
}
