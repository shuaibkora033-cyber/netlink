"use client";

import { useEffect, useRef, useState } from "react";
import {
  Panel,
  TextField,
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

type ClientRow = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  industry: string | null;
  order_index: number;
  is_visible: boolean;
};

function isRowDirty(row: ClientRow, saved: Record<string, ClientRow>): boolean {
  const s = saved[row.id];
  return !s || JSON.stringify(row) !== JSON.stringify(s);
}

export function ClientsEditor() {
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [saved, setSaved] = useState<Record<string, ClientRow>>({});
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
      const res = await fetch("/api/admin/clients", { signal: controller.signal });
      const data: ClientRow[] = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error || "Failed to load clients.");
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

  function update(id: string, patch: Partial<ClientRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function save(row: ClientRow) {
    setRowState((s) => ({ ...s, [row.id]: "saving" }));
    setRowError((s) => ({ ...s, [row.id]: null }));
    try {
      const res = await fetch(`/api/admin/clients/${row.id}`, {
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
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New client",
        logo_url: "",
        website_url: "",
        industry: "",
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
    const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
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
        <h1 className="text-xl font-semibold text-fg">Clients</h1>
        <p className="mt-1 text-sm text-muted">
          Manages the client logo marquee data. Note: this section isn&apos;t currently placed on
          any page — it was left out when the site was split into multiple pages. Add it back to
          a page to make these edits visible.
        </p>
      </div>

      <Panel title="Client logos" description="Each logo saves independently.">
        {loadState === "loading" && <p className="text-sm text-muted">Loading clients…</p>}
        {loadState === "error" && (
          <ErrorState message="Could not load clients." onRetry={() => guardedRetry(load)} retrying={retrying} />
        )}

        {loadState === "ready" &&
          rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Name" value={row.name} onChange={(v) => update(row.id, { name: v })} />
                <TextField label="Industry" value={row.industry ?? ""} onChange={(v) => update(row.id, { industry: v })} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Logo URL"
                  value={row.logo_url ?? ""}
                  onChange={(v) => update(row.id, { logo_url: v })}
                  placeholder="/clients/logo.webp"
                />
                <TextField
                  label="Website URL"
                  value={row.website_url ?? ""}
                  onChange={(v) => update(row.id, { website_url: v })}
                  placeholder="https://client-site.com"
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

        <IconButton label="+ Add client" onClick={addRow} />
      </Panel>
    </div>
  );
}
