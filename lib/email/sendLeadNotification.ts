import "server-only";
import { Resend } from "resend";
import { getLeadQuality } from "@/lib/leads";
import { site } from "@/lib/content";

export type LeadNotificationData = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string | null;
  website_url: string | null;
  service_needed: string | null;
  industry: string | null;
  monthly_marketing_budget: string | null;
  current_lead_source: string | null;
  main_problem: string | null;
  preferred_contact_method: string | null;
  message: string | null;
  lead_score: number;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  page_url: string | null;
  referrer: string | null;
  created_at: string;
};

function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  return `https://www.${site.domain}`;
}

function dash(value: string | null | undefined): string {
  return value && value.trim() ? value : "—";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const FIELD_ROWS: { label: string; get: (l: LeadNotificationData) => string }[] = [
  { label: "Full name", get: (l) => l.full_name },
  { label: "Email", get: (l) => l.email },
  { label: "Phone", get: (l) => l.phone },
  { label: "Company name", get: (l) => dash(l.company_name) },
  { label: "Website URL", get: (l) => dash(l.website_url) },
  { label: "Service needed", get: (l) => dash(l.service_needed) },
  { label: "Industry", get: (l) => dash(l.industry) },
  { label: "Monthly marketing budget", get: (l) => dash(l.monthly_marketing_budget) },
  { label: "Current lead source", get: (l) => dash(l.current_lead_source) },
  { label: "Main problem", get: (l) => dash(l.main_problem) },
  { label: "Preferred contact method", get: (l) => dash(l.preferred_contact_method) },
  { label: "Message / notes", get: (l) => dash(l.message) },
  { label: "UTM source", get: (l) => dash(l.utm_source) },
  { label: "UTM medium", get: (l) => dash(l.utm_medium) },
  { label: "UTM campaign", get: (l) => dash(l.utm_campaign) },
  { label: "UTM term", get: (l) => dash(l.utm_term) },
  { label: "UTM content", get: (l) => dash(l.utm_content) },
  { label: "Page URL", get: (l) => dash(l.page_url) },
  { label: "Referrer", get: (l) => dash(l.referrer) },
];

function buildHtml(lead: LeadNotificationData, quality: { label: string }, adminUrl: string): string {
  const rows = FIELD_ROWS.map(
    (f) => `
      <tr>
        <td style="padding:7px 0;color:#6b7280;font-size:13px;vertical-align:top;width:38%;">${escapeHtml(f.label)}</td>
        <td style="padding:7px 0;color:#111827;font-size:13px;font-weight:600;vertical-align:top;">${escapeHtml(f.get(lead))}</td>
      </tr>`
  ).join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f6f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
            <tr>
              <td style="background:#050507;padding:22px 24px;border-radius:14px 14px 0 0;">
                <span style="color:#0dfdd1;font-weight:700;font-size:15px;letter-spacing:0.02em;">Netlink</span>
                <div style="color:#f4f6f5;font-size:20px;font-weight:600;margin-top:6px;">New Consultation Lead</div>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 14px 14px;">
                <div style="display:inline-block;background:#ecfeff;color:#0e7490;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;">
                  ${escapeHtml(quality.label)} &middot; Score ${lead.lead_score}
                </div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;border-collapse:collapse;">
                  ${rows}
                </table>
                <p style="margin:16px 0 0;color:#6b7280;font-size:12px;">
                  Submitted ${escapeHtml(formatCreatedAt(lead.created_at))}
                </p>
                <a href="${adminUrl}" style="display:inline-block;margin-top:20px;background:#0dfdd1;color:#050507;padding:11px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">
                  View lead in admin →
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildText(lead: LeadNotificationData, quality: { label: string }, adminUrl: string): string {
  const lines = [
    `New Netlink Lead: ${lead.full_name} — ${dash(lead.service_needed)}`,
    "",
    `Lead quality: ${quality.label} (score ${lead.lead_score})`,
    "",
    ...FIELD_ROWS.map((f) => `${f.label}: ${f.get(lead)}`),
    "",
    `Created: ${formatCreatedAt(lead.created_at)}`,
    "",
    `View in admin: ${adminUrl}`,
  ];
  return lines.join("\n");
}

/**
 * Sends the "new lead" notification email to LEADS_NOTIFICATION_EMAIL via
 * Resend. Never throws — a missing config or a failed send is logged
 * server-side (console.error) and swallowed, so a notification problem can
 * never fail the visitor's actual form submission (the lead is already
 * saved in Supabase by the time this is called — see
 * app/api/consultation-leads/route.ts).
 */
export async function sendLeadNotification(lead: LeadNotificationData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFICATION_EMAIL;
  const from = process.env.NOTIFICATION_FROM_EMAIL;

  if (!apiKey || !to || !from) {
    console.error(
      "[sendLeadNotification] Skipped — missing RESEND_API_KEY, LEADS_NOTIFICATION_EMAIL, or NOTIFICATION_FROM_EMAIL."
    );
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const quality = getLeadQuality(lead.lead_score);
    const adminUrl = `${getSiteUrl()}/admin/leads/${lead.id}`;

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: lead.email,
      subject: `New Netlink Lead: ${lead.full_name} — ${dash(lead.service_needed)}`,
      html: buildHtml(lead, quality, adminUrl),
      text: buildText(lead, quality, adminUrl),
    });

    if (error) {
      console.error("[sendLeadNotification] Resend API error:", error);
    }
  } catch (err) {
    console.error("[sendLeadNotification] Unexpected error sending email:", err);
  }
}
