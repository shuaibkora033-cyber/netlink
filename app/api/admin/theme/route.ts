import { NextResponse } from "next/server";
import { requireRole, assertSameOrigin } from "@/lib/admin/api";
import { deepNormalize } from "@/lib/normalize";
import { logAdminActivity, getClientIp, getUserAgent } from "@/lib/admin/activity";

export async function GET() {
  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("theme_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[theme] Load failed:", error.message);
    return NextResponse.json({ error: "Could not load theme settings." }, { status: 500 });
  }

  return NextResponse.json({
    primaryColor: data.primary_color,
    secondaryColor: data.secondary_color,
    backgroundColor: data.background_color,
    buttonText: data.button_text,
    navbarCtaText: data.navbar_cta_text,
    sectionVisibility: data.section_visibility ?? {},
    contactEmail: data.contact_email,
    phoneNumber: data.phone_number,
    whatsappLink: data.whatsapp_link ?? "",
    socialLinks: data.social_links ?? {},
  });
}

export async function PUT(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;

  const auth = await requireRole(["owner", "admin", "editor"]);
  if (!auth.ok) return auth.response;
  const { supabase, session } = auth;

  let body: Record<string, unknown>;
  try {
    const raw = await request.json();
    if (!raw || typeof raw !== "object") throw new Error("invalid");
    body = deepNormalize(raw as Record<string, unknown>);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.primaryColor !== "string" || typeof body.contactEmail !== "string") {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { error } = await supabase
    .from("theme_settings")
    .update({
      primary_color: body.primaryColor,
      secondary_color: body.secondaryColor,
      background_color: body.backgroundColor,
      button_text: body.buttonText,
      navbar_cta_text: body.navbarCtaText,
      section_visibility: body.sectionVisibility,
      contact_email: body.contactEmail,
      phone_number: body.phoneNumber,
      whatsapp_link: body.whatsappLink,
      social_links: body.socialLinks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    console.error("[theme] Update failed:", error.message);
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }

  await logAdminActivity({
    adminUserId: session.userId,
    action: "cms_update",
    entityType: "theme_settings",
    entityId: "1",
    metadata: { op: "update" },
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ ok: true });
}
