import Image from "next/image";
import { site } from "@/lib/content";

/**
 * Netlink brand lockup — icon + "Netlink" text, vertically centered as one
 * group (`flex items-center`).
 *
 * The icon renders inside a fixed-size square box (`fill` + `object-contain`)
 * so it can be sized precisely in CSS pixels without distorting the source
 * art's natural (portrait) aspect ratio.
 *
 * That box carries a small static translateY correction: the source PNG's
 * opaque pixels are not vertically centered within its own 90x112 canvas
 * (measured top margin 24px vs bottom margin 34px), so centering the box
 * alone still reads as "icon sits too high" next to the text. The nudge
 * compensates for the asset itself, independent of the animation.
 *
 * `animated` adds a visible float + scale + glow pulse to the icon
 * (`nav-logo-icon`) and a much subtler, perfectly-synced opacity/glow pulse
 * to the text (`nav-logo-text`, no movement) so the whole lockup breathes
 * together rather than the icon feeling animated in isolation. Both are
 * transform/opacity/filter only (no layout shift) and disabled under
 * prefers-reduced-motion.
 */
export function Logo({
  size = "sm",
  animated = false,
}: {
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  const cfg = {
    sm: { box: "h-8 w-8", text: "text-lg", gap: "gap-3" }, // 32px icon, 12px gap — mobile navbar / footer
    md: { box: "h-[34px] w-[34px]", text: "text-lg", gap: "gap-3.5" }, // 34px icon, 14px gap — desktop navbar
    lg: { box: "h-11 w-11", text: "text-xl", gap: "gap-3.5" }, // 44px — reserved for larger contexts
  } as const;

  const { box, text, gap } = cfg[size];

  return (
    <span className={`flex items-center ${gap}`}>
      <span
        className={`nav-logo-icon-wrap relative flex shrink-0 items-center justify-center ${box}`}
        style={{ transform: "translateY(1.5px)" }}
      >
        <Image
          src="/brand/netlink-logo.png"
          alt="Netlink logomark"
          fill
          sizes="48px"
          className={
            animated
              ? "object-contain nav-logo-icon"
              : "object-contain [filter:drop-shadow(0_0_7px_rgba(13,253,209,0.45))]"
          }
          priority
        />
      </span>
      <span
        className={`${text} ${animated ? "nav-logo-text" : ""} font-semibold leading-none tracking-tight text-fg`}
      >
        {site.name}
      </span>
    </span>
  );
}
