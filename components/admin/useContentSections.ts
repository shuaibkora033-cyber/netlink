"use client";

import { useEffect, useState } from "react";
import type { SaveState } from "./ui";

export type SectionState<T> = {
  data: T;
  saved: T;
  saveState: SaveState;
  error: string | null;
};

export function isSectionDirty<T>(s: SectionState<T>): boolean {
  return JSON.stringify(s.data) !== JSON.stringify(s.saved);
}

type Sections<S> = { [K in keyof S]: SectionState<S[K]> };

/**
 * Generic per-page content editor state, backed by /api/admin/content-sections.
 * Does one GET for every section of a page, seeds each section's starting
 * value from the saved row or — if nothing has been saved yet — from
 * `fallbacks` (the static copy in lib/content.ts), and exposes an
 * independent update/save per section. Saving PATCHes only the section that
 * changed, mirroring HomepageEditor.tsx's per-section save model.
 */
export function usePageSections<S extends Record<string, unknown>>(pageSlug: string, fallbacks: S) {
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sections, setSections] = useState<Sections<S> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/content-sections?slug=${encodeURIComponent(pageSlug)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load page content.");
        if (cancelled) return;

        const built = {} as Sections<S>;
        for (const key of Object.keys(fallbacks) as (keyof S)[]) {
          const row = data[key as string] as { content?: S[typeof key] } | undefined;
          const saved = row?.content ?? fallbacks[key];
          built[key] = { data: saved, saved, saveState: "idle", error: null };
        }
        setSections(built);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : "Failed to load page content.");
        setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
    // fallbacks is a stable module-level object per page — only pageSlug should retrigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSlug]);

  function update<K extends keyof S>(key: K, data: S[K]) {
    setSections((prev) => (prev ? { ...prev, [key]: { ...prev[key], data } } : prev));
  }

  async function save<K extends keyof S>(key: K) {
    if (!sections) return;
    const section = sections[key];

    setSections((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], saveState: "saving", error: null } } : prev
    );

    try {
      const res = await fetch("/api/admin/content-sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageSlug, sectionKey: String(key), content: section.data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save.");

      setSections((prev) =>
        prev
          ? { ...prev, [key]: { ...prev[key], saved: prev[key].data, saveState: "saved", error: null } }
          : prev
      );
      setTimeout(() => {
        setSections((prev) =>
          prev && prev[key].saveState === "saved"
            ? { ...prev, [key]: { ...prev[key], saveState: "idle" } }
            : prev
        );
      }, 2500);
    } catch (e) {
      setSections((prev) =>
        prev
          ? {
              ...prev,
              [key]: {
                ...prev[key],
                saveState: "error",
                error: e instanceof Error ? e.message : "Failed to save.",
              },
            }
          : prev
      );
    }
  }

  return { loadState, loadError, sections, update, save };
}
