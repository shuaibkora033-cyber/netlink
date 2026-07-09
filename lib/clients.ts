/**
 * Client data for the Clients Logos marquee.
 * Logos live in public/clients/*.webp
 *
 * ── needsLightHover ─────────────────────────────────────────────────────────
 *   true  → logo has dark/black content; hover card becomes soft-white so the
 *            logo stays visible against a light surface.
 *   false → logo is colorful or already light-on-dark; the card stays dark-glass.
 *
 * ── scale ───────────────────────────────────────────────────────────────────
 *   Controls how much of the card area the logo occupies. 1.0 = full card.
 *   Range: 0.60 – 1.0. Use it to optically balance logos that are much wider
 *   or taller than others. The card dimensions are NEVER changed by this field.
 *
 *   Actual logo aspect ratios (width ÷ height):
 *     texas-solar          4.17   ← very wide text mark
 *     the-black-closet     4.54   ← very wide text mark
 *     yardaz               5.03   ← very wide text mark
 *     sisters              3.28   ← wide text mark
 *     quicken-solar        3.30   ← wide text + leaf icon
 *     gulf-electrical-solar 1.67  ← moderate landscape
 *     bliss-brothers       1.63   ← moderate landscape
 *     green-wat-consulting 1.12   ← near-square icon mark
 *     ground-up            1.00   ← square icon mark
 *     bynusyba             1.00   ← square calligraphy mark
 *
 *   Wide logos fill the card naturally and are scaled down slightly to breathe.
 *   Square/portrait logos are left at 1.0 (object-contain already centers them).
 */
export type Client = {
  name: string;
  logo: string;
  alt: string;
  /** true → hover card is soft-white; false → hover card is dark-glass */
  needsLightHover: boolean;
  /**
   * Fraction of the card area used by this logo (0.60–1.0).
   * Defaults to 0.88 when not specified.
   * Increase toward 1.0 for compact/square logos; decrease for very wide ones.
   */
  scale?: number;
};

export const clients: Client[] = [
  {
    name: "Texas Solar",
    logo: "/clients/texas-solar.webp",
    alt: "Texas Solar",
    needsLightHover: true,
    scale: 0.82,  // ratio 4.17 — very wide; shrink so it doesn't crowd the edges
  },
  {
    name: "Ground Up",
    logo: "/clients/ground-up.webp",
    alt: "Ground Up",
    needsLightHover: true,
    scale: 1.0,   // ratio 1.0 — square mark; give it all the space it can use
  },
  {
    name: "Quicken Solar",
    logo: "/clients/quicken-solar.webp",
    alt: "Quicken Solar",
    needsLightHover: true,
    scale: 0.88,  // ratio 3.30 — wide; slight breathing room
  },
  {
    name: "Gulf Electrical Solar",
    logo: "/clients/gulf-electrical-solar.webp",
    alt: "Gulf Electrical Solar",
    needsLightHover: false,
    scale: 0.92,  // ratio 1.67 — moderate; small inset only
  },
  {
    name: "Bliss Brothers",
    logo: "/clients/bliss-brothers.webp",
    alt: "Bliss Brothers",
    needsLightHover: true,
    scale: 0.92,  // ratio 1.63 — moderate; small inset only
  },
  {
    name: "Green Wat Consulting",
    logo: "/clients/green-wat-consulting.webp",
    alt: "Green Wat Consulting",
    needsLightHover: false,
    scale: 1.0,   // ratio 1.12 — near-square; give it max space
  },
  {
    name: "The Black Closet",
    logo: "/clients/the-black-closet.webp",
    alt: "The Black Closet",
    needsLightHover: false,
    scale: 0.80,  // ratio 4.54 — very wide; pull in from edges
  },
  {
    name: "ByNusyba",
    logo: "/clients/bynusyba.webp",
    alt: "ByNusyba",
    needsLightHover: false,
    scale: 1.0,   // ratio 1.0 — square mark; give it max space
  },
  {
    name: "Sisters",
    logo: "/clients/sisters.webp",
    alt: "Sisters",
    needsLightHover: true,
    scale: 0.88,  // ratio 3.28 — wide; slight breathing room
  },
  {
    name: "Yardaz",
    logo: "/clients/yardaz.webp",
    alt: "Yardaz",
    needsLightHover: true,
    scale: 0.78,  // ratio 5.03 — widest logo in the set; most reduction
  },
];
