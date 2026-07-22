"use client";

import { resultsPage, dashboard, pageCta } from "@/lib/content";
import { usePageSections, isSectionDirty } from "@/components/admin/useContentSections";
import { ItemListField } from "@/components/admin/RepeatableFields";
import {
  HeroPanel,
  ItemGridPanel,
  BulletsPanel,
  FinalCtaPanel,
  type HeroContent,
  type ItemGridContent,
  type BulletsContent,
  type FinalCtaContent,
} from "@/components/admin/SectionPanels";
import { Panel, SaveButton, StatusMessage, UnsavedBadge, ErrorState } from "@/components/admin/ui";

const PAGE_SLUG = "results";

type MetricsContent = { items: { value: string; label: string }[] };

const FALLBACKS = {
  hero: resultsPage.hero as HeroContent,
  metrics: { items: resultsPage.metrics } as MetricsContent,
  leadGenKpis: { ...resultsPage.leadGenKpis, subtitle: "" } as ItemGridContent,
  apptKpis: { ...resultsPage.apptKpis, subtitle: "" } as ItemGridContent,
  dashboardPreview: {
    eyebrow: dashboard.eyebrow,
    title: dashboard.title,
    text: dashboard.text,
    bullets: dashboard.bullets,
  } as BulletsContent,
  finalCta: {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  } as FinalCtaContent,
};

export function ResultsEditor() {
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
        <h1 className="text-xl font-semibold text-fg">Results</h1>
        <p className="mt-1 text-sm text-muted">
          Edits go live on /results immediately after saving — no rebuild needed. Case study
          cards are managed separately under Content › Case Studies (same data shown here and on
          the homepage).
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
        title="Metrics"
        description="The four headline stats near the top of the page."
        headerAction={
          <div className="flex items-center gap-2">
            <UnsavedBadge show={isSectionDirty(sections.metrics)} />
            <SaveButton state={sections.metrics.saveState} label="Save Metrics" onClick={() => save("metrics")} />
          </div>
        }
      >
        <ItemListField
          label="Metrics"
          items={sections.metrics.data.items}
          emptyItem={{ value: "", label: "" }}
          itemFields={[
            { key: "value", label: "Value", width: "sm:w-32" },
            { key: "label", label: "Label" },
          ]}
          onChange={(items) => update("metrics", { items })}
        />
        <StatusMessage state={sections.metrics.saveState} error={sections.metrics.error} />
      </Panel>

      <ItemGridPanel
        title="Lead Generation KPIs"
        description="What's tracked on the lead-gen side."
        data={sections.leadGenKpis.data}
        saveState={sections.leadGenKpis.saveState}
        error={sections.leadGenKpis.error}
        dirty={isSectionDirty(sections.leadGenKpis)}
        onChange={(v) => update("leadGenKpis", v)}
        onSave={() => save("leadGenKpis")}
      />

      <ItemGridPanel
        title="Appointment Setting KPIs"
        description="What's tracked on the booking side."
        data={sections.apptKpis.data}
        saveState={sections.apptKpis.saveState}
        error={sections.apptKpis.error}
        dirty={isSectionDirty(sections.apptKpis)}
        onChange={(v) => update("apptKpis", v)}
        onSave={() => save("apptKpis")}
      />

      <BulletsPanel
        title="Dashboard / Reporting Preview"
        description="The reporting checklist shown near the bottom of the page."
        data={sections.dashboardPreview.data}
        saveState={sections.dashboardPreview.saveState}
        error={sections.dashboardPreview.error}
        dirty={isSectionDirty(sections.dashboardPreview)}
        onChange={(v) => update("dashboardPreview", v)}
        onSave={() => save("dashboardPreview")}
      />

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
