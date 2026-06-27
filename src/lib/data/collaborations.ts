import { createClient } from "@/lib/supabase/server";
import type { Collaboration } from "@/types/database";

export async function getCollaborations(): Promise<Collaboration[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select("*, product:products(*)")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCollaborations error:", error.message);
    return [];
  }
  return (data ?? []) as Collaboration[];
}
