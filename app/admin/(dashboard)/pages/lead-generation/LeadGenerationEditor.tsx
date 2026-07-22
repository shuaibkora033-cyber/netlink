"use client";

import { leadGenPage, problem, pageCta } from "@/lib/content";
import { usePageSections, isSectionDirty } from "@/components/admin/useContentSections";
import { ErrorState } from "@/components/admin/ui";
import {
  HeroPanel,
  ItemGridPanel,
  FinalCtaPanel,
  type HeroContent,
  type ItemGridContent,
  type FinalCtaContent,
} from "@/components/admin/SectionPanels";

const PAGE_SLUG = "lead-generation";

const FALLBACKS = {
  hero: leadGenPage.hero as HeroContent,
  problem: {
    eyebrow: problem.eyebrow,
    title: problem.title,
    subtitle: problem.body,
    items: problem.points,
  } as ItemGridContent,
  whatWeDo: leadGenPage.whatWeDo as ItemGridContent,
  funnelAdsTracking: leadGenPage.funnelAdsTracking as ItemGridContent,
  leadQuality: leadGenPage.leadQuality as ItemGridContent,
  reporting: leadGenPage.reporting as ItemGridContent,
  finalCta: {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  } as FinalCtaContent,
};

export function LeadGenerationEditor() {
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
        <h1 className="text-xl font-semibold text-fg">Lead Generation</h1>
        <p className="mt-1 text-sm text-muted">
          Edits go live on /lead-generation immediately after saving — no rebuild needed. Each
          section below saves independently.
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

      <ItemGridPanel
        title="Problem"
        description={'"The problem with random leads" section.'}
        data={sections.problem.data}
        saveState={sections.problem.saveState}
        error={sections.problem.error}
        dirty={isSectionDirty(sections.problem)}
        onChange={(v) => update("problem", v)}
        onSave={() => save("problem")}
      />

      <ItemGridPanel
        title="What Netlink Does"
        description="Three-card overview of the approach."
        data={sections.whatWeDo.data}
        saveState={sections.whatWeDo.saveState}
        error={sections.whatWeDo.error}
        dirty={isSectionDirty(sections.whatWeDo)}
        onChange={(v) => update("whatWeDo", v)}
        onSave={() => save("whatWeDo")}
      />

      <ItemGridPanel
        title="Funnel, Ads & Tracking"
        description="How campaigns and tracking work together."
        data={sections.funnelAdsTracking.data}
        saveState={sections.funnelAdsTracking.saveState}
        error={sections.funnelAdsTracking.error}
        dirty={isSectionDirty(sections.funnelAdsTracking)}
        onChange={(v) => update("funnelAdsTracking", v)}
        onSave={() => save("funnelAdsTracking")}
      />

      <ItemGridPanel
        title="Lead Quality System"
        description="How low-intent leads get filtered out."
        data={sections.leadQuality.data}
        saveState={sections.leadQuality.saveState}
        error={sections.leadQuality.error}
        dirty={isSectionDirty(sections.leadQuality)}
        onChange={(v) => update("leadQuality", v)}
        onSave={() => save("leadQuality")}
      />

      <ItemGridPanel
        title="Reporting & Optimization"
        description="Weekly visibility into cost, quality, and volume."
        data={sections.reporting.data}
        saveState={sections.reporting.saveState}
        error={sections.reporting.error}
        dirty={isSectionDirty(sections.reporting)}
        onChange={(v) => update("reporting", v)}
        onSave={() => save("reporting")}
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
