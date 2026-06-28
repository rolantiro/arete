import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateVoucher } from "@/lib/voucher";

/**
 * Body: { code: string; subtotal: number }
 * Public endpoint (no auth) — a customer types a code at checkout
 * and this validates it against the current subtotal. Does NOT
 * increment used_count; that only happens once the order is
 * actually placed (see /api/checkout), so a customer trying a code
 * without completing checkout never burns a use.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotal = Number(body.subtotal ?? 0);

  if (!code) {
    return NextResponse.json({ valid: false, reason: "Kode voucher wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: voucher } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  const result = validateVoucher(voucher, subtotal);

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: result.voucher.code,
    discount_type: result.voucher.discount_type,
    discount_amount: result.discountAmount,
    free_shipping: result.freeShipping,
    description: result.voucher.description,
  });
}
