"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RegionSelector } from "@/components/store/RegionSelector";
import { ShippingEstimateTable } from "@/components/store/ShippingEstimateTable";
import { PaymentProofUpload } from "@/components/store/PaymentProofUpload";
import { VoucherInput, type AppliedVoucher } from "@/components/store/VoucherInput";
import { formatPrice } from "@/lib/utils";
import { getShippingEstimate } from "@/lib/shipping";
import { checkoutSchema } from "@/lib/validations";
import type { CartItem } from "@/types/database";

const BANK_NAME = "BRI";
const BANK_ACCOUNT_NUMBER = "083901005659508";
const BANK_ACCOUNT_HOLDER = "M.ROLANTIRO AL FAQIH";

type RegionData = {
  province_id: string;
  province_name: string;
  regency_id: string;
  regency_name: string;
  district_id: string;
  district_name: string;
  village_id: string;
  village_name: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");

  const [region, setRegion] = useState<RegionData | null>(null);
  const [postalCode, setPostalCode] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [landmark, setLandmark] = useState("");

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [voucher, setVoucher] = useState<AppliedVoucher | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => res.json())
      .then((data) => setCartItems(data.items ?? []))
      .finally(() => setCartLoading(false));
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price ?? 0) * item.quantity,
    0
  );
  const shippingEstimate = region ? getShippingEstimate(region.province_name) : null;
  const discountAmount = voucher?.discount_amount ?? 0;
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = checkoutSchema.safeParse({
      full_name: fullName,
      email,
      whatsapp,
      notes,
      province_id: region?.province_id ?? "",
      province_name: region?.province_name ?? "",
      regency_id: region?.regency_id ?? "",
      regency_name: region?.regency_name ?? "",
      district_id: region?.district_id ?? "",
      district_name: region?.district_name ?? "",
      village_id: region?.village_id ?? "",
      village_name: region?.village_name ?? "",
      postal_code: postalCode,
      address_detail: addressDetail,
      landmark,
      agreed_to_terms: agreed,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Periksa kembali data yang Anda isi");
      return;
    }

    if (!proofFile) {
      setErrors((prev) => ({ ...prev, payment_proof: "Bukti pembayaran wajib diunggah" }));
      toast.error("Bukti pembayaran wajib diunggah");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Keranjang belanja Anda kosong");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(parsed.data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      formData.append("shipping_estimate_label", shippingEstimate?.label ?? "");
      formData.append("voucher_code", voucher?.code ?? "");
      formData.append("payment_proof", proofFile);
      formData.append(
        "items",
        JSON.stringify(
          cartItems.map((item) => ({
            product_id: item.product_id,
            product_name: item.product?.name ?? "Produk",
            product_image_url: item.product?.images?.[0]?.url ?? null,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price_at_purchase: item.product?.price ?? 0,
          }))
        )
      );

      const res = await fetch("/api/checkout", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Gagal membuat pesanan");
        setSubmitting(false);
        return;
      }

      router.push(`/checkout/sukses?order=${data.order_number}`);
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
      setSubmitting(false);
    }
  }

  if (cartLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar brandName="ARÉTÉ" />
        <main className="flex flex-1 flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="mb-4 h-10 w-10 text-[var(--color-grey-300)]" strokeWidth={1} />
          <p className="font-display text-2xl">Keranjang Anda kosong</p>
          <p className="mt-2 text-sm text-[var(--color-grey-500)]">
            Tambahkan produk ke keranjang sebelum checkout.
          </p>
          <Link
            href="/katalog"
            className="tracked mt-8 border border-[var(--color-ink)] px-8 py-3.5 text-xs transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
          >
            Jelajahi Katalog
          </Link>
        </main>
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

  return (
    <>
      <Navbar brandName="ARÉTÉ" />
      <main className="flex-1 py-16 md:py-20">
        <Container>
          <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Selangkah lagi</p>
          <h1 className="font-display mb-2 text-4xl md:text-5xl">Halaman Checkout</h1>
          <p className="mb-12 text-sm text-[var(--color-grey-500)]">
            Di sinilah Anda mengisi data untuk menyelesaikan pesanan.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="flex flex-col gap-10 lg:col-span-2">
              {/* Informasi Pembeli */}
              <section>
                <h2 className="font-display mb-5 text-xl">Informasi Pembeli</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Input
                    label="Nama Lengkap *"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.full_name}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                  <Input
                    label="Nomor WhatsApp *"
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    error={errors.whatsapp}
                  />
                  <div className="md:col-span-2">
                    <Textarea
                      label="Catatan Pesanan (opsional)"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Alamat Pengiriman */}
              <section className="hairline pt-10">
                <h2 className="font-display mb-5 text-xl">Alamat Pengiriman</h2>
                <div className="flex flex-col gap-4">
                  <RegionSelector onComplete={setRegion} error={errors.village_id} />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Input
                      label="Kode Pos"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                    />
                  </div>
                  <Textarea
                    label="Alamat Lengkap *"
                    rows={3}
                    placeholder="Nama jalan, nomor rumah, RT/RW, dsb."
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    error={errors.address_detail}
                  />
                  <Input
                    label="Patokan Rumah (opsional)"
                    placeholder="Misal: dekat masjid, sebelah toko kelontong"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>
              </section>

              {/* Pembayaran */}
              <section className="hairline pt-10">
                <h2 className="font-display mb-5 text-xl">Pembayaran</h2>
                <div className="border border-[var(--color-grey-300)] p-5">
                  <p className="tracked text-[11px] text-[var(--color-grey-500)]">
                    Transfer Bank
                  </p>
                  <p className="mt-2 text-lg font-medium">{BANK_NAME}</p>
                  <p className="mt-1 text-sm">
                    No. Rek: <span className="font-medium">{BANK_ACCOUNT_NUMBER}</span>
                  </p>
                  <p className="text-sm text-[var(--color-grey-500)]">
                    a.n. {BANK_ACCOUNT_HOLDER}
                  </p>
                </div>
                <div className="mt-5">
                  <p className="tracked mb-3 text-[11px] text-[var(--color-grey-500)]">
                    Bukti Pembayaran *
                  </p>
                  <PaymentProofUpload
                    file={proofFile}
                    onChange={setProofFile}
                    error={errors.payment_proof}
                  />
                  <p className="mt-3 text-xs text-[var(--color-grey-500)]">
                    Bukti pembayaran akan diverifikasi oleh admin sebelum pesanan
                    diproses.
                  </p>
                </div>
              </section>

              {/* Pengiriman */}
              <section className="hairline pt-10">
                <h2 className="font-display mb-5 text-xl">Pengiriman</h2>
                {voucher?.free_shipping ? (
                  <div className="border border-[var(--color-gold)] bg-[var(--color-gold)]/10 px-4 py-3 text-sm">
                    Voucher gratis ongkir aktif — Anda tidak akan dikenakan biaya
                    pengiriman untuk pesanan ini.
                  </div>
                ) : (
                  <ShippingEstimateTable provinceName={region?.province_name ?? ""} />
                )}
                <label className="mt-5 flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]"
                  />
                  <span>
                    {voucher?.free_shipping
                      ? "Saya memahami pesanan ini menggunakan voucher gratis ongkir."
                      : "Saya setuju bahwa ongkos kirim ditanggung oleh saya (pembeli) dan dibayarkan saat barang sampai, sesuai estimasi pada tabel di atas."}
                  </span>
                </label>
                {errors.agreed_to_terms && (
                  <p className="mt-2 text-xs text-[var(--color-error)]">
                    {errors.agreed_to_terms}
                  </p>
                )}
              </section>
            </div>

            {/* Ringkasan Pesanan */}
            <div className="h-fit border border-[var(--color-grey-300)] p-8 lg:sticky lg:top-24">
              <h2 className="font-display mb-6 text-xl">Ringkasan Pesanan</h2>
              <div className="flex flex-col gap-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-12 shrink-0 overflow-hidden bg-[var(--color-grey-100)]">
                      {item.product?.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-1">{item.product?.name}</p>
                      <p className="text-xs text-[var(--color-grey-500)]">
                        {item.quantity}x {formatPrice(item.product?.price ?? 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hairline mt-6 mb-4" />

              <VoucherInput
                subtotal={subtotal}
                applied={voucher}
                onApply={setVoucher}
                onRemove={() => setVoucher(null)}
              />

              <div className="hairline mt-4 mb-4" />
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-grey-500)]">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {voucher && (
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-[var(--color-grey-500)]">Diskon Voucher</span>
                  <span>
                    {voucher.free_shipping ? "Gratis Ongkir" : `- ${formatPrice(discountAmount)}`}
                  </span>
                </div>
              )}
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[var(--color-grey-500)]">Estimasi Ongkir</span>
                <span>
                  {voucher?.free_shipping
                    ? "Gratis"
                    : shippingEstimate
                      ? `${formatPrice(shippingEstimate.min)}–${formatPrice(shippingEstimate.max)}`
                      : "Pilih alamat dulu"}
                </span>
              </div>
              <div className="hairline mt-4 mb-4" />
              <div className="flex justify-between text-base font-medium">
                <span>Total (belum ongkir)</span>
                <span>{formatPrice(totalAfterDiscount)}</span>
              </div>

              <Button
                type="submit"
                className="mt-8 w-full"
                isLoading={submitting}
                disabled={!region}
              >
                Buat Pesanan
              </Button>
            </div>
          </form>
        </Container>
      </main>
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
