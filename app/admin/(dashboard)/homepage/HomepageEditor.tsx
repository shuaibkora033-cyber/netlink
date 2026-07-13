"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { HomepageContent } from "@/lib/data/homepage";
import {
  Panel,
  TextField,
  TextAreaField,
  SaveButton,
  StatusMessage,
  IconButton,
  type SaveState,
} from "@/components/admin/ui";

type LoadState = "loading" | "ready" | "error";

type CaseStudyRow = {
  id: string;
  industry: string;
  title: string;
  body: string;
  metrics: { value: string; label: string }[];
  order_index: number;
  is_visible: boolean;
};

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
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const [caseStudies, setCaseStudies] = useState<CaseStudyRow[]>([]);
  const [csLoadState, setCsLoadState] = useState<LoadState>("loading");
  const [csRowState, setCsRowState] = useState<Record<string, SaveState>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/homepage");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load homepage content.");
        setContent(data);
        setLoadState("ready");
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load homepage content.");
        setLoadState("error");
      }
    })();

    (async () => {
      try {
        const res = await fetch("/api/admin/case-studies");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load case studies.");
        setCaseStudies(data);
        setCsLoadState("ready");
      } catch {
        setCsLoadState("error");
      }
    })();
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!content) return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setSaveState("saved");
      setTimeout(() => setSaveState((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save.");
      setSaveState("error");
    }
  }

  async function saveCaseStudy(row: CaseStudyRow) {
    setCsRowState((s) => ({ ...s, [row.id]: "saving" }));
    try {
      const res = await fetch(`/api/admin/case-studies/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) throw new Error();
      setCsRowState((s) => ({ ...s, [row.id]: "saved" }));
      setTimeout(() => setCsRowState((s) => ({ ...s, [row.id]: "idle" })), 2500);
    } catch {
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
    }
  }

  async function deleteCaseStudy(id: string) {
    const res = await fetch(`/api/admin/case-studies/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCaseStudies((prev) => prev.filter((r) => r.id !== id));
    }
  }

  function updateCaseStudy(id: string, patch: Partial<CaseStudyRow>) {
    setCaseStudies((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading homepage content…</p>;
  }
  if (loadState === "error" || !content) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {loadError || "Could not load homepage content."}
      </p>
    );
  }

  function update<K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const safeContent = content;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Homepage</h1>
        <p className="mt-1 text-sm text-muted">
          Edit the hero, stats, growth steps, industries, and final CTA shown on your homepage.
        </p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Panel title="Hero" description="The first thing visitors see.">
          <TextField label="Badge text" value={safeContent.heroBadge} onChange={(v) => update("heroBadge", v)} />
          <TextField label="Headline" value={safeContent.heroHeadline} onChange={(v) => update("heroHeadline", v)} />
          <TextField
            label="Rotating words (comma-separated)"
            value={safeContent.heroRotatingWords.join(", ")}
            onChange={(v) =>
              update(
                "heroRotatingWords",
                v.split(",").map((w) => w.trim()).filter(Boolean)
              )
            }
          />
          <TextAreaField
            label="Subheadline"
            value={safeContent.heroSubheadline}
            onChange={(v) => update("heroSubheadline", v)}
            rows={3}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Primary CTA text" value={safeContent.primaryCtaText} onChange={(v) => update("primaryCtaText", v)} />
            <TextField label="Primary CTA link" value={safeContent.primaryCtaLink} onChange={(v) => update("primaryCtaLink", v)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Secondary CTA text" value={safeContent.secondaryCtaText} onChange={(v) => update("secondaryCtaText", v)} />
            <TextField label="Secondary CTA link" value={safeContent.secondaryCtaLink} onChange={(v) => update("secondaryCtaLink", v)} />
          </div>
        </Panel>

        <Panel title="Stats" description="The four numbers shown under the hero.">
          {safeContent.stats.map((s, i) => (
            <RepeatableCard
              key={i}
              onRemove={() => update("stats", safeContent.stats.filter((_, idx) => idx !== i))}
            >
              <div className="sm:w-24">
                <TextField
                  label="Value"
                  value={String(s.value)}
                  onChange={(v) => {
                    const next = [...safeContent.stats];
                    next[i] = { ...next[i], value: Number(v) || 0 };
                    update("stats", next);
                  }}
                />
              </div>
              <div className="sm:w-24">
                <TextField
                  label="Suffix"
                  value={s.suffix}
                  onChange={(v) => {
                    const next = [...safeContent.stats];
                    next[i] = { ...next[i], suffix: v };
                    update("stats", next);
                  }}
                />
              </div>
              <div className="flex-1">
                <TextField
                  label="Label"
                  value={s.label}
                  onChange={(v) => {
                    const next = [...safeContent.stats];
                    next[i] = { ...next[i], label: v };
                    update("stats", next);
                  }}
                />
              </div>
            </RepeatableCard>
          ))}
          <IconButton
            label="+ Add stat"
            onClick={() => update("stats", [...safeContent.stats, { value: 0, suffix: "", label: "" }])}
          />
        </Panel>

        <Panel title="Growth system steps" description="The step-by-step process shown on your homepage.">
          {safeContent.growthSteps.map((step, i) => (
            <RepeatableCard
              key={i}
              onRemove={() => update("growthSteps", safeContent.growthSteps.filter((_, idx) => idx !== i))}
            >
              <div className="sm:w-16">
                <TextField
                  label="No."
                  value={step.num}
                  onChange={(v) => {
                    const next = [...safeContent.growthSteps];
                    next[i] = { ...next[i], num: v };
                    update("growthSteps", next);
                  }}
                />
              </div>
              <div className="sm:w-40">
                <TextField
                  label="Title"
                  value={step.title}
                  onChange={(v) => {
                    const next = [...safeContent.growthSteps];
                    next[i] = { ...next[i], title: v };
                    update("growthSteps", next);
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <TextAreaField
                  label="Description"
                  value={step.text}
                  rows={2}
                  onChange={(v) => {
                    const next = [...safeContent.growthSteps];
                    next[i] = { ...next[i], text: v };
                    update("growthSteps", next);
                  }}
                />
              </div>
            </RepeatableCard>
          ))}
          <IconButton
            label="+ Add step"
            onClick={() =>
              update("growthSteps", [
                ...safeContent.growthSteps,
                { num: String(safeContent.growthSteps.length + 1).padStart(2, "0"), title: "", text: "" },
              ])
            }
          />
        </Panel>

        <Panel title="Industries" description="The industries grid shown on your homepage.">
          {safeContent.industries.map((ind, i) => (
            <RepeatableCard
              key={i}
              onRemove={() => update("industries", safeContent.industries.filter((_, idx) => idx !== i))}
            >
              <div className="sm:w-40">
                <TextField
                  label="Id (icon key)"
                  value={ind.id}
                  onChange={(v) => {
                    const next = [...safeContent.industries];
                    next[i] = { ...next[i], id: v };
                    update("industries", next);
                  }}
                />
              </div>
              <div className="flex-1">
                <TextField
                  label="Name"
                  value={ind.name}
                  onChange={(v) => {
                    const next = [...safeContent.industries];
                    next[i] = { ...next[i], name: v };
                    update("industries", next);
                  }}
                />
              </div>
            </RepeatableCard>
          ))}
          <IconButton
            label="+ Add industry"
            onClick={() => update("industries", [...safeContent.industries, { id: "", name: "" }])}
          />
          <p className="text-xs text-muted/70">
            Known icon keys: solar, home-services, healthcare, real-estate, professional, construction, ecommerce, finance. Unknown keys use a generic icon.
          </p>
        </Panel>

        <Panel title="Final CTA" description="The closing section above the contact form.">
          <TextField label="Eyebrow" value={safeContent.finalCta.eyebrow} onChange={(v) => update("finalCta", { ...safeContent.finalCta, eyebrow: v })} />
          <TextField label="Title" value={safeContent.finalCta.title} onChange={(v) => update("finalCta", { ...safeContent.finalCta, title: v })} />
          <TextAreaField label="Text" rows={3} value={safeContent.finalCta.text} onChange={(v) => update("finalCta", { ...safeContent.finalCta, text: v })} />

          {safeContent.finalCta.bullets.map((b, i) => (
            <RepeatableCard
              key={i}
              onRemove={() =>
                update("finalCta", {
                  ...safeContent.finalCta,
                  bullets: safeContent.finalCta.bullets.filter((_, idx) => idx !== i),
                })
              }
            >
              <div className="flex-1">
                <TextField
                  label={`Bullet ${i + 1}`}
                  value={b}
                  onChange={(v) => {
                    const next = [...safeContent.finalCta.bullets];
                    next[i] = v;
                    update("finalCta", { ...safeContent.finalCta, bullets: next });
                  }}
                />
              </div>
            </RepeatableCard>
          ))}
          <IconButton
            label="+ Add bullet"
            onClick={() => update("finalCta", { ...safeContent.finalCta, bullets: [...safeContent.finalCta.bullets, ""] })}
          />
        </Panel>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SaveButton state={saveState} />
          <StatusMessage state={saveState} error={saveError} />
        </div>
      </form>

      <Panel title="Case studies / results" description="Each card is saved independently.">
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
                <button
                  type="button"
                  onClick={() => saveCaseStudy(row)}
                  disabled={csRowState[row.id] === "saving"}
                  className="rounded-full bg-gradient-to-r from-neon to-neon-soft px-4 py-1.5 text-xs font-semibold text-ink disabled:opacity-70"
                >
                  {csRowState[row.id] === "saving" ? "Saving…" : csRowState[row.id] === "saved" ? "Saved ✓" : "Save"}
                </button>
                <IconButton label="Delete" variant="danger" onClick={() => deleteCaseStudy(row.id)} />
              </div>
            </div>
          ))}

        <IconButton label="+ Add case study" onClick={addCaseStudy} />
      </Panel>
    </div>
  );
}
