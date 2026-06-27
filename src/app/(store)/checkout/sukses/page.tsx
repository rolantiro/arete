"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <CheckCircle2 className="mb-6 h-14 w-14 text-[var(--color-ink)]" strokeWidth={1.2} />
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Berhasil</p>
      <h1 className="font-display text-4xl md:text-5xl">Terima Kasih!</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--color-grey-500)]">
        Pesanan Anda telah kami terima dan sedang menunggu verifikasi pembayaran
        oleh admin. Kami akan segera memproses pesanan Anda setelah pembayaran
        terkonfirmasi.
      </p>
      {orderNumber && (
        <div className="mt-8 border border-[var(--color-grey-300)] px-8 py-4">
          <p className="tracked text-[11px] text-[var(--color-grey-500)]">
            Nomor Pesanan
          </p>
          <p className="font-display mt-1 text-lg">{orderNumber}</p>
        </div>
      )}
      <Link
        href="/katalog"
        className="tracked mt-10 border border-[var(--color-ink)] px-8 py-3.5 text-xs transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
      >
        Lanjut Belanja
      </Link>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar brandName="ARÉTÉ" />
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
      <Footer
        brandName="ARÉTÉ"
        tagline="Pakaian premium untuk keseharian yang penuh arti."
        address="Jakarta, Indonesia"
        email="hello@arete.id"
        phone="+62 812 0000 0000"
      />
    </>
  );
}
