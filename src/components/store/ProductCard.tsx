"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingBag, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, cn } from "@/lib/utils";
import { useCounterStore } from "@/store/useCounterStore";
import type { Product } from "@/types/database";
import { toast } from "sonner";

type ProductCardProps = {
  product: Product;
  initialWishlisted?: boolean;
};

export function ProductCard({ product, initialWishlisted = false }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [loadingCart, setLoadingCart] = useState(false);
  const incrementCart = useCounterStore((s) => s.incrementCart);
  const toggleWishlistCount = useCounterStore((s) => s.toggleWishlist);

  const cover = product.images?.[0];
  // A pre-order product can be added to cart even with zero stock —
  // the whole point of pre-order is selling before stock exists.
  const outOfStock = !product.is_preorder && product.stock <= 0;
  const onSale =
    product.compare_at_price && product.compare_at_price > product.price;

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoadingWishlist(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: wishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id }),
      });
      if (!res.ok) throw new Error();
      setWishlisted(!wishlisted);
      toggleWishlistCount(wishlisted ? -1 : 1);
      toast.success(wishlisted ? "Dihapus dari wishlist" : "Ditambahkan ke wishlist");
    } catch {
      toast.error("Gagal memperbarui wishlist");
    } finally {
      setLoadingWishlist(false);
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      if (!res.ok) throw new Error();
      incrementCart(1);
      toast.success("Ditambahkan ke keranjang");
    } catch {
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link href={`/produk/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-grey-100)]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={cover.alt || product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[var(--color-grey-500)]">
              Tidak ada gambar
            </div>
          )}

          {outOfStock && (
            <div className="absolute left-0 top-0 bg-[var(--color-ink)] px-3 py-1.5">
              <span className="tracked text-[10px] text-[var(--color-paper)]">
                Stok Habis
              </span>
            </div>
          )}
          {product.is_preorder && (
            <div className="absolute left-0 top-0 bg-[var(--color-gold)] px-3 py-1.5">
              <span className="tracked text-[10px] text-[var(--color-ink)]">
                Pre-Order{product.preorder_days ? ` · ${product.preorder_days} Hari` : ""}
              </span>
            </div>
          )}
          {!outOfStock && !product.is_preorder && onSale && (
            <div className="absolute left-0 top-0 bg-[var(--color-gold)] px-3 py-1.5">
              <span className="tracked text-[10px] text-[var(--color-ink)]">Diskon</span>
            </div>
          )}

          <button
            onClick={handleWishlist}
            disabled={loadingWishlist}
            aria-label={wishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-paper)]/90 backdrop-blur-sm transition-transform duration-300 hover:scale-110"
          >
            {loadingWishlist ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={cn("h-4 w-4", wishlisted && "fill-[var(--color-ink)]")}
                strokeWidth={1.5}
              />
            )}
          </button>

          <div className="absolute inset-x-0 bottom-0 translate-y-full p-3 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:translate-y-0">
            <button
              onClick={handleAddToCart}
              disabled={loadingCart || outOfStock}
              className="tracked flex w-full items-center justify-center gap-2 bg-[var(--color-ink)] py-3 text-[11px] text-[var(--color-paper)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loadingCart ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              {outOfStock
                ? "Stok Habis"
                : product.is_preorder
                  ? "Pre-Order Sekarang"
                  : "Tambah ke Keranjang"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base leading-snug">{product.name}</h3>
            {product.category?.name && (
              <p className="tracked mt-1 text-[10px] text-[var(--color-grey-500)]">
                {product.category.name}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium">{formatPrice(product.price)}</p>
            {onSale && (
              <p className="text-xs text-[var(--color-grey-500)] line-through">
                {formatPrice(product.compare_at_price!)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
