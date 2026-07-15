import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { MetricCard } from "@/components/ui/MetricCard";
import { ServiceCardGrid } from "@/components/ui/ServiceCardGrid";
import { CTASection } from "@/components/ui/CTASection";
import { CaseStudies } from "@/components/CaseStudies";
import { DashboardReporting } from "@/components/DashboardReporting";
import { getCaseStudies } from "@/lib/data/homepage";
import { resultsPage } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "Lead Generation Results & Reporting | Netlink" },
  description: "Track qualified leads, booked appointments, pipeline performance, and campaign results.",
};

export default async function ResultsPage() {
  const caseStudies = await getCaseStudies();

  return (
    <>
      <PageHero
        eyebrow={resultsPage.hero.eyebrow}
        title={resultsPage.hero.title}
        subtitle={resultsPage.hero.subtitle}
        primaryCta={{ text: "Book a Free Growth Consultation", href: "/book-consultation" }}
      />

      {/* Metrics */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {resultsPage.metrics.map((m, i) => (
            <MetricCard key={m.label} index={i} value={m.value} label={m.label} />
          ))}
        </div>
      </section>

      {/* Example case study cards — same Supabase-backed data as /admin/homepage */}
      <CaseStudies items={caseStudies} />

      <ServiceCardGrid
        eyebrow={resultsPage.leadGenKpis.eyebrow}
        title={resultsPage.leadGenKpis.title}
        items={resultsPage.leadGenKpis.items}
      />

      <ServiceCardGrid
        tone="muted"
        eyebrow={resultsPage.apptKpis.eyebrow}
        title={resultsPage.apptKpis.title}
        items={resultsPage.apptKpis.items}
      />

      {/* Dashboard / reporting preview */}
      <DashboardReporting />

      <CTASection />
    </>
  );
}
