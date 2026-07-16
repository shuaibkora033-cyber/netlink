"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const TOP_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/media", label: "Media" },
] as const;

const PAGE_ITEMS = [
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/pages/lead-generation", label: "Lead Generation" },
  { href: "/admin/pages/appointment-setting", label: "Appointment Setting" },
  { href: "/admin/pages/process", label: "Process" },
  { href: "/admin/pages/industries", label: "Industries" },
  { href: "/admin/pages/results", label: "Results" },
  { href: "/admin/pages/about", label: "About" },
  { href: "/admin/pages/book-consultation", label: "Book Consultation" },
] as const;

const CONTENT_ITEMS = [
  { href: "/admin/services", label: "Services" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/case-studies", label: "Case Studies / Results" },
  { href: "/admin/pages/industries", label: "Industries" },
] as const;

const BOTTOM_ITEMS = [
  { href: "/admin/theme", label: "Theme" },
  { href: "/admin/settings", label: "Settings" },
] as const;

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({
  heading,
  items,
  pathname,
  onNavigate,
}: {
  heading?: string;
  items: readonly NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {heading && (
        <p className="px-3 pb-1 pt-3 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted/50">
          {heading}
        </p>
      )}
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "rounded-lg border-l-2 px-3 py-2.5 text-sm transition-colors",
              active
                ? "border-neon bg-neon/[0.08] text-neon"
                : "border-transparent text-muted hover:bg-white/[0.04] hover:text-fg",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col">
      <NavGroup items={TOP_ITEMS} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup heading="Pages" items={PAGE_ITEMS} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup heading="Content" items={CONTENT_ITEMS} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup items={BOTTOM_ITEMS} pathname={pathname} onNavigate={onNavigate} />
    </nav>
  );
}

function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className={[
        "rounded-lg border border-line px-3 py-2.5 text-left text-sm text-muted transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-60",
        className ?? "",
      ].join(" ")}
    >
      {loggingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-charcoal/40 px-4 py-6 lg:flex">
        <div className="mb-8 px-1">
          <p className="text-sm font-semibold tracking-tight text-fg">Netlink</p>
          <p className="text-xs text-muted">Admin dashboard</p>
        </div>
        <div className="flex-1">
          <NavLinks pathname={pathname} />
        </div>
        <LogoutButton />
      </aside>

      {/* ── Mobile topbar + drawer ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-[rgba(5,10,12,0.92)] px-4 py-3 backdrop-blur-xl lg:hidden">
          <div>
            <p className="text-sm font-semibold text-fg">Netlink Admin</p>
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-fg"
          >
            <span className="flex flex-col items-center gap-[4px]">
              <span
                className={`block h-[1.5px] w-[16px] rounded-full bg-fg/80 transition-all duration-200 ${mobileOpen ? "translate-y-[5.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-[16px] rounded-full bg-fg/80 transition-all duration-200 ${mobileOpen ? "-translate-y-[5.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </header>

        {mobileOpen && (
          <div className="border-b border-line bg-charcoal/60 px-3 py-3 lg:hidden">
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-3">
              <LogoutButton className="w-full" />
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
