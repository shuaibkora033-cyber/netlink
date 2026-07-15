"use client";

import { motion } from "motion/react";
import { Reveal } from "./Reveal";

type ServiceCardProps = {
  index: number;
  title: string;
  text: string;
};

/**
 * Numbered feature/benefit card — the ghost-number + left-accent style
 * shared with Problem.tsx / WhyChoose.tsx. Used across the Lead Generation,
 * Appointment Setting, and Results detail pages' content grids.
 */
export function ServiceCard({ index, title, text }: ServiceCardProps) {
  return (
    <Reveal index={index % 3} className="h-full">
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-charcoal/40 p-5 sm:p-7 transition-all duration-300 hover:border-neon/25 hover:bg-charcoal/60"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1 -top-4 select-none font-mono text-[4rem] font-bold leading-none text-white/[0.028] transition-colors duration-500 group-hover:text-neon/[0.06] sm:text-[5.5rem]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-gradient-to-b from-neon/0 via-neon/40 to-neon/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <h3 className="relative text-base font-semibold tracking-tight text-fg">{title}</h3>
        <p className="relative mt-2.5 text-sm leading-relaxed text-muted">{text}</p>
      </motion.div>
    </Reveal>
  );
}
