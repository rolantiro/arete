import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";

export async function getProducts(options?: {
  categorySlug?: string;
  featuredOnly?: boolean;
  limit?: number;
}): Promise<Product[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (options?.featuredOnly) {
    query = query.eq("is_featured", true);
  }

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();
    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getProducts error:", error.message);
    return [];
  }
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as Product;
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  if (!categoryId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", excludeId)
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Product[];
}
