import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type GuaranteeItem = { title: string; text: string };

/**
 * "What We Can Guarantee" — risk-reversal cards for /book-consultation.
 * Static content (lib/proof.ts). Distinct shield-check card treatment
 * (rather than reusing ServiceCard's numbered-ghost style) so guarantees
 * read as commitments, not sequential steps.
 */
export function ProofGuaranteesSection({
  eyebrow,
  title,
  subtitle,
  items,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: GuaranteeItem[];
}) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.title} index={i % 3} className="h-full">
            <div className="group relative flex h-full flex-col gap-3 rounded-2xl border border-cyan/15 bg-white/[0.02] p-5 transition-all duration-300 hover:border-cyan/40 hover:shadow-[0_0_28px_-12px_rgba(34,211,238,0.35)] sm:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan/25 bg-cyan/8 text-cyan transition-all duration-300 group-hover:border-cyan/50 group-hover:bg-cyan/15">
                <ShieldCheckIcon />
              </span>
              <h3 className="text-base font-semibold tracking-tight text-fg">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
