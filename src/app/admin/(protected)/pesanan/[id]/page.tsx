"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/database";

const STATUS_LABELS: Record<OrderStatus, string> = {
  menunggu_verifikasi: "Menunggu Verifikasi",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [shippingCost, setShippingCost] = useState("");
  const [savingShipping, setSavingShipping] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order ?? null);
        setShippingCost(data.order?.shipping_cost?.toString() ?? "");
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  async function patchOrder(payload: Record<string, unknown>) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal memperbarui pesanan");
    return data.order as Order;
  }

  async function handleSaveShipping() {
    const cost = Number(shippingCost);
    if (Number.isNaN(cost) || cost < 0) {
      toast.error("Masukkan ongkir yang valid");
      return;
    }
    setSavingShipping(true);
    try {
      const updated = await patchOrder({ shipping_cost: cost });
      setOrder(updated);
      toast.success("Ongkir berhasil disimpan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan ongkir");
    } finally {
      setSavingShipping(false);
    }
  }

  async function handleVerifyPayment() {
    setVerifying(true);
    try {
      const updated = await patchOrder({ payment_verified: !order?.payment_verified });
      setOrder(updated);
      toast.success(
        updated.payment_verified ? "Pembayaran ditandai terverifikasi" : "Verifikasi dibatalkan"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memverifikasi pembayaran");
    } finally {
      setVerifying(false);
    }
  }

  async function handleStatusChange(status: OrderStatus) {
    setUpdatingStatus(true);
    try {
      const updated = await patchOrder({ status });
      setOrder(updated);
      toast.success(`Status pesanan diubah ke "${STATUS_LABELS[status]}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center text-[var(--color-grey-500)]">
        Pesanan tidak ditemukan.
      </div>
    );
  }

  const fullAddress = [
    order.address_detail,
    order.village_name,
    order.district_name,
    order.regency_name,
    order.province_name,
    order.postal_code,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/pesanan"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar pesanan
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="tracked mb-2 text-xs text-[var(--color-grey-500)]">
            {formatDate(order.created_at)}
          </p>
          <h1 className="font-display text-3xl">{order.order_number}</h1>
        </div>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          disabled={updatingStatus}
          className="border border-[var(--color-grey-300)] bg-transparent px-4 py-3 text-sm focus:border-[var(--color-ink)] focus:outline-none"
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Informasi Pembeli & Alamat */}
        <div className="flex flex-col gap-6">
          <div className="border border-[var(--color-grey-300)] p-6">
            <h2 className="font-display mb-4 text-lg">Informasi Pembeli</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Nama" value={order.full_name} />
              <Row label="WhatsApp" value={order.whatsapp} />
              {order.email && <Row label="Email" value={order.email} />}
              {order.notes && <Row label="Catatan" value={order.notes} />}
            </dl>
          </div>

          <div className="border border-[var(--color-grey-300)] p-6">
            <h2 className="font-display mb-4 text-lg">Alamat Pengiriman</h2>
            <p className="text-sm leading-relaxed">{fullAddress}</p>
            {order.landmark && (
              <p className="mt-2 text-sm text-[var(--color-grey-500)]">
                Patokan: {order.landmark}
              </p>
            )}
          </div>

          <div className="border border-[var(--color-grey-300)] p-6">
            <h2 className="font-display mb-4 text-lg">Pembayaran</h2>
            {order.payment_proof_url ? (
              <a
                href={order.payment_proof_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-[3/4] w-40 overflow-hidden bg-[var(--color-grey-100)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.payment_proof_url}
                  alt="Bukti pembayaran"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <ExternalLink className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            ) : (
              <p className="text-sm text-[var(--color-grey-500)]">
                Tidak ada bukti pembayaran
              </p>
            )}

            <Button
              type="button"
              size="sm"
              variant={order.payment_verified ? "secondary" : "primary"}
              className="mt-4"
              isLoading={verifying}
              onClick={handleVerifyPayment}
            >
              {!verifying && order.payment_verified && <CheckCircle2 className="h-3.5 w-3.5" />}
              {order.payment_verified ? "Terverifikasi — batalkan" : "Tandai Terverifikasi"}
            </Button>
            {order.payment_verified_at && (
              <p className="mt-2 text-xs text-[var(--color-grey-500)]">
                Diverifikasi pada {formatDate(order.payment_verified_at)}
              </p>
            )}
          </div>
        </div>

        {/* Produk & Ringkasan */}
        <div className="flex flex-col gap-6">
          <div className="border border-[var(--color-grey-300)] p-6">
            <h2 className="font-display mb-4 text-lg">Produk Dipesan</h2>
            <div className="flex flex-col gap-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-14 w-12 shrink-0 overflow-hidden bg-[var(--color-grey-100)]">
                    {item.product_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 text-sm">
                    <p>{item.product_name}</p>
                    <p className="text-xs text-[var(--color-grey-500)]">
                      {[item.size, item.color].filter(Boolean).join(" / ")} ·{" "}
                      {item.quantity}x {formatPrice(item.price_at_purchase)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[var(--color-grey-300)] p-6">
            <h2 className="font-display mb-4 text-lg">Ongkos Kirim</h2>
            <p className="mb-3 text-xs text-[var(--color-grey-500)]">
              Estimasi pembeli: {order.shipping_estimate_label || "-"}
            </p>
            <div className="flex gap-3">
              <Input
                type="number"
                min={0}
                placeholder="Masukkan ongkir final"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                isLoading={savingShipping}
                onClick={handleSaveShipping}
              >
                Simpan
              </Button>
            </div>
          </div>

          <div className="border border-[var(--color-grey-300)] p-6">
            <h2 className="font-display mb-4 text-lg">Ringkasan</h2>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-grey-500)]">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-[var(--color-grey-500)]">Ongkir</span>
              <span>
                {order.shipping_cost != null ? formatPrice(order.shipping_cost) : "Belum diisi"}
              </span>
            </div>
            <div className="hairline mt-4 mb-4" />
            <div className="flex justify-between text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--color-grey-500)]">{label}</dt>
      <dd className={cn("text-right")}>{value}</dd>
    </div>
  );
}
