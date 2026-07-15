import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceCardGrid } from "@/components/ui/ServiceCardGrid";
import { CTASection } from "@/components/ui/CTASection";
import { DashboardReporting } from "@/components/DashboardReporting";
import { apptSettingPage } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Appointment Setting Services | Netlink" },
  description:
    "Turn qualified leads into booked sales calls with structured follow-up, qualification, and CRM workflows.",
};

export default function AppointmentSettingPage() {
  return (
    <>
      <PageHero
        eyebrow={apptSettingPage.hero.eyebrow}
        title={apptSettingPage.hero.title}
        subtitle={apptSettingPage.hero.subtitle}
        primaryCta={{ text: "Book a Free Growth Consultation", href: "/book-consultation" }}
      />

      <ServiceCardGrid
        eyebrow={apptSettingPage.whyLeadsGoCold.eyebrow}
        title={apptSettingPage.whyLeadsGoCold.title}
        subtitle={apptSettingPage.whyLeadsGoCold.subtitle}
        items={apptSettingPage.whyLeadsGoCold.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={apptSettingPage.followUpWorkflow.eyebrow}
        title={apptSettingPage.followUpWorkflow.title}
        subtitle={apptSettingPage.followUpWorkflow.subtitle}
        items={apptSettingPage.followUpWorkflow.items}
      />

      <ServiceCardGrid
        eyebrow={apptSettingPage.leadQualification.eyebrow}
        title={apptSettingPage.leadQualification.title}
        subtitle={apptSettingPage.leadQualification.subtitle}
        items={apptSettingPage.leadQualification.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={apptSettingPage.bookingSystem.eyebrow}
        title={apptSettingPage.bookingSystem.title}
        subtitle={apptSettingPage.bookingSystem.subtitle}
        items={apptSettingPage.bookingSystem.items}
      />

      {/* CRM and pipeline visibility */}
      <DashboardReporting
        eyebrow={apptSettingPage.crmPipeline.eyebrow}
        title={apptSettingPage.crmPipeline.title}
        text={apptSettingPage.crmPipeline.text}
        bullets={apptSettingPage.crmPipeline.bullets}
      />

      <CTASection />
    </>
  );
}
