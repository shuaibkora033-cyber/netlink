"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { CtaButton } from "./CtaButton";
import { GlowBackground } from "./GlowBackground";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.21, 0.47, 0.32, 0.98] as const },
  },
};

type PageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  primaryCta?: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
};

/**
 * Top-of-page hero for subpages — same visual language as the homepage
 * Hero (GlowBackground, staggered fade-up, eyebrow badge), without the
 * rotating keyword / stats / pipeline strip. Renders the page's H1.
 */
export function PageHero({ eyebrow, title, subtitle, primaryCta, secondaryCta }: PageHeroProps) {
  return (
    <section className="relative flex flex-col items-center overflow-clip px-4 pb-12 pt-32 text-center sm:px-6 sm:pb-16 sm:pt-36">
      <GlowBackground />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-ink" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex max-w-3xl flex-col items-center"
      >
        <motion.span
          variants={item}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted sm:mb-6 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          {eyebrow}
        </motion.span>

        <motion.h1
          variants={item}
          className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-[3.5rem]"
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            variants={item}
            className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted sm:mt-6 sm:text-base"
          >
            {subtitle}
          </motion.p>
        )}

        {(primaryCta || secondaryCta) && (
          <motion.div
            variants={item}
            className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            {primaryCta && (
              <CtaButton href={primaryCta.href} className="w-full justify-center sm:w-auto">
                {primaryCta.text}
              </CtaButton>
            )}
            {secondaryCta && (
              <CtaButton href={secondaryCta.href} variant="ghost" className="w-full justify-center sm:w-auto">
                {secondaryCta.text}
              </CtaButton>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
