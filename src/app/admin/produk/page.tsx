"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Product } from "@/types/database";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success("Produk berhasil dihapus");
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus produk");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div>
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kelola</p>
          <h1 className="font-display text-3xl md:text-4xl">Produk</h1>
        </div>
        <Link
          href="/admin/produk/baru"
          className="tracked flex items-center gap-2 bg-[var(--color-ink)] px-6 py-3 text-xs text-[var(--color-paper)] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk
        </Link>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-grey-500)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari produk, SKU, kategori..."
          className="w-full border border-[var(--color-grey-300)] bg-transparent py-3 pl-11 pr-4 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--color-grey-300)] py-20 text-center">
          <p className="text-[var(--color-grey-500)]">Tidak ada produk ditemukan</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--color-grey-300)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="hairline border-b bg-[var(--color-grey-100)] text-xs text-[var(--color-grey-500)]">
                <th className="px-5 py-4 font-normal">Produk</th>
                <th className="px-5 py-4 font-normal">Kategori</th>
                <th className="px-5 py-4 font-normal">Harga</th>
                <th className="px-5 py-4 font-normal">Stok</th>
                <th className="px-5 py-4 font-normal">Status</th>
                <th className="px-5 py-4 font-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const cover = product.images?.[0];
                return (
                  <tr key={product.id} className="hairline border-b last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-10 shrink-0 overflow-hidden bg-[var(--color-grey-100)]">
                          {cover && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover.url}
                              alt={cover.alt || product.name}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-[var(--color-grey-500)]">
                            {product.sku || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-grey-500)]">
                      {product.category?.name || "-"}
                    </td>
                    <td className="px-5 py-4">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          product.stock <= 5 && "text-[var(--color-error)]"
                        )}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "tracked px-2.5 py-1 text-[10px]",
                          product.is_active
                            ? "bg-[var(--color-grey-100)] text-[var(--color-ink)]"
                            : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
                        )}
                      >
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/produk/${product.id}`}
                          aria-label="Edit produk"
                          className="text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          aria-label="Hapus produk"
                          className="text-[var(--color-grey-500)] hover:text-[var(--color-error)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Produk"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
