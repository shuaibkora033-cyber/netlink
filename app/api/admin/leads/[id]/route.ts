import { NextResponse } from "next/server";
import { requireAdminSupabase } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { LEAD_STATUSES } from "@/lib/leads";

const STATUS_VALUES = new Set<string>(LEAD_STATUSES.map((s) => s.value));

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await params;

  const { data, error } = await supabase
    .from("consultation_leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}

// Only status and admin_notes are updatable — every other field is the
// visitor's original submission and stays as-is, same as every other PATCH
// route in this codebase (explicit column allow-list, never a full overwrite).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSupabase();
  if (!auth.ok) return auth.response;
  const { supabase } = auth;
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.status === "string") {
    if (!STATUS_VALUES.has(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.admin_notes === "string") {
    update.admin_notes = body.admin_notes;
  }
  // Datetime fields accept a value, or null to clear them.
  for (const key of ["follow_up_date", "last_contacted_at"] as const) {
    const value = body[key];
    if (value === null) {
      update[key] = null;
    } else if (typeof value === "string" && value) {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json({ error: `Invalid ${key}.` }, { status: 400 });
      }
      update[key] = parsed.toISOString();
    }
  }
  if (typeof body.archived === "boolean") {
    update.archived = body.archived;
  }

  const { data, error } = await supabase
    .from("consultation_leads")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
