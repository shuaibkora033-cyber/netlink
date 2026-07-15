import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceCardGrid } from "@/components/ui/ServiceCardGrid";
import { CTASection } from "@/components/ui/CTASection";
import { Problem } from "@/components/Problem";
import { leadGenPage } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Lead Generation Services for Service Businesses | Netlink" },
  description:
    "Generate qualified leads with high-converting funnels, paid ads, tracking, and optimization.",
};

export default function LeadGenerationPage() {
  return (
    <>
      <PageHero
        eyebrow={leadGenPage.hero.eyebrow}
        title={leadGenPage.hero.title}
        subtitle={leadGenPage.hero.subtitle}
        primaryCta={{ text: "Book a Free Growth Consultation", href: "/book-consultation" }}
      />

      {/* The problem with random leads */}
      <Problem />

      <ServiceCardGrid
        eyebrow={leadGenPage.whatWeDo.eyebrow}
        title={leadGenPage.whatWeDo.title}
        subtitle={leadGenPage.whatWeDo.subtitle}
        items={leadGenPage.whatWeDo.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={leadGenPage.funnelAdsTracking.eyebrow}
        title={leadGenPage.funnelAdsTracking.title}
        subtitle={leadGenPage.funnelAdsTracking.subtitle}
        items={leadGenPage.funnelAdsTracking.items}
      />

      <ServiceCardGrid
        eyebrow={leadGenPage.leadQuality.eyebrow}
        title={leadGenPage.leadQuality.title}
        subtitle={leadGenPage.leadQuality.subtitle}
        items={leadGenPage.leadQuality.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={leadGenPage.reporting.eyebrow}
        title={leadGenPage.reporting.title}
        subtitle={leadGenPage.reporting.subtitle}
        items={leadGenPage.reporting.items}
      />

      <CTASection />
    </>
  );
}
