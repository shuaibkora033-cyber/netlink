"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import type { FinalCta } from "@/lib/data/homepage";
import { toTelHref } from "@/lib/data/theme";
import { Reveal } from "./ui/Reveal";
import { GlowBackground } from "./ui/GlowBackground";

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-fg placeholder:text-muted/60 outline-none transition-all duration-200 focus:border-neon/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-neon/20";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
      <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Contact({
  finalCta,
  contactEmail,
  phoneNumber,
  buttonText,
}: {
  finalCta: FinalCta;
  contactEmail: string;
  phoneNumber: string;
  buttonText: string;
}) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section
      id="contact"
      className="relative overflow-clip py-14 md:py-28"
    >
      <GlowBackground className="opacity-60" />

      {/* Section neon rule */}
      <div className="pointer-events-none absolute inset-x-0 top-0 section-rule" />

      <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">

        {/* ── Left: pitch ── */}
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-neon/25 bg-neon/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-neon">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neon" />
              {finalCta.eyebrow}
            </span>
          </Reveal>

          <Reveal index={1}>
            <h2 className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2.75rem] md:leading-[1.1]">
              {finalCta.title}
            </h2>
          </Reveal>

          <Reveal index={2}>
            <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted sm:mt-5 sm:text-base">
              {finalCta.text}
            </p>
          </Reveal>

          {/* Bullet list */}
          <Reveal index={3}>
            <ul className="mt-6 flex flex-col gap-3 sm:mt-8 sm:gap-4">
              {finalCta.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neon/12 text-neon ring-1 ring-neon/20">
                    <CheckIcon />
                  </span>
                  <span className="text-sm text-white/85 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Contact links */}
          <Reveal index={4}>
            <div className="mt-10 flex flex-col gap-2 text-sm">
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 text-muted transition-colors hover:text-neon"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-60" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 8l10 6 10-6" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                {contactEmail}
              </a>
              <a
                href={toTelHref(phoneNumber)}
                className="flex items-center gap-2 text-muted transition-colors hover:text-neon"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-60" fill="none">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                </svg>
                {phoneNumber}
              </a>
            </div>
          </Reveal>
        </div>

        {/* ── Right: form ── */}
        <Reveal index={1}>
          <div className="rounded-3xl border border-line glass p-5 sm:p-9">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-5 py-16 text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-neon/15 text-neon ring-1 ring-neon/30"
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                    <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.span>
                <div>
                  <h3 className="text-xl font-semibold">
                    Thanks — we&apos;ll be in touch.
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-muted">
                    We received your request and will reach out within one business day
                    to book your free growth consultation.
                  </p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-5">
                <div className="mb-1">
                  <h3 className="text-lg font-semibold">Book your free consultation</h3>
                  <p className="mt-1 text-xs text-muted">No spam. We reply within one business day.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-medium text-muted">Full name</label>
                    <input id="name" name="name" required placeholder="Jane Doe" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-muted">Work email</label>
                    <input id="email" name="email" type="email" required placeholder="jane@company.com" className={inputCls} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="company" className="text-xs font-medium text-muted">Company</label>
                    <input id="company" name="company" placeholder="Company name" className={inputCls} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="budget" className="text-xs font-medium text-muted">Monthly budget</label>
                    <select id="budget" name="budget" className={`${inputCls} cursor-pointer`} defaultValue="">
                      <option value="" disabled>Select range</option>
                      <option>Under $2k</option>
                      <option>$2k – $5k</option>
                      <option>$5k – $10k</option>
                      <option>$10k+</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-medium text-muted">What are you looking to grow?</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Tell us about your business and goals…"
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon to-neon-soft px-6 py-4 text-sm font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(13,253,209,0.55)] transition-shadow hover:shadow-[0_14px_50px_-8px_rgba(13,253,209,0.75)]"
                >
                  {buttonText}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </motion.button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
