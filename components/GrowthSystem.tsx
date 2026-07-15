"use client";

import { motion } from "motion/react";
import { process } from "@/lib/content";
import type { GrowthStep } from "@/lib/data/homepage";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

// Colors cycle neon → cyan → electric, repeating for however many steps exist.
const STEP_COLORS = [
  "from-neon/20 to-neon/5 border-neon/25",
  "from-cyan/20 to-cyan/5 border-cyan/25",
  "from-electric/20 to-electric/5 border-electric/25",
  "from-neon/20 to-neon/5 border-neon/25",
  "from-cyan/20 to-cyan/5 border-cyan/25",
  "from-electric/20 to-electric/5 border-electric/25",
];

const STEP_TEXT_COLORS = ["text-neon", "text-cyan", "text-electric", "text-neon", "text-cyan", "text-electric"];
const STEP_GLOW_COLORS = [
  "bg-neon/15",
  "bg-cyan/15",
  "bg-electric/15",
  "bg-neon/15",
  "bg-cyan/15",
  "bg-electric/15",
];

// Steps per row on the desktop (lg:) grid — used to hide the connector
// arrow at the end of each row instead of only after the very last step.
const DESKTOP_COLS = 3;

export function GrowthSystem({ steps }: { steps: GrowthStep[] }) {
  return (
    <section
      id="process"
      className="relative overflow-clip border-y border-line/60 bg-charcoal/25 py-14 md:py-28"
    >
      {/* Large ambient orb */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[36rem] w-[50rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/6 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow={process.eyebrow}
          title={process.title}
          subtitle="Diagnose. Build. Generate. Qualify. Book. Optimize. A proven system that turns qualified prospects into booked appointments."
        />

        <div className="relative mt-10 sm:mt-16 md:mt-20">
          {/* Desktop connector line — only looks right for a single row (<=3 steps
              at the current lg:grid-cols-3), so it's skipped for longer processes
              rather than drawing a line that only spans the first row. */}
          {steps.length <= DESKTOP_COLS && (
            <div
              aria-hidden
              className="absolute left-[calc(50%-50%)] right-0 top-[2.6rem] hidden h-px lg:block"
              style={{
                background:
                  "linear-gradient(to right, rgba(13,253,209,0.08), rgba(13,253,209,0.35) 25%, rgba(34,211,238,0.35) 50%, rgba(8,145,178,0.35) 75%, rgba(8,145,178,0.08))",
              }}
            />
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.num} index={i}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="group relative flex flex-col"
                >
                  {/*
                   * Mobile: badge + title share one flex-row (gap-3, items-center).
                   * sm+:    flex-col so badge stacks above title — desktop layout unchanged.
                   */}
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
                    {/* Badge node */}
                    <div className="relative z-10 shrink-0 sm:mb-5 lg:mb-6">
                      <div
                        className={[
                          "flex items-center justify-center border bg-gradient-to-br",
                          // Mobile: compact badge (40 × 56 px, rounded-xl)
                          "h-10 w-14 rounded-xl",
                          // sm: restore original square pill
                          "sm:h-14 sm:w-14 sm:rounded-2xl",
                          // lg: larger square
                          "lg:h-[4.5rem] lg:w-[4.5rem]",
                          STEP_COLORS[i % STEP_COLORS.length],
                          "transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_24px_-4px_currentColor]",
                        ].join(" ")}
                      >
                        <span className={`font-bold text-base sm:text-lg lg:text-xl ${STEP_TEXT_COLORS[i % STEP_TEXT_COLORS.length]}`}>
                          {step.num}
                        </span>
                      </div>
                      {/* Outer glow ring */}
                      <div
                        aria-hidden
                        className={`absolute inset-0 -m-2 rounded-3xl ${STEP_GLOW_COLORS[i % STEP_GLOW_COLORS.length]} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100`}
                      />
                    </div>

                    {/* Title — sits beside badge on mobile, below badge on sm+ */}
                    <h3
                      className={[
                        "tracking-tight transition-colors duration-200",
                        // Mobile: larger, bold — prominent heading beside the badge
                        "text-xl font-bold",
                        // sm+: restore original weight and size
                        "sm:text-lg sm:font-semibold",
                        `group-hover:${STEP_TEXT_COLORS[i % STEP_TEXT_COLORS.length]}`,
                      ].join(" ")}
                    >
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:mt-2.5">
                    {step.text}
                  </p>

                  {/* Arrow to next step (desktop) — hidden at the end of each row, not just the very last step */}
                  {i < steps.length - 1 && (i + 1) % DESKTOP_COLS !== 0 && (
                    <span
                      aria-hidden
                      className="absolute -right-3 top-[1.35rem] z-20 hidden text-muted/30 lg:block"
                    >
                      →
                    </span>
                  )}
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Loop badge */}
          <Reveal index={4}>
            <div className="mt-14 flex justify-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-line bg-charcoal/60 px-4 py-2.5 text-xs text-muted sm:gap-3 sm:px-6 sm:py-3 sm:text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neon/30 text-neon text-xs">↻</span>
                This loop runs every month — compounding results over time.
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
