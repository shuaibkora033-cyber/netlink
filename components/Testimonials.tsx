/**
 * Testimonials section — superseded by GoogleReviews in the 2026 upgrade.
 * Kept here as a reference but no longer mounted in app/page.tsx.
 */

const testimonials = [
  {
    quote:
      "Netlink didn't just run ads — they rebuilt how leads come into our business. We finally have a system we can trust and scale.",
    name: "Daniel R.",
    role: "Founder, Solar Installer",
  },
  {
    quote:
      "The new site plus their campaigns doubled our booked consultations in the first two months. The reporting alone was worth it.",
    name: "Priya M.",
    role: "Director, Consulting Firm",
  },
  {
    quote:
      "Fast, sharp, and genuinely invested in results. It feels like they care about our pipeline as much as we do.",
    name: "Marcus T.",
    role: "Owner, HVAC Company",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 md:py-32">
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-7"
          >
            <blockquote className="flex-1 text-sm leading-relaxed text-white/85">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 border-t border-white/8 pt-5 text-sm text-white/60">
              {t.name} — {t.role}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
