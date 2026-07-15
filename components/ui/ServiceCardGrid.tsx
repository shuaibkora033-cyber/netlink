import type { ReactNode } from "react";
import { SectionHeading } from "./SectionHeading";
import { ServiceCard } from "./ServiceCard";

type ServiceCardGridProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  items: { title: string; text: string }[];
  tone?: "default" | "muted";
};

/**
 * SectionHeading + a grid of ServiceCards — the repeated content-section
 * pattern used across the Lead Generation, Appointment Setting, and Results
 * detail pages. `tone="muted"` alternates the bordered/tinted background,
 * matching the homepage's own alternating section rhythm.
 */
export function ServiceCardGrid({ eyebrow, title, subtitle, items, tone = "default" }: ServiceCardGridProps) {
  const content = (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <ServiceCard key={it.title} index={i} title={it.title} text={it.text} />
        ))}
      </div>
    </div>
  );

  if (tone === "muted") {
    return (
      <section className="relative overflow-clip border-y border-line/60 bg-charcoal/20 py-14 md:py-20">
        {content}
      </section>
    );
  }
  return <section className="relative py-14 md:py-20">{content}</section>;
}
