"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCounterStore } from "@/store/useCounterStore";

type NavbarProps = {
  brandName: string;
  logoUrl?: string;
};

const NAV_LINKS = [
  { href: "/katalog", label: "Katalog" },
  { href: "/katalog?featured=true", label: "Unggulan" },
  { href: "/kolaborasi", label: "Kolaborasi" },
];

export function Navbar({ brandName, logoUrl }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = useCounterStore((s) => s.cartCount);
  const wishlistCount = useCounterStore((s) => s.wishlistCount);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-[var(--color-grey-300)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 md:px-10 lg:px-16">
        <Link href="/" className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={brandName} className="h-7 w-auto object-contain" />
          ) : (
            <span className="font-display text-xl tracking-[0.15em] md:text-2xl">
              {brandName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="tracked text-xs text-[var(--color-ink)] transition-opacity hover:opacity-60"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative transition-opacity hover:opacity-60"
          >
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)] text-[10px] text-[var(--color-paper)]">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/keranjang"
            aria-label="Keranjang"
            className="relative transition-opacity hover:opacity-60"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-ink)] text-[10px] text-[var(--color-paper)]">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            aria-label="Menu"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-[var(--color-grey-300)] glass md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="tracked py-3 text-xs text-[var(--color-ink)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
