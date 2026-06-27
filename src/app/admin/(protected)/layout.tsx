import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/admin/login");
  }

  const { data: adminProfile } = await supabase
    .from("admins")
    .select("full_name")
    .eq("id", userData.user.id)
    .maybeSingle();

  // Authenticated via Supabase Auth but not registered in `admins`:
  // sign out and bounce back to login rather than granting access.
  if (!adminProfile) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <AdminSidebar adminName={adminProfile.full_name} />
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
