import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductDetailActions } from "@/components/store/ProductDetailActions";
import { getWebsiteContent, getWebsiteImages } from "@/lib/data/content";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSessionId } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk Tidak Ditemukan" };

  return {
    title: product.name,
    description: product.description?.slice(0, 160) || product.name,
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [content, images, related, sessionId] = await Promise.all([
    getWebsiteContent(),
    getWebsiteImages(),
    getRelatedProducts(product.category_id, product.id),
    getOrCreateSessionId(),
  ]);

  const supabase = await createClient();
  const { data: wishlistRow } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("session_id", sessionId)
    .eq("product_id", product.id)
    .maybeSingle();

  const brandName = content.navbar?.brand_name || "ARÉTÉ";
  const onSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <>
      <Navbar brandName={brandName} logoUrl={images.logo?.url} />

      <main className="flex-1 py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <ProductGallery images={product.images ?? []} productName={product.name} />

            <div>
              {product.category?.name && (
                <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">
                  {product.category.name}
                </p>
              )}
              <h1 className="font-display text-4xl leading-tight md:text-5xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-xl font-medium">{formatPrice(product.price)}</p>
                {onSale && (
                  <p className="text-base text-[var(--color-grey-500)] line-through">
                    {formatPrice(product.compare_at_price!)}
                  </p>
                )}
              </div>

              <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--color-grey-500)]">
                {product.description}
              </p>

              {product.is_sold ? (
                <div className="mt-4 inline-flex items-center gap-2 border border-[var(--color-ink)] bg-[var(--color-grey-100)] px-4 py-2.5">
                  <span className="tracked text-xs text-[var(--color-ink)]">
                    Produk ini sudah terjual — ditampilkan sebagai arsip koleksi
                  </span>
                </div>
              ) : product.is_preorder ? (
                <div className="mt-4 inline-flex items-center gap-2 border border-[var(--color-gold)] bg-[var(--color-gold)]/10 px-4 py-2.5">
                  <span className="tracked text-xs text-[var(--color-ink)]">
                    Pre-Order — estimasi pengiriman {product.preorder_days ?? "beberapa"}{" "}
                    hari setelah pesanan diverifikasi
                  </span>
                </div>
              ) : (
                product.stock > 0 &&
                product.stock <= 5 && (
                  <p className="mt-3 text-xs text-[var(--color-error)]">
                    Hanya tersisa {product.stock} stok
                  </p>
                )
              )}

              <div className="mt-8">
                <ProductDetailActions
                  product={product}
                  initialWishlisted={!!wishlistRow}
                />
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="hairline mt-24 pt-16">
              <h2 className="font-display mb-10 text-3xl">Produk Terkait</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
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
