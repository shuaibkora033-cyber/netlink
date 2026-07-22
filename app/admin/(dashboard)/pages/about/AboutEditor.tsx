"use client";

import { aboutPage, why, pageCta } from "@/lib/content";
import { usePageSections, isSectionDirty } from "@/components/admin/useContentSections";
import { ErrorState } from "@/components/admin/ui";
import {
  HeroPanel,
  ItemGridPanel,
  BulletsPanel,
  SimpleTextPanel,
  FinalCtaPanel,
  type HeroContent,
  type ItemGridContent,
  type BulletsContent,
  type SimpleTextContent,
  type FinalCtaContent,
} from "@/components/admin/SectionPanels";

const PAGE_SLUG = "about";

const FALLBACKS = {
  hero: aboutPage.hero as HeroContent,
  whatWeDo: aboutPage.whatWeDo as SimpleTextContent,
  whyWeExist: aboutPage.whyWeExist as SimpleTextContent,
  growthApproach: { eyebrow: why.eyebrow, title: why.title, subtitle: "", items: why.reasons } as ItemGridContent,
  whoWeWorkWith: aboutPage.whoWeWorkWith as BulletsContent,
  finalCta: {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  } as FinalCtaContent,
};

export function AboutEditor() {
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
        <h1 className="text-xl font-semibold text-fg">About</h1>
        <p className="mt-1 text-sm text-muted">
          Edits go live on /about immediately after saving — no rebuild needed. Each section
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

      <SimpleTextPanel
        title="What Netlink Does"
        description="Short summary of the growth system."
        data={sections.whatWeDo.data}
        saveState={sections.whatWeDo.saveState}
        error={sections.whatWeDo.error}
        dirty={isSectionDirty(sections.whatWeDo)}
        onChange={(v) => update("whatWeDo", v)}
        onSave={() => save("whatWeDo")}
      />

      <SimpleTextPanel
        title="Why Netlink Exists"
        description="The problem Netlink was built to solve."
        data={sections.whyWeExist.data}
        saveState={sections.whyWeExist.saveState}
        error={sections.whyWeExist.error}
        dirty={isSectionDirty(sections.whyWeExist)}
        onChange={(v) => update("whyWeExist", v)}
        onSave={() => save("whyWeExist")}
      />

      <ItemGridPanel
        title="Managed Growth System Approach"
        description="The team/role cards shown for how Netlink operates."
        data={sections.growthApproach.data}
        saveState={sections.growthApproach.saveState}
        error={sections.growthApproach.error}
        dirty={isSectionDirty(sections.growthApproach)}
        onChange={(v) => update("growthApproach", v)}
        onSave={() => save("growthApproach")}
      />

      <BulletsPanel
        title="Who We Work Best With"
        description="Qualification bullets for the ideal client fit."
        data={sections.whoWeWorkWith.data}
        saveState={sections.whoWeWorkWith.saveState}
        error={sections.whoWeWorkWith.error}
        dirty={isSectionDirty(sections.whoWeWorkWith)}
        onChange={(v) => update("whoWeWorkWith", v)}
        onSave={() => save("whoWeWorkWith")}
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
