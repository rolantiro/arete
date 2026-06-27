"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { TagInput } from "@/components/admin/TagInput";
import type { Category, Product, ProductImage } from "@/types/database";

type ProductFormValues = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string;
  stock: number;
  category_id: string | null;
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  is_featured: boolean;
  is_active: boolean;
  is_preorder: boolean;
  preorder_days: number | null;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ProductForm({
  categories,
  initialProduct,
}: {
  categories: Category[];
  initialProduct?: Product;
}) {
  const router = useRouter();
  const isEditing = !!initialProduct;
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [values, setValues] = useState<ProductFormValues>({
    name: initialProduct?.name ?? "",
    slug: initialProduct?.slug ?? "",
    description: initialProduct?.description ?? "",
    price: initialProduct?.price ?? 0,
    compare_at_price: initialProduct?.compare_at_price ?? null,
    sku: initialProduct?.sku ?? "",
    stock: initialProduct?.stock ?? 0,
    category_id: initialProduct?.category_id ?? null,
    images: initialProduct?.images ?? [],
    sizes: initialProduct?.sizes ?? [],
    colors: initialProduct?.colors ?? [],
    is_featured: initialProduct?.is_featured ?? false,
    is_active: initialProduct?.is_active ?? true,
    is_preorder: initialProduct?.is_preorder ?? false,
    preorder_days: initialProduct?.preorder_days ?? null,
  });

  function update<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    update("name", name);
    if (!slugTouched) {
      update("slug", slugify(name));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const endpoint = isEditing
        ? `/api/admin/products/${initialProduct!.id}`
        : "/api/admin/products";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          sku: values.sku || null,
          compare_at_price: values.compare_at_price || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menyimpan produk");
        return;
      }

      toast.success(isEditing ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
      router.push("/admin/produk");
      router.refresh();
    } catch {
      setErrorMsg("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {errorMsg && (
        <div className="border border-[var(--color-error)] bg-[var(--color-error)]/5 px-4 py-3 text-sm text-[var(--color-error)]">
          {errorMsg}
        </div>
      )}

      <ImagePicker images={values.images} onChange={(images) => update("images", images)} />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Nama Produk"
          value={values.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
        />
        <Input
          label="Slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            update("slug", e.target.value);
          }}
          required
        />
      </div>

      <Textarea
        label="Deskripsi"
        rows={4}
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Input
          label="Harga (IDR)"
          type="number"
          min={0}
          value={values.price}
          onChange={(e) => update("price", Number(e.target.value))}
          required
        />
        <Input
          label="Harga Coret (opsional)"
          type="number"
          min={0}
          value={values.compare_at_price ?? ""}
          onChange={(e) =>
            update("compare_at_price", e.target.value ? Number(e.target.value) : null)
          }
        />
        <Input
          label="Stok"
          type="number"
          min={0}
          value={values.stock}
          onChange={(e) => update("stock", Number(e.target.value))}
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="SKU (opsional)"
          value={values.sku}
          onChange={(e) => update("sku", e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="tracked text-[11px] text-[var(--color-grey-500)]">
            Kategori
          </label>
          <select
            value={values.category_id ?? ""}
            onChange={(e) => update("category_id", e.target.value || null)}
            className="w-full border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
          >
            <option value="">Tanpa kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <TagInput
          label="Ukuran Tersedia"
          placeholder="Ketik ukuran, tekan Enter"
          values={values.sizes}
          onChange={(sizes) => update("sizes", sizes)}
        />
        <TagInput
          label="Warna Tersedia"
          placeholder="Ketik warna, tekan Enter"
          values={values.colors}
          onChange={(colors) => update("colors", colors)}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.is_featured}
            onChange={(e) => update("is_featured", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-ink)]"
          />
          Tampilkan sebagai produk unggulan
        </label>
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.is_active}
            onChange={(e) => update("is_active", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-ink)]"
          />
          Aktif (tampil di toko)
        </label>
      </div>

      <div className="border border-[var(--color-grey-300)] p-5">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.is_preorder}
            onChange={(e) => {
              const checked = e.target.checked;
              update("is_preorder", checked);
              if (checked && !values.preorder_days) {
                update("preorder_days", 7);
              }
              if (!checked) {
                update("preorder_days", null);
              }
            }}
            className="h-4 w-4 accent-[var(--color-ink)]"
          />
          Produk ini Pre-Order
        </label>

        {values.is_preorder && (
          <div className="mt-4 flex flex-col gap-2">
            <label className="tracked text-[11px] text-[var(--color-grey-500)]">
              Estimasi Waktu Pre-Order (1–20 hari)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={20}
                value={values.preorder_days ?? 7}
                onChange={(e) => update("preorder_days", Number(e.target.value))}
                className="flex-1 accent-[var(--color-ink)]"
              />
              <span className="w-20 shrink-0 text-right text-sm font-medium">
                {values.preorder_days ?? 7} hari
              </span>
            </div>
            <p className="text-xs text-[var(--color-grey-500)]">
              Pembeli akan melihat keterangan &ldquo;Pre-Order, estimasi{" "}
              {values.preorder_days ?? 7} hari&rdquo; pada produk ini.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" isLoading={submitting}>
          {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/produk")}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
