"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Voucher, VoucherDiscountType } from "@/types/database";

type FormValues = {
  code: string;
  description: string;
  discount_type: VoucherDiscountType;
  discount_amount: string;
  discount_percent: string;
  min_purchase: string;
  max_uses: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
};

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function VoucherForm({ initial }: { initial?: Voucher }) {
  const router = useRouter();
  const isEditing = !!initial;
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [values, setValues] = useState<FormValues>({
    code: initial?.code ?? "",
    description: initial?.description ?? "",
    discount_type: initial?.discount_type ?? "amount",
    discount_amount: initial?.discount_amount?.toString() ?? "",
    discount_percent: initial?.discount_percent?.toString() ?? "",
    min_purchase: initial?.min_purchase?.toString() ?? "0",
    max_uses: initial?.max_uses?.toString() ?? "",
    starts_at: toDateInputValue(initial?.starts_at ?? null),
    expires_at: toDateInputValue(initial?.expires_at ?? null),
    is_active: initial?.is_active ?? true,
  });

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const payload = {
        code: values.code,
        description: values.description || null,
        discount_type: values.discount_type,
        discount_amount:
          values.discount_type === "amount" && values.discount_amount
            ? Number(values.discount_amount)
            : null,
        discount_percent:
          values.discount_type === "percent" && values.discount_percent
            ? Number(values.discount_percent)
            : null,
        min_purchase: Number(values.min_purchase || 0),
        max_uses: values.max_uses ? Number(values.max_uses) : null,
        starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
        expires_at: values.expires_at
          ? new Date(values.expires_at + "T23:59:59").toISOString()
          : null,
        is_active: values.is_active,
      };

      const endpoint = isEditing ? `/api/admin/vouchers/${initial!.id}` : "/api/admin/vouchers";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menyimpan voucher");
        return;
      }

      toast.success(isEditing ? "Voucher berhasil diperbarui" : "Voucher berhasil ditambahkan");
      router.push("/admin/voucher");
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

      <Input
        label="Kode Voucher"
        placeholder="Misal: DISKON10"
        value={values.code}
        onChange={(e) => update("code", e.target.value.toUpperCase())}
        required
      />

      <Textarea
        label="Deskripsi (opsional)"
        rows={2}
        placeholder="Catatan internal, tidak tampil ke pembeli"
        value={values.description}
        onChange={(e) => update("description", e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="tracked text-[11px] text-[var(--color-grey-500)]">
          Tipe Voucher
        </label>
        <select
          value={values.discount_type}
          onChange={(e) => update("discount_type", e.target.value as VoucherDiscountType)}
          className="w-full border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        >
          <option value="amount">Potongan Harga — Nominal Tetap</option>
          <option value="percent">Potongan Harga — Persentase</option>
          <option value="free_shipping">Gratis Ongkos Kirim</option>
        </select>
      </div>

      {values.discount_type === "amount" && (
        <Input
          label="Nominal Potongan (IDR)"
          type="number"
          min={0}
          value={values.discount_amount}
          onChange={(e) => update("discount_amount", e.target.value)}
          required
        />
      )}
      {values.discount_type === "percent" && (
        <Input
          label="Persentase Potongan (%)"
          type="number"
          min={0.01}
          max={100}
          step={0.01}
          value={values.discount_percent}
          onChange={(e) => update("discount_percent", e.target.value)}
          required
        />
      )}
      {values.discount_type === "free_shipping" && (
        <p className="text-sm text-[var(--color-grey-500)]">
          Ongkos kirim pesanan akan otomatis menjadi Rp0 saat admin mengisi ongkir
          final di halaman verifikasi pesanan.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Minimal Belanja (IDR)"
          type="number"
          min={0}
          value={values.min_purchase}
          onChange={(e) => update("min_purchase", e.target.value)}
        />
        <Input
          label="Maksimal Pemakaian (opsional)"
          type="number"
          min={1}
          placeholder="Tidak terbatas"
          value={values.max_uses}
          onChange={(e) => update("max_uses", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Input
          label="Berlaku Mulai (opsional)"
          type="date"
          value={values.starts_at}
          onChange={(e) => update("starts_at", e.target.value)}
        />
        <Input
          label="Berlaku Sampai (opsional)"
          type="date"
          value={values.expires_at}
          onChange={(e) => update("expires_at", e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(e) => update("is_active", e.target.checked)}
          className="h-4 w-4 accent-[var(--color-ink)]"
        />
        Aktif (bisa digunakan pembeli)
      </label>

      <div className="flex gap-3">
        <Button type="submit" isLoading={submitting}>
          {isEditing ? "Simpan Perubahan" : "Tambah Voucher"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/voucher")}>
          Batal
        </Button>
      </div>
    </form>
  );
}
