"use client";

import { useEffect, useRef, useState } from "react";
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

type ServiceRow = {
  id: string;
  title: string;
  description: string;
  icon_key: string | null;
  link_href: string | null;
  order_index: number;
  is_visible: boolean;
};

function isRowDirty(row: ServiceRow, saved: Record<string, ServiceRow>): boolean {
  const s = saved[row.id];
  return !s || JSON.stringify(row) !== JSON.stringify(s);
}

export function ServicesEditor() {
  const [rows, setRows] = useState<ServiceRow[]>([]);
  const [saved, setSaved] = useState<Record<string, ServiceRow>>({});
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
      const res = await fetch("/api/admin/services", { signal: controller.signal });
      const data: ServiceRow[] = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error || "Failed to load services.");
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

  function update(id: string, patch: Partial<ServiceRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: ServiceRow) {
    setRowState((s) => ({ ...s, [row.id]: "saving" }));
    setRowError((s) => ({ ...s, [row.id]: null }));
    try {
      const res = await fetch(`/api/admin/services/${row.id}`, {
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
    const res = await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New service",
        description: "",
        icon_key: "",
        link_href: "",
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
    const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
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
        <h1 className="text-xl font-semibold text-fg">Services</h1>
        <p className="mt-1 text-sm text-muted">
          Edits go live on the homepage&apos;s solution grid immediately after saving. Each card
          saves independently.
        </p>
      </div>

      <Panel title="Service cards" description="Icon key controls which icon renders — see the list below.">
        {loadState === "loading" && <p className="text-sm text-muted">Loading services…</p>}
        {loadState === "error" && (
          <ErrorState message="Could not load services." onRetry={() => guardedRetry(load)} retrying={retrying} />
        )}

        {loadState === "ready" &&
          rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Title" value={row.title} onChange={(v) => update(row.id, { title: v })} />
                <TextField
                  label="Icon key"
                  value={row.icon_key ?? ""}
                  onChange={(v) => update(row.id, { icon_key: v })}
                  placeholder="lead-gen, appt-setting, conversion…"
                />
              </div>
              <div className="mt-3">
                <TextAreaField
                  label="Description"
                  rows={2}
                  value={row.description}
                  onChange={(v) => update(row.id, { description: v })}
                />
              </div>
              <div className="mt-3">
                <TextField
                  label="Page link"
                  value={row.link_href ?? ""}
                  onChange={(v) => update(row.id, { link_href: v })}
                  placeholder="/lead-generation"
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

        <IconButton label="+ Add service" onClick={addRow} />
        <p className="text-xs text-muted/70">
          Known icon keys: lead-gen, appt-setting, conversion, lead-nurturing, reporting-dashboard.
          Unknown keys render no icon.
        </p>
      </Panel>
    </div>
  );
}
