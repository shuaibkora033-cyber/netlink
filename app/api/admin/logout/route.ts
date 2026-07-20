import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, requireAdminSession } from "@/lib/admin/session";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (session) {
    await logAdminActivity({
      adminUserId: session.userId,
      action: "logout",
      entityType: "admin_user",
      entityId: session.userId,
      metadata: { email: session.email },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
