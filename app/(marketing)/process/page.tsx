import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { GrowthSystem } from "@/components/GrowthSystem";
import { process, pageCta } from "@/lib/content";
import { getPageSections, pickSection } from "@/lib/data/pageSections";

export const metadata: Metadata = {
  title: { absolute: "The Netlink Growth Process | Lead Generation & Appointment Setting" },
  description:
    "See how Netlink diagnoses, builds, generates, qualifies, books, and optimizes your growth system.",
};

const DEFAULT_HERO_SUBTITLE =
  "Diagnose. Build. Generate. Qualify. Book. Optimize. The same six-step system behind every Netlink engagement.";

export default async function ProcessPage() {
  const sections = await getPageSections("process");

  const hero = pickSection(sections, "hero", {
    eyebrow: process.eyebrow,
    title: process.title,
    subtitle: DEFAULT_HERO_SUBTITLE,
  });
  const steps = pickSection(sections, "steps", { items: process.steps }).items;
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

      <GrowthSystem steps={steps} />

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
