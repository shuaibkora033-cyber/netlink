import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin/session";
import { UsersManager } from "./UsersManager";

export default async function AdminUsersPage() {
  // Defense in depth — proxy.ts already redirects non-owners away from
  // /admin/users for page navigation, but this route re-checks independently
  // the same way every app/api/admin/* handler does.
  const session = await requireAdminSession();
  if (!session || session.role !== "owner") {
    redirect("/admin");
  }

  return <UsersManager currentUserId={session.userId} />;
}
