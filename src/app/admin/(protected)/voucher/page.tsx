"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Voucher } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  amount: "Potongan Nominal",
  percent: "Potongan Persen",
  free_shipping: "Gratis Ongkir",
};

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Voucher | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadVouchers();
  }, []);

  async function loadVouchers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/vouchers");
      const data = await res.json();
      setVouchers(data.vouchers ?? []);
    } catch {
      toast.error("Gagal memuat voucher");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/vouchers/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setVouchers((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      toast.success("Voucher berhasil dihapus");
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus voucher");
    } finally {
      setDeleting(false);
    }
  }

  function describeDiscount(v: Voucher) {
    if (v.discount_type === "free_shipping") return "Gratis Ongkir";
    if (v.discount_type === "percent") return `${v.discount_percent}%`;
    return formatPrice(v.discount_amount ?? 0);
  }

  function isExpired(v: Voucher) {
    return v.expires_at && new Date(v.expires_at) < new Date();
  }

  return (
    <div>
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kelola</p>
          <h1 className="font-display text-3xl md:text-4xl">Voucher</h1>
        </div>
        <Link
          href="/admin/voucher/baru"
          className="tracked flex items-center gap-2 bg-[var(--color-ink)] px-6 py-3 text-xs text-[var(--color-paper)] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Tambah Voucher
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
        </div>
      ) : vouchers.length === 0 ? (
        <div className="border border-dashed border-[var(--color-grey-300)] py-20 text-center">
          <p className="text-[var(--color-grey-500)]">Belum ada voucher</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--color-grey-300)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="hairline border-b bg-[var(--color-grey-100)] text-xs text-[var(--color-grey-500)]">
                <th className="px-5 py-4 font-normal">Kode</th>
                <th className="px-5 py-4 font-normal">Tipe</th>
                <th className="px-5 py-4 font-normal">Pemakaian</th>
                <th className="px-5 py-4 font-normal">Berlaku Sampai</th>
                <th className="px-5 py-4 font-normal">Status</th>
                <th className="px-5 py-4 font-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => {
                const expired = isExpired(v);
                return (
                  <tr key={v.id} className="hairline border-b last:border-b-0">
                    <td className="px-5 py-4">
                      <p className="font-medium">{v.code}</p>
                      {v.description && (
                        <p className="text-xs text-[var(--color-grey-500)]">{v.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p>{TYPE_LABELS[v.discount_type]}</p>
                      <p className="text-xs text-[var(--color-grey-500)]">
                        {describeDiscount(v)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-grey-500)]">
                      {v.used_count}
                      {v.max_uses ? ` / ${v.max_uses}` : ""}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-grey-500)]">
                      {v.expires_at
                        ? new Date(v.expires_at).toLocaleDateString("id-ID")
                        : "Tidak ada batas"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "tracked px-2.5 py-1 text-[10px]",
                          !v.is_active || expired
                            ? "bg-[var(--color-error)]/10 text-[var(--color-error)]"
                            : "bg-[var(--color-grey-100)] text-[var(--color-ink)]"
                        )}
                      >
                        {!v.is_active ? "Nonaktif" : expired ? "Kedaluwarsa" : "Aktif"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/voucher/${v.id}`}
                          aria-label="Edit voucher"
                          className="text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(v)}
                          aria-label="Hapus voucher"
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
        title="Hapus Voucher"
        description={`Apakah Anda yakin ingin menghapus voucher "${deleteTarget?.code}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
