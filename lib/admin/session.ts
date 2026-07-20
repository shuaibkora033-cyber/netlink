import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { isRole, type Role } from "./roles";

export const ADMIN_SESSION_COOKIE = "netlink_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

export type AdminSession = {
  /** null for the .env emergency-fallback account, which has no DB row. */
  userId: string | null;
  email: string;
  name: string;
  role: Role;
};

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to your environment before using admin login."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

/**
 * Verifies the admin session cookie's signature/expiry and reconstructs the
 * session. Tolerant of the pre-RBAC token shape (`{ email, role: "admin" }`,
 * no userId/name) so sessions issued before this change stay valid instead
 * of silently logging people out on deploy.
 */
export async function verifyAdminSessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== "string" || !payload.email) return null;

    const role: Role = isRole(payload.role) ? payload.role : "admin";
    const userId = typeof payload.userId === "string" ? payload.userId : null;
    const name = typeof payload.name === "string" && payload.name ? payload.name : payload.email;

    return { userId, email: payload.email, name, role };
  } catch {
    return null;
  }
}

/**
 * Verifies the admin session cookie inside a Route Handler. Every
 * app/api/admin/* mutation route must call this before touching the
 * database — the proxy (proxy.ts) only does an optimistic redirect for page
 * navigation, not API calls made directly (e.g. via curl/fetch), so routes
 * re-check independently.
 */
export async function requireAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminSessionToken(token);
}
