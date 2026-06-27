"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { ImageCarousel } from "@/components/store/ImageCarousel";
import type { ProductImage } from "@/types/database";

type AboutProps = {
  title: string;
  body: string;
  images: ProductImage[];
  imageAlt: string;
};

export function About({ title, body, images, imageAlt }: AboutProps) {
  return (
    <section className="py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] overflow-hidden bg-[var(--color-grey-100)] md:order-1"
        >
          <ImageCarousel images={images} fallbackAlt={imageAlt} className="absolute inset-0" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="tracked mb-4 text-xs text-[var(--color-grey-500)]">Tentang Kami</p>
          <h2 className="font-display mb-6 text-4xl leading-tight md:text-5xl">{title}</h2>
          <p className="max-w-md text-base leading-relaxed text-[var(--color-grey-500)]">
            {body}
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
