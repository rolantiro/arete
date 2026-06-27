"use client";

import { useState } from "react";
import { Heart, ShoppingBag, Loader2, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCounterStore } from "@/store/useCounterStore";
import type { Product } from "@/types/database";

export function ProductDetailActions({
  product,
  initialWishlisted,
}: {
  product: Product;
  initialWishlisted: boolean;
}) {
  const [size, setSize] = useState<string | null>(product.sizes?.[0] ?? null);
  const [color, setColor] = useState<string | null>(product.colors?.[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loadingCart, setLoadingCart] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const incrementCart = useCounterStore((s) => s.incrementCart);
  const toggleWishlistCount = useCounterStore((s) => s.toggleWishlist);

  const outOfStock = product.stock <= 0;

  async function handleAddToCart() {
    if (outOfStock) return;
    setLoadingCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity, size, color }),
      });
      if (!res.ok) throw new Error();
      incrementCart(quantity);
      toast.success("Ditambahkan ke keranjang");
    } catch {
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setLoadingCart(false);
    }
  }

  async function handleWishlist() {
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

  return (
    <div className="flex flex-col gap-8">
      {product.sizes?.length > 0 && (
        <div>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Ukuran</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={cn(
                  "h-11 min-w-11 border px-3 text-sm transition-colors",
                  size === s
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                    : "border-[var(--color-grey-300)] hover:border-[var(--color-ink)]"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors?.length > 0 && (
        <div>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Warna</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "tracked border px-4 py-2.5 text-xs transition-colors",
                  color === c
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]"
                    : "border-[var(--color-grey-300)] hover:border-[var(--color-ink)]"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Jumlah</p>
        <div className="flex w-fit items-center border border-[var(--color-grey-300)]">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center hover:bg-[var(--color-grey-100)]"
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="flex h-11 w-12 items-center justify-center text-sm">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-11 w-11 items-center justify-center hover:bg-[var(--color-grey-100)]"
            aria-label="Tambah jumlah"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={loadingCart || outOfStock}
          className="tracked flex flex-1 items-center justify-center gap-2 bg-[var(--color-ink)] py-4 text-xs text-[var(--color-paper)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loadingCart ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
          )}
          {outOfStock ? "Stok Habis" : "Tambah ke Keranjang"}
        </button>
        <button
          onClick={handleWishlist}
          disabled={loadingWishlist}
          aria-label="Tambah ke wishlist"
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-[var(--color-grey-300)] transition-colors hover:border-[var(--color-ink)]"
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
      </div>
    </div>
  );
}
