"use client";

import { useState } from "react";
import { Loader2, Tag, X, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export type AppliedVoucher = {
  code: string;
  discount_type: "amount" | "percent" | "free_shipping";
  discount_amount: number;
  free_shipping: boolean;
  description: string | null;
};

export function VoucherInput({
  subtotal,
  applied,
  onApply,
  onRemove,
}: {
  subtotal: number;
  applied: AppliedVoucher | null;
  onApply: (voucher: AppliedVoucher) => void;
  onRemove: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.reason || "Voucher tidak valid");
        return;
      }
      onApply({
        code: data.code,
        discount_type: data.discount_type,
        discount_amount: data.discount_amount,
        free_shipping: data.free_shipping,
        description: data.description,
      });
      setCode("");
    } catch {
      setError("Gagal memeriksa voucher. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between border border-[var(--color-gold)] bg-[var(--color-gold)]/10 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Check className="h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-medium">{applied.code}</p>
            <p className="text-xs text-[var(--color-grey-500)]">
              {applied.free_shipping
                ? "Gratis ongkos kirim"
                : `Potongan ${formatPrice(applied.discount_amount)}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Hapus voucher"
          className="text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-grey-500)]" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
            placeholder="Punya kode voucher?"
            className="w-full border border-[var(--color-grey-300)] bg-transparent py-3 pl-10 pr-3 text-sm uppercase tracking-wide focus:border-[var(--color-ink)] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="tracked shrink-0 border border-[var(--color-ink)] px-5 py-3 text-xs transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pakai"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
