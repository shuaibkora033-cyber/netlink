import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceCardGrid } from "@/components/ui/ServiceCardGrid";
import { CTASection } from "@/components/ui/CTASection";
import { DashboardReporting } from "@/components/DashboardReporting";
import { apptSettingPage, pageCta } from "@/lib/content";
import { getPageSections, pickSection } from "@/lib/data/pageSections";

export const metadata: Metadata = {
  title: { absolute: "Appointment Setting Services | Netlink" },
  description:
    "Turn qualified leads into booked sales calls with structured follow-up, qualification, and CRM workflows.",
};

export default async function AppointmentSettingPage() {
  const sections = await getPageSections("appointment-setting");

  const hero = pickSection(sections, "hero", apptSettingPage.hero);
  const whyLeadsGoCold = pickSection(sections, "whyLeadsGoCold", apptSettingPage.whyLeadsGoCold);
  const followUpWorkflow = pickSection(sections, "followUpWorkflow", apptSettingPage.followUpWorkflow);
  const leadQualification = pickSection(sections, "leadQualification", apptSettingPage.leadQualification);
  const bookingSystem = pickSection(sections, "bookingSystem", apptSettingPage.bookingSystem);
  const crmPipeline = pickSection(sections, "crmPipeline", apptSettingPage.crmPipeline);
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

      <ServiceCardGrid
        eyebrow={whyLeadsGoCold.eyebrow}
        title={whyLeadsGoCold.title}
        subtitle={whyLeadsGoCold.subtitle}
        items={whyLeadsGoCold.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={followUpWorkflow.eyebrow}
        title={followUpWorkflow.title}
        subtitle={followUpWorkflow.subtitle}
        items={followUpWorkflow.items}
      />

      <ServiceCardGrid
        eyebrow={leadQualification.eyebrow}
        title={leadQualification.title}
        subtitle={leadQualification.subtitle}
        items={leadQualification.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={bookingSystem.eyebrow}
        title={bookingSystem.title}
        subtitle={bookingSystem.subtitle}
        items={bookingSystem.items}
      />

      {/* CRM and pipeline visibility */}
      <DashboardReporting
        eyebrow={crmPipeline.eyebrow}
        title={crmPipeline.title}
        text={crmPipeline.text}
        bullets={crmPipeline.bullets}
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
