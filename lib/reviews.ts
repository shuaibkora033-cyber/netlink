/**
 * Google Reviews types and demo fallback data.
 *
 * Real reviews are fetched server-side in components/GoogleReviews.tsx
 * using GOOGLE_MAPS_API_KEY + GOOGLE_PLACE_ID environment variables.
 * When those are not set this demo data is used instead.
 *
 * The demo data is clearly labelled in the UI so it's never mistaken for
 * verified real reviews.
 */

export type Review = {
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
  profile_photo_url?: string;
};

export const DEMO_REVIEWS: Review[] = [
  {
    author_name: "Daniel R.",
    rating: 5,
    relative_time_description: "2 months ago",
    text: "Netlink completely transformed how we generate leads. The team built a system that actually works — qualified appointments started flowing within the first month. Highly recommend.",
  },
  {
    author_name: "Priya M.",
    rating: 5,
    relative_time_description: "3 months ago",
    text: "The new website plus their paid campaigns doubled our booked consultations in the first two months. Clear reporting, fast communication, and results I can measure.",
  },
  {
    author_name: "Marcus T.",
    rating: 5,
    relative_time_description: "4 months ago",
    text: "Fast, sharp, and genuinely invested in our pipeline. They treat our business as if it were their own. The monthly reporting alone gives us more clarity than we've ever had.",
  },
  {
    author_name: "Sarah K.",
    rating: 5,
    relative_time_description: "5 months ago",
    text: "We tried two agencies before Netlink. This is the first time we've had a team that connects website, ads, and follow-up into one system. Game-changing for a solar business.",
  },
  {
    author_name: "James L.",
    rating: 5,
    relative_time_description: "6 months ago",
    text: "They rebuilt our entire marketing approach from the ground up. Lead quality improved significantly and our cost per appointment came down. Exactly what we needed.",
  },
  {
    author_name: "Omar A.",
    rating: 5,
    relative_time_description: "7 months ago",
    text: "Professional, transparent, and results-focused. The team is always reachable and proactive about what's working. Best marketing investment we've made.",
  },
];
