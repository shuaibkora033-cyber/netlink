import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/ui/CTASection";
import { WhyChoose } from "@/components/WhyChoose";
import { DashboardReporting } from "@/components/DashboardReporting";
import { aboutPage, why, pageCta } from "@/lib/content";
import { getPageSections, pickSection } from "@/lib/data/pageSections";

export const metadata: Metadata = {
  title: { absolute: "About Netlink | Managed Lead Generation Partner" },
  description:
    "Learn how Netlink helps service businesses build predictable lead generation and appointment setting systems.",
};

export default async function AboutPage() {
  const sections = await getPageSections("about");

  const hero = pickSection(sections, "hero", aboutPage.hero);
  const whatWeDo = pickSection(sections, "whatWeDo", aboutPage.whatWeDo);
  const whyWeExist = pickSection(sections, "whyWeExist", aboutPage.whyWeExist);
  const growthApproach = pickSection(sections, "growthApproach", {
    eyebrow: why.eyebrow,
    title: why.title,
    subtitle: "",
    items: why.reasons,
  });
  const whoWeWorkWith = pickSection(sections, "whoWeWorkWith", aboutPage.whoWeWorkWith);
  const finalCta = pickSection(sections, "finalCta", {
    eyebrow: pageCta.eyebrow,
    title: pageCta.title,
    text: pageCta.text,
    buttonText: pageCta.buttonText,
    href: pageCta.href,
  });

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} />

      {/* What Netlink does */}
      <section className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeading eyebrow={whatWeDo.eyebrow} title={whatWeDo.title} subtitle={whatWeDo.text} />
      </section>

      {/* Why Netlink exists */}
      <section className="relative overflow-clip border-y border-line/60 bg-charcoal/20 py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading eyebrow={whyWeExist.eyebrow} title={whyWeExist.title} subtitle={whyWeExist.text} />
        </div>
      </section>

      {/* Managed growth system approach */}
      <WhyChoose eyebrow={growthApproach.eyebrow} title={growthApproach.title} reasons={growthApproach.items} />

      {/* Who we work best with */}
      <DashboardReporting
        eyebrow={whoWeWorkWith.eyebrow}
        title={whoWeWorkWith.title}
        text={whoWeWorkWith.text}
        bullets={whoWeWorkWith.bullets}
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
