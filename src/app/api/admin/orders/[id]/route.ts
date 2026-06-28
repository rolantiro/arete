import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ order: data });
}

const ALLOWED_STATUSES = [
  "menunggu_verifikasi",
  "diproses",
  "dikirim",
  "selesai",
  "dibatalkan",
];

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const updatePayload: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }
    updatePayload.status = body.status;
  }

  if (body.shipping_cost !== undefined) {
    const shippingCost = Number(body.shipping_cost);
    if (Number.isNaN(shippingCost) || shippingCost < 0) {
      return NextResponse.json({ error: "Ongkir tidak valid" }, { status: 400 });
    }
    updatePayload.shipping_cost = shippingCost;
  }

  if (body.payment_verified !== undefined) {
    updatePayload.payment_verified = !!body.payment_verified;
    updatePayload.payment_verified_at = body.payment_verified ? new Date().toISOString() : null;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "Tidak ada data untuk diperbarui" }, { status: 400 });
  }

  const supabase = await createClient();

  // Recompute total when shipping_cost changes, so total always
  // reflects (subtotal - discount_amount) + effective shipping —
  // and a free_shipping voucher zeroes the shipping line out
  // entirely regardless of what figure the admin types in, since
  // the customer was promised free shipping at checkout time.
  if (updatePayload.shipping_cost !== undefined) {
    const { data: existing } = await supabase
      .from("orders")
      .select("subtotal, discount_amount, free_shipping")
      .eq("id", id)
      .single();
    if (existing) {
      const effectiveShipping = existing.free_shipping
        ? 0
        : (updatePayload.shipping_cost as number);
      updatePayload.shipping_cost = effectiveShipping;
      updatePayload.total =
        Math.max(0, existing.subtotal - existing.discount_amount) + effectiveShipping;
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", id)
    .select("*, items:order_items(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
