"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useMotionTemplate } from "motion/react";
import { services, type Service } from "@/lib/content";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

// ─── Service icons by ID ──────────────────────────────────────────────────────

function ServiceIcon({ id }: { id: string }): ReactNode {
  const icons: Record<string, ReactNode> = {
    "lead-gen": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1 3" opacity=".5" />
      </svg>
    ),
    "appt-setting": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 14h4M7 17h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="17" cy="16" r="2.2" fill="currentColor" opacity=".6" />
        <path d="M16.3 16l.7.7 1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    "web-dev": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="2" y="3" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 7h20" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 11l-2 2 2 2M15 11l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    "uiux": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 2L9.5 9.5H2l6 4.5-2.5 7.5L12 17l6.5 4.5-2.5-7.5 6-4.5h-7.5L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    "perf-marketing": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M3 17l5-5 4 4 5-7 4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 7h-3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    "google-ads": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M16.5 16.5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    "social-media": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8.4 10.8l7.2-4.2M8.4 13.2l7.2 4.2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
    "branding": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5" />
        <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    "conversion": (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M6 4h12v3l-4 5 4 5v3H6v-3l4-5-4-5V4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M6 7h12M6 17h12" stroke="currentColor" strokeWidth="1.2" opacity=".5" />
      </svg>
    ),
  };
  return icons[id] ?? null;
}

// ─── Bento service card ───────────────────────────────────────────────────────

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  }

  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgba(13,253,209,0.1), transparent 70%)`;

  const isWide = service.span === 2;

  return (
    <Reveal
      index={index}
      className={isWide ? "lg:col-span-2" : ""}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        whileHover={{ y: -3 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
        className="group relative h-full overflow-hidden rounded-2xl border border-line glass p-6 sm:p-7"
      >
        {/* Mouse-spotlight glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />

        <div className="relative flex h-full flex-col">
          {/* Top row: icon + number */}
          <div className="mb-4 flex items-start justify-between sm:mb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon/25 bg-neon/8 text-neon transition-all duration-300 group-hover:border-neon/50 group-hover:bg-neon/12 sm:h-11 sm:w-11">
              <ServiceIcon id={service.id} />
            </span>
            <span className="font-mono text-xs text-muted/40 transition-colors group-hover:text-neon/60 sm:text-sm">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-semibold tracking-tight ${isWide ? "text-lg sm:text-xl md:text-2xl" : "text-base sm:text-lg md:text-xl"}`}>
            {service.title}
          </h3>

          {/* Description */}
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
            {service.text}
          </p>

          {/* Feature pills */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {service.features.map((f) => (
              <li
                key={f}
                className="rounded-full border border-line bg-white/[0.02] px-3 py-1 text-xs text-white/65 transition-colors group-hover:border-neon/20 group-hover:text-white/80"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function Services() {
  return (
    <section id="services" className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-24">
      <SectionHeading
        eyebrow="What we do"
        title={
          <>
            Nine services. <span className="text-gradient">One growth system.</span>
          </>
        }
        subtitle="Every service connects — from first click to closed deal — so your marketing works as a single compounding machine."
      />

      {/*
        Bento grid: 3 columns on lg, 2 on sm, 1 on mobile.
        Wide cards (span 2) use lg:col-span-2 only so mobile/tablet stack cleanly.
        Layout: [Lead Gen×2 | Appt×1] [Web×1 | UI/UX×2] [Perf×1 | G-Ads×1 | Social×1] [Brand×2 | Conv×1]
      */}
      <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <ServiceCard key={service.id} service={service} index={i} />
        ))}
      </div>
    </section>
  );
}
