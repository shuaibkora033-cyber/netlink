import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
} from "@/lib/admin/session";
import { verifyPassword } from "@/lib/admin/password";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isRole } from "@/lib/admin/roles";

// Compares via fixed-length SHA-256 digests so the check is both
// constant-time and safe for inputs of different lengths (timingSafeEqual
// throws on length mismatch, which would otherwise leak length via a 500).
function safeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
};

function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
}

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email, password } = body;
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  // 1. Try a per-user admin_users account first — it takes precedence over
  // the .env account whenever the emails match.
  const supabase = getAdminSupabase();
  if (supabase) {
    const { data: user } = await supabase
      .from("admin_users")
      .select("id, name, email, password_hash, role, is_active")
      .eq("email", email.toLowerCase())
      .maybeSingle<AdminUserRow>();

    if (user) {
      if (!user.is_active) {
        return NextResponse.json({ error: "This account has been deactivated." }, { status: 401 });
      }

      const passwordMatches = await verifyPassword(password, user.password_hash);
      if (!passwordMatches) {
        return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
      }

      const role = isRole(user.role) ? user.role : "viewer";
      const token = await createAdminSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
        role,
      });

      // Best-effort — a failure here shouldn't block sign-in.
      await supabase
        .from("admin_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id);

      const response = NextResponse.json({ ok: true });
      setSessionCookie(response, token);
      return response;
    }
  }

  // 2. Fall back to the .env emergency account. Always available regardless
  // of whether admin_users has any rows, so the operator can never be
  // locked out — logs in with role "owner" so the first real owner account
  // can be created from /admin/users.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const emailMatches = safeCompare(email, adminEmail);
  const passwordMatches = safeCompare(password, adminPassword);

  if (!emailMatches || !passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createAdminSessionToken({
    userId: null,
    email: adminEmail,
    name: "Admin",
    role: "owner",
  });
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, token);
  return response;
}
