"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { ImageCarousel } from "@/components/store/ImageCarousel";
import type { ProductImage } from "@/types/database";

type HeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  bannerImages: ProductImage[];
  bannerAlt: string;
};

export function Hero({ eyebrow, title, subtitle, ctaLabel, bannerImages, bannerAlt }: HeroProps) {
  return (
    <section className="relative flex h-[92vh] min-h-[640px] w-full items-end overflow-hidden bg-[var(--color-ink)]">
      <motion.div
        initial={{ scale: 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        <ImageCarousel
          images={bannerImages}
          fallbackAlt={bannerAlt}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/20 to-[var(--color-ink)]/10" />
      </motion.div>

      <div className="relative z-10 w-full px-6 pb-16 md:px-10 lg:px-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="tracked mb-4 text-xs text-[var(--color-paper)]/80"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-3xl text-5xl leading-[1.05] text-[var(--color-paper)] md:text-7xl"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-md text-base text-[var(--color-paper)]/85"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <Link
            href="/katalog"
            className="tracked group inline-flex items-center gap-3 border border-[var(--color-paper)] px-8 py-4 text-xs text-[var(--color-paper)] transition-colors hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
          >
            {ctaLabel}
            <ArrowDown className="h-3.5 w-3.5 -rotate-90 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
