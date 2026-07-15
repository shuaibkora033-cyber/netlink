import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { IndustryCard } from "@/components/ui/IndustryCard";
import { CTASection } from "@/components/ui/CTASection";
import { industries, industryDetails, industriesPage } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Industries We Serve | Netlink" },
  description:
    "Netlink helps solar, roofing, real estate, medical, legal, financial, B2B, and local service businesses book more qualified calls.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow={industriesPage.hero.eyebrow}
        title={industriesPage.hero.title}
        subtitle={industriesPage.hero.subtitle}
        primaryCta={{ text: "Book a Free Growth Consultation", href: "/book-consultation" }}
      />

      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => {
            const details = industryDetails[ind.id];
            return (
              <IndustryCard
                key={ind.id}
                index={i}
                id={ind.id}
                name={ind.name}
                problem={details.problem}
                solution={details.solution}
                ctaHref="/book-consultation"
              />
            );
          })}
        </div>
      </section>

      <CTASection />
    </>
  );
}
