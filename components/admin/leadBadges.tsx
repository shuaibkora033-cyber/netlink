import {
  LEAD_STATUSES,
  getLeadQuality,
  type LeadStatus,
  type LeadQuality,
} from "@/lib/leads";

// Status = the manual pipeline stage an admin sets. Quality = an automatic
// score bucket. Both can land on "Qualified" at once (see lib/leads.ts) — by
// design, not a bug — so they're always shown with a caption ("Status" /
// "Quality") via BadgeGroup below, and deliberately different colors, so
// they never read as the same value.

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "border-cyan/30 bg-cyan/10 text-cyan",
  contacted: "border-blue-400/30 bg-blue-400/10 text-blue-400",
  qualified: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  booked:
    "border-green-400/40 bg-green-400/15 text-green-300 shadow-[0_0_16px_-4px_rgba(74,222,128,0.5)]",
  not_qualified: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  lost: "border-red-500/25 bg-red-500/[0.06] text-red-400/80",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const label = LEAD_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}
    >
      {label}
    </span>
  );
}

const QUALITY_STYLES: Record<LeadQuality, string> = {
  hot_lead: "border-neon/40 bg-neon/15 text-neon shadow-[0_0_20px_-4px_rgba(13,253,209,0.55)]",
  qualified: "border-cyan/30 bg-cyan/10 text-cyan",
  needs_review: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  low_fit: "border-white/15 bg-white/[0.04] text-muted",
};

export function QualityBadge({ score }: { score: number }) {
  const quality = getLeadQuality(score);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide ${QUALITY_STYLES[quality.value]}`}
    >
      {quality.label}
    </span>
  );
}

/** Small uppercase caption above a badge — keeps Status/Quality slots unambiguous everywhere. */
export function BadgeGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6rem] uppercase tracking-wide text-muted/50">{label}</span>
      {children}
    </div>
  );
}
