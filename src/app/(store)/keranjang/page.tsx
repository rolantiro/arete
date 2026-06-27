"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/utils";
import { useCounterStore } from "@/store/useCounterStore";
import type { CartItem } from "@/types/database";

export default function KeranjangPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const setCartCount = useCounterStore((s) => s.setCartCount);

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => {
        const list: CartItem[] = data.items ?? [];
        setItems(list);
        setCartCount(list.reduce((sum, i) => sum + i.quantity, 0));
      })
      .finally(() => setLoading(false));
  }, [setCartCount]);

  async function updateQuantity(id: string, quantity: number) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });
      if (!res.ok) throw new Error();

      setItems((prev) => {
        const next =
          quantity <= 0
            ? prev.filter((i) => i.id !== id)
            : prev.map((i) => (i.id === id ? { ...i, quantity } : i));
        setCartCount(next.reduce((sum, i) => sum + i.quantity, 0));
        return next;
      });
    } catch {
      toast.error("Gagal memperbarui keranjang");
    } finally {
      setUpdatingId(null);
    }
  }

  async function removeItem(id: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/cart?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== id);
        setCartCount(next.reduce((sum, i) => sum + i.quantity, 0));
        return next;
      });
      toast.success("Item dihapus dari keranjang");
    } catch {
      toast.error("Gagal menghapus item");
    } finally {
      setUpdatingId(null);
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );

  return (
    <>
      <Navbar brandName="ARÉTÉ" />
      <main className="flex-1 py-16 md:py-20">
        <Container>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Belanja</p>
          <h1 className="font-display mb-12 text-4xl md:text-5xl">Keranjang Saya</h1>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag
                className="mb-4 h-10 w-10 text-[var(--color-grey-300)]"
                strokeWidth={1}
              />
              <p className="font-display text-2xl">Keranjang masih kosong</p>
              <p className="mt-2 text-sm text-[var(--color-grey-500)]">
                Mulai jelajahi koleksi kami dan temukan favorit Anda.
              </p>
              <Link
                href="/katalog"
                className="tracked mt-8 border border-[var(--color-ink)] px-8 py-3.5 text-xs transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
              >
                Jelajahi Katalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2">
                {items.map((item) => {
                  const product = item.product;
                  if (!product) return null;
                  const cover = product.images?.[0];
                  const isUpdating = updatingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="hairline flex items-center gap-5 py-6 first:border-t-0"
                    >
                      <Link
                        href={`/produk/${product.slug}`}
                        className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--color-grey-100)]"
                      >
                        {cover && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover.url}
                            alt={cover.alt || product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </Link>

                      <div className="flex-1">
                        <Link href={`/produk/${product.slug}`}>
                          <h3 className="font-display text-lg">{product.name}</h3>
                        </Link>
                        <p className="mt-1 text-xs text-[var(--color-grey-500)]">
                          {[item.size, item.color].filter(Boolean).join(" / ")}
                        </p>
                        <p className="mt-1 text-sm">{formatPrice(product.price)}</p>
                      </div>

                      <div className="flex items-center border border-[var(--color-grey-300)]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={isUpdating}
                          className="flex h-9 w-9 items-center justify-center hover:bg-[var(--color-grey-100)]"
                          aria-label="Kurangi jumlah"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="flex h-9 w-9 items-center justify-center text-sm">
                          {isUpdating ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating}
                          className="flex h-9 w-9 items-center justify-center hover:bg-[var(--color-grey-100)]"
                          aria-label="Tambah jumlah"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating}
                        aria-label="Hapus item"
                        className="flex h-9 w-9 items-center justify-center text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="h-fit border border-[var(--color-grey-300)] p-8">
                <h2 className="font-display mb-6 text-2xl">Ringkasan</h2>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-grey-500)]">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-2 text-xs text-[var(--color-grey-500)]">
                  Ongkos kirim dihitung saat checkout.
                </p>
                <div className="hairline mt-6 mb-6" />
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <button className="tracked mt-8 w-full bg-[var(--color-ink)] py-4 text-xs text-[var(--color-paper)] transition-opacity hover:opacity-90">
                  Checkout
                </button>
              </div>
            </div>
          )}
        </Container>
      </main>
      <Footer
        brandName="ARÉTÉ"
        tagline="Pakaian premium untuk keseharian yang penuh arti."
        address="Jakarta, Indonesia"
        email="hello@arete.id"
        phone="+62 812 0000 0000"
      />
    </>
  );
}
