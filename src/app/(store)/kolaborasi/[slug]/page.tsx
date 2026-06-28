import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles, ShoppingBag, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { ProductGallery } from "@/components/store/ProductGallery";
import { getWebsiteContent, getWebsiteImages } from "@/lib/data/content";
import { getCollaborationBySlug } from "@/lib/data/collaborations";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const collab = await getCollaborationBySlug(slug);
  if (!collab) return { title: "Kolaborasi Tidak Ditemukan" };

  return {
    title: collab.title,
    description: collab.description?.slice(0, 160) || collab.title,
    openGraph: {
      title: collab.title,
      description: collab.description?.slice(0, 160),
      images: collab.images?.[0]?.url ? [collab.images[0].url] : [],
    },
  };
}

export default async function CollaborationDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collab = await getCollaborationBySlug(slug);
  if (!collab) notFound();

  const [content, images] = await Promise.all([getWebsiteContent(), getWebsiteImages()]);
  const brandName = content.navbar?.brand_name || "ARÉTÉ";
  const isComingSoon = collab.status === "coming_soon";

  return (
    <>
      <Navbar brandName={brandName} logoUrl={images.logo?.url} />

      <main className="flex-1 py-12 md:py-16">
        <Container>
          <Link
            href="/kolaborasi"
            className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali ke Kolaborasi
          </Link>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <ProductGallery images={collab.images ?? []} productName={collab.title} />

            <div>
              <div
                className={cn(
                  "tracked mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px]",
                  isComingSoon
                    ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
                    : "bg-[var(--color-ink)] text-[var(--color-paper)]"
                )}
              >
                {isComingSoon ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {isComingSoon ? "Coming Soon" : "Selesai"}
              </div>

              <h1 className="font-display text-4xl leading-tight md:text-5xl">
                {collab.title}
              </h1>

              {collab.partner_name && (
                <p className="tracked mt-3 text-xs text-[var(--color-grey-500)]">
                  bersama {collab.partner_name}
                </p>
              )}

              {collab.description && (
                <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--color-grey-500)]">
                  {collab.description}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {collab.is_for_sale && collab.product?.slug && (
                  <Link
                    href={`/produk/${collab.product.slug}`}
                    className="tracked flex items-center gap-2 bg-[var(--color-ink)] px-6 py-3.5 text-xs text-[var(--color-paper)] transition-opacity hover:opacity-90"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    Lihat Produk
                  </Link>
                )}
                {collab.instagram_url && (
                  <a
                    href={collab.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tracked flex items-center gap-2 border border-[var(--color-ink)] px-6 py-3.5 text-xs transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Lihat di Instagram
                  </a>
                )}
              </div>
            </div>
          </div>
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
