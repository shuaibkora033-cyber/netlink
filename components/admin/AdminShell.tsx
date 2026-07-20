"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { canAccessPath, type Role } from "@/lib/admin/roles";

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
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
] as const;

type NavItem = { href: string; label: string };
type AdminShellUser = { name: string; email: string; role: Role };

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  sales: "Sales",
  viewer: "Viewer",
};

function filterByRole(items: readonly NavItem[], role: Role): NavItem[] {
  return items.filter((item) => canAccessPath(role, item.href));
}

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

function NavLinks({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: Role;
  onNavigate?: () => void;
}) {
  const top = filterByRole(TOP_ITEMS, role);
  const pages = filterByRole(PAGE_ITEMS, role);
  const content = filterByRole(CONTENT_ITEMS, role);
  const bottom = filterByRole(BOTTOM_ITEMS, role);

  return (
    <nav className="flex flex-col">
      <NavGroup items={top} pathname={pathname} onNavigate={onNavigate} />
      {pages.length > 0 && <NavGroup heading="Pages" items={pages} pathname={pathname} onNavigate={onNavigate} />}
      {content.length > 0 && <NavGroup heading="Content" items={content} pathname={pathname} onNavigate={onNavigate} />}
      {bottom.length > 0 && <NavGroup items={bottom} pathname={pathname} onNavigate={onNavigate} />}
    </nav>
  );
}

function UserBadge({ user }: { user: AdminShellUser }) {
  return (
    <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-line bg-white/[0.02] px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neon/12 text-xs font-semibold text-neon">
        {user.name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-fg">{user.name}</p>
        <p className="truncate text-[0.65rem] text-muted">{ROLE_LABELS[user.role]}</p>
      </div>
    </div>
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

export function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AdminShellUser | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role: Role = user?.role ?? "viewer";

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-charcoal/40 px-4 py-6 lg:flex">
        <div className="mb-8 px-1">
          <p className="text-sm font-semibold tracking-tight text-fg">Netlink</p>
          <p className="text-xs text-muted">Admin dashboard</p>
        </div>
        <div className="flex-1">
          <NavLinks pathname={pathname} role={role} />
        </div>
        {user && <UserBadge user={user} />}
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
            <NavLinks pathname={pathname} role={role} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-3 flex flex-col gap-2">
              {user && <UserBadge user={user} />}
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
