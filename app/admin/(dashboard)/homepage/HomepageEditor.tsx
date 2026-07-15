"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { HomepageContent, Stat, GrowthStep, FinalCta } from "@/lib/data/homepage";
import {
  Panel,
  TextField,
  TextAreaField,
  SaveButton,
  StatusMessage,
  UnsavedBadge,
  IconButton,
  type SaveState,
} from "@/components/admin/ui";

type LoadState = "loading" | "ready" | "error";

type HeroData = Pick<
  HomepageContent,
  | "heroBadge"
  | "heroHeadline"
  | "heroRotatingWords"
  | "heroSubheadline"
  | "primaryCtaText"
  | "primaryCtaLink"
  | "secondaryCtaText"
  | "secondaryCtaLink"
>;

type SectionState<T> = {
  data: T;
  saved: T;
  saveState: SaveState;
  error: string | null;
};

type Sections = {
  hero: SectionState<HeroData>;
  stats: SectionState<Stat[]>;
  growthSteps: SectionState<GrowthStep[]>;
  finalCta: SectionState<FinalCta>;
};

type SectionKey = keyof Sections;

function isDirty<T>(section: SectionState<T>): boolean {
  return JSON.stringify(section.data) !== JSON.stringify(section.saved);
}

function buildSections(content: HomepageContent): Sections {
  const hero: HeroData = {
    heroBadge: content.heroBadge,
    heroHeadline: content.heroHeadline,
    heroRotatingWords: content.heroRotatingWords,
    heroSubheadline: content.heroSubheadline,
    primaryCtaText: content.primaryCtaText,
    primaryCtaLink: content.primaryCtaLink,
    secondaryCtaText: content.secondaryCtaText,
    secondaryCtaLink: content.secondaryCtaLink,
  };
  return {
    hero: { data: hero, saved: hero, saveState: "idle", error: null },
    stats: { data: content.stats, saved: content.stats, saveState: "idle", error: null },
    growthSteps: {
      data: content.growthSteps,
      saved: content.growthSteps,
      saveState: "idle",
      error: null,
    },
    finalCta: { data: content.finalCta, saved: content.finalCta, saveState: "idle", error: null },
  };
}

function RepeatableCard({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">{children}</div>
      <div className="mt-3 flex justify-end">
        <IconButton label="Remove" variant="danger" onClick={onRemove} />
      </div>
    </div>
  );
}

export function HomepageEditor() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sections, setSections] = useState<Sections | null>(null);

  const [resetState, setResetState] = useState<SaveState>("idle");
  const [resetError, setResetError] = useState<string | null>(null);

  async function loadHomepage() {
    try {
      const res = await fetch("/api/admin/homepage");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load homepage content.");
      setSections(buildSections(data));
      setLoadState("ready");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load homepage content.");
      setLoadState("error");
    }
  }

  useEffect(() => {
    loadHomepage();
  }, []);

  async function handleResetToDefaults() {
    const confirmed = window.confirm(
      "This overwrites every homepage section, all case studies, and the shared industries list with Netlink's new lead-generation defaults, for everyone visiting the site. This cannot be undone. Continue?"
    );
    if (!confirmed) return;

    setResetState("saving");
    setResetError(null);
    try {
      const res = await fetch("/api/admin/homepage/reset", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reset.");

      setLoadState("loading");
      await loadHomepage();

      setResetState("saved");
      setTimeout(() => setResetState((s) => (s === "saved" ? "idle" : s)), 3000);
    } catch (e) {
      setResetError(e instanceof Error ? e.message : "Failed to reset.");
      setResetState("error");
    }
  }

  function updateSection<K extends SectionKey>(key: K, data: Sections[K]["data"]) {
    setSections((prev) => (prev ? { ...prev, [key]: { ...prev[key], data } } : prev));
  }

  async function saveSection<K extends SectionKey>(key: K) {
    if (!sections) return;
    const section = sections[key];

    setSections((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], saveState: "saving", error: null } } : prev
    );

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: key, data: section.data }),
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

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading homepage content…</p>;
  }
  if (loadState === "error" || !sections) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {loadError || "Could not load homepage content."}
      </p>
    );
  }

  const hero = sections.hero;
  const stats = sections.stats;
  const growthSteps = sections.growthSteps;
  const finalCta = sections.finalCta;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Homepage</h1>
        <p className="mt-1 text-sm text-muted">
          Each section below saves independently — saving one section never touches the others.
          Industries live under Content › Industries; case studies live under Content › Case
          Studies — both are shared with other pages, so they&apos;re edited from one place.
        </p>
      </div>

      <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5 sm:p-7">
        <h2 className="text-base font-semibold text-fg">Reset to Netlink&apos;s new defaults</h2>
        <p className="mt-1 text-sm text-muted">
          Overwrites every section below, all case studies, and the shared industries list with
          the current lead-generation positioning from the codebase. Use this once to push the
          new copy live instead of re-typing each section — review the sections afterward and
          adjust anything you&apos;d like to keep custom.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SaveButton
            state={resetState}
            label="Reset all homepage content"
            onClick={handleResetToDefaults}
          />
          <StatusMessage state={resetState} error={resetError} />
        </div>
      </section>

      {/* ── Hero ── */}
      <Panel
        title="Hero"
        description="The first thing visitors see."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isDirty(hero)} />
            <SaveButton state={hero.saveState} label="Save Hero" onClick={() => saveSection("hero")} />
          </div>
        }
      >
        <TextField label="Badge text" value={hero.data.heroBadge} onChange={(v) => updateSection("hero", { ...hero.data, heroBadge: v })} />
        <TextField label="Headline" value={hero.data.heroHeadline} onChange={(v) => updateSection("hero", { ...hero.data, heroHeadline: v })} />
        <TextField
          label="Rotating words (comma-separated)"
          value={hero.data.heroRotatingWords.join(", ")}
          onChange={(v) =>
            updateSection("hero", {
              ...hero.data,
              heroRotatingWords: v.split(",").map((w) => w.trim()).filter(Boolean),
            })
          }
        />
        <TextAreaField
          label="Subheadline"
          value={hero.data.heroSubheadline}
          onChange={(v) => updateSection("hero", { ...hero.data, heroSubheadline: v })}
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Primary CTA text" value={hero.data.primaryCtaText} onChange={(v) => updateSection("hero", { ...hero.data, primaryCtaText: v })} />
          <TextField label="Primary CTA link" value={hero.data.primaryCtaLink} onChange={(v) => updateSection("hero", { ...hero.data, primaryCtaLink: v })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Secondary CTA text" value={hero.data.secondaryCtaText} onChange={(v) => updateSection("hero", { ...hero.data, secondaryCtaText: v })} />
          <TextField label="Secondary CTA link" value={hero.data.secondaryCtaLink} onChange={(v) => updateSection("hero", { ...hero.data, secondaryCtaLink: v })} />
        </div>
        <StatusMessage state={hero.saveState} error={hero.error} />
      </Panel>

      {/* ── Stats ── */}
      <Panel
        title="Stats"
        description="The four numbers shown under the hero."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isDirty(stats)} />
            <SaveButton state={stats.saveState} label="Save Stats" onClick={() => saveSection("stats")} />
          </div>
        }
      >
        {stats.data.map((s, i) => (
          <RepeatableCard key={i} onRemove={() => updateSection("stats", stats.data.filter((_, idx) => idx !== i))}>
            <div className="sm:w-24">
              <TextField
                label="Value"
                value={String(s.value)}
                onChange={(v) => {
                  const next = [...stats.data];
                  next[i] = { ...next[i], value: Number(v) || 0 };
                  updateSection("stats", next);
                }}
              />
            </div>
            <div className="sm:w-24">
              <TextField
                label="Suffix"
                value={s.suffix}
                onChange={(v) => {
                  const next = [...stats.data];
                  next[i] = { ...next[i], suffix: v };
                  updateSection("stats", next);
                }}
              />
            </div>
            <div className="flex-1">
              <TextField
                label="Label"
                value={s.label}
                onChange={(v) => {
                  const next = [...stats.data];
                  next[i] = { ...next[i], label: v };
                  updateSection("stats", next);
                }}
              />
            </div>
          </RepeatableCard>
        ))}
        <IconButton label="+ Add stat" onClick={() => updateSection("stats", [...stats.data, { value: 0, suffix: "", label: "" }])} />
        <StatusMessage state={stats.saveState} error={stats.error} />
      </Panel>

      {/* ── Growth steps ── */}
      <Panel
        title="Growth system steps"
        description="The step-by-step process shown on your homepage."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isDirty(growthSteps)} />
            <SaveButton
              state={growthSteps.saveState}
              label="Save Growth Steps"
              onClick={() => saveSection("growthSteps")}
            />
          </div>
        }
      >
        {growthSteps.data.map((step, i) => (
          <RepeatableCard
            key={i}
            onRemove={() => updateSection("growthSteps", growthSteps.data.filter((_, idx) => idx !== i))}
          >
            <div className="sm:w-16">
              <TextField
                label="No."
                value={step.num}
                onChange={(v) => {
                  const next = [...growthSteps.data];
                  next[i] = { ...next[i], num: v };
                  updateSection("growthSteps", next);
                }}
              />
            </div>
            <div className="sm:w-40">
              <TextField
                label="Title"
                value={step.title}
                onChange={(v) => {
                  const next = [...growthSteps.data];
                  next[i] = { ...next[i], title: v };
                  updateSection("growthSteps", next);
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <TextAreaField
                label="Description"
                value={step.text}
                rows={2}
                onChange={(v) => {
                  const next = [...growthSteps.data];
                  next[i] = { ...next[i], text: v };
                  updateSection("growthSteps", next);
                }}
              />
            </div>
          </RepeatableCard>
        ))}
        <IconButton
          label="+ Add step"
          onClick={() =>
            updateSection("growthSteps", [
              ...growthSteps.data,
              { num: String(growthSteps.data.length + 1).padStart(2, "0"), title: "", text: "" },
            ])
          }
        />
        <StatusMessage state={growthSteps.saveState} error={growthSteps.error} />
      </Panel>

      {/* Industries now live on their own shared editor — see Content › Industries
          (/admin/pages/industries) — since the same list also feeds the full
          /industries page, not just this homepage grid. */}

      {/* ── Final CTA ── */}
      <Panel
        title="Final CTA"
        description="The closing section above the contact form."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isDirty(finalCta)} />
            <SaveButton state={finalCta.saveState} label="Save Final CTA" onClick={() => saveSection("finalCta")} />
          </div>
        }
      >
        <TextField label="Eyebrow" value={finalCta.data.eyebrow} onChange={(v) => updateSection("finalCta", { ...finalCta.data, eyebrow: v })} />
        <TextField label="Title" value={finalCta.data.title} onChange={(v) => updateSection("finalCta", { ...finalCta.data, title: v })} />
        <TextAreaField label="Text" rows={3} value={finalCta.data.text} onChange={(v) => updateSection("finalCta", { ...finalCta.data, text: v })} />

        {finalCta.data.bullets.map((b, i) => (
          <RepeatableCard
            key={i}
            onRemove={() =>
              updateSection("finalCta", {
                ...finalCta.data,
                bullets: finalCta.data.bullets.filter((_, idx) => idx !== i),
              })
            }
          >
            <div className="flex-1">
              <TextField
                label={`Bullet ${i + 1}`}
                value={b}
                onChange={(v) => {
                  const next = [...finalCta.data.bullets];
                  next[i] = v;
                  updateSection("finalCta", { ...finalCta.data, bullets: next });
                }}
              />
            </div>
          </RepeatableCard>
        ))}
        <IconButton
          label="+ Add bullet"
          onClick={() => updateSection("finalCta", { ...finalCta.data, bullets: [...finalCta.data.bullets, ""] })}
        />
        <StatusMessage state={finalCta.saveState} error={finalCta.error} />
      </Panel>
    </div>
  );
}
