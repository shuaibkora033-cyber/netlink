"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  LEAD_STATUSES,
  LEAD_QUALITIES,
  SERVICE_NEEDED_OPTIONS,
  BUDGET_OPTIONS,
  INDUSTRY_OPTIONS,
  getLeadQuality,
  type LeadStatus,
  type LeadQuality,
} from "@/lib/leads";
import { StatusBadge, QualityBadge } from "@/components/admin/leadBadges";
import { ErrorState, SkeletonBlock, touchTargetCls } from "@/components/admin/ui";

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

type SortColumn = "full_name" | "lead_score" | "created_at";
type SortDir = "asc" | "desc";
type LoadState = "loading" | "ready" | "error";

const PAGE_SIZE = 20;

const selectCls =
  "w-full cursor-pointer rounded-xl border border-admin-border bg-admin-surface px-3.5 py-2.5 text-admin-body text-admin-text outline-none transition-colors duration-200 ease-admin focus:border-admin-accent/50 sm:w-auto";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Simple RFC 4180-ish CSV escaping — quote any field containing a comma,
// quote, or line break (\n or a bare \r), doubling embedded quotes.
function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
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

const QUALITY_BAR_COLOR: Record<LeadQuality, string> = {
  hot_lead: "bg-admin-accent",
  qualified: "bg-admin-info",
  needs_review: "bg-admin-warning",
  low_fit: "bg-admin-text-3",
};

function ScoreCell({ score }: { score: number }) {
  const quality = getLeadQuality(score);
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-admin-surface-3" aria-hidden="true">
          <span className={`block h-full rounded-full ${QUALITY_BAR_COLOR[quality.value]}`} style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-admin-body font-semibold tabular-nums text-admin-text">{score}</span>
      </div>
      <QualityBadge score={score} />
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-3 w-3 shrink-0 transition-transform duration-200 ease-admin ${active ? "text-admin-accent" : "text-admin-text-3"} ${active && dir === "asc" ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SortableTh({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  column: SortColumn;
  sortBy: SortColumn;
  sortDir: SortDir;
  onSort: (col: SortColumn) => void;
  align?: "left" | "right";
}) {
  const active = sortBy === column;
  return (
    <th
      scope="col"
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      className={`px-4 py-3 text-admin-caption font-semibold uppercase tracking-wide text-admin-text-3 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 rounded transition-colors duration-200 ease-admin hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 ${active ? "text-admin-text" : ""} ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        {label}
        <SortIcon active={active} dir={sortDir} />
      </button>
    </th>
  );
}

/** Mirrors a real row's 8 columns (name+company, contact, service+budget,
 * industry, status pill, score bar, created date, follow-up date) so the
 * table doesn't reflow when real rows arrive. */
function LeadRowSkeleton() {
  return (
    <tr className="border-b border-admin-border last:border-b-0" aria-hidden="true">
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="mt-1.5 h-3 w-20" />
      </td>
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="mt-1.5 h-3 w-24" />
      </td>
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="mt-1.5 h-3 w-20" />
      </td>
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-4 w-20" />
      </td>
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-1.5 w-14 rounded-full" />
        <SkeletonBlock className="mt-1.5 h-4 w-10" />
      </td>
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-4 w-16" />
      </td>
      <td className="px-4 py-3 align-top">
        <SkeletonBlock className="h-4 w-16" />
      </td>
    </tr>
  );
}

function Th({ label, align = "left" }: { label: string; align?: "left" | "right" }) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-admin-caption font-semibold uppercase tracking-wide text-admin-text-3 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {label}
    </th>
  );
}

export function LeadsList() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [exporting, setExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [quality, setQuality] = useState("");
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");
  const [industry, setIndustry] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortColumn>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  // Bumped by handleRetry() below to retrigger the fetch effect after an
  // error — a dependency change is the only way to re-run an effect on
  // demand.
  const [retryToken, setRetryToken] = useState(0);
  // Separate from loadState: a retry keeps loadState at "error" (so
  // ErrorState stays mounted throughout) and only flips this instead, which
  // ErrorState uses to disable its button and show "Retrying…".
  const [retrying, setRetrying] = useState(false);
  // Checked and set synchronously inside handleRetry() — a state-only guard
  // still has a gap between a click and the next render, where a second
  // click would read the same stale "not retrying yet" value. A ref closes
  // that gap regardless of React's render timing.
  const retryInFlightRef = useRef(false);

  const hasFilters = Boolean(status || quality || service || budget || industry || debouncedSearch || showArchived);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Any filter, search, or sort change invalidates the current page — always
  // return to page 1 rather than risk showing a page number that no longer
  // has any matching rows. Adjusting state during render (not in an effect,
  // which would set state unconditionally on every dependency change) —
  // same pattern as AdminShell's route-change reset.
  const filterSignature = JSON.stringify([
    status, quality, service, budget, industry, showArchived, debouncedSearch, sortBy, sortDir,
  ]);
  const [lastFilterSignature, setLastFilterSignature] = useState(filterSignature);
  if (filterSignature !== lastFilterSignature) {
    setLastFilterSignature(filterSignature);
    setPage(1);
  }

  function buildFilterParams(): URLSearchParams {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (quality) params.set("quality", quality);
    if (service) params.set("service", service);
    if (budget) params.set("budget", budget);
    if (industry) params.set("industry", industry);
    if (showArchived) params.set("archived", "1");
    if (debouncedSearch) params.set("q", debouncedSearch);
    return params;
  }

  useEffect(() => {
    const controller = new AbortController();

    const params = buildFilterParams();
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));
    params.set("sortBy", sortBy);
    params.set("sortDir", sortDir);

    fetch(`/api/admin/leads?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load leads.");
        const rows: LeadRow[] = data.leads ?? [];
        const rowTotal: number = data.total ?? 0;
        setLeads(rows);
        setTotal(rowTotal);
        setLoadState("ready");
        setRetrying(false);
        retryInFlightRef.current = false;

        // Defensive clamp: if something else shrank the result set out from
        // under the current page (e.g. a lead got archived elsewhere), step
        // back to the last valid page instead of showing an empty page.
        const maxPage = Math.max(1, Math.ceil(rowTotal / PAGE_SIZE));
        if (page > maxPage) setPage(maxPage);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setLoadState("error");
        setRetrying(false);
        retryInFlightRef.current = false;
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- buildFilterParams reads state already listed below; including it would just re-create it every render without changing behavior.
  }, [status, quality, service, budget, industry, showArchived, debouncedSearch, page, sortBy, sortDir, retryToken]);

  function handleRetry() {
    if (retryInFlightRef.current) return;
    retryInFlightRef.current = true;
    setRetrying(true);
    setRetryToken((t) => t + 1);
  }

  function clearAllFilters() {
    setSearch("");
    setStatus("");
    setQuality("");
    setService("");
    setBudget("");
    setIndustry("");
    setShowArchived(false);
  }

  async function handleExportCsv() {
    setExporting(true);
    try {
      // Deliberately omits page/pageSize — the export always fetches every
      // row matching the current filters, not just the visible page.
      //
      // NOTE: this still pulls the full matching result set into the
      // browser in one response and builds the CSV client-side — the same
      // approach the export used before pagination existed. Fine at today's
      // volume, but if the leads table grows large this should move to a
      // server-generated (or streamed) CSV response instead of a client-side
      // fetch-everything-then-build-the-file approach. Out of scope for this
      // phase — noted here, not redesigned.
      const params = buildFilterParams();
      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to export leads.");
      const allLeads: LeadRow[] = Array.isArray(data) ? data : [];
      downloadLeadsCsv(allLeads);
      // Fire-and-forget — an export log failure should never block the download.
      fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: allLeads.length }),
      }).catch(() => {});
    } catch {
      // Export is a secondary action off an already-rendered table; a toast
      // library isn't part of this app, so fall back to a plain alert rather
      // than fail silently.
      window.alert("Could not export leads. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  function handleSort(column: SortColumn) {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir(column === "full_name" ? "asc" : "desc");
    }
  }

  // Distinct copy per empty reason — search, filter, archived-only, and true
  // no-data all mean something different to the person looking at an empty
  // table, so each gets its own message (and, where there's something to
  // undo, a "Clear filters" action below).
  const emptyMessage = useMemo(() => {
    if (debouncedSearch) return `No leads match "${debouncedSearch}".`;
    if (showArchived && !status && !quality && !service && !budget && !industry) {
      return "No archived leads.";
    }
    if (hasFilters) return "No leads match these filters.";
    return "No leads yet. Submissions from /book-consultation will show up here.";
  }, [showArchived, status, quality, service, budget, industry, debouncedSearch, hasFilters]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-admin-h1 font-semibold text-admin-text">Leads</h1>
          <p className="mt-1 text-admin-body text-admin-text-2">
            Consultation requests submitted through /book-consultation.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={exporting || (loadState === "ready" && total === 0)}
          className="inline-flex items-center gap-2 rounded-full border border-admin-border bg-admin-surface px-4 py-2 text-admin-label font-medium text-admin-text transition-colors duration-200 ease-admin hover:border-admin-accent/30 hover:text-admin-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, email, or phone…"
          className="w-full rounded-xl border border-admin-border bg-admin-surface px-4 py-2.5 text-admin-body text-admin-text placeholder:text-admin-text-3 outline-none transition-colors duration-200 ease-admin focus:border-admin-accent/50 focus:bg-admin-surface-2 focus:ring-1 focus:ring-admin-accent/20"
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
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-admin-border bg-admin-surface px-3.5 py-2.5 text-admin-body text-admin-text">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded border-admin-border accent-[var(--color-admin-accent)]"
            />
            Show archived
          </label>
        </div>
      </div>

      {loadState === "error" && (
        <ErrorState message="Could not load leads." onRetry={handleRetry} retrying={retrying} />
      )}

      {loadState !== "error" && (
        <div className="overflow-x-auto rounded-2xl border border-admin-border">
          <table className="w-full min-w-[880px] border-collapse text-admin-body">
            <thead>
              <tr className="border-b border-admin-border bg-admin-surface">
                <SortableTh label="Lead" column="full_name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <Th label="Contact" />
                <Th label="Service / Budget" />
                <Th label="Industry" />
                <Th label="Status" />
                <SortableTh label="Score" column="lead_score" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <SortableTh label="Created" column="created_at" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                <Th label="Follow-up" />
              </tr>
            </thead>
            <tbody>
              {loadState === "loading" &&
                Array.from({ length: 6 }, (_, i) => <LeadRowSkeleton key={i} />)}
              {loadState === "ready" && leads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <p className="text-admin-body text-admin-text-2">{emptyMessage}</p>
                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className={`relative mt-3 rounded-full border border-admin-border bg-admin-surface px-4 py-1.5 text-admin-label font-medium text-admin-text transition-colors duration-200 ease-admin hover:border-admin-accent/30 hover:text-admin-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 ${touchTargetCls}`}
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {loadState === "ready" &&
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-admin-border last:border-b-0 transition-colors duration-200 ease-admin hover:bg-admin-surface-2 ${lead.archived ? "opacity-60" : ""}`}
                  >
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-semibold text-admin-text underline-offset-2 hover:text-admin-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 rounded"
                      >
                        {lead.full_name}
                      </Link>
                      {lead.archived && (
                        <span className="ml-2 inline-flex items-center rounded-full border border-admin-border-strong bg-admin-surface-2 px-2 py-0.5 text-admin-caption font-semibold uppercase tracking-wide text-admin-text-3">
                          Archived
                        </span>
                      )}
                      <p className="mt-0.5 truncate text-admin-caption text-admin-text-3">{lead.company_name || "—"}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-admin-body text-admin-text">{lead.email}</p>
                      <p className="text-admin-caption text-admin-text-3">{lead.phone}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-admin-body text-admin-text">{lead.service_needed || "—"}</p>
                      <p className="text-admin-caption text-admin-text-3">{lead.monthly_marketing_budget || "—"}</p>
                    </td>
                    <td className="px-4 py-3 align-top text-admin-body text-admin-text">{lead.industry || "—"}</td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <ScoreCell score={lead.lead_score} />
                    </td>
                    <td className="px-4 py-3 align-top text-admin-body text-admin-text">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3 align-top text-admin-body text-admin-text">{formatDate(lead.follow_up_date)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {loadState === "ready" && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-admin-caption text-admin-text-3">
            Showing {rangeStart}–{rangeEnd} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-admin-label font-medium text-admin-text-2 transition-colors duration-200 ease-admin hover:bg-admin-surface-2 hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-admin-caption text-admin-text-3">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-admin-border bg-admin-surface px-3 py-1.5 text-admin-label font-medium text-admin-text-2 transition-colors duration-200 ease-admin hover:bg-admin-surface-2 hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
