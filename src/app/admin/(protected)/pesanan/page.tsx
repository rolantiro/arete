"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/database";

const STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu_verifikasi: "Menunggu Verifikasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  menunggu_verifikasi: "bg-[var(--color-gold)]/20 text-[var(--color-ink)]",
  diproses: "bg-[var(--color-grey-100)] text-[var(--color-ink)]",
  dikirim: "bg-[var(--color-grey-100)] text-[var(--color-ink)]",
  selesai: "bg-[var(--color-ink)] text-[var(--color-paper)]",
  dibatalkan: "bg-[var(--color-error)]/10 text-[var(--color-error)]",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "semua">("semua");

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .catch(() => toast.error("Gagal memuat pesanan"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "semua" && order.status !== statusFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        order.order_number.toLowerCase().includes(q) ||
        order.full_name.toLowerCase().includes(q) ||
        order.whatsapp.includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  const pendingCount = orders.filter((o) => o.status === "menunggu_verifikasi").length;

  return (
    <div>
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kelola</p>
      <h1 className="font-display mb-2 text-3xl md:text-4xl">Pesanan</h1>
      {pendingCount > 0 && (
        <p className="mb-8 text-sm text-[var(--color-grey-500)]">
          <span className="font-medium text-[var(--color-ink)]">{pendingCount}</span>{" "}
          pesanan menunggu verifikasi pembayaran
        </p>
      )}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-grey-500)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. pesanan, nama, WhatsApp..."
            className="w-full border border-[var(--color-grey-300)] bg-transparent py-3 pl-11 pr-4 text-sm focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "semua")}
          className="border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        >
          <option value="semua">Semua Status</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--color-grey-300)] py-20 text-center">
          <p className="text-[var(--color-grey-500)]">Belum ada pesanan</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[var(--color-grey-300)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="hairline border-b bg-[var(--color-grey-100)] text-xs text-[var(--color-grey-500)]">
                <th className="px-5 py-4 font-normal">No. Pesanan</th>
                <th className="px-5 py-4 font-normal">Pembeli</th>
                <th className="px-5 py-4 font-normal">Tanggal</th>
                <th className="px-5 py-4 font-normal">Total</th>
                <th className="px-5 py-4 font-normal">Status</th>
                <th className="px-5 py-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="hairline border-b last:border-b-0">
                  <td className="px-5 py-4 font-medium">{order.order_number}</td>
                  <td className="px-5 py-4">
                    <p>{order.full_name}</p>
                    <p className="text-xs text-[var(--color-grey-500)]">{order.whatsapp}</p>
                  </td>
                  <td className="px-5 py-4 text-[var(--color-grey-500)]">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-5 py-4">{formatPrice(order.total)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "tracked px-2.5 py-1 text-[10px]",
                        STATUS_STYLES[order.status]
                      )}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/pesanan/${order.id}`}
                      className="tracked text-xs underline hover:opacity-60"
                    >
                      Lihat
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
