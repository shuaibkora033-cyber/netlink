"use client";

import { motion } from "motion/react";
import type { CaseStudy } from "@/lib/data/homepage";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";
import { MetricValue } from "./ui/MetricValue";

// ─── Industry accent colours ──────────────────────────────────────────────────

const INDUSTRY_STYLES: Record<string, string> = {
  Solar: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  "Home services": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Professional services": "bg-neon/10 text-neon border-neon/20",
};

function badge(industry: string) {
  return (
    INDUSTRY_STYLES[industry] ??
    "bg-white/[0.05] text-muted border-white/[0.06]"
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function CaseStudies({ items }: { items: CaseStudy[] }) {
  return (
    <section
      id="results"
      className="relative overflow-clip border-y border-line/60 bg-charcoal/25 py-14 md:py-28"
    >
      {/* Ambient orb */}
      <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-neon/6 blur-[120px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Results"
          title={
            <>
              Real systems.{" "}
              <span className="text-gradient">Real pipeline.</span>
            </>
          }
          subtitle="A snapshot of what our growth system delivers. Individual results vary based on market, budget, and starting point."
        />

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c, i) => (
            <Reveal key={c.id} index={i} className="h-full">
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line glass p-5 sm:p-7 transition-all duration-300 hover:border-neon/25 hover:card-glow"
              >
                {/* Industry badge */}
                <span
                  className={`w-fit rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider ${badge(c.industry)}`}
                >
                  {c.industry}
                </span>

                {/* Headline metric */}
                <h3 className="mt-5 text-2xl font-bold tracking-tight text-gradient">
                  <MetricValue raw={c.title.split(" ")[0]} />
                  {" "}
                  {c.title.split(" ").slice(1).join(" ")}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{c.body}</p>

                {/* Metrics row */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <div className="text-xl font-bold tracking-tight text-fg transition-colors duration-300 group-hover:text-neon">
                        <MetricValue raw={m.value} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted">{m.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>

        {/* Disclaimer */}
        <Reveal index={3}>
          <p className="mt-8 text-center text-xs text-muted/50">
            Metrics shown are representative of client outcomes. Results are not guaranteed and vary by market and engagement.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
