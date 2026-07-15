import Image from "next/image";
import { type Client } from "@/lib/clients";
import { DEFAULT_CLIENTS } from "@/lib/data/clients";

// ─── Shared visual tokens ─────────────────────────────────────────────────────
// Edit ONLY these constants to restyle the entire section at once.
// Never put style overrides directly on individual cards.

/** Every card is exactly this size — no exceptions. */
const CARD_W = "w-44";   // 176 px
const CARD_H = "h-14";   // 56 px

/**
 * Base card surface — identical for every logo.
 * Must include `relative`, `flex`, `items-center`, `justify-center`,
 * and `overflow-hidden` for the inner logo shell to work correctly.
 */
const CARD_BASE = [
  "group",
  `relative flex shrink-0 ${CARD_W} ${CARD_H}`,
  "items-center justify-center",
  "overflow-hidden rounded-xl",
  "border border-white/[0.07] bg-white/[0.04]",
  "transition-[background-color,border-color,box-shadow] duration-500 ease-in-out",
].join(" ");

/**
 * Hover surface for logos whose content is dark / near-black.
 * Card shifts to a soft warm-white so the dark logo remains visible.
 */
const HOVER_LIGHT =
  "hover:border-transparent hover:bg-[#edf0f2] hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.28)]";

/**
 * Hover surface for logos that are colorful or naturally light-on-dark.
 * Card brightens slightly within the dark-glass system.
 */
const HOVER_COLORFUL =
  "hover:border-white/[0.15] hover:bg-white/[0.09] hover:shadow-[0_8px_28px_-8px_rgba(255,255,255,0.04)]";

// ─── Logo card ────────────────────────────────────────────────────────────────

function LogoCard({ client }: { client: Client }) {
  /**
   * The inner shell is `position: relative` and sized as a percentage of the
   * card. The fill Image positions within this shell (not the card), so the
   * logo naturally breathes inside the card.
   *
   * Why percentage width AND height? Because `object-contain` scales to the
   * shorter axis. A wide logo is constrained by height; a square logo by width.
   * Percentage both axes keeps the breathing room consistent regardless of the
   * logo's aspect ratio.
   *
   * The shell does NOT use a CSS transform for scale — transforms stack with
   * the hover transform on the Image and cause unpredictable compound scaling.
   * Layout dimensions (width/height) avoid that entirely.
   */
  const pct = `${(client.scale ?? 0.88) * 100}%`;

  return (
    <div className={[CARD_BASE, client.needsLightHover ? HOVER_LIGHT : HOVER_COLORFUL].join(" ")}>
      <div className="relative" style={{ width: pct, height: pct }}>
        <Image
          src={client.logo}
          alt={client.alt}
          fill
          sizes="176px"
          draggable={false}
          className={[
            "object-contain",
            // ── Default state: every logo is the same soft monochrome ──────
            "brightness-0 invert opacity-[0.52]",
            // ── Hover state: identical for ALL logos ──────────────────────
            // Same duration, same easing, same scale — no per-logo variation.
            "transition-[filter,opacity,transform] duration-500 ease-in-out",
            "group-hover:brightness-100 group-hover:invert-0",
            "group-hover:opacity-100 group-hover:scale-[1.06]",
          ].join(" ")}
        />
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export function ClientsLogos({ items = DEFAULT_CLIENTS }: { items?: Client[] }) {
  // Doubled array gives the marquee a seamless loop.
  const row = [...items, ...items];

  return (
    <section className="relative border-y border-line/60 bg-charcoal/40 py-10 sm:py-12">
      <p className="mb-6 text-center text-[0.6rem] font-medium uppercase tracking-[0.18em] text-muted sm:mb-8 sm:text-xs sm:tracking-[0.25em]">
        Trusted by growing businesses
      </p>

      {/* .marquee-mask in globals.css adds the left/right fade-out gradient */}
      <div className="marquee-mask relative flex overflow-hidden">
        <div
          className="flex shrink-0 animate-marquee items-center gap-5 pr-5 hover:[animation-play-state:paused]"
        >
          {row.map((client, i) => (
            <LogoCard key={`${client.name}-${i}`} client={client} />
          ))}
        </div>
      </div>
    </section>
  );
}
