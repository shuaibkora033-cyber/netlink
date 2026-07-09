"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { faqs } from "@/lib/content";
import { SectionHeading } from "./ui/SectionHeading";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-24"
    >
      {/* Subtle top glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-neon/5 blur-[100px]" />

      <SectionHeading
        eyebrow="FAQ"
        title="Questions, answered"
        subtitle="Everything you need to know before your free growth consultation."
      />

      <div className="mt-12 flex flex-col gap-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={faq.q}
              initial={false}
              animate={{
                borderColor: isOpen
                  ? "rgba(13, 253, 209, 0.25)"
                  : "rgba(255, 255, 255, 0.08)",
                backgroundColor: isOpen
                  ? "rgba(10, 11, 14, 0.7)"
                  : "rgba(10, 11, 14, 0.3)",
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden rounded-2xl border"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5"
                aria-expanded={isOpen}
              >
                <span className={`text-sm font-medium leading-snug tracking-tight transition-colors duration-200 sm:text-base ${isOpen ? "text-fg" : "text-fg/80"}`}>
                  {faq.q}
                </span>

                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-lg font-light transition-colors duration-200 ${
                    isOpen
                      ? "border-neon/40 bg-neon/10 text-neon"
                      : "border-line text-muted"
                  }`}
                  aria-hidden
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-6 pt-0 text-sm leading-relaxed text-muted">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
