import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current request is from an authenticated user who
 * is also a registered row in public.admins. Returns the admin id
 * or null. Every admin-only API route must call this before
 * performing any write.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", userData.user.id)
    .maybeSingle();

  return admin ? userData.user.id : null;
}
