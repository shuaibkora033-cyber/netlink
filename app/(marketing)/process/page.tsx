import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CTASection } from "@/components/ui/CTASection";
import { GrowthSystem } from "@/components/GrowthSystem";
import { process } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "The Netlink Growth Process | Lead Generation & Appointment Setting" },
  description:
    "See how Netlink diagnoses, builds, generates, qualifies, books, and optimizes your growth system.",
};

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow={process.eyebrow}
        title={process.title}
        subtitle="Diagnose. Build. Generate. Qualify. Book. Optimize. The same six-step system behind every Netlink engagement."
        primaryCta={{ text: "Book a Free Growth Consultation", href: "/book-consultation" }}
      />

      <GrowthSystem steps={process.steps} />

      <CTASection />
    </>
  );
}
