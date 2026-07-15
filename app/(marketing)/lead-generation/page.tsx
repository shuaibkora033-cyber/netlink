import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceCardGrid } from "@/components/ui/ServiceCardGrid";
import { CTASection } from "@/components/ui/CTASection";
import { Problem } from "@/components/Problem";
import { leadGenPage, problem as problemContent, pageCta } from "@/lib/content";
import { getPageSections, pickSection } from "@/lib/data/pageSections";

export const metadata: Metadata = {
  title: { absolute: "Lead Generation Services for Service Businesses | Netlink" },
  description:
    "Generate qualified leads with high-converting funnels, paid ads, tracking, and optimization.",
};

export default async function LeadGenerationPage() {
  const sections = await getPageSections("lead-generation");

  const hero = pickSection(sections, "hero", leadGenPage.hero);
  const problemData = pickSection(sections, "problem", {
    eyebrow: problemContent.eyebrow,
    title: problemContent.title,
    subtitle: problemContent.body,
    items: problemContent.points,
  });
  const whatWeDo = pickSection(sections, "whatWeDo", leadGenPage.whatWeDo);
  const funnelAdsTracking = pickSection(sections, "funnelAdsTracking", leadGenPage.funnelAdsTracking);
  const leadQuality = pickSection(sections, "leadQuality", leadGenPage.leadQuality);
  const reporting = pickSection(sections, "reporting", leadGenPage.reporting);
  const finalCta = pickSection(sections, "finalCta", {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  });

  return (
    <>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
        primaryCta={{ text: "Book a Free Growth Consultation", href: "/book-consultation" }}
      />

      {/* The problem with random leads */}
      <Problem
        eyebrow={problemData.eyebrow}
        title={problemData.title}
        body={problemData.subtitle}
        points={problemData.items}
      />

      <ServiceCardGrid
        eyebrow={whatWeDo.eyebrow}
        title={whatWeDo.title}
        subtitle={whatWeDo.subtitle}
        items={whatWeDo.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={funnelAdsTracking.eyebrow}
        title={funnelAdsTracking.title}
        subtitle={funnelAdsTracking.subtitle}
        items={funnelAdsTracking.items}
      />

      <ServiceCardGrid
        eyebrow={leadQuality.eyebrow}
        title={leadQuality.title}
        subtitle={leadQuality.subtitle}
        items={leadQuality.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={reporting.eyebrow}
        title={reporting.title}
        subtitle={reporting.subtitle}
        items={reporting.items}
      />

      <CTASection
        eyebrow={finalCta.eyebrow}
        title={finalCta.title}
        text={finalCta.text}
        buttonText={finalCta.buttonText}
        href={finalCta.href}
      />
    </>
  );
}
