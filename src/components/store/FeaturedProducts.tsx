import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/store/ProductCard";
import type { Product } from "@/types/database";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="hairline py-24 md:py-32">
      <Container>
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="tracked mb-4 text-xs text-[var(--color-grey-500)]">Pilihan Editor</p>
            <h2 className="font-display text-4xl md:text-5xl">Koleksi Unggulan</h2>
          </div>
          <Link
            href="/katalog"
            className="tracked hidden items-center gap-2 text-xs hover:opacity-60 md:flex"
          >
            Lihat Semua
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <Link
            href="/katalog"
            className="tracked flex items-center gap-2 text-xs hover:opacity-60"
          >
            Lihat Semua
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
