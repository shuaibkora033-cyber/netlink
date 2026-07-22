import { Suspense } from "react";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin/session";
import { getAdminSupabase } from "@/lib/supabase/server";
import { hasPermission, type Role } from "@/lib/admin/roles";
import { getDashboardStats, type DashboardStats } from "@/lib/admin/dashboardStats";

const LINKS = [
  { href: "/admin/leads", title: "Leads", description: "Consultation requests submitted through /book-consultation." },
  { href: "/admin/homepage", title: "Homepage", description: "Hero, stats, growth steps, and the final CTA." },
  { href: "/admin/pages/lead-generation", title: "Lead Generation", description: "Edit the /lead-generation page." },
  { href: "/admin/pages/appointment-setting", title: "Appointment Setting", description: "Edit the /appointment-setting page." },
  { href: "/admin/pages/process", title: "Process", description: "Edit the /process page." },
  { href: "/admin/pages/industries", title: "Industries", description: "Shared industry cards — feeds the homepage grid and /industries." },
  { href: "/admin/pages/results", title: "Results", description: "Edit the /results page." },
  { href: "/admin/pages/about", title: "About", description: "Edit the /about page." },
  { href: "/admin/pages/book-consultation", title: "Book Consultation", description: "Edit the /book-consultation page and form." },
  { href: "/admin/services", title: "Services", description: "The homepage's solution grid cards." },
  { href: "/admin/clients", title: "Clients", description: "Client logo marquee data." },
  { href: "/admin/faqs", title: "FAQs", description: "The FAQ question/answer list." },
  { href: "/admin/case-studies", title: "Case Studies / Results", description: "Shared with the homepage and /results." },
  { href: "/admin/theme", title: "Theme & settings", description: "Colors, button labels, section visibility, and contact details." },
];

const KPI_COPY: { key: keyof DashboardStats; label: string; hint: string }[] = [
  { key: "newThisWeek", label: "New this week", hint: "Since Monday" },
  { key: "hotLeads", label: "Hot leads", hint: "Score 61+" },
  { key: "awaitingReply", label: "Awaiting reply", hint: "Contacted, no follow-up set" },
  { key: "bookedThisMonth", label: "Booked this month", hint: "Submitted & booked this month" },
];

function KpiCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-admin-border bg-admin-surface p-5">
      <p className="text-admin-label font-semibold uppercase tracking-wide text-admin-text-3">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-admin-text">{value}</p>
      <p className="mt-1 text-admin-caption text-admin-text-3">{hint}</p>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden="true">
      {KPI_COPY.map((c) => (
        <div key={c.key} className="animate-pulse rounded-2xl border border-admin-border bg-admin-surface p-5">
          <div className="h-3 w-20 rounded bg-admin-surface-3" />
          <div className="mt-3 h-8 w-12 rounded bg-admin-surface-3" />
          <div className="mt-2 h-3 w-24 rounded bg-admin-surface-3" />
        </div>
      ))}
    </div>
  );
}

function KpiError() {
  return (
    <p
      role="alert"
      className="rounded-2xl border border-admin-danger/30 bg-admin-danger/10 px-4 py-3 text-admin-body text-admin-danger"
    >
      Couldn&apos;t load lead metrics. Try refreshing the page.
    </p>
  );
}

async function KpiSection() {
  const supabase = getAdminSupabase();
  if (!supabase) return <KpiError />;

  let stats: DashboardStats;
  try {
    stats = await getDashboardStats(supabase);
  } catch (e) {
    console.error("[admin overview] Failed to load dashboard stats:", e);
    return <KpiError />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="group" aria-label="Lead metrics">
      {KPI_COPY.map((c) => (
        <KpiCard key={c.key} label={c.label} value={stats[c.key]} hint={c.hint} />
      ))}
    </div>
  );
}

export default async function AdminOverviewPage() {
  // layout.tsx already guarantees a valid session reaches here; re-checking
  // is the same defense-in-depth pattern every admin page/route follows.
  const session = await requireAdminSession();
  const role: Role = session?.role ?? "viewer";

  // Mirrors the /admin/leads route restriction (owner/admin/sales/viewer) via
  // the same existing permission — an editor can't open Leads, so lead
  // metrics have no place on their overview either.
  const canViewLeadMetrics = hasPermission(role, "view_leads");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-admin-h1 font-semibold text-admin-text">Welcome back</h1>
        <p className="mt-1 text-admin-body text-admin-text-2">
          Edit your site&apos;s content and theme below — changes go live as soon as you save.
        </p>
      </div>

      {canViewLeadMetrics && (
        <Suspense fallback={<KpiSkeleton />}>
          <KpiSection />
        </Suspense>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-2xl border border-line glass p-5 transition-all duration-200 hover:border-neon/30 hover:card-glow"
          >
            <h2 className="text-sm font-semibold text-fg transition-colors group-hover:text-neon">
              {link.title}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
