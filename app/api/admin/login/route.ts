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
import { assertSameOrigin } from "@/lib/admin/api";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

// ── Basic in-memory rate limiting ────────────────────────────────────────────
// Same pattern as app/api/consultation-leads/route.ts: this VPS runs a
// single long-lived `next start` process, so an in-memory map persists
// across requests within that process. Resets on deploy/restart — an
// accepted tradeoff for this phase.
const RATE_LIMIT_WINDOW_MS = 5 * 60_000;
const RATE_LIMIT_MAX = 5;
const attemptsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (attemptsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  attemptsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

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

const GENERIC_LOGIN_ERROR = "Invalid email or password.";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const ip = getClientIp(request);
  const userAgent = getUserAgent(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in a few minutes." },
      { status: 429 }
    );
  }

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

  async function logFailure(adminUserId: string | null) {
    await logAdminActivity({
      adminUserId,
      action: "login_failed",
      entityType: "admin_user",
      entityId: adminUserId,
      metadata: { email },
      ipAddress: ip,
      userAgent,
    });
  }

  async function logSuccess(adminUserId: string | null) {
    await logAdminActivity({
      adminUserId,
      action: "login_success",
      entityType: "admin_user",
      entityId: adminUserId,
      metadata: { email },
      ipAddress: ip,
      userAgent,
    });
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
      // Deliberately the same generic message as "wrong password" — a
      // distinct "this account is deactivated" message would confirm to an
      // outside prober that the email exists in the system.
      if (!user.is_active) {
        await logFailure(user.id);
        return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
      }

      const passwordMatches = await verifyPassword(password, user.password_hash);
      if (!passwordMatches) {
        await logFailure(user.id);
        return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
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

      await logSuccess(user.id);

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
    await logFailure(null);
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  const emailMatches = safeCompare(email, adminEmail);
  const passwordMatches = safeCompare(password, adminPassword);

  if (!emailMatches || !passwordMatches) {
    await logFailure(null);
    return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
  }

  const token = await createAdminSessionToken({
    userId: null,
    email: adminEmail,
    name: "Admin",
    role: "owner",
  });
  await logSuccess(null);

  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, token);
  return response;
}
