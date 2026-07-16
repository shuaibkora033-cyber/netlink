import Image from "next/image";
import { SectionHeading } from "./SectionHeading";
import { Reveal } from "./Reveal";

export type FeedbackItem = {
  source: string;
  quote: string;
  name?: string;
  role: string;
  /** Resolved server-side (see lib/publicAsset.ts) — null when the asset doesn't exist yet. */
  screenshotSrc: string | null;
};

const SOURCE_STYLES: Record<string, string> = {
  "Client Feedback": "border-cyan/25 bg-cyan/8 text-cyan",
  "Call Note": "border-neon/25 bg-neon/8 text-neon",
  UGC: "border-amber-400/25 bg-amber-400/8 text-amber-300",
};
const DEFAULT_SOURCE_STYLE = "border-line bg-white/[0.03] text-muted";

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-cyan/40">
      <path
        d="M7.5 6C5 6 3 8 3 10.8c0 2.3 1.6 4 3.8 4.2-.3 1.6-1.4 2.6-2.8 3v2c3-.4 5-2.6 5-6V10c0-2.2-.7-4-1.5-4zm10 0c-2.5 0-4.5 2-4.5 4.8 0 2.3 1.6 4 3.8 4.2-.3 1.6-1.4 2.6-2.8 3v2c3-.4 5-2.6 5-6V10c0-2.2-.7-4-1.5-4z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * "Real Feedback From Growth Conversations" UGC/testimonial grid for
 * /book-consultation. Static content (lib/proof.ts). Screenshot images are
 * optional per card — omitted entirely when the file doesn't exist yet
 * (resolved server-side), rather than showing a broken image.
 */
export function FeedbackProofGrid({
  eyebrow,
  title,
  text,
  items,
}: {
  eyebrow: string;
  title: string;
  text: string;
  items: FeedbackItem[];
}) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={text} />

      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={`${item.source}-${i}`} index={i % 4} className="h-full">
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-white/[0.02] p-5 transition-all duration-300 hover:border-cyan/25 hover:bg-white/[0.03]">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide ${SOURCE_STYLES[item.source] ?? DEFAULT_SOURCE_STYLE}`}
                >
                  {item.source}
                </span>
                <QuoteIcon />
              </div>

              {item.screenshotSrc && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line/60 bg-charcoal">
                  <Image
                    src={item.screenshotSrc}
                    alt={`${item.source} screenshot`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}

              <p className="flex-1 text-pretty text-sm leading-relaxed text-fg/85">&ldquo;{item.quote}&rdquo;</p>

              {(item.name || item.role) && (
                <p className="text-xs text-muted">
                  {[item.name, item.role].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
