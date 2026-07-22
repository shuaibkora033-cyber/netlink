"use client";

import { useEffect, useRef, useState } from "react";
import { industriesPage, pageCta } from "@/lib/content";
import { usePageSections, isSectionDirty } from "@/components/admin/useContentSections";
import { HeroPanel, FinalCtaPanel, type HeroContent, type FinalCtaContent } from "@/components/admin/SectionPanels";
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

const PAGE_SLUG = "industries";

const FALLBACKS = {
  hero: industriesPage.hero as HeroContent,
  finalCta: {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  } as FinalCtaContent,
};

type LoadState = "loading" | "ready" | "error";

type IndustryCardRow = {
  id: string;
  slug: string;
  name: string;
  problem: string;
  solution: string;
  cta_text: string;
  cta_href: string;
  order_index: number;
  is_visible: boolean;
};

function isRowDirty(row: IndustryCardRow, saved: Record<string, IndustryCardRow>): boolean {
  const s = saved[row.id];
  return !s || JSON.stringify(row) !== JSON.stringify(s);
}

export function IndustriesEditor() {
  const { loadState, loadError, sections, update, save, reload, retrying } = usePageSections(PAGE_SLUG, FALLBACKS);

  const [cards, setCards] = useState<IndustryCardRow[]>([]);
  const [savedCards, setSavedCards] = useState<Record<string, IndustryCardRow>>({});
  const [cardsLoadState, setCardsLoadState] = useState<LoadState>("loading");
  const [rowState, setRowState] = useState<Record<string, SaveState>>({});
  const [rowError, setRowError] = useState<Record<string, string | null>>({});

  // Tracks the most recent loadCards() call so a slower, superseded response
  // (whether from an accidental overlap or a genuinely stale request) can
  // never overwrite state set by a newer one, and aborts the in-flight
  // request outright on unmount or when a newer call starts.
  const cardsRequestRef = useRef<AbortController | null>(null);

  async function loadCards() {
    cardsRequestRef.current?.abort();
    const controller = new AbortController();
    cardsRequestRef.current = controller;
    try {
      const res = await fetch("/api/admin/industry-cards", { signal: controller.signal });
      const data: IndustryCardRow[] = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error?: string }).error || "Failed to load industries.");
      if (cardsRequestRef.current !== controller) return;
      setCards(data);
      setSavedCards(Object.fromEntries(data.map((row) => [row.id, row])));
      setCardsLoadState("ready");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (cardsRequestRef.current !== controller) return;
      setCardsLoadState("error");
    }
  }

  useEffect(() => {
    loadCards();
    return () => {
      cardsRequestRef.current?.abort();
    };
  }, []);

  const { retrying: cardsRetrying, guardedRetry: guardedCardsRetry } = useRetryGuard();

  function updateCard(id: string, patch: Partial<IndustryCardRow>) {
    setCards((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function saveCard(row: IndustryCardRow) {
    setRowState((s) => ({ ...s, [row.id]: "saving" }));
    setRowError((s) => ({ ...s, [row.id]: null }));
    try {
      const res = await fetch(`/api/admin/industry-cards/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save.");
      setSavedCards((s) => ({ ...s, [row.id]: row }));
      setRowState((s) => ({ ...s, [row.id]: "saved" }));
      setTimeout(() => setRowState((s) => (s[row.id] === "saved" ? { ...s, [row.id]: "idle" } : s)), 2500);
    } catch (e) {
      setRowError((s) => ({ ...s, [row.id]: e instanceof Error ? e.message : "Failed to save." }));
      setRowState((s) => ({ ...s, [row.id]: "error" }));
    }
  }

  async function addCard() {
    const res = await fetch("/api/admin/industry-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New industry",
        slug: "",
        problem: "",
        solution: "",
        cta_text: "Book a Free Growth Consultation",
        cta_href: "/book-consultation",
        order_index: cards.length,
        is_visible: true,
      }),
    });
    if (res.ok) {
      const row = await res.json();
      setCards((prev) => [...prev, row]);
      setSavedCards((s) => ({ ...s, [row.id]: row }));
    }
  }

  async function deleteCard(id: string) {
    const res = await fetch(`/api/admin/industry-cards/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCards((prev) => prev.filter((r) => r.id !== id));
      setSavedCards((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  }

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading page content…</p>;
  }
  if (loadState === "error" || !sections) {
    return <ErrorState message={loadError || "Could not load page content."} onRetry={reload} retrying={retrying} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Industries</h1>
        <p className="mt-1 text-sm text-muted">
          This one list feeds both the homepage&apos;s compact industries grid and the full
          /industries page. Edits go live immediately after saving.
        </p>
      </div>

      <HeroPanel
        data={sections.hero.data}
        saveState={sections.hero.saveState}
        error={sections.hero.error}
        dirty={isSectionDirty(sections.hero)}
        onChange={(v) => update("hero", v)}
        onSave={() => save("hero")}
      />

      <Panel title="Industry cards" description="Each card saves independently.">
        {cardsLoadState === "loading" && <p className="text-sm text-muted">Loading industries…</p>}
        {cardsLoadState === "error" && (
          <ErrorState
            message="Could not load industries."
            onRetry={() => guardedCardsRetry(loadCards)}
            retrying={cardsRetrying}
          />
        )}

        {cardsLoadState === "ready" &&
          cards.map((row) => (
            <div key={row.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Name" value={row.name} onChange={(v) => updateCard(row.id, { name: v })} />
                <TextField
                  label="Icon key (slug)"
                  value={row.slug}
                  onChange={(v) => updateCard(row.id, { slug: v })}
                  placeholder="solar, home-services, legal…"
                />
              </div>
              <div className="mt-3">
                <TextAreaField
                  label="Common lead problem"
                  rows={2}
                  value={row.problem}
                  onChange={(v) => updateCard(row.id, { problem: v })}
                />
              </div>
              <div className="mt-3">
                <TextAreaField
                  label="How Netlink helps"
                  rows={2}
                  value={row.solution}
                  onChange={(v) => updateCard(row.id, { solution: v })}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <TextField label="CTA text" value={row.cta_text} onChange={(v) => updateCard(row.id, { cta_text: v })} />
                <TextField label="CTA link" value={row.cta_href} onChange={(v) => updateCard(row.id, { cta_href: v })} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ToggleField
                  label="Visible"
                  checked={row.is_visible}
                  onChange={(v) => updateCard(row.id, { is_visible: v })}
                />
                <UnsavedBadge show={isRowDirty(row, savedCards)} />
                <SaveButton state={rowState[row.id] ?? "idle"} label="Save" onClick={() => saveCard(row)} />
                <IconButton label="Delete" variant="danger" onClick={() => deleteCard(row.id)} />
              </div>
              <div className="mt-2">
                <StatusMessage state={rowState[row.id] ?? "idle"} error={rowError[row.id]} />
              </div>
            </div>
          ))}

        <IconButton label="+ Add industry" onClick={addCard} />
      </Panel>

      <FinalCtaPanel
        data={sections.finalCta.data}
        saveState={sections.finalCta.saveState}
        error={sections.finalCta.error}
        dirty={isSectionDirty(sections.finalCta)}
        onChange={(v) => update("finalCta", v)}
        onSave={() => save("finalCta")}
      />
    </div>
  );
}
