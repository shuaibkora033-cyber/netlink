"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";

const inputCls =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-fg placeholder:text-muted/60 outline-none transition-all duration-200 focus:border-neon/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-neon/20";

/**
 * Consultation form placeholder for /book-consultation. Field set is a
 * superset of the homepage's compact Contact.tsx form (adds Phone, Website,
 * Service needed), so it's a dedicated component rather than a Contact.tsx
 * edit — keeps the homepage's existing form untouched. No backend wiring
 * yet, same as Contact.tsx today: submit just flips to a success state.
 */
export function BookConsultationForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
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
              <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
          <div>
            <h3 className="text-xl font-semibold">Thanks — we&apos;ll be in touch.</h3>
            <p className="mt-2 max-w-xs text-sm text-muted">
              We received your request and will reach out within one business day to confirm your
              free growth consultation.
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
              <label htmlFor="phone" className="text-xs font-medium text-muted">Phone number</label>
              <input id="phone" name="phone" type="tel" required placeholder="(202) 474-4630" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="company" className="text-xs font-medium text-muted">Company</label>
              <input id="company" name="company" required placeholder="Company name" className={inputCls} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="website" className="text-xs font-medium text-muted">Website</label>
              <input id="website" name="website" placeholder="yourcompany.com" className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="service" className="text-xs font-medium text-muted">Service needed</label>
              <select id="service" name="service" className={`${inputCls} cursor-pointer`} defaultValue="">
                <option value="" disabled>Select a service</option>
                <option>Lead Generation</option>
                <option>Appointment Setting</option>
                <option>Both</option>
                <option>Not sure yet</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="budget" className="text-xs font-medium text-muted">Monthly marketing budget</label>
            <select id="budget" name="budget" className={`${inputCls} cursor-pointer`} defaultValue="">
              <option value="" disabled>Select range</option>
              <option>Under $2k</option>
              <option>$2k – $5k</option>
              <option>$5k – $10k</option>
              <option>$10k+</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-xs font-medium text-muted">Notes</label>
            <textarea
              id="notes"
              name="notes"
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
            Book Consultation
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </motion.button>
        </form>
      )}
    </div>
  );
}
