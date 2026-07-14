"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { HomepageContent, Stat, GrowthStep, IndustryItem, FinalCta } from "@/lib/data/homepage";
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
  industries: SectionState<IndustryItem[]>;
  finalCta: SectionState<FinalCta>;
};

type SectionKey = keyof Sections;

type CaseStudyRow = {
  id: string;
  industry: string;
  title: string;
  body: string;
  metrics: { value: string; label: string }[];
  order_index: number;
  is_visible: boolean;
};

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
    industries: {
      data: content.industries,
      saved: content.industries,
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

  const [caseStudies, setCaseStudies] = useState<CaseStudyRow[]>([]);
  const [savedCaseStudies, setSavedCaseStudies] = useState<Record<string, CaseStudyRow>>({});
  const [csLoadState, setCsLoadState] = useState<LoadState>("loading");
  const [csRowState, setCsRowState] = useState<Record<string, SaveState>>({});
  const [csRowError, setCsRowError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    (async () => {
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
    })();

    (async () => {
      try {
        const res = await fetch("/api/admin/case-studies");
        const data: CaseStudyRow[] = await res.json();
        if (!res.ok) throw new Error((data as unknown as { error?: string }).error || "Failed to load case studies.");
        setCaseStudies(data);
        setSavedCaseStudies(Object.fromEntries(data.map((row) => [row.id, row])));
        setCsLoadState("ready");
      } catch {
        setCsLoadState("error");
      }
    })();
  }, []);

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

  function isRowDirty(row: CaseStudyRow): boolean {
    const saved = savedCaseStudies[row.id];
    return !saved || JSON.stringify(row) !== JSON.stringify(saved);
  }

  async function saveCaseStudy(row: CaseStudyRow) {
    setCsRowState((s) => ({ ...s, [row.id]: "saving" }));
    setCsRowError((s) => ({ ...s, [row.id]: null }));
    try {
      const res = await fetch(`/api/admin/case-studies/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save.");
      setSavedCaseStudies((s) => ({ ...s, [row.id]: row }));
      setCsRowState((s) => ({ ...s, [row.id]: "saved" }));
      setTimeout(() => setCsRowState((s) => (s[row.id] === "saved" ? { ...s, [row.id]: "idle" } : s)), 2500);
    } catch (e) {
      setCsRowError((s) => ({ ...s, [row.id]: e instanceof Error ? e.message : "Failed to save." }));
      setCsRowState((s) => ({ ...s, [row.id]: "error" }));
    }
  }

  async function addCaseStudy() {
    const res = await fetch("/api/admin/case-studies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        industry: "",
        title: "New case study",
        body: "",
        metrics: [],
        order_index: caseStudies.length,
        is_visible: true,
      }),
    });
    if (res.ok) {
      const row = await res.json();
      setCaseStudies((prev) => [...prev, row]);
      setSavedCaseStudies((s) => ({ ...s, [row.id]: row }));
    }
  }

  async function deleteCaseStudy(id: string) {
    const res = await fetch(`/api/admin/case-studies/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCaseStudies((prev) => prev.filter((r) => r.id !== id));
      setSavedCaseStudies((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  }

  function updateCaseStudy(id: string, patch: Partial<CaseStudyRow>) {
    setCaseStudies((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
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
  const industries = sections.industries;
  const finalCta = sections.finalCta;

  const anyCaseStudyDirty = caseStudies.some(isRowDirty);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Homepage</h1>
        <p className="mt-1 text-sm text-muted">
          Each section below saves independently — saving one section never touches the others.
        </p>
      </div>

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

      {/* ── Industries ── */}
      <Panel
        title="Industries"
        description="The industries grid shown on your homepage."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isDirty(industries)} />
            <SaveButton
              state={industries.saveState}
              label="Save Industries"
              onClick={() => saveSection("industries")}
            />
          </div>
        }
      >
        {industries.data.map((ind, i) => (
          <RepeatableCard
            key={i}
            onRemove={() => updateSection("industries", industries.data.filter((_, idx) => idx !== i))}
          >
            <div className="sm:w-40">
              <TextField
                label="Id (icon key)"
                value={ind.id}
                onChange={(v) => {
                  const next = [...industries.data];
                  next[i] = { ...next[i], id: v };
                  updateSection("industries", next);
                }}
              />
            </div>
            <div className="flex-1">
              <TextField
                label="Name"
                value={ind.name}
                onChange={(v) => {
                  const next = [...industries.data];
                  next[i] = { ...next[i], name: v };
                  updateSection("industries", next);
                }}
              />
            </div>
          </RepeatableCard>
        ))}
        <IconButton label="+ Add industry" onClick={() => updateSection("industries", [...industries.data, { id: "", name: "" }])} />
        <p className="text-xs text-muted/70">
          Known icon keys: solar, home-services, healthcare, real-estate, professional, construction, ecommerce, finance. Unknown keys use a generic icon.
        </p>
        <StatusMessage state={industries.saveState} error={industries.error} />
      </Panel>

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

      {/* ── Results / case studies ── */}
      <Panel
        title="Results / case studies"
        description="Each card saves independently."
        headerAction={<UnsavedBadge show={anyCaseStudyDirty} />}
      >
        {csLoadState === "loading" && <p className="text-sm text-muted">Loading case studies…</p>}
        {csLoadState === "error" && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            Could not load case studies.
          </p>
        )}

        {csLoadState === "ready" &&
          caseStudies.map((row) => (
            <div key={row.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Industry" value={row.industry} onChange={(v) => updateCaseStudy(row.id, { industry: v })} />
                <TextField label="Title" value={row.title} onChange={(v) => updateCaseStudy(row.id, { title: v })} />
              </div>
              <div className="mt-3">
                <TextAreaField label="Description" rows={2} value={row.body} onChange={(v) => updateCaseStudy(row.id, { body: v })} />
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {row.metrics.map((m, mi) => (
                  <div key={mi} className="flex flex-col gap-2 sm:flex-row">
                    <div className="sm:w-32">
                      <TextField
                        label="Metric value"
                        value={m.value}
                        onChange={(v) => {
                          const next = [...row.metrics];
                          next[mi] = { ...next[mi], value: v };
                          updateCaseStudy(row.id, { metrics: next });
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <TextField
                        label="Metric label"
                        value={m.label}
                        onChange={(v) => {
                          const next = [...row.metrics];
                          next[mi] = { ...next[mi], label: v };
                          updateCaseStudy(row.id, { metrics: next });
                        }}
                      />
                    </div>
                    <div className="flex items-end">
                      <IconButton
                        label="Remove"
                        variant="danger"
                        onClick={() => updateCaseStudy(row.id, { metrics: row.metrics.filter((_, idx) => idx !== mi) })}
                      />
                    </div>
                  </div>
                ))}
                <IconButton
                  label="+ Add metric"
                  onClick={() => updateCaseStudy(row.id, { metrics: [...row.metrics, { value: "", label: "" }] })}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={row.is_visible}
                    onChange={(e) => updateCaseStudy(row.id, { is_visible: e.target.checked })}
                    className="h-4 w-4 rounded border-line accent-[var(--color-neon)]"
                  />
                  Visible on site
                </label>
                <UnsavedBadge show={isRowDirty(row)} />
                <SaveButton
                  state={csRowState[row.id] ?? "idle"}
                  label="Save"
                  onClick={() => saveCaseStudy(row)}
                />
                <IconButton label="Delete" variant="danger" onClick={() => deleteCaseStudy(row.id)} />
              </div>
              <div className="mt-2">
                <StatusMessage state={csRowState[row.id] ?? "idle"} error={csRowError[row.id]} />
              </div>
            </div>
          ))}

        <IconButton label="+ Add case study" onClick={addCaseStudy} />
      </Panel>
    </div>
  );
}
