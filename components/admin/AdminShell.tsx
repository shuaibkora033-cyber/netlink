"use client";

import { useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { canAccessPath, type Role } from "@/lib/admin/roles";

type IconProps = { className?: string };

function IconOverview({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function IconLeads({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 19V10M12 19V5M20 19v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconMedia({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 15l-5-5-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTheme({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21a9 9 0 1 1 0-18c4.97 0 9 3.5 9 7.5 0 2-1.5 3.5-3.5 3.5H15a2 2 0 0 0-1.5 3.2c.4.5.2 1.3-.5 1.6-.3.1-.7.2-1 .2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="11" cy="7" r="1" fill="currentColor" />
      <circle cx="15.5" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 20c.7-3.5 3-5.5 5.5-5.5s4.8 2 5.5 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M15.5 5.5c1.4.3 2.5 1.6 2.5 3.1 0 1.5-1.1 2.8-2.5 3.1M18 14.8c1.8.5 3.1 2 3.6 4.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconSettings({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type NavItem = { href: string; label: string; icon?: ComponentType<IconProps> };

// Grouping mirrors lib/admin/roles.ts's ROUTE_ROLES exactly — Overview has no
// restriction, Operate is [owner, admin, sales, viewer] (leads triage roles),
// Content and Workspace are the editor-reachable and owner-only routes
// respectively. Regrouping nav headings here never changes what a role can
// reach — canAccessPath / filterByRole below still do that filtering.

const OVERVIEW_ITEMS = [{ href: "/admin", label: "Dashboard", icon: IconOverview }] as const;

const OPERATE_ITEMS = [
  { href: "/admin/leads", label: "Leads", icon: IconLeads },
  { href: "/admin/media", label: "Media", icon: IconMedia },
] as const;

// Previously split across two headings ("Pages" / "Content") with
// /admin/pages/industries duplicated in both — every item here has the same
// [owner, admin, editor] access in roles.ts, so one heading is both simpler
// and more accurate. Industries now appears exactly once.
const CONTENT_ITEMS = [
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/pages/lead-generation", label: "Lead Generation" },
  { href: "/admin/pages/appointment-setting", label: "Appointment Setting" },
  { href: "/admin/pages/process", label: "Process" },
  { href: "/admin/pages/industries", label: "Industries" },
  { href: "/admin/pages/results", label: "Results" },
  { href: "/admin/pages/about", label: "About" },
  { href: "/admin/pages/book-consultation", label: "Book Consultation" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/faqs", label: "FAQs" },
  { href: "/admin/case-studies", label: "Case Studies / Results" },
] as const;

const WORKSPACE_ITEMS = [
  { href: "/admin/theme", label: "Theme", icon: IconTheme },
  { href: "/admin/users", label: "Users", icon: IconUsers },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
] as const;

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

// Every content editor (Homepage, the /pages/* editors, Services, Clients,
// FAQs, Case Studies, Users, Theme, Settings) is a form or a list of small
// field-groups — those stay at the narrower reading width. The Overview
// dashboard, the Leads table, and the Media grid are the only genuinely
// table/grid-heavy views, where the same narrow cap just wastes horizontal
// space on wide screens instead of showing more columns/cards/rows.
//
// Exact matches only — /admin/leads/[id] (a single lead's detail form) is
// deliberately excluded even though it's nested under /admin/leads, since
// it reads like the other Panel-based editors, not a table.
const WIDE_EXACT_PATHS = ["/admin", "/admin/leads", "/admin/media"];

function isWidePage(pathname: string): boolean {
  return WIDE_EXACT_PATHS.includes(pathname);
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
        <p className="px-3 pb-1 pt-3 text-admin-caption font-semibold uppercase tracking-[0.08em] text-admin-text-3">
          {heading}
        </p>
      )}
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={[
              "flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-admin-body transition-colors duration-200 ease-admin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40",
              active
                ? "border-admin-accent bg-admin-accent/[0.08] text-admin-accent"
                : "border-transparent text-admin-text-2 hover:bg-admin-surface-2 hover:text-admin-text",
            ].join(" ")}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="truncate">{item.label}</span>
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
  const overview = filterByRole(OVERVIEW_ITEMS, role);
  const operate = filterByRole(OPERATE_ITEMS, role);
  const content = filterByRole(CONTENT_ITEMS, role);
  const workspace = filterByRole(WORKSPACE_ITEMS, role);

  return (
    <nav className="flex flex-col">
      {overview.length > 0 && <NavGroup items={overview} pathname={pathname} onNavigate={onNavigate} />}
      {operate.length > 0 && <NavGroup heading="Operate" items={operate} pathname={pathname} onNavigate={onNavigate} />}
      {content.length > 0 && <NavGroup heading="Content" items={content} pathname={pathname} onNavigate={onNavigate} />}
      {workspace.length > 0 && (
        <NavGroup heading="Workspace" items={workspace} pathname={pathname} onNavigate={onNavigate} />
      )}
    </nav>
  );
}

function UserBadge({ user }: { user: AdminShellUser }) {
  return (
    <div className="mb-2 flex items-center gap-2.5 rounded-lg border border-admin-border bg-admin-surface px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-admin-accent/12 text-admin-label font-semibold text-admin-accent">
        {user.name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-admin-label font-medium text-admin-text">{user.name}</p>
        <p className="truncate text-admin-caption text-admin-text-3">{ROLE_LABELS[user.role]}</p>
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
        "rounded-lg border border-admin-border px-3 py-2.5 text-left text-admin-body text-admin-text-2 transition-colors duration-200 ease-admin hover:border-admin-danger/30 hover:bg-admin-danger/10 hover:text-admin-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 disabled:opacity-60",
        className ?? "",
      ].join(" ")}
    >
      {loggingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}

const MOBILE_NAV_ID = "admin-mobile-nav";

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
  const wide = isWidePage(pathname);

  // Mobile drawer should never persist open across a route change. Adjusting
  // state during render (React's recommended pattern for "reset on prop
  // change") rather than in an effect — an effect here would set state
  // unconditionally on every pathname change, causing an extra render pass.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  // Mobile drawer is a disclosure region, not a modal — no focus trap, but
  // Escape should still close it.
  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen">
      {/* ── Persistent sidebar (tablet and up) ── */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-admin-border bg-admin-bg px-4 py-6 md:flex">
        <div className="mb-8 px-1">
          <p className="text-admin-body font-semibold tracking-tight text-admin-text">Netlink</p>
          <p className="text-admin-caption text-admin-text-3">Admin dashboard</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} role={role} />
        </div>
        {user && <UserBadge user={user} />}
        <LogoutButton />
      </aside>

      {/* ── Mobile topbar + drawer ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-admin-border bg-[rgba(5,10,12,0.92)] px-4 py-3 backdrop-blur-xl md:hidden">
          <div>
            <p className="text-admin-body font-semibold text-admin-text">Netlink Admin</p>
          </div>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={MOBILE_NAV_ID}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-admin-border bg-admin-surface text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
          >
            <span className="flex flex-col items-center gap-[4px]">
              <span
                className={`block h-[1.5px] w-[16px] rounded-full bg-current transition-transform duration-200 ease-admin ${mobileOpen ? "translate-y-[5.5px] rotate-45" : ""}`}
              />
              <span
                className={`block h-[1.5px] w-[16px] rounded-full bg-current transition-transform duration-200 ease-admin ${mobileOpen ? "-translate-y-[5.5px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </header>

        {mobileOpen && (
          <div
            id={MOBILE_NAV_ID}
            className="max-h-[calc(100vh-57px)] overflow-y-auto border-b border-admin-border bg-admin-bg px-3 py-3 md:hidden"
          >
            <NavLinks pathname={pathname} role={role} onNavigate={() => setMobileOpen(false)} />
            <div className="mt-3 flex flex-col gap-2">
              {user && <UserBadge user={user} />}
              <LogoutButton className="w-full" />
            </div>
          </div>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className={`mx-auto ${wide ? "max-w-[1600px]" : "max-w-4xl"}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}
