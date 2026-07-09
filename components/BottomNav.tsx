"use client";

import { useEffect, useState } from "react";

// ─── Section → nav tab mapping ────────────────────────────────────────────────
// Ordered bottom-of-page first; the first match whose offsetTop ≤ scroll mid wins.
const SECTION_MAP: ReadonlyArray<{ sectionId: string; navId: string }> = [
  { sectionId: "contact",    navId: "book"     },
  { sectionId: "faq",        navId: "book"     },
  { sectionId: "why",        navId: "book"     },
  { sectionId: "reviews",    navId: "results"  },
  { sectionId: "results",    navId: "results"  },
  { sectionId: "industries", navId: "results"  },
  { sectionId: "process",    navId: "services" },
  { sectionId: "services",   navId: "services" },
  { sectionId: "top",        navId: "home"     },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" className="h-[1.15rem] w-[1.15rem]"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M3 10.8L12 3l9 7.8V20a1 1 0 01-1 1H5a1 1 0 01-1-1v-9.2z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" className="h-[1.15rem] w-[1.15rem]"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" className="h-[1.15rem] w-[1.15rem]"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" className="h-[1.15rem] w-[1.15rem]"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
    </svg>
  );
}

// Hamburger → X with same math as the top navbar icon
// gap-[3.5px] + h-[1.5px]: line centers at 0.75, 5.75, 10.75 → Δ = 5px
function BurgerIcon({ open }: { open: boolean }) {
  return (
    <span className="flex flex-col items-center gap-[3.5px]">
      <span
        className={`block h-[1.5px] w-[13px] rounded-full bg-current
          transition-all duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`}
      />
      <span
        className={`block h-[1.5px] w-[9px] rounded-full bg-current
          transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`}
      />
      <span
        className={`block h-[1.5px] w-[13px] rounded-full bg-current
          transition-all duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
      />
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active,   setActive]   = useState("home");

  // ── Sync with the top Navbar's drawer state ──────────────────────────────
  useEffect(() => {
    const onChanged = (e: Event) => {
      setMenuOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    };
    window.addEventListener("netlink:menu-changed", onChanged);
    return () => window.removeEventListener("netlink:menu-changed", onChanged);
  }, []);

  // ── Track which section is in view ──────────────────────────────────────
  useEffect(() => {
    const check = () => {
      const mid = window.scrollY + window.innerHeight * 0.45;
      for (const { sectionId, navId } of SECTION_MAP) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= mid) {
          setActive(navId);
          return;
        }
      }
      setActive("home");
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, []);

  // When the menu is open, override the active indicator to "menu"
  const activeTab = menuOpen ? "menu" : active;

  // ── Shared classes ──────────────────────────────────────────────────────
  const tabBase = [
    "flex flex-col items-center gap-[3px]",
    "flex-1 min-w-0 rounded-full px-2 py-2",
    "transition-all duration-200",
    "active:scale-[0.90]",
  ].join(" ");

  const tabDefault = "text-white/[0.38] hover:text-white/60";
  const tabActive  = "text-neon";

  return (
    // bottom is computed via inline style so we can reference env(safe-area-inset-bottom)
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed left-4 right-4 z-[998] lg:hidden"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {/* Glass pill ──────────────────────────────────────────────────────── */}
      <div
        className={[
          "flex items-center justify-around",
          "rounded-full",
          "bg-[rgba(5,10,12,0.90)]",
          "border border-white/[0.08]",
          "backdrop-blur-xl",
          "px-2 py-1.5",
          // Layered shadow: deep drop shadow + soft outer neon halo
          "shadow-[0_8px_40px_-4px_rgba(0,0,0,0.70),0_0_0_1px_rgba(13,253,209,0.04),0_0_56px_-14px_rgba(13,253,209,0.14)]",
        ].join(" ")}
      >
        {/* ── Home ─────────────────────────────────────────────────────── */}
        <a
          href="#top"
          aria-label="Home"
          className={`${tabBase} ${activeTab === "home" ? tabActive : tabDefault}`}
        >
          <HomeIcon />
          <span className="text-[0.58rem] font-medium tracking-wide">Home</span>
        </a>

        {/* ── Services ─────────────────────────────────────────────────── */}
        <a
          href="#services"
          aria-label="Services"
          className={`${tabBase} ${activeTab === "services" ? tabActive : tabDefault}`}
        >
          <GridIcon />
          <span className="text-[0.58rem] font-medium tracking-wide">Services</span>
        </a>

        {/* ── Book (primary CTA) ───────────────────────────────────────── */}
        {/*
         * To change the Book CTA destination: update the href below.
         * To resize the badge: adjust px-*, py-*, and text-* classes below.
         */}
        <a
          href="#contact"
          aria-label="Book a free consultation"
          className={[
            "flex flex-col items-center gap-[3px]",
            "flex-shrink-0",
            "rounded-full px-4 py-2",
            // Neon gradient fill — distinguishes the CTA from regular tabs
            "bg-gradient-to-b from-neon/[0.18] to-neon/[0.07]",
            "border border-neon/[0.30]",
            "text-neon",
            // Soft cyan outer glow
            "shadow-[0_0_18px_-4px_rgba(13,253,209,0.32)]",
            "transition-all duration-200",
            "active:scale-[0.90]",
            "hover:from-neon/[0.26] hover:to-neon/[0.12] hover:shadow-[0_0_24px_-4px_rgba(13,253,209,0.46)]",
          ].join(" ")}
        >
          <CalendarIcon />
          <span className="text-[0.58rem] font-semibold tracking-wide">Book</span>
        </a>

        {/* ── Results ──────────────────────────────────────────────────── */}
        <a
          href="#results"
          aria-label="Results"
          className={`${tabBase} ${activeTab === "results" ? tabActive : tabDefault}`}
        >
          <TrendIcon />
          <span className="text-[0.58rem] font-medium tracking-wide">Results</span>
        </a>

        {/* ── Menu ─────────────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("netlink:toggle-menu"))}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className={`${tabBase} ${activeTab === "menu" ? tabActive : tabDefault}`}
        >
          <BurgerIcon open={menuOpen} />
          <span className="text-[0.58rem] font-medium tracking-wide">Menu</span>
        </button>
      </div>
    </nav>
  );
}
