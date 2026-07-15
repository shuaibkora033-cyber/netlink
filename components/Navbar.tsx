"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { nav, site } from "@/lib/content";
import { CtaButton } from "./ui/CtaButton";
import { Logo } from "./ui/Logo";

// ─── Shared visual tokens ─────────────────────────────────────────────────────

const GLASS_BG   = "bg-[rgba(5,10,12,0.92)]";
const GLASS_BOR  = "border border-[rgba(255,255,255,0.10)]";
const SHADOW_REST =
  "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.55),0_0_48px_-12px_rgba(13,253,209,0.06)]";
const SHADOW_ON =
  "shadow-[0_0_0_1px_rgba(13,253,209,0.08),0_16px_48px_-6px_rgba(0,0,0,0.75),0_0_72px_-12px_rgba(13,253,209,0.10)]";

// ─── Shared sub-components ────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "relative whitespace-nowrap text-sm text-muted/90",
        "transition-colors duration-200 hover:text-fg",
        "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0",
        "after:bg-neon after:transition-[width] after:duration-300 hover:after:w-full",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

// Animated hamburger → X icon (shared by both navbars)
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex flex-col items-center gap-[4px]">
      {/* Line 1 — rotates to form top arm of X */}
      <span
        className={`block h-[1.5px] w-[14px] rounded-full bg-fg/80 transition-all duration-300 ease-in-out ${
          open ? "translate-y-[5.5px] rotate-45" : ""
        }`}
      />
      {/* Line 2 — short centre stroke, fades away */}
      <span
        className={`block h-[1.5px] w-[8px] rounded-full bg-fg/80 transition-all duration-300 ease-in-out ${
          open ? "scale-x-0 opacity-0" : ""
        }`}
      />
      {/* Line 3 — rotates to form bottom arm of X */}
      <span
        className={`block h-[1.5px] w-[14px] rounded-full bg-fg/80 transition-all duration-300 ease-in-out ${
          open ? "-translate-y-[5.5px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

// ─── Mobile navbar  (visible below lg = 1024 px) ──────────────────────────────
//
//  The wrapper is a POSITION-ONLY element:
//    fixed top-4 inset-x-4 → 16 px from every horizontal screen edge
//    w-auto max-w-none      → width driven purely by inset values, no calc
//    translate-x-0          → no transform; desktop centering never bleeds in
//    box-border             → padding counted inside the element, not outside
//
//  The inner pill carries all visual styling (glass, border, shadow, padding).
//  w-full max-w-full min-w-0 box-border on the pill prevent it from ever
//  growing wider than its parent wrapper.

function MobileNavbar({
  scrolled,
  open,
  onToggle,
  onClose,
  navbarCtaText,
}: {
  scrolled: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  navbarCtaText: string;
}) {
  return (
    <>
      {/* ── Bar ── */}
      <div
        className={[
          // Position container — inset-x-4 is the ONLY thing setting width
          "fixed top-4 inset-x-4 z-[999]",
          "w-auto max-w-none translate-x-0 box-border",
          // Hidden at lg+ (desktop navbar takes over)
          "lg:hidden",
        ].join(" ")}
      >
        {/* Glass pill */}
        <div
          className={[
            "w-full max-w-full min-w-0 box-border",
            "flex items-center justify-between",
            "rounded-2xl",
            GLASS_BOR,
            GLASS_BG,
            "backdrop-blur-xl",
            "transition-shadow duration-300",
            scrolled ? SHADOW_ON : SHADOW_REST,
            "px-4 py-3",
          ].join(" ")}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label={site.name}
            className="flex min-w-0 shrink-0 items-center"
          >
            <Logo size="sm" animated />
          </Link>

          {/* Hamburger button — ml-auto pushes it to far right inside the pill */}
          <button
            onClick={onToggle}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={[
              "ml-auto shrink-0",
              "h-10 w-10",
              "flex items-center justify-center",
              "rounded-xl",
              "border border-white/[0.13] bg-white/[0.06]",
              "transition-all duration-200 ease-in-out",
              "hover:bg-white/[0.12] hover:border-white/[0.22]",
              "active:scale-[0.93]",
            ].join(" ")}
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {/*
       * top = top-4 (16px) + pill height (≈ 64px) + 4px gap = 84px
       * inset-x-4 aligns perfectly with the bar above.
       */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer"
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className={[
              "fixed top-[84px] inset-x-4 z-[998]",
              "w-auto max-w-none",
              "rounded-2xl",
              "border border-[rgba(255,255,255,0.10)]",
              "bg-[rgba(5,10,12,0.97)] backdrop-blur-xl",
              "shadow-[0_16px_48px_-6px_rgba(0,0,0,0.75)]",
              "px-4 pb-5 pt-3",
              "lg:hidden",
            ].join(" ")}
          >
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted/85 transition-all duration-150 hover:bg-white/[0.05] hover:text-fg"
                >
                  <span className="h-3.5 w-px rounded-full bg-neon/0 transition-all duration-200 group-hover:bg-neon/70" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div
              className="mt-2 border-t border-white/[0.07] pt-3"
              onClick={onClose}
            >
              <CtaButton
                href="/book-consultation"
                className="w-full justify-center py-3.5 text-sm"
              >
                Get {navbarCtaText} →
              </CtaButton>
            </div>

            <p className="mt-3 text-center text-[0.6rem] tracking-wide text-muted/40">
              No spam · Reply within 1 business day
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Desktop navbar  (visible from lg = 1024 px and above) ───────────────────
//
//  Completely independent of the mobile layout — no shared positioning classes.
//  Uses the original centered-pill approach (left-1/2 -translate-x-1/2 + calc)
//  which is correct and reliable at desktop widths.

function DesktopNavbar({
  scrolled,
  navbarCtaText,
}: {
  scrolled: boolean;
  navbarCtaText: string;
}) {
  return (
    <header
      style={{ width: "calc(100% - 32px)" }}
      className={[
        // Hidden on mobile; shown only at lg+
        "hidden lg:block",
        // Centered floating pill — safe to use left-1/2 + transform at desktop
        "fixed top-4 left-1/2 z-[999] -translate-x-1/2",
        "max-w-[1200px]",
        "rounded-2xl",
        GLASS_BG,
        "backdrop-blur-xl",
        GLASS_BOR,
        "transition-shadow duration-300",
        scrolled ? SHADOW_ON : SHADOW_REST,
        "px-6 py-3",
      ].join(" ")}
    >
      <div className="flex w-full items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          aria-label={site.name}
          className="flex shrink-0 items-center"
        >
          <Logo size="md" animated />
        </Link>

        {/* Nav links — always visible inside desktop navbar */}
        <nav
          className="flex flex-1 items-center justify-center gap-6 xl:gap-8"
          aria-label="Main navigation"
        >
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        {/* CTA */}
        <CtaButton href="/book-consultation" className="shrink-0 px-5 py-2.5 text-xs">
          {navbarCtaText}
        </CtaButton>
      </div>
    </header>
  );
}

// ─── Navbar (export) ──────────────────────────────────────────────────────────

export function Navbar({ navbarCtaText }: { navbarCtaText: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);

  // Scroll shadow
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 12);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // Auto-close mobile drawer when viewport reaches lg breakpoint
  useEffect(() => {
    const mq    = window.matchMedia("(min-width: 1024px)");
    const close = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  // Broadcast menu state so BottomNav can sync its icon
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("netlink:menu-changed", { detail: { open } })
    );
  }, [open]);

  // Allow BottomNav "Menu" button to toggle this drawer
  useEffect(() => {
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener("netlink:toggle-menu", onToggle);
    return () => window.removeEventListener("netlink:toggle-menu", onToggle);
  }, []);

  return (
    <>
      <MobileNavbar
        scrolled={scrolled}
        open={open}
        onToggle={() => setOpen((v) => !v)}
        onClose={() => setOpen(false)}
        navbarCtaText={navbarCtaText}
      />
      <DesktopNavbar scrolled={scrolled} navbarCtaText={navbarCtaText} />
    </>
  );
}
