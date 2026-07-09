"use client";

import { motion } from "motion/react";
import { why } from "@/lib/content";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

// Unique icon for each reason
const ICONS = [
  // Revenue / money
  <svg key="0" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path d="M12 2v2M12 20v2M6 12H4M20 12h-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M9.5 13.5c0 .83.67 1.5 1.5 1.5h2a1.5 1.5 0 000-3h-2a1.5 1.5 0 010-3h2c.83 0 1.5.67 1.5 1.5M12 8v1M12 15v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>,
  // Connected system / chain
  <svg key="1" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <circle cx="5" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="6"  r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="19" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7.4 10.8l2.7-3.1M14 7.4l2.6 3M17.1 13.5l-3 2.6M6.9 13.5l3 2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>,
  // Eye / transparency
  <svg key="2" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>,
  // Person / team
  <svg key="3" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="17" cy="9" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M3 20c0-3.31 2.69-6 6-6h2c3.31 0 6 2.69 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 15c1.66 0 3 1.34 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>,
  // Lightning / speed
  <svg key="4" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>,
  // Scale / infinite
  <svg key="5" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path d="M5 12a3 3 0 106 0 3 3 0 00-6 0zM13 12a3 3 0 106 0 3 3 0 00-6 0z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 9.5l8 5M16 9.5l-8 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>,
];

export function WhyChoose() {
  return (
    <section
      id="why"
      className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-24"
    >
      <SectionHeading eyebrow={why.eyebrow} title={why.title} />

      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
        {why.reasons.map((r, i) => (
          <Reveal key={r.title} index={i % 3} className="h-full">
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-charcoal/40 p-5 sm:p-7 transition-all duration-300 hover:border-neon/25 hover:bg-charcoal/60"
            >
              {/* Ghost number watermark */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-4 select-none font-mono text-[4rem] font-bold leading-none text-white/[0.028] transition-colors duration-500 group-hover:text-neon/[0.06] sm:text-[5.5rem]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Left accent glow on hover */}
              <span className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-gradient-to-b from-neon/0 via-neon/40 to-neon/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Icon */}
              <span className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-neon/20 bg-neon/8 text-neon transition-all duration-300 group-hover:border-neon/45 group-hover:bg-neon/15 group-hover:scale-110">
                {ICONS[i]}
              </span>

              <h3 className="relative text-base font-semibold tracking-tight text-fg">
                {r.title}
              </h3>
              <p className="relative mt-2.5 text-sm leading-relaxed text-muted">
                {r.text}
              </p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
