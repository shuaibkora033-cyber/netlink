/**
 * Google Reviews section — async Server Component.
 *
 * Fetches real reviews from the Google Places API when
 * GOOGLE_MAPS_API_KEY and GOOGLE_PLACE_ID are set in the environment.
 * Falls back to clearly-labelled demo content when they are not.
 *
 * The API key is never sent to the browser — it stays on the server.
 *
 * To connect real reviews:
 *   1. Set GOOGLE_MAPS_API_KEY in your Hostinger / .env.local
 *   2. Set GOOGLE_PLACE_ID (your Google Maps Place ID)
 *   3. Redeploy — the demo banner disappears automatically.
 */

import { DEMO_REVIEWS, type Review } from "@/lib/reviews";
import { SectionHeading } from "./ui/SectionHeading";
import { Reveal } from "./ui/Reveal";

// ─── Data fetching ────────────────────────────────────────────────────────────

async function fetchReviews(): Promise<{ reviews: Review[]; isDemo: boolean }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return { reviews: DEMO_REVIEWS, isDemo: true };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();

    if (data.result?.reviews?.length) {
      const reviews: Review[] = (data.result.reviews as Review[])
        .slice(0, 6)
        .map((r) => ({
          author_name: r.author_name,
          rating: r.rating,
          relative_time_description: r.relative_time_description,
          text: r.text,
          profile_photo_url: r.profile_photo_url,
        }));
      return { reviews, isDemo: false };
    }
  } catch {
    // Network or parse error — fall through to demo
  }

  return { reviews: DEMO_REVIEWS, isDemo: true };
}

// ─── Star row ─────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-base ${i < rating ? "text-[#FBBC05]" : "text-white/15"}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Single review card ───────────────────────────────────────────────────────

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const initial = review.author_name.charAt(0).toUpperCase();

  return (
    <Reveal index={index % 3} className="h-full">
      <figure className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-charcoal/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
        <Stars rating={review.rating} />

        <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/80">
          &ldquo;{review.text}&rdquo;
        </blockquote>

        <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          {review.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.profile_photo_url}
              alt={review.author_name}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon to-cyan text-sm font-semibold text-ink">
              {initial}
            </span>
          )}
          <div>
            <span className="block text-sm font-medium text-fg">
              {review.author_name}
            </span>
            <span className="block text-xs text-muted">
              {review.relative_time_description}
            </span>
          </div>
          {/* Google mark */}
          <svg viewBox="0 0 24 24" className="ml-auto h-4 w-4 shrink-0 opacity-40" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </figcaption>
      </figure>
    </Reveal>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export async function GoogleReviews() {
  const { reviews, isDemo } = await fetchReviews();

  return (
    <section
      id="reviews"
      className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-24"
    >
      <SectionHeading
        eyebrow="Google reviews"
        title="What clients say about working with Netlink"
        subtitle="Real feedback from service businesses we have partnered with."
      />

      {/* Demo data notice — removed automatically once env vars are set */}
      {isDemo && (
        <p className="mx-auto mt-4 max-w-lg rounded-xl border border-line/60 bg-white/[0.02] px-4 py-2.5 text-center text-xs text-muted/70">
          Demo content — connect{" "}
          <code className="text-neon/80">GOOGLE_MAPS_API_KEY</code> &amp;{" "}
          <code className="text-neon/80">GOOGLE_PLACE_ID</code> to show real reviews.
        </p>
      )}

      <div className="mt-8 grid gap-5 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <ReviewCard key={`${review.author_name}-${i}`} review={review} index={i} />
        ))}
      </div>
    </section>
  );
}
