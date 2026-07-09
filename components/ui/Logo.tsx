import Image from "next/image";
import { site } from "@/lib/content";

/**
 * Netlink wordmark — real logo PNG (transparent background, no CSS filter).
 *
 * The PNG was generated from the original WebP with background already at
 * alpha=0 and body alpha normalised to 255.  A subtle drop-shadow adds the
 * turquoise glow effect that makes the mark pop on dark surfaces.
 */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cfg = {
    sm: { w: 20, h: 25, text: "text-base" },
    md: { w: 26, h: 32, text: "text-lg"   },
    lg: { w: 34, h: 42, text: "text-xl"   },
  } as const;

  const { w, h, text } = cfg[size];

  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/brand/netlink-logo.png"
        alt="Netlink logomark"
        width={w}
        height={h}
        className="shrink-0 [filter:drop-shadow(0_0_7px_rgba(13,253,209,0.45))]"
        priority
      />
      <span className={`${text} font-semibold tracking-tight text-fg`}>
        {site.name}
      </span>
    </span>
  );
}
