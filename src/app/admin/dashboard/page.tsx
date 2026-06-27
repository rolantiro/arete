import { Package, AlertTriangle, FolderTree, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: lowStockCount },
    { count: totalCategories },
    { data: products },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lte("stock", 5),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("products").select("price, stock").eq("is_active", true),
  ]);

  const inventoryValue = (products ?? []).reduce(
    (sum, p) => sum + p.price * p.stock,
    0
  );

  return {
    totalProducts: totalProducts ?? 0,
    lowStockCount: lowStockCount ?? 0,
    totalCategories: totalCategories ?? 0,
    inventoryValue,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Total Produk",
      value: stats.totalProducts.toString(),
      icon: Package,
    },
    {
      label: "Stok Menipis (≤5)",
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
    },
    {
      label: "Kategori",
      value: stats.totalCategories.toString(),
      icon: FolderTree,
    },
    {
      label: "Nilai Inventaris",
      value: formatPrice(stats.inventoryValue),
      icon: Tag,
    },
  ];

  return (
    <div>
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Ringkasan</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="border border-[var(--color-grey-300)] p-6"
          >
            <card.icon
              className="mb-4 h-5 w-5 text-[var(--color-grey-500)]"
              strokeWidth={1.5}
            />
            <p className="text-2xl font-medium">{card.value}</p>
            <p className="tracked mt-2 text-[11px] text-[var(--color-grey-500)]">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 border border-[var(--color-grey-300)] p-8">
        <h2 className="font-display mb-4 text-xl">Selamat Datang di ARÉTÉ Admin</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-grey-500)]">
          Gunakan menu di samping untuk mengelola produk, media, konten halaman,
          dan pengaturan toko. Semua perubahan yang Anda simpan akan langsung
          tampil di website pembeli.
        </p>
      </div>
    </div>
  );
}
