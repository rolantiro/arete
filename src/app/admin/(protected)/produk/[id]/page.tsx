import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category, Product } from "@/types/database";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("sort_order", { ascending: true }),
  ]);

  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Produk</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Edit Produk</h1>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        initialProduct={product as Product}
      />
    </div>
  );
}
