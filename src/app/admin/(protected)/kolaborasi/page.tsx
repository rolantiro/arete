"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Collaboration } from "@/types/database";

export default function AdminCollaborationsPage() {
  const [items, setItems] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Collaboration | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/collaborations");
      const data = await res.json();
      setItems(data.collaborations ?? []);
    } catch {
      toast.error("Gagal memuat kolaborasi");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/collaborations/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      toast.success("Kolaborasi berhasil dihapus");
      setDeleteTarget(null);
    } catch {
      toast.error("Gagal menghapus kolaborasi");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kelola</p>
          <h1 className="font-display text-3xl md:text-4xl">Kolaborasi</h1>
        </div>
        <Link
          href="/admin/kolaborasi/baru"
          className="tracked flex items-center gap-2 bg-[var(--color-ink)] px-6 py-3 text-xs text-[var(--color-paper)] transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Tambah Kolaborasi
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="border border-dashed border-[var(--color-grey-300)] py-20 text-center">
          <p className="text-[var(--color-grey-500)]">Belum ada kolaborasi</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--color-grey-300)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="hairline border-b bg-[var(--color-grey-100)] text-xs text-[var(--color-grey-500)]">
                <th className="px-5 py-4 font-normal">Judul</th>
                <th className="px-5 py-4 font-normal">Status</th>
                <th className="px-5 py-4 font-normal">Untuk Dijual</th>
                <th className="px-5 py-4 font-normal">Dipublikasikan</th>
                <th className="px-5 py-4 font-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cover = item.images?.[0];
                return (
                  <tr key={item.id} className="hairline border-b last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-10 shrink-0 overflow-hidden bg-[var(--color-grey-100)]">
                          {cover && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={cover.url}
                              alt={cover.alt || item.title}
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.partner_name && (
                            <p className="text-xs text-[var(--color-grey-500)]">
                              {item.partner_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "tracked px-2.5 py-1 text-[10px]",
                          item.status === "coming_soon"
                            ? "bg-[var(--color-gold)]/20 text-[var(--color-ink)]"
                            : "bg-[var(--color-grey-100)] text-[var(--color-ink)]"
                        )}
                      >
                        {item.status === "coming_soon" ? "Coming Soon" : "Selesai"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[var(--color-grey-500)]">
                      {item.is_for_sale ? "Ya" : "Tidak"}
                    </td>
                    <td className="px-5 py-4 text-[var(--color-grey-500)]">
                      {item.is_published ? "Ya" : "Tidak"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/kolaborasi/${item.id}`}
                          aria-label="Edit kolaborasi"
                          className="text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          aria-label="Hapus kolaborasi"
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
        title="Hapus Kolaborasi"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
