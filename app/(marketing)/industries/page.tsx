import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { IndustryCard } from "@/components/ui/IndustryCard";
import { CTASection } from "@/components/ui/CTASection";
import { industriesPage, pageCta } from "@/lib/content";
import { getIndustryCards } from "@/lib/data/industryCards";
import { getPageSections, pickSection } from "@/lib/data/pageSections";

export const metadata: Metadata = {
  title: { absolute: "Industries We Serve | Netlink" },
  description:
    "Netlink helps solar, roofing, real estate, medical, legal, financial, B2B, and local service businesses book more qualified calls.",
};

export default async function IndustriesPage() {
  const [cards, sections] = await Promise.all([getIndustryCards(), getPageSections("industries")]);

  const hero = pickSection(sections, "hero", industriesPage.hero);
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

      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <IndustryCard
              key={card.id}
              index={i}
              id={card.slug}
              name={card.name}
              problem={card.problem}
              solution={card.solution}
              ctaHref={card.ctaHref}
              ctaText={card.ctaText}
            />
          ))}
        </div>
      </section>

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
