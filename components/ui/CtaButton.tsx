"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type Variant = "primary" | "ghost";

type CtaButtonProps = {
  children: ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-colors";

const MotionLink = motion.create(Link);

/** Primary = neon gradient pill; ghost = glass outline. Subtle hover lift. */
export function CtaButton({
  children,
  href,
  variant = "primary",
  className = "",
}: CtaButtonProps) {
  const styles =
    variant === "primary"
      ? "text-ink bg-gradient-to-r from-neon to-neon-soft shadow-[0_10px_40px_-10px_rgba(13,253,209,0.5)] hover:shadow-[0_14px_50px_-8px_rgba(13,253,209,0.7)]"
      : "text-fg glass hover:border-white/20 hover:bg-white/[0.06]";

  return (
    <MotionLink
      href={href}
      className={`${base} ${styles} ${className}`}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      {children}
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </MotionLink>
  );
}
