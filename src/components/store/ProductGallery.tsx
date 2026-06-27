"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/database";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const active = sorted[activeIndex] ?? sorted[0];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center bg-[var(--color-grey-100)] text-[var(--color-grey-500)]">
        Tidak ada gambar
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[3/4] w-full overflow-hidden bg-[var(--color-grey-100)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.url}
          alt={active.alt || productName}
          className="h-full w-full object-cover"
        />
      </div>

      {sorted.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {sorted.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Lihat foto ${index + 1} dari ${productName}`}
              className={cn(
                "aspect-square overflow-hidden border-2 transition-colors",
                index === activeIndex
                  ? "border-[var(--color-ink)]"
                  : "border-transparent hover:border-[var(--color-grey-300)]"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `${productName} ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
