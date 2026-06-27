import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Hero } from "@/components/store/Hero";
import { About } from "@/components/store/About";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { getWebsiteContent, getWebsiteImages } from "@/lib/data/content";
import { getProducts } from "@/lib/data/products";

export default async function HomePage() {
  const [content, images, featuredProducts] = await Promise.all([
    getWebsiteContent(),
    getWebsiteImages(),
    getProducts({ featuredOnly: true, limit: 8 }),
  ]);

  const brandName = content.navbar?.brand_name || "ARÉTÉ";

  return (
    <>
      <LoadingScreen />
      <Navbar brandName={brandName} logoUrl={images.logo?.url} />

      <main className="flex-1">
        <Hero
          eyebrow={content.hero?.eyebrow || "Koleksi Terbaru"}
          title={content.hero?.title || "Kemewahan Yang Tenang"}
          subtitle={
            content.hero?.subtitle ||
            "Pakaian premium untuk mereka yang memilih detail di atas kebisingan."
          }
          ctaLabel={content.hero?.cta_label || "Jelajahi Koleksi"}
          bannerImages={images.banner_home?.urls ?? []}
          bannerAlt={images.banner_home?.alt || brandName}
        />

        <FeaturedProducts products={featuredProducts} />

        <About
          title={content.about?.title || "Filosofi Kami"}
          body={content.about?.body || ""}
          images={images.about_image?.urls ?? []}
          imageAlt={images.about_image?.alt || brandName}
        />
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
