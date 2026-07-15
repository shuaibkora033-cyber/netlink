"use client";

import { useEffect, useState } from "react";
import {
  Panel,
  TextField,
  TextAreaField,
  SaveButton,
  StatusMessage,
  UnsavedBadge,
  IconButton,
  ToggleField,
  type SaveState,
} from "@/components/admin/ui";

type LoadState = "loading" | "ready" | "error";

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  related_page: string | null;
  order_index: number;
  is_visible: boolean;
};

function isRowDirty(row: FaqRow, saved: Record<string, FaqRow>): boolean {
  const s = saved[row.id];
  return !s || JSON.stringify(row) !== JSON.stringify(s);
}

export function FaqsEditor() {
  const [rows, setRows] = useState<FaqRow[]>([]);
  const [saved, setSaved] = useState<Record<string, FaqRow>>({});
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [rowState, setRowState] = useState<Record<string, SaveState>>({});
  const [rowError, setRowError] = useState<Record<string, string | null>>({});

  async function load() {
    try {
      const res = await fetch("/api/admin/faqs");
      const data: FaqRow[] = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error || "Failed to load FAQs.");
      setRows(data);
      setSaved(Object.fromEntries(data.map((r) => [r.id, r])));
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function update(id: string, patch: Partial<FaqRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: FaqRow) {
    setRowState((s) => ({ ...s, [row.id]: "saving" }));
    setRowError((s) => ({ ...s, [row.id]: null }));
    try {
      const res = await fetch(`/api/admin/faqs/${row.id}`, {
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
    const res = await fetch("/api/admin/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "New question",
        answer: "",
        related_page: "",
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
    const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
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
        <h1 className="text-xl font-semibold text-fg">FAQs</h1>
        <p className="mt-1 text-sm text-muted">
          Manages the FAQ list. Note: the FAQ accordion isn&apos;t currently placed on any page —
          it was left out when the site was split into multiple pages. Add it back to a page to
          make these edits visible.
        </p>
      </div>

      <Panel title="Questions" description="Each question saves independently.">
        {loadState === "loading" && <p className="text-sm text-muted">Loading FAQs…</p>}
        {loadState === "error" && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            Could not load FAQs.
          </p>
        )}

        {loadState === "ready" &&
          rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <TextField label="Question" value={row.question} onChange={(v) => update(row.id, { question: v })} />
              <div className="mt-3">
                <TextAreaField label="Answer" rows={3} value={row.answer} onChange={(v) => update(row.id, { answer: v })} />
              </div>
              <div className="mt-3">
                <TextField
                  label="Related page (slug, blank = all pages)"
                  value={row.related_page ?? ""}
                  onChange={(v) => update(row.id, { related_page: v })}
                  placeholder="lead-generation"
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

        <IconButton label="+ Add question" onClick={addRow} />
      </Panel>
    </div>
  );
}
