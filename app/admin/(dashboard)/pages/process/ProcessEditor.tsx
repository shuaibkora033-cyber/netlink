"use client";

import { process, pageCta } from "@/lib/content";
import { usePageSections, isSectionDirty } from "@/components/admin/useContentSections";
import { ItemListField } from "@/components/admin/RepeatableFields";
import { HeroPanel, FinalCtaPanel, type HeroContent, type FinalCtaContent } from "@/components/admin/SectionPanels";
import { Panel, SaveButton, StatusMessage, UnsavedBadge, ErrorState } from "@/components/admin/ui";

const PAGE_SLUG = "process";

type StepsContent = { items: { num: string; title: string; text: string }[] };

const FALLBACKS = {
  hero: {
    eyebrow: process.eyebrow,
    title: process.title,
    subtitle:
      "Diagnose. Build. Generate. Qualify. Book. Optimize. The same six-step system behind every Netlink engagement.",
  } as HeroContent,
  steps: { items: process.steps } as StepsContent,
  finalCta: {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  } as FinalCtaContent,
};

export function ProcessEditor() {
  const { loadState, loadError, sections, update, save, reload, retrying } = usePageSections(PAGE_SLUG, FALLBACKS);

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading page content…</p>;
  }
  if (loadState === "error" || !sections) {
    return <ErrorState message={loadError || "Could not load page content."} onRetry={reload} retrying={retrying} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Process</h1>
        <p className="mt-1 text-sm text-muted">
          Edits go live on /process immediately after saving — no rebuild needed. Each section
          below saves independently.
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

      <Panel
        title="Process steps"
        description="Steps 01 through 06 shown on the page."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isSectionDirty(sections.steps)} />
            <SaveButton state={sections.steps.saveState} label="Save Steps" onClick={() => save("steps")} />
          </div>
        }
      >
        <ItemListField
          label="Steps"
          items={sections.steps.data.items}
          emptyItem={{ num: String(sections.steps.data.items.length + 1).padStart(2, "0"), title: "", text: "" }}
          itemFields={[
            { key: "num", label: "No.", width: "sm:w-16" },
            { key: "title", label: "Title", width: "sm:w-40" },
            { key: "text", label: "Description", type: "textarea" },
          ]}
          onChange={(items) => update("steps", { items })}
        />
        <StatusMessage state={sections.steps.saveState} error={sections.steps.error} />
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
