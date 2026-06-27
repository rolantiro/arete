import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { getWebsiteContent } from "@/lib/data/content";

const playfair = localFont({
  src: [
    { path: "../fonts/playfair-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/playfair-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/playfair-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/playfair-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../fonts/inter-300.woff2", weight: "300", style: "normal" },
    { path: "../fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getWebsiteContent();
  const title = content.seo?.site_title || "ARÉTÉ — Premium Fashion House";
  const description =
    content.seo?.site_description ||
    "ARÉTÉ adalah rumah mode premium dengan desain bersih dan bahan pilihan.";

  return {
    title: {
      default: title,
      template: `%s — ${content.navbar?.brand_name || "ARÉTÉ"}`,
    },
    description,
    keywords: ["fashion premium", "toko baju", "ARÉTÉ", "pakaian premium"],
    openGraph: {
      title,
      description,
      type: "website",
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] font-body">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--color-ink)",
              color: "var(--color-paper)",
              border: "none",
              borderRadius: 0,
              fontFamily: "var(--font-body)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
