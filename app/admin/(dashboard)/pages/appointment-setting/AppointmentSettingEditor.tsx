"use client";

import { apptSettingPage, pageCta } from "@/lib/content";
import { usePageSections, isSectionDirty } from "@/components/admin/useContentSections";
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

const PAGE_SLUG = "appointment-setting";

const FALLBACKS = {
  hero: apptSettingPage.hero as HeroContent,
  whyLeadsGoCold: apptSettingPage.whyLeadsGoCold as ItemGridContent,
  followUpWorkflow: apptSettingPage.followUpWorkflow as ItemGridContent,
  leadQualification: apptSettingPage.leadQualification as ItemGridContent,
  bookingSystem: apptSettingPage.bookingSystem as ItemGridContent,
  crmPipeline: apptSettingPage.crmPipeline as BulletsContent,
  finalCta: {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  } as FinalCtaContent,
};

export function AppointmentSettingEditor() {
  const { loadState, loadError, sections, update, save } = usePageSections(PAGE_SLUG, FALLBACKS);

  if (loadState === "loading") {
    return <p className="text-sm text-muted">Loading page content…</p>;
  }
  if (loadState === "error" || !sections) {
    return (
      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
        {loadError || "Could not load page content."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-fg">Appointment Setting</h1>
        <p className="mt-1 text-sm text-muted">
          Edits go live on /appointment-setting immediately after saving — no rebuild needed. Each
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
        title="Why Leads Go Cold"
        description="Why follow-up fails without a structured system."
        data={sections.whyLeadsGoCold.data}
        saveState={sections.whyLeadsGoCold.saveState}
        error={sections.whyLeadsGoCold.error}
        dirty={isSectionDirty(sections.whyLeadsGoCold)}
        onChange={(v) => update("whyLeadsGoCold", v)}
        onSave={() => save("whyLeadsGoCold")}
      />

      <ItemGridPanel
        title="Follow-Up Workflow"
        description="The cadence every lead enters after converting."
        data={sections.followUpWorkflow.data}
        saveState={sections.followUpWorkflow.saveState}
        error={sections.followUpWorkflow.error}
        dirty={isSectionDirty(sections.followUpWorkflow)}
        onChange={(v) => update("followUpWorkflow", v)}
        onSave={() => save("followUpWorkflow")}
      />

      <ItemGridPanel
        title="Lead Qualification"
        description="How prospects are confirmed as a fit before booking."
        data={sections.leadQualification.data}
        saveState={sections.leadQualification.saveState}
        error={sections.leadQualification.error}
        dirty={isSectionDirty(sections.leadQualification)}
        onChange={(v) => update("leadQualification", v)}
        onSave={() => save("leadQualification")}
      />

      <ItemGridPanel
        title="Booking System"
        description="Calendar integration and no-show reduction."
        data={sections.bookingSystem.data}
        saveState={sections.bookingSystem.saveState}
        error={sections.bookingSystem.error}
        dirty={isSectionDirty(sections.bookingSystem)}
        onChange={(v) => update("bookingSystem", v)}
        onSave={() => save("bookingSystem")}
      />

      <BulletsPanel
        title="CRM & Pipeline Visibility"
        description="What's tracked from first contact through booked call."
        data={sections.crmPipeline.data}
        saveState={sections.crmPipeline.saveState}
        error={sections.crmPipeline.error}
        dirty={isSectionDirty(sections.crmPipeline)}
        onChange={(v) => update("crmPipeline", v)}
        onSave={() => save("crmPipeline")}
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
