"use client";

import { useEffect, useRef, useState } from "react";
import { ItemListField } from "@/components/admin/RepeatableFields";
import {
  Panel,
  TextField,
  TextAreaField,
  SaveButton,
  StatusMessage,
  UnsavedBadge,
  IconButton,
  ToggleField,
  ErrorState,
  useRetryGuard,
  type SaveState,
} from "@/components/admin/ui";

type LoadState = "loading" | "ready" | "error";

type CaseStudyRow = {
  id: string;
  industry: string;
  title: string;
  body: string;
  challenge: string | null;
  solution: string | null;
  result: string | null;
  metrics: { value: string; label: string }[];
  order_index: number;
  is_visible: boolean;
};

function isRowDirty(row: CaseStudyRow, saved: Record<string, CaseStudyRow>): boolean {
  const s = saved[row.id];
  return !s || JSON.stringify(row) !== JSON.stringify(s);
}

export function CaseStudiesEditor() {
  const [rows, setRows] = useState<CaseStudyRow[]>([]);
  const [saved, setSaved] = useState<Record<string, CaseStudyRow>>({});
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [rowState, setRowState] = useState<Record<string, SaveState>>({});
  const [rowError, setRowError] = useState<Record<string, string | null>>({});

  // Tracks the most recent load() call so a slower, superseded response can
  // never overwrite state set by a newer one, and aborts the in-flight
  // request on unmount or when a newer call starts.
  const requestRef = useRef<AbortController | null>(null);

  async function load() {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const res = await fetch("/api/admin/case-studies", { signal: controller.signal });
      const data: CaseStudyRow[] = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error || "Failed to load case studies.");
      if (requestRef.current !== controller) return;
      setRows(data);
      setSaved(Object.fromEntries(data.map((r) => [r.id, r])));
      setLoadState("ready");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (requestRef.current !== controller) return;
      setLoadState("error");
    }
  }

  const { retrying, guardedRetry } = useRetryGuard();

  useEffect(() => {
    load();
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  function update(id: string, patch: Partial<CaseStudyRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: CaseStudyRow) {
    setRowState((s) => ({ ...s, [row.id]: "saving" }));
    setRowError((s) => ({ ...s, [row.id]: null }));
    try {
      const res = await fetch(`/api/admin/case-studies/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save.");
      setSaved((s) => ({ ...s, [row.id]: row }));
      setRowState((s) => ({ ...s, [row.id]: "saved" }));
      setTimeout(() => setRowState((s) => (s[row.id] === "saved" ? { ...s, [row.id]: "idle" } : s)), 2500);
    } catch (e) {
      setRowError((s) => ({ ...s, [row.id]: e instanceof Error ? e.message : "Failed to save." }));
      setRowState((s) => ({ ...s, [row.id]: "error" }));
    }
  }

  async function addRow() {
    const res = await fetch("/api/admin/case-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: "",
        title: "New case study",
        body: "",
        challenge: "",
        solution: "",
        result: "",
        metrics: [],
        order_index: rows.length,
        is_visible: true,
      }),
    });
    if (res.ok) {
      const row = await res.json();
      setRows((prev) => [...prev, row]);
      setSaved((s) => ({ ...s, [row.id]: row }));
    }
  }

  async function deleteRow(id: string) {
    const res = await fetch(`/api/admin/case-studies/${id}`, { method: "DELETE" });
    if (res.ok) {
      setRows((prev) => prev.filter((r) => r.id !== id));
      setSaved((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Case Studies / Results</h1>
        <p className="mt-1 text-sm text-muted">
          The same case studies shown on both the homepage and /results — one shared list, each
          card saves independently.
        </p>
      </div>

      <Panel title="Case studies">
        {loadState === "loading" && <p className="text-sm text-muted">Loading case studies…</p>}
        {loadState === "error" && (
          <ErrorState message="Could not load case studies." onRetry={() => guardedRetry(load)} retrying={retrying} />
        )}

        {loadState === "ready" &&
          rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Industry" value={row.industry} onChange={(v) => update(row.id, { industry: v })} />
                <TextField label="Title" value={row.title} onChange={(v) => update(row.id, { title: v })} />
              </div>
              <div className="mt-3">
                <TextAreaField label="Description" rows={2} value={row.body} onChange={(v) => update(row.id, { body: v })} />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <TextAreaField
                  label="Challenge"
                  rows={2}
                  value={row.challenge ?? ""}
                  onChange={(v) => update(row.id, { challenge: v })}
                />
                <TextAreaField
                  label="Solution"
                  rows={2}
                  value={row.solution ?? ""}
                  onChange={(v) => update(row.id, { solution: v })}
                />
                <TextAreaField
                  label="Result"
                  rows={2}
                  value={row.result ?? ""}
                  onChange={(v) => update(row.id, { result: v })}
                />
              </div>

              <div className="mt-3">
                <ItemListField
                  label="Metrics"
                  items={row.metrics}
                  emptyItem={{ value: "", label: "" }}
                  itemFields={[
                    { key: "value", label: "Metric value", width: "sm:w-32" },
                    { key: "label", label: "Metric label" },
                  ]}
                  onChange={(metrics) => update(row.id, { metrics })}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ToggleField label="Visible" checked={row.is_visible} onChange={(v) => update(row.id, { is_visible: v })} />
                <UnsavedBadge show={isRowDirty(row, saved)} />
                <SaveButton state={rowState[row.id] ?? "idle"} label="Save" onClick={() => save(row)} />
                <IconButton label="Delete" variant="danger" onClick={() => deleteRow(row.id)} />
              </div>
              <div className="mt-2">
                <StatusMessage state={rowState[row.id] ?? "idle"} error={rowError[row.id]} />
              </div>
            </div>
          ))}

        <IconButton label="+ Add case study" onClick={addRow} />
      </Panel>
    </div>
  );
}
