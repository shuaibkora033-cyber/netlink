import type { IndustryItem } from "@/lib/data/homepage";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { INDUSTRY_ICONS, DEFAULT_INDUSTRY_ICON } from "./ui/industryIcons";

export function Industries({ items }: { items: IndustryItem[] }) {
  return (
    <section
      id="industries"
      className="relative overflow-clip border-y border-line/60 bg-charcoal/20 py-14 md:py-24"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[24rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/8 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Industries we serve"
          title={
            <>
              Built for the businesses that{" "}
              <span className="text-gradient">run the real economy.</span>
            </>
          }
          subtitle="We specialize in service-based businesses that depend on a steady pipeline of qualified leads and booked appointments to grow."
        />

        <div className="mt-10 grid grid-cols-2 gap-2 sm:mt-12 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:gap-4">
          {items.map((ind, i) => (
            <Reveal key={ind.id} index={i % 4}>
              <div className="group flex items-center gap-2 rounded-xl border border-line bg-white/[0.02] px-3 py-3 transition-all duration-300 hover:border-neon/30 hover:bg-neon/[0.04] sm:gap-3 sm:px-4 sm:py-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neon/20 bg-neon/8 text-neon transition-all duration-300 group-hover:border-neon/40 group-hover:bg-neon/15 sm:h-9 sm:w-9">
                  {INDUSTRY_ICONS[ind.id] ?? DEFAULT_INDUSTRY_ICON}
                </span>
                <span className="text-xs font-medium leading-snug text-fg/80 transition-colors group-hover:text-fg sm:text-sm">
                  {ind.name}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
