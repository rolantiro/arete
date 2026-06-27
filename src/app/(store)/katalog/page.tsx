import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { CategoryFilter } from "@/components/store/CategoryFilter";
import { ProductCard } from "@/components/store/ProductCard";
import { getWebsiteContent, getWebsiteImages } from "@/lib/data/content";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSessionId } from "@/lib/session";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog",
  description: "Jelajahi seluruh koleksi pakaian premium kami.",
};

type SearchParams = Promise<{ kategori?: string; featured?: string }>;

async function CatalogGrid({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [products, categories, sessionId] = await Promise.all([
    getProducts({
      categorySlug: params.kategori,
      featuredOnly: params.featured === "true",
    }),
    getCategories(),
    getOrCreateSessionId(),
  ]);

  const supabase = await createClient();
  const { data: wishlistRows } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("session_id", sessionId);
  const wishlistedIds = new Set((wishlistRows ?? []).map((r) => r.product_id));

  return (
    <>
      <div className="mb-12">
        <CategoryFilter categories={categories} />
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <p className="font-display text-2xl">Belum ada produk</p>
          <p className="mt-2 text-sm text-[var(--color-grey-500)]">
            Coba pilih kategori lain atau kembali lagi nanti.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              initialWishlisted={wishlistedIds.has(product.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default async function KatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const [content, images] = await Promise.all([getWebsiteContent(), getWebsiteImages()]);
  const brandName = content.navbar?.brand_name || "ARÉTÉ";

  return (
    <>
      <Navbar brandName={brandName} logoUrl={images.logo?.url} />

      <main className="flex-1 py-16 md:py-20">
        <Container>
          <div className="mb-12">
            <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Koleksi</p>
            <h1 className="font-display text-4xl md:text-5xl">Katalog Produk</h1>
          </div>

          <Suspense fallback={<CatalogSkeleton />}>
            <CatalogGrid searchParams={searchParams} />
          </Suspense>
        </Container>
      </main>

      <Footer
        brandName={brandName}
        tagline={content.footer?.tagline || ""}
        address={content.footer?.address || ""}
        email={content.footer?.email || ""}
        phone={content.footer?.phone || ""}
      />
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-[var(--color-grey-100)]" />
          <div className="mt-4 h-4 w-3/4 bg-[var(--color-grey-100)]" />
          <div className="mt-2 h-3 w-1/2 bg-[var(--color-grey-100)]" />
        </div>
      ))}
    </div>
  );
}
