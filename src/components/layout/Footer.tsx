import Link from "next/link";
import { Container } from "@/components/ui/Container";

type FooterProps = {
  brandName: string;
  tagline: string;
  address: string;
  email: string;
  phone: string;
};

export function Footer({ brandName, tagline, address, email, phone }: FooterProps) {
  return (
    <footer className="hairline mt-24 bg-[var(--color-paper)]">
      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <span className="font-display text-2xl tracking-[0.12em]">{brandName}</span>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--color-grey-500)]">
            {tagline}
          </p>
        </div>

        <div>
          <h3 className="tracked mb-4 text-xs text-[var(--color-grey-500)]">Navigasi</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/katalog" className="hover:opacity-60">
                Katalog
              </Link>
            </li>
            <li>
              <Link href="/kolaborasi" className="hover:opacity-60">
                Kolaborasi
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:opacity-60">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/keranjang" className="hover:opacity-60">
                Keranjang
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="tracked mb-4 text-xs text-[var(--color-grey-500)]">Kontak</h3>
          <ul className="flex flex-col gap-2 text-sm text-[var(--color-grey-500)]">
            <li>{address}</li>
            <li>{email}</li>
            <li>{phone}</li>
          </ul>
        </div>
      </Container>

      <div className="hairline">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-[var(--color-grey-500)] md:flex-row">
          <span>© {new Date().getFullYear()} {brandName}. Seluruh hak cipta dilindungi.</span>
          <Link href="/admin/login" className="hover:opacity-60">
            Admin
          </Link>
        </Container>
      </div>
    </footer>
  );
}
