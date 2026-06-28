import type { Voucher } from "@/types/database";

export type VoucherValidationResult =
  | { valid: true; voucher: Voucher; discountAmount: number; freeShipping: boolean }
  | { valid: false; reason: string };

/**
 * Pure validation + discount calculation, shared between the
 * checkout API (source of truth, runs server-side with a fresh DB
 * read) and any client-side preview. Given a voucher row already
 * fetched from the database and the current order's subtotal,
 * returns whether it can be applied right now and exactly how much
 * it discounts.
 */
export function validateVoucher(
  voucher: Voucher | null,
  subtotal: number
): VoucherValidationResult {
  if (!voucher) {
    return { valid: false, reason: "Kode voucher tidak ditemukan" };
  }
  if (!voucher.is_active) {
    return { valid: false, reason: "Voucher ini sudah tidak aktif" };
  }

  const now = new Date();
  if (voucher.starts_at && now < new Date(voucher.starts_at)) {
    return { valid: false, reason: "Voucher ini belum berlaku" };
  }
  if (voucher.expires_at && now > new Date(voucher.expires_at)) {
    return { valid: false, reason: "Voucher ini sudah kedaluwarsa" };
  }
  if (voucher.max_uses !== null && voucher.used_count >= voucher.max_uses) {
    return { valid: false, reason: "Kuota pemakaian voucher ini sudah habis" };
  }
  if (subtotal < voucher.min_purchase) {
    return {
      valid: false,
      reason: `Minimal belanja untuk voucher ini adalah ${voucher.min_purchase.toLocaleString("id-ID")}`,
    };
  }

  if (voucher.discount_type === "free_shipping") {
    return { valid: true, voucher, discountAmount: 0, freeShipping: true };
  }

  if (voucher.discount_type === "amount") {
    const amount = Math.min(voucher.discount_amount ?? 0, subtotal);
    return { valid: true, voucher, discountAmount: amount, freeShipping: false };
  }

  // percent
  const amount = Math.round((subtotal * (voucher.discount_percent ?? 0)) / 100);
  return { valid: true, voucher, discountAmount: Math.min(amount, subtotal), freeShipping: false };
}
