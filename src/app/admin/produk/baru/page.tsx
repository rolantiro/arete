import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category } from "@/types/database";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Produk</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Tambah Produk Baru</h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </div>
  );
}
