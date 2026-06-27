"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ProductImage } from "@/types/database";

/**
 * Lightweight auto-advancing image carousel. Renders a single
 * static image (no controls) when there's only one slide, so
 * single-image slots look identical to before this component
 * existed — the carousel chrome only appears when it's needed.
 */
export function ImageCarousel({
  images,
  fallbackAlt,
  autoAdvanceMs = 5000,
  className,
  imgClassName,
}: {
  images: ProductImage[];
  fallbackAlt: string;
  autoAdvanceMs?: number;
  className?: string;
  imgClassName?: string;
}) {
  const [index, setIndex] = useState(0);
  const slides = images.length > 0 ? images : [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, autoAdvanceMs);
    return () => clearInterval(timer);
  }, [slides.length, autoAdvanceMs]);

  if (slides.length === 0) return null;

  const active = slides[index];

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={active.url}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.alt || fallbackAlt}
            className={imgClassName ?? "h-full w-full object-cover"}
          />
        </motion.div>
      </AnimatePresence>

      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.url}
              type="button"
              aria-label={`Lihat gambar ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[var(--color-paper)]" : "w-1.5 bg-[var(--color-paper)]/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
