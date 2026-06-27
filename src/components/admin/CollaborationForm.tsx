"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import type { Collaboration, CollaborationStatus, Product, ProductImage } from "@/types/database";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

type FormValues = {
  title: string;
  slug: string;
  description: string;
  images: ProductImage[];
  status: CollaborationStatus;
  is_for_sale: boolean;
  product_id: string | null;
  partner_name: string;
  is_published: boolean;
};

export function CollaborationForm({ initial }: { initial?: Collaboration }) {
  const router = useRouter();
  const isEditing = !!initial;
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [values, setValues] = useState<FormValues>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    images: initial?.images ?? [],
    status: initial?.status ?? "selesai",
    is_for_sale: initial?.is_for_sale ?? false,
    product_id: initial?.product_id ?? null,
    partner_name: initial?.partner_name ?? "",
    is_published: initial?.is_published ?? true,
  });

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
  }, []);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleTitleChange(title: string) {
    update("title", title);
    if (!slugTouched) update("slug", slugify(title));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const endpoint = isEditing
        ? `/api/admin/collaborations/${initial!.id}`
        : "/api/admin/collaborations";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          partner_name: values.partner_name || null,
          product_id: values.is_for_sale ? values.product_id : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menyimpan kolaborasi");
        return;
      }

      toast.success(isEditing ? "Kolaborasi berhasil diperbarui" : "Kolaborasi berhasil ditambahkan");
      router.push("/admin/kolaborasi");
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

      <ImagePicker
        images={values.images}
        onChange={(images) => update("images", images)}
        context="collaboration"
        label="Foto Kolaborasi"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Judul"
          value={values.title}
          onChange={(e) => handleTitleChange(e.target.value)}
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
        rows={3}
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
      />

      <Input
        label="Nama Partner / Brand (opsional)"
        placeholder="Misal: Nama brand atau event yang diajak kolaborasi"
        value={values.partner_name}
        onChange={(e) => update("partner_name", e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="tracked text-[11px] text-[var(--color-grey-500)]">Status</label>
        <select
          value={values.status}
          onChange={(e) => update("status", e.target.value as CollaborationStatus)}
          className="w-full border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        >
          <option value="selesai">Selesai</option>
          <option value="coming_soon">Coming Soon</option>
        </select>
      </div>

      <div className="border border-[var(--color-grey-300)] p-5">
        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={values.is_for_sale}
            onChange={(e) => update("is_for_sale", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-ink)]"
          />
          Untuk Dijual (tautkan ke produk)
        </label>

        {values.is_for_sale && (
          <div className="mt-4 flex flex-col gap-1.5">
            <label className="tracked text-[11px] text-[var(--color-grey-500)]">
              Pilih Produk
            </label>
            <select
              value={values.product_id ?? ""}
              onChange={(e) => update("product_id", e.target.value || null)}
              className="w-full border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
            >
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {!values.is_for_sale && (
          <p className="mt-2 text-xs text-[var(--color-grey-500)]">
            Kolaborasi ini hanya akan dipajang sebagai galeri, tanpa tautan beli.
          </p>
        )}
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={values.is_published}
          onChange={(e) => update("is_published", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-ink)]"
        />
        Dipublikasikan (tampil di halaman /kolaborasi)
      </label>

      <div className="flex gap-3">
        <Button type="submit" isLoading={submitting}>
          {isEditing ? "Simpan Perubahan" : "Tambah Kolaborasi"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/kolaborasi")}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
