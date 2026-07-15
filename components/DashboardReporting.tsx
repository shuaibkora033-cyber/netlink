import { dashboard } from "@/lib/content";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
      <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type DashboardReportingProps = {
  eyebrow?: string;
  title?: string;
  text?: string;
  bullets?: string[];
};

export function DashboardReporting({
  eyebrow = dashboard.eyebrow,
  title = dashboard.title,
  text = dashboard.text,
  bullets = dashboard.bullets,
}: DashboardReportingProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-80 w-80 -translate-y-1/2 rounded-full bg-neon/6 blur-[110px]" />

      <SectionHeading eyebrow={eyebrow} title={title} subtitle={text} />

      <Reveal index={3}>
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-line glass p-5 sm:mt-14 sm:p-8">
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neon/12 text-neon ring-1 ring-neon/20">
                  <CheckIcon />
                </span>
                <span className="text-sm text-white/85 leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
