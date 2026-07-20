import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireFreshRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { isRole, type Role } from "@/lib/admin/roles";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

const USER_COLUMNS = "id, name, email, role, is_active, last_login_at, created_at, updated_at";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ExistingUserRow = { id: string; role: Role; is_active: boolean };

/** True if, after removing/changing `excludeId`, at least one other active owner exists. */
async function hasAnotherActiveOwner(supabase: SupabaseClient, excludeId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("admin_users")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner")
    .eq("is_active", true)
    .neq("id", excludeId);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireFreshRole(["owner"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;
  const { id } = await params;

  const { data: existing, error: fetchError } = await supabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", id)
    .maybeSingle<ExistingUserRow>();

  if (fetchError) {
    console.error("[users] Load failed:", fetchError.message);
    return NextResponse.json({ error: "Could not load user." }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  let profileFieldChanged = false;

  if (typeof body.name === "string") {
    if (!body.name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    update.name = body.name;
    profileFieldChanged = true;
  }
  if (typeof body.email === "string") {
    if (!body.email || !EMAIL_RE.test(body.email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    update.email = body.email.toLowerCase();
    profileFieldChanged = true;
  }
  if (body.role !== undefined) {
    if (!isRole(body.role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }
    update.role = body.role;
    profileFieldChanged = true;
  }
  if (typeof body.is_active === "boolean") {
    update.is_active = body.is_active;
  }

  // Would this change leave the last active owner without owner status?
  const wasActiveOwner = existing.role === "owner" && existing.is_active;
  const willBeActiveOwner =
    (typeof update.role === "string" ? update.role : existing.role) === "owner" &&
    (typeof update.is_active === "boolean" ? update.is_active : existing.is_active);

  if (wasActiveOwner && !willBeActiveOwner) {
    const hasOther = await hasAnotherActiveOwner(supabase, id);
    if (!hasOther) {
      return NextResponse.json(
        { error: "Cannot demote or deactivate the last active owner." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("admin_users")
    .update(update)
    .eq("id", id)
    .select(USER_COLUMNS)
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
    }
    console.error("[users] Update failed:", error.message);
    return NextResponse.json({ error: "Could not update user." }, { status: 500 });
  }

  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);

  if (typeof update.is_active === "boolean" && update.is_active !== existing.is_active) {
    await logAdminActivity({
      adminUserId: session.userId,
      action: update.is_active ? "user_activate" : "user_deactivate",
      entityType: "admin_user",
      entityId: id,
      metadata: {},
      ipAddress,
      userAgent,
    });
  }
  if (profileFieldChanged) {
    await logAdminActivity({
      adminUserId: session.userId,
      action: "user_update",
      entityType: "admin_user",
      entityId: id,
      metadata: {
        ...(typeof update.role === "string" ? { role: update.role } : {}),
      },
      ipAddress,
      userAgent,
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireFreshRole(["owner"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;
  const { id } = await params;

  if (session.userId === id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("admin_users")
    .select("id, role, is_active")
    .eq("id", id)
    .maybeSingle<ExistingUserRow>();

  if (fetchError) {
    console.error("[users] Load failed:", fetchError.message);
    return NextResponse.json({ error: "Could not load user." }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (existing.role === "owner" && existing.is_active) {
    const hasOther = await hasAnotherActiveOwner(supabase, id);
    if (!hasOther) {
      return NextResponse.json(
        { error: "Cannot delete the last active owner." },
        { status: 400 }
      );
    }
  }

  const { error } = await supabase.from("admin_users").delete().eq("id", id);

  if (error) {
    console.error("[users] Delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete user." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "user_delete",
    entityType: "admin_user",
    entityId: id,
    metadata: {},
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
