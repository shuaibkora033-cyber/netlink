import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/admin/session";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // proxy.ts already guarantees a valid session reaches here; re-checking is
  // just the same defense-in-depth pattern every API route follows, plus it
  // gives AdminShell the name/role to render.
  const session = await requireAdminSession();

  return (
    <AdminShell
      user={session ? { name: session.name, email: session.email, role: session.role } : null}
    >
      {children}
    </AdminShell>
  );
}
