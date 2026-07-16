"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LEAD_STATUSES,
  LEAD_QUALITIES,
  SERVICE_NEEDED_OPTIONS,
  BUDGET_OPTIONS,
  INDUSTRY_OPTIONS,
  getLeadQuality,
  type LeadStatus,
} from "@/lib/leads";
import { StatusBadge, QualityBadge, BadgeGroup } from "@/components/admin/leadBadges";

type LeadRow = {
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
  status: LeadStatus;
  lead_score: number;
  admin_notes: string | null;
  follow_up_date: string | null;
  last_contacted_at: string | null;
  archived: boolean;
  created_at: string;
};

const selectCls =
  "w-full cursor-pointer rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-fg outline-none transition-all duration-200 focus:border-neon/50 sm:w-auto";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[0.6rem] uppercase tracking-wide text-muted/50">{label}</p>
      <p className="truncate text-xs text-fg/80">{value || "—"}</p>
    </div>
  );
}

// Simple RFC 4180-ish CSV escaping — quote any field containing a comma,
// quote, or newline, doubling embedded quotes.
function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

const CSV_COLUMNS: { key: string; header: string; get: (l: LeadRow) => string }[] = [
  { key: "full_name", header: "Full Name", get: (l) => l.full_name },
  { key: "email", header: "Email", get: (l) => l.email },
  { key: "phone", header: "Phone", get: (l) => l.phone },
  { key: "company_name", header: "Company", get: (l) => l.company_name ?? "" },
  { key: "website_url", header: "Website", get: (l) => l.website_url ?? "" },
  { key: "service_needed", header: "Service Needed", get: (l) => l.service_needed ?? "" },
  { key: "industry", header: "Industry", get: (l) => l.industry ?? "" },
  { key: "monthly_marketing_budget", header: "Budget", get: (l) => l.monthly_marketing_budget ?? "" },
  { key: "current_lead_source", header: "Current Lead Source", get: (l) => l.current_lead_source ?? "" },
  { key: "main_problem", header: "Main Problem", get: (l) => l.main_problem ?? "" },
  { key: "preferred_contact_method", header: "Preferred Contact Method", get: (l) => l.preferred_contact_method ?? "" },
  { key: "status", header: "Status", get: (l) => LEAD_STATUSES.find((s) => s.value === l.status)?.label ?? l.status },
  { key: "lead_score", header: "Lead Score", get: (l) => String(l.lead_score) },
  { key: "lead_quality", header: "Lead Quality", get: (l) => getLeadQuality(l.lead_score).label },
  { key: "created_at", header: "Created At", get: (l) => l.created_at },
  { key: "admin_notes", header: "Admin Notes", get: (l) => l.admin_notes ?? "" },
];

function downloadLeadsCsv(leads: LeadRow[]) {
  const header = CSV_COLUMNS.map((c) => csvCell(c.header)).join(",");
  const rows = leads.map((lead) => CSV_COLUMNS.map((c) => csvCell(c.get(lead))).join(","));
  const csv = [header, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `netlink-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function LeadsList() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [quality, setQuality] = useState("");
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");
  const [industry, setIndustry] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const hasFilters = Boolean(status || quality || service || budget || industry || debouncedSearch || showArchived);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (quality) params.set("quality", quality);
    if (service) params.set("service", service);
    if (budget) params.set("budget", budget);
    if (industry) params.set("industry", industry);
    if (showArchived) params.set("archived", "1");
    if (debouncedSearch) params.set("q", debouncedSearch);

    fetch(`/api/admin/leads?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load leads.");
        setLeads(data);
        setLoadState("ready");
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setLoadState("error");
      });

    return () => controller.abort();
  }, [status, quality, service, budget, industry, showArchived, debouncedSearch]);

  const emptyMessage = useMemo(() => {
    if (showArchived && !status && !quality && !service && !budget && !industry && !debouncedSearch) {
      return "No archived leads.";
    }
    if (hasFilters) return "No leads match this filter.";
    return "No leads yet. Submissions from /book-consultation will show up here.";
  }, [showArchived, status, quality, service, budget, industry, debouncedSearch, hasFilters]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-fg">Leads</h1>
          <p className="mt-1 text-sm text-muted">
            Consultation requests submitted through /book-consultation, newest first.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadLeadsCsv(leads)}
          disabled={loadState !== "ready" || leads.length === 0}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-xs font-medium text-fg transition-colors hover:border-neon/30 hover:text-neon disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, email, or phone…"
          className="w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-fg placeholder:text-muted/60 outline-none transition-all duration-200 focus:border-neon/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-neon/20"
        />

        <div className="flex flex-wrap gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className={selectCls}>
            <option value="">All qualities</option>
            {LEAD_QUALITIES.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
          <select value={service} onChange={(e) => setService(e.target.value)} className={selectCls}>
            <option value="">All services</option>
            {SERVICE_NEEDED_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select value={budget} onChange={(e) => setBudget(e.target.value)} className={selectCls}>
            <option value="">All budgets</option>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selectCls}>
            <option value="">All industries</option>
            {INDUSTRY_OPTIONS.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3.5 py-2.5 text-sm text-fg">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-[var(--color-neon)]"
            />
            Show archived
          </label>
        </div>
      </div>

      {loadState === "loading" && <p className="text-sm text-muted">Loading leads…</p>}
      {loadState === "error" && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          Could not load leads.
        </p>
      )}
      {loadState === "ready" && leads.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line px-6 py-16 text-center text-sm text-muted">
          {emptyMessage}
        </p>
      )}

      {loadState === "ready" && leads.length > 0 && (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => {
            const leadQuality = getLeadQuality(lead.lead_score);
            const isHot = leadQuality.value === "hot_lead";
            return (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className={[
                  "group flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-200 sm:p-5",
                  isHot
                    ? "border-neon/30 bg-neon/[0.04] hover:border-neon/50 hover:bg-neon/[0.07]"
                    : "border-line bg-white/[0.02] hover:border-neon/25 hover:bg-white/[0.04]",
                  lead.archived ? "opacity-60" : "",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-semibold text-fg group-hover:text-neon">{lead.full_name}</p>
                  {lead.archived && (
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-muted">
                      Archived
                    </span>
                  )}
                  <BadgeGroup label="Quality">
                    <QualityBadge score={lead.lead_score} />
                  </BadgeGroup>
                  <BadgeGroup label="Status">
                    <StatusBadge status={lead.status} />
                  </BadgeGroup>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
                  <MiniField label="Company" value={lead.company_name ?? ""} />
                  <MiniField label="Email" value={lead.email} />
                  <MiniField label="Phone" value={lead.phone} />
                  <MiniField label="Service" value={lead.service_needed ?? ""} />
                  <MiniField label="Budget" value={lead.monthly_marketing_budget ?? ""} />
                  <MiniField label="Industry" value={lead.industry ?? ""} />
                  <MiniField label="Score" value={String(lead.lead_score)} />
                  <MiniField label="Created" value={formatDate(lead.created_at)} />
                  {lead.follow_up_date && <MiniField label="Follow-up" value={formatDate(lead.follow_up_date)} />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
