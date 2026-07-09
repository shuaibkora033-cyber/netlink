"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { hero, stats } from "@/lib/content";
import { CtaButton } from "./ui/CtaButton";
import { GlowBackground } from "./ui/GlowBackground";
import { Counter } from "./ui/Counter";

// ─── Animation variants ───────────────────────────────────────────────────────

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

// ─── Rotating keyword ─────────────────────────────────────────────────────────

function RotatingWord() {
  const words = hero.rotatingWords;
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <span className="relative inline-flex items-baseline">
      {/* invisible spacer keeps line height stable */}
      <span aria-hidden className="invisible select-none">
        {words.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[idx]}
          className="absolute inset-0 flex items-baseline justify-center text-gradient"
          initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
          transition={{ duration: 0.42, ease: [0.21, 0.47, 0.32, 0.98] as const }}
        >
          {words[idx]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// ─── Pipeline visual strip ───────────────────────────────────────────────────
//
// To edit step labels, change the array below. Order matters — left to right.
//
const pipeline = ["Click", "Landing Page", "Lead Captured", "Qualified Call", "Closed Deal"];

// Thin SVG arrow that sits between each step.
function PipelineArrow() {
  return (
    <div aria-hidden className="flex shrink-0 items-center px-1">
      <svg
        width="22"
        height="8"
        viewBox="0 0 22 8"
        fill="none"
        className="text-neon/30"
      >
        {/* shaft */}
        <line x1="0" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        {/* arrowhead */}
        <path d="M13 1.5L17 4L13 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function PipelineVisual() {
  return (
    <motion.div variants={item} className="mt-8 w-full sm:mt-14">
      <div className="glass rounded-2xl border border-line">

        {/* ── Stats grid ───────────────────────────────────────── */}
        <div className="px-4 pt-4 pb-0 sm:px-6 sm:pt-5">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1 px-3 py-3.5 sm:px-4 sm:py-4">
                <span className="text-xl font-bold tracking-tight text-fg sm:text-2xl md:text-3xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </span>
                <span className="text-center text-[0.6rem] leading-tight text-muted sm:text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pipeline row ─────────────────────────────────────── */}
        <div className="border-t border-line/60 px-4 py-4 sm:px-6">

          {/* Mobile: premium vertical funnel with gradient connecting line */}
          <div className="sm:hidden">
            <p className="mb-3 text-center text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-muted/50">
              Client journey
            </p>
            <div className="flex flex-col items-center gap-0">
              {pipeline.map((step, i) => (
                <div key={step} className="flex flex-col items-center">
                  <span className="rounded-full border border-neon/30 bg-neon/[0.09] px-5 py-2 text-[0.72rem] font-semibold tracking-wide text-neon/90">
                    {step}
                  </span>
                  {i < pipeline.length - 1 && (
                    <div
                      aria-hidden
                      className="h-4 w-px"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(13,253,209,0.35), rgba(13,253,209,0.12))",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: horizontal equal-width columns (sm+) */}
          <div className="hidden sm:block">
            <div className="flex items-center">
              {pipeline.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-1 justify-center">
                    <span
                      className={[
                        "whitespace-nowrap rounded-full",
                        "border border-neon/20 bg-neon/[0.07]",
                        "px-3 py-[5px]",
                        "text-[0.7rem] font-medium leading-none text-neon/80",
                        "transition-colors duration-200",
                        "hover:border-neon/40 hover:bg-neon/[0.13] hover:text-neon",
                        "cursor-default select-none",
                      ].join(" ")}
                    >
                      {step}
                    </span>
                  </div>
                  {i < pipeline.length - 1 && <PipelineArrow />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-clip px-4 pt-24 pb-12 sm:px-6 sm:pt-28 sm:pb-16"
    >
      <GlowBackground />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-ink" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex max-w-4xl flex-col items-center text-center"
      >
        {/* Eyebrow */}
        <motion.span
          variants={item}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted sm:mb-6 sm:px-4 sm:text-xs sm:tracking-[0.2em]"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
          {hero.eyebrow}
        </motion.span>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-[4rem]"
        >
          {hero.headlineStart}
          <br />
          <RotatingWord />.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted sm:mt-6 sm:text-base"
        >
          {hero.subheadline}
        </motion.p>

        {/* CTAs — full-width on mobile, inline on sm+ */}
        <motion.div
          variants={item}
          className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <CtaButton href="#contact" className="w-full justify-center sm:w-auto">{hero.primaryCta}</CtaButton>
          <CtaButton href="#services" variant="ghost" className="w-full justify-center sm:w-auto">
            {hero.secondaryCta}
          </CtaButton>
        </motion.div>

        {/* Stats + pipeline visual */}
        <PipelineVisual />
      </motion.div>
    </section>
  );
}
