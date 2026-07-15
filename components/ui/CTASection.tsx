import type { ReactNode } from "react";
import { pageCta } from "@/lib/content";
import { Reveal } from "./Reveal";
import { GlowBackground } from "./GlowBackground";
import { CtaButton } from "./CtaButton";

type CTASectionProps = {
  eyebrow?: string;
  title?: ReactNode;
  text?: string;
  buttonText?: string;
  href?: string;
};

/**
 * Reusable closing CTA banner for the bottom of every subpage. Defaults to
 * `pageCta` from lib/content.ts (→ /book-consultation); pass props to
 * override copy per page.
 */
export function CTASection({
  eyebrow = pageCta.eyebrow,
  title = pageCta.title,
  text = pageCta.text,
  buttonText = pageCta.buttonText,
  href = pageCta.href,
}: CTASectionProps) {
  return (
    <section className="relative overflow-clip py-14 md:py-24">
      <GlowBackground className="opacity-50" />
      <div className="pointer-events-none absolute inset-x-0 top-0 section-rule" />

      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-neon">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
            {eyebrow}
          </span>
        </Reveal>
        <Reveal index={1}>
          <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2.5rem] md:leading-[1.1]">
            {title}
          </h2>
        </Reveal>
        <Reveal index={2}>
          <p className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-muted sm:text-base">
            {text}
          </p>
        </Reveal>
        <Reveal index={3}>
          <div className="mt-8">
            <CtaButton href={href}>{buttonText}</CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
