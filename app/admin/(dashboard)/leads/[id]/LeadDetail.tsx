"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LEAD_STATUSES, getLeadQuality, type LeadStatus } from "@/lib/leads";
import { StatusBadge, QualityBadge, BadgeGroup } from "@/components/admin/leadBadges";
import {
  Panel,
  TextAreaField,
  ToggleField,
  SaveButton,
  StatusMessage,
  UnsavedBadge,
  ErrorState,
  useRetryGuard,
  type SaveState,
} from "@/components/admin/ui";

type Lead = {
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
  status: LeadStatus;
  lead_score: number;
  admin_notes: string | null;
  follow_up_date: string | null;
  last_contacted_at: string | null;
  archived: boolean;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  page_url: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string;
};

type LoadState = "loading" | "ready" | "error";

type AdminFields = {
  status: LeadStatus;
  notes: string;
  followUpDate: string; // datetime-local string, "" = unset
  lastContactedAt: string; // datetime-local string, "" = unset
  archived: boolean;
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[0.65rem] uppercase tracking-wide text-muted/50">{label}</p>
      <p className="mt-0.5 text-sm text-fg/90 break-words">{value || "—"}</p>
    </div>
  );
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// datetime-local inputs need "YYYY-MM-DDTHH:mm" in local time, not the UTC
// ISO string the API stores — convert both directions at the edges only.
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

function fieldsFromLead(lead: Lead): AdminFields {
  return {
    status: lead.status,
    notes: lead.admin_notes ?? "",
    followUpDate: toDatetimeLocalValue(lead.follow_up_date),
    lastContactedAt: toDatetimeLocalValue(lead.last_contacted_at),
    archived: lead.archived,
  };
}

export function LeadDetail({ id }: { id: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fields, setFields] = useState<AdminFields | null>(null);
  const [saved, setSaved] = useState<AdminFields | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Tracks the most recent load so a slower, superseded response can never
  // overwrite state set by a newer one, and aborts the in-flight request on
  // unmount or when a newer call starts.
  const requestRef = useRef<AbortController | null>(null);

  async function fetchLead(signal: AbortSignal): Promise<Lead> {
    const res = await fetch(`/api/admin/leads/${id}`, { signal });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load lead.");
    return data;
  }

  function applyLead(data: Lead) {
    setLead(data);
    const initial = fieldsFromLead(data);
    setFields(initial);
    setSaved(initial);
    setLoadState("ready");
  }

  // The mount effect below calls fetchLead directly (inline), not through a
  // hoisted function that itself setStates — eslint-plugin-react-hooks's
  // `set-state-in-effect` rule flags a hoisted function's synchronous
  // setState prefix as unsafe when the effect is its only caller (it can't
  // trace ref/call safety through an intermediate layer). handleRetry below
  // duplicates a few lines rather than sharing this exact shape, precisely
  // to keep the effect's call site inline.
  useEffect(() => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    (async () => {
      try {
        const data = await fetchLead(controller.signal);
        if (requestRef.current !== controller) return;
        applyLead(data);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (requestRef.current !== controller) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load lead.");
        setLoadState("error");
      }
    })();
    return () => {
      requestRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchLead/applyLead close over id/state already accounted for; id is listed below.
  }, [id]);

  const { retrying, guardedRetry } = useRetryGuard();

  // Distinct from the mount load above: retry keeps loadState at "error" (so
  // ErrorState stays mounted with its own "Retrying…" state) instead of
  // flipping to the generic "loading" text.
  function handleRetry() {
    guardedRetry(async () => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setLoadError(null);
      try {
        const data = await fetchLead(controller.signal);
        if (requestRef.current !== controller) return;
        applyLead(data);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (requestRef.current !== controller) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load lead.");
        setLoadState("error");
      }
    });
  }

  const dirty = Boolean(fields && saved && JSON.stringify(fields) !== JSON.stringify(saved));

  async function handleSave() {
    if (!fields) return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: fields.status,
          admin_notes: fields.notes,
          follow_up_date: fromDatetimeLocalValue(fields.followUpDate),
          last_contacted_at: fromDatetimeLocalValue(fields.lastContactedAt),
          archived: fields.archived,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save.");
      setSaved(fields);
      setLead((prev) =>
        prev
          ? {
              ...prev,
              status: fields.status,
              admin_notes: fields.notes,
              follow_up_date: fromDatetimeLocalValue(fields.followUpDate),
              last_contacted_at: fromDatetimeLocalValue(fields.lastContactedAt),
              archived: fields.archived,
            }
          : prev
      );
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
      setSaveState("error");
    }
  }

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading lead…</p>;
  }
  if (loadState === "error" || !lead || !fields) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState message={loadError || "Could not load this lead."} onRetry={handleRetry} retrying={retrying} />
        <Link href="/admin/leads" className="text-sm text-neon hover:text-neon/80">← Back to leads</Link>
      </div>
    );
  }

  function update(patch: Partial<AdminFields>) {
    setFields((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/leads" className="text-xs text-muted transition-colors hover:text-neon">← Back to leads</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-fg">{lead.full_name}</h1>
          {lead.archived && (
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
              Archived
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">Submitted {formatDateTime(lead.created_at)}</p>
      </div>

      <Panel title="A. Contact information">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={lead.full_name} />
          <Field label="Email" value={lead.email} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Preferred contact method" value={lead.preferred_contact_method} />
          <Field label="Company" value={lead.company_name} />
          <Field label="Website" value={lead.website_url} />
        </div>
      </Panel>

      <Panel title="B. Qualification">
        <div className="flex flex-wrap gap-3">
          <BadgeGroup label="Quality">
            <QualityBadge score={lead.lead_score} />
          </BadgeGroup>
          <BadgeGroup label="Status">
            <StatusBadge status={lead.status} />
          </BadgeGroup>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service needed" value={lead.service_needed} />
          <Field label="Industry" value={lead.industry} />
          <Field label="Monthly marketing budget" value={lead.monthly_marketing_budget} />
          <Field label="Current lead source" value={lead.current_lead_source} />
          <Field label="Main problem" value={lead.main_problem} />
          <Field label="Lead score" value={`${lead.lead_score} (${getLeadQuality(lead.lead_score).label})`} />
        </div>
        {lead.message && (
          <div className="mt-2 border-t border-line pt-4">
            <Field label="Notes from visitor" value={lead.message} />
          </div>
        )}
      </Panel>

      <Panel title="C. Tracking">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="UTM source" value={lead.utm_source} />
          <Field label="UTM medium" value={lead.utm_medium} />
          <Field label="UTM campaign" value={lead.utm_campaign} />
          <Field label="UTM term" value={lead.utm_term} />
          <Field label="UTM content" value={lead.utm_content} />
          <Field label="Referrer" value={lead.referrer} />
          <Field label="Created at" value={formatDateTime(lead.created_at)} />
        </div>
        <Field label="Page URL" value={lead.page_url} />
      </Panel>

      <Panel
        title="D. Admin management"
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={dirty} />
            <SaveButton state={saveState} label="Save changes" onClick={handleSave} />
          </div>
        }
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Status</span>
          <select
            value={fields.status}
            onChange={(e) => update({ status: e.target.value as LeadStatus })}
            className="w-full cursor-pointer rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-fg outline-none transition-all duration-200 focus:border-neon/50 focus:ring-1 focus:ring-neon/20"
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Follow-up date</span>
            <input
              type="datetime-local"
              value={fields.followUpDate}
              onChange={(e) => update({ followUpDate: e.target.value })}
              className="w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-fg outline-none transition-all duration-200 focus:border-neon/50 focus:ring-1 focus:ring-neon/20"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Last contacted</span>
            <input
              type="datetime-local"
              value={fields.lastContactedAt}
              onChange={(e) => update({ lastContactedAt: e.target.value })}
              className="w-full rounded-xl border border-line bg-white/[0.03] px-4 py-2.5 text-sm text-fg outline-none transition-all duration-200 focus:border-neon/50 focus:ring-1 focus:ring-neon/20"
            />
          </label>
        </div>

        <ToggleField
          label="Archived"
          checked={fields.archived}
          onChange={(v) => update({ archived: v })}
        />

        <TextAreaField
          label="Admin notes"
          rows={5}
          value={fields.notes}
          onChange={(v) => update({ notes: v })}
          placeholder="Internal notes about this lead…"
        />
        <StatusMessage state={saveState} error={saveError} />
      </Panel>
    </div>
  );
}
