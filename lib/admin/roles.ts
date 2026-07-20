/**
 * Role-based access control for the admin dashboard. Single source of truth
 * for what each role can reach — used by proxy.ts (page navigation), admin
 * layout/nav (hiding links), and API routes (authorization).
 */

export type Role = "owner" | "admin" | "editor" | "sales" | "viewer";

export const ROLES: Role[] = ["owner", "admin", "editor", "sales", "viewer"];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

// Ordered longest-prefix-first isn't required here since paths are checked
// via startsWith against the full set and the most specific match wins.
const ROUTE_ROLES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/admin/users", roles: ["owner"] },
  { prefix: "/admin/settings", roles: ["owner"] },
  { prefix: "/admin/media", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/pages", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/theme", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/homepage", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/services", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/clients", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/faqs", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/case-studies", roles: ["owner", "admin", "editor"] },
  { prefix: "/admin/leads", roles: ["owner", "admin", "sales", "viewer"] },
];

/**
 * Returns the allowed roles for an admin path, or `null` when the path has
 * no specific restriction (e.g. `/admin` itself) — meaning any active,
 * authenticated dashboard user may view it.
 */
export function allowedRolesForPath(pathname: string): Role[] | null {
  const match = ROUTE_ROLES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  return match ? match.roles : null;
}

export function canAccessPath(role: Role, pathname: string): boolean {
  const allowed = allowedRolesForPath(pathname);
  return allowed ? allowed.includes(role) : true;
}

// ── Fine-grained permissions (used inside pages/components/API routes for
// checks that aren't a simple route prefix, e.g. hiding a delete button) ────
export type Permission =
  | "manage_users"
  | "manage_settings"
  | "manage_cms"
  | "manage_media"
  | "manage_leads"
  | "delete_leads"
  | "view_leads";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: ["manage_users", "manage_settings", "manage_cms", "manage_media", "manage_leads", "delete_leads", "view_leads"],
  admin: ["manage_cms", "manage_media", "manage_leads", "view_leads"],
  editor: ["manage_cms", "manage_media"],
  sales: ["manage_leads", "view_leads"],
  viewer: ["view_leads"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Roles allowed to reach any authenticated /api/admin/* route at all (i.e.
// "can log in and see something") — used as a baseline; specific routes
// layer stricter checks (e.g. manage_users) on top via requireRole/hasPermission.
export const ALL_ROLES = ROLES;
