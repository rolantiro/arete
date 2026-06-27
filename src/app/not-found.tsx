import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-paper)] px-6 text-center">
      <p className="tracked mb-4 text-xs text-[var(--color-grey-500)]">404</p>
      <h1 className="font-display text-4xl md:text-5xl">Halaman Tidak Ditemukan</h1>
      <p className="mt-4 max-w-md text-sm text-[var(--color-grey-500)]">
        Halaman yang Anda cari mungkin telah dipindahkan atau tidak pernah ada.
      </p>
      <Link
        href="/"
        className="tracked mt-10 border border-[var(--color-ink)] px-8 py-3.5 text-xs transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
