"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/utils";
import { useCounterStore } from "@/store/useCounterStore";
import type { WishlistItem } from "@/types/database";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const setWishlistCount = useCounterStore((s) => s.setWishlistCount);
  const incrementCart = useCounterStore((s) => s.incrementCart);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
        setWishlistCount((data.items ?? []).length);
      })
      .finally(() => setLoading(false));
  }, [setWishlistCount]);

  async function handleRemove(productId: string) {
    setRemovingId(productId);
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) => {
        const next = prev.filter((i) => i.product_id !== productId);
        setWishlistCount(next.length);
        return next;
      });
      toast.success("Dihapus dari wishlist");
    } catch {
      toast.error("Gagal menghapus item");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAddToCart(productId: string) {
    setAddingId(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error();
      incrementCart(1);
      toast.success("Ditambahkan ke keranjang");
    } catch {
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <>
      <Navbar brandName="ARÉTÉ" />
      <main className="flex-1 py-16 md:py-20">
        <Container>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Tersimpan</p>
          <h1 className="font-display mb-12 text-4xl md:text-5xl">Wishlist Saya</h1>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Heart className="mb-4 h-10 w-10 text-[var(--color-grey-300)]" strokeWidth={1} />
              <p className="font-display text-2xl">Wishlist masih kosong</p>
              <p className="mt-2 text-sm text-[var(--color-grey-500)]">
                Simpan produk favorit Anda untuk dilihat kembali nanti.
              </p>
              <Link
                href="/katalog"
                className="tracked mt-8 border border-[var(--color-ink)] px-8 py-3.5 text-xs transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
              >
                Jelajahi Katalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;
                const cover = product.images?.[0];
                return (
                  <div
                    key={item.id}
                    className="hairline flex items-center gap-5 py-6 first:border-t-0"
                  >
                    <Link
                      href={`/produk/${product.slug}`}
                      className="relative h-24 w-20 shrink-0 overflow-hidden bg-[var(--color-grey-100)]"
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
                      <p className="mt-1 text-sm text-[var(--color-grey-500)]">
                        {formatPrice(product.price)}
                      </p>
                      {product.stock <= 0 && (
                        <p className="mt-1 text-xs text-[var(--color-error)]">Stok habis</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingId === product.id || product.stock <= 0}
                      className="tracked hidden items-center gap-2 border border-[var(--color-grey-300)] px-5 py-3 text-xs transition-colors hover:border-[var(--color-ink)] disabled:opacity-40 sm:flex"
                    >
                      {addingId === product.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
                      )}
                      Tambah
                    </button>

                    <button
                      onClick={() => handleRemove(product.id)}
                      disabled={removingId === product.id}
                      aria-label="Hapus dari wishlist"
                      className="flex h-9 w-9 items-center justify-center text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
                    >
                      {removingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}
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
