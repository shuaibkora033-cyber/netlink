"use client";

import { motion } from "motion/react";
import { problem } from "@/lib/content";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

// Pain-point icons, one per problem.points entry in order:
// Inconsistent lead flow → Low-quality leads → Slow follow-up → No clear system
const ICONS = [
  // Gauge / unpredictable performance
  <svg key="a" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 9l1 1M17 9l-1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
  </svg>,
  // Funnel with leak
  <svg key="b" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M3 4h18v2l-7 8v6l-4-2v-4L3 6V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M14 18l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>,
  // Clock — slow follow-up
  <svg key="c" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>,
  // Broken chain / disconnected links
  <svg key="d" viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <path d="M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    <path d="M7 8H5a3 3 0 000 6h2M17 8h2a3 3 0 010 6h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>,
];

type ProblemPoint = { title: string; text: string };

type ProblemProps = {
  eyebrow?: string;
  title?: string;
  body?: string;
  points?: ProblemPoint[];
};

export function Problem({
  eyebrow = problem.eyebrow,
  title = problem.title,
  body = problem.body,
  points = problem.points,
}: ProblemProps = {}) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-0 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-red-500/5 blur-[100px]" />

      <SectionHeading eyebrow={eyebrow} title={title} subtitle={body} />

      <div className="mt-10 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p, i) => (
          <Reveal key={`${p.title}-${i}`} index={i} className="h-full">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-charcoal/50 p-5 sm:p-7 transition-colors hover:border-red-500/20"
            >
              {/* Large ghost number */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-5 select-none font-mono text-[5rem] font-bold leading-none text-white/[0.025] transition-all duration-500 group-hover:text-red-500/[0.06] sm:text-[7rem]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Red left accent */}
              <span className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-gradient-to-b from-red-500/50 via-red-500/20 to-transparent transition-opacity duration-300 group-hover:opacity-100 opacity-60" />

              <div className="relative">
                {/* Icon */}
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/8 text-red-400 sm:mb-5 sm:h-12 sm:w-12">
                  {ICONS[i % ICONS.length]}
                </span>

                <h3 className="text-lg font-semibold tracking-tight text-fg">
                  {p.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.text}</p>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>

      {/* Transition bridge */}
      <Reveal index={3}>
        <div className="mt-10 flex items-center justify-center gap-2 sm:mt-12 sm:gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-neon/20" />
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-neon/20 bg-neon/5 px-3 py-2 text-[0.7rem] font-medium text-neon/80 sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-sm">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neon animate-pulse" />
            Netlink closes every gap
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-neon/20" />
        </div>
      </Reveal>
    </section>
  );
}
