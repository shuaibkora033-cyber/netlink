import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { MetricCard } from "@/components/ui/MetricCard";
import { ServiceCardGrid } from "@/components/ui/ServiceCardGrid";
import { CTASection } from "@/components/ui/CTASection";
import { CaseStudies } from "@/components/CaseStudies";
import { DashboardReporting } from "@/components/DashboardReporting";
import { getCaseStudies } from "@/lib/data/homepage";
import { resultsPage, dashboard, pageCta } from "@/lib/content";
import { getPageSections, pickSection } from "@/lib/data/pageSections";

export const metadata: Metadata = {
  title: { absolute: "Lead Generation Results & Reporting | Netlink" },
  description: "Track qualified leads, booked appointments, pipeline performance, and campaign results.",
};

export default async function ResultsPage() {
  const [caseStudies, sections] = await Promise.all([getCaseStudies(), getPageSections("results")]);

  const hero = pickSection(sections, "hero", resultsPage.hero);
  const metrics = pickSection(sections, "metrics", { items: resultsPage.metrics }).items;
  const leadGenKpis = pickSection(sections, "leadGenKpis", { ...resultsPage.leadGenKpis, subtitle: "" });
  const apptKpis = pickSection(sections, "apptKpis", { ...resultsPage.apptKpis, subtitle: "" });
  const dashboardPreview = pickSection(sections, "dashboardPreview", {
    eyebrow: dashboard.eyebrow,
    title: dashboard.title,
    text: dashboard.text,
    bullets: dashboard.bullets,
  });
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

      {/* Metrics */}
      <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} index={i} value={m.value} label={m.label} />
          ))}
        </div>
      </section>

      {/* Example case study cards — same Supabase-backed data as /admin/case-studies */}
      <CaseStudies items={caseStudies} />

      <ServiceCardGrid eyebrow={leadGenKpis.eyebrow} title={leadGenKpis.title} items={leadGenKpis.items} />

      <ServiceCardGrid
        tone="muted"
        eyebrow={apptKpis.eyebrow}
        title={apptKpis.title}
        items={apptKpis.items}
      />

      {/* Dashboard / reporting preview */}
      <DashboardReporting
        eyebrow={dashboardPreview.eyebrow}
        title={dashboardPreview.title}
        text={dashboardPreview.text}
        bullets={dashboardPreview.bullets}
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
