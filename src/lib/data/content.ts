import { createClient } from "@/lib/supabase/server";
import type { WebsiteContentMap, WebsiteImageMap } from "@/types/database";

/**
 * Hardcoded fallbacks ensure the storefront never shows a blank
 * section even before an admin has customized anything, and act
 * as documentation for which (section, key) pairs the UI expects.
 */
const DEFAULT_CONTENT: WebsiteContentMap = {
  hero: {
    eyebrow: "Koleksi Terbaru",
    title: "Kemewahan Yang Tenang",
    subtitle: "Pakaian premium untuk mereka yang memilih detail di atas kebisingan.",
    cta_label: "Jelajahi Koleksi",
  },
  about: {
    title: "Filosofi Kami",
    body: "ARÉTÉ lahir dari satu keyakinan sederhana: kualitas tidak pernah berteriak.",
  },
  footer: {
    tagline: "Pakaian premium untuk keseharian yang penuh arti.",
    address: "Jakarta, Indonesia",
    email: "hello@arete.id",
    phone: "+62 812 0000 0000",
  },
  navbar: {
    brand_name: "ARÉTÉ",
  },
  seo: {
    site_title: "ARÉTÉ — Premium Fashion House",
    site_description:
      "ARÉTÉ adalah rumah mode premium dengan desain bersih dan bahan pilihan.",
  },
};

const DEFAULT_IMAGES: WebsiteImageMap = {
  logo: { url: "", alt: "ARÉTÉ", urls: [] },
  banner_home: {
    url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000",
    alt: "Koleksi ARÉTÉ",
    urls: [
      {
        url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000",
        alt: "Koleksi ARÉTÉ",
        sort_order: 0,
      },
    ],
  },
  about_image: {
    url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1400",
    alt: "Studio ARÉTÉ",
    urls: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1400",
        alt: "Studio ARÉTÉ",
        sort_order: 0,
      },
    ],
  },
};

export async function getWebsiteContent(): Promise<WebsiteContentMap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_content")
    .select("section, key, value");

  if (error || !data) return DEFAULT_CONTENT;

  const map: WebsiteContentMap = structuredClone(DEFAULT_CONTENT);
  for (const row of data) {
    if (!map[row.section]) map[row.section] = {};
    map[row.section][row.key] = row.value;
  }
  return map;
}

export async function getWebsiteImages(): Promise<WebsiteImageMap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_images")
    .select("slot, url, alt, urls");

  if (error || !data) return DEFAULT_IMAGES;

  const map: WebsiteImageMap = structuredClone(DEFAULT_IMAGES);
  for (const row of data) {
    const hasMultiImages = Array.isArray(row.urls) && row.urls.length > 0;
    if (hasMultiImages) {
      map[row.slot] = {
        url: row.urls[0].url,
        alt: row.urls[0].alt ?? row.alt ?? "",
        urls: row.urls,
      };
    } else if (row.url) {
      map[row.slot] = {
        url: row.url,
        alt: row.alt ?? "",
        urls: [{ url: row.url, alt: row.alt ?? "", sort_order: 0 }],
      };
    }
  }
  return map;
}
