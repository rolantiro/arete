import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Clock, ShoppingBag } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getWebsiteContent, getWebsiteImages } from "@/lib/data/content";
import { getCollaborations } from "@/lib/data/collaborations";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kolaborasi",
  description: "Galeri kolaborasi dan kegiatan brand kami bersama partner dan event.",
};

export default async function KolaborasiPage() {
  const [content, images, collaborations] = await Promise.all([
    getWebsiteContent(),
    getWebsiteImages(),
    getCollaborations(),
  ]);

  const brandName = content.navbar?.brand_name || "ARÉTÉ";

  return (
    <>
      <Navbar brandName={brandName} logoUrl={images.logo?.url} />

      <main className="flex-1 py-16 md:py-20">
        <Container>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Galeri</p>
          <h1 className="font-display mb-3 text-4xl md:text-5xl">Kolaborasi</h1>
          <p className="mb-12 max-w-lg text-sm text-[var(--color-grey-500)]">
            Dokumentasi kerja sama, kegiatan, dan proyek kolaborasi kami bersama
            berbagai brand dan komunitas — termasuk yang akan datang.
          </p>

          {collaborations.length === 0 ? (
            <div className="border border-dashed border-[var(--color-grey-300)] py-24 text-center">
              <p className="text-[var(--color-grey-500)]">Belum ada kolaborasi dipublikasikan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {collaborations.map((collab) => {
                const cover = collab.images?.[0];
                const isComingSoon = collab.status === "coming_soon";
                return (
                  <div key={collab.id} className="group">
                    <Link href={`/kolaborasi/${collab.slug}`}>
                      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-grey-100)]">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover.url}
                            alt={cover.alt || collab.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[var(--color-grey-500)]">
                            Tidak ada gambar
                          </div>
                        )}

                        {collab.images && collab.images.length > 1 && (
                          <div className="absolute right-3 top-3 bg-[var(--color-paper)]/90 px-2 py-1">
                            <span className="text-[10px] text-[var(--color-ink)]">
                              +{collab.images.length - 1} foto
                            </span>
                          </div>
                        )}

                        <div
                          className={cn(
                            "absolute left-0 top-0 flex items-center gap-1.5 px-3 py-1.5",
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
                          <span className="tracked text-[10px]">
                            {isComingSoon ? "Coming Soon" : "Selesai"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h3 className="font-display text-lg leading-snug">{collab.title}</h3>
                        {collab.partner_name && (
                          <p className="tracked mt-1 text-[10px] text-[var(--color-grey-500)]">
                            bersama {collab.partner_name}
                          </p>
                        )}
                        {collab.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-grey-500)]">
                            {collab.description}
                          </p>
                        )}
                      </div>
                    </Link>

                    {collab.is_for_sale && collab.product?.slug && (
                      <Link
                        href={`/produk/${collab.product.slug}`}
                        className="tracked mt-3 inline-flex items-center gap-2 text-xs underline hover:opacity-60"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        Lihat Produk
                      </Link>
                    )}
                  </div>
                );
              })}
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
