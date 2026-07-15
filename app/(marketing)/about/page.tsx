import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTASection } from "@/components/ui/CTASection";
import { WhyChoose } from "@/components/WhyChoose";
import { DashboardReporting } from "@/components/DashboardReporting";
import { aboutPage } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "About Netlink | Managed Lead Generation Partner" },
  description:
    "Learn how Netlink helps service businesses build predictable lead generation and appointment setting systems.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={aboutPage.hero.eyebrow}
        title={aboutPage.hero.title}
        subtitle={aboutPage.hero.subtitle}
      />

      {/* What Netlink does */}
      <section className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20">
        <SectionHeading
          eyebrow={aboutPage.whatWeDo.eyebrow}
          title={aboutPage.whatWeDo.title}
          subtitle={aboutPage.whatWeDo.text}
        />
      </section>

      {/* Why Netlink exists */}
      <section className="relative overflow-clip border-y border-line/60 bg-charcoal/20 py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow={aboutPage.whyWeExist.eyebrow}
            title={aboutPage.whyWeExist.title}
            subtitle={aboutPage.whyWeExist.text}
          />
        </div>
      </section>

      {/* Managed growth system approach */}
      <WhyChoose />

      {/* Who we work best with */}
      <DashboardReporting
        eyebrow={aboutPage.whoWeWorkWith.eyebrow}
        title={aboutPage.whoWeWorkWith.title}
        text={aboutPage.whoWeWorkWith.text}
        bullets={aboutPage.whoWeWorkWith.bullets}
      />

      <CTASection />
    </>
  );
}
