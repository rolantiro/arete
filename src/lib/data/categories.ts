import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types/database";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }
  return (data ?? []) as Category[];
}
