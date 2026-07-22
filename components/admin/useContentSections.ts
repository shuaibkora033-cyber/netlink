"use client";

import { useEffect, useRef, useState } from "react";
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
  // Bumped by reload() to retrigger the fetch effect below — a dependency
  // change is the only way to re-run an effect on demand, so a retry click
  // just increments this rather than calling the fetch logic directly.
  const [reloadToken, setReloadToken] = useState(0);
  // Separate from loadState: a retry keeps loadState at "error" (so
  // ErrorState stays mounted throughout) and only flips this instead, which
  // ErrorState uses to disable its button and show "Retrying…".
  const [retrying, setRetrying] = useState(false);
  // Checked and set synchronously inside reload() — a state-only guard
  // (retrying) still has a gap between a click and the next render, where a
  // second click would read the same stale "not retrying yet" value. A ref
  // closes that gap regardless of React's render timing.
  const retryInFlightRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const isRetry = reloadToken > 0;

    if (isRetry) {
      setRetrying(true);
    } else {
      setLoadState("loading");
    }
    setLoadError(null);

    (async () => {
      try {
        const res = await fetch(`/api/admin/content-sections?slug=${encodeURIComponent(pageSlug)}`, {
          signal: controller.signal,
        });
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
        if (e instanceof DOMException && e.name === "AbortError") return;
        setLoadError(e instanceof Error ? e.message : "Failed to load page content.");
        setLoadState("error");
      } finally {
        // Always reset — regardless of whether this run was cancelled —
        // since a cancelled run is, by definition, no longer "in flight".
        // reload() is itself guarded (see retryInFlightRef there), so only
        // one run can ever hold this ref at a time; there's no case here
        // where an older run's cleanup would need to leave it alone for a
        // newer one.
        setRetrying(false);
        retryInFlightRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
    // fallbacks is a stable module-level object per page — only pageSlug/reloadToken should retrigger the fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSlug, reloadToken]);

  function reload() {
    if (retryInFlightRef.current) return;
    retryInFlightRef.current = true;
    setReloadToken((t) => t + 1);
  }

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

  return { loadState, loadError, sections, update, save, reload, retrying };
}
