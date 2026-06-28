import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrCreateSessionId } from "@/lib/session";
import { checkoutSchema } from "@/lib/validations";
import { validateVoucher } from "@/lib/voucher";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Checkout submission. Accepts multipart/form-data because it
 * includes a payment-proof image file alongside the order fields.
 *
 * Uses the service-role client (bypassing RLS) for the order
 * insert because customers never authenticate — the public RLS
 * policy already allows anonymous inserts (see
 * supabase/migrations/0004_orders_rls.sql), but the proof image
 * upload specifically needs the service role since storage write
 * policies are admin-only by design (see 0002_rls_policies.sql).
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const rawFields = {
    full_name: String(formData.get("full_name") ?? ""),
    email: String(formData.get("email") ?? ""),
    whatsapp: String(formData.get("whatsapp") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    province_id: String(formData.get("province_id") ?? ""),
    province_name: String(formData.get("province_name") ?? ""),
    regency_id: String(formData.get("regency_id") ?? ""),
    regency_name: String(formData.get("regency_name") ?? ""),
    district_id: String(formData.get("district_id") ?? ""),
    district_name: String(formData.get("district_name") ?? ""),
    village_id: String(formData.get("village_id") ?? ""),
    village_name: String(formData.get("village_name") ?? ""),
    postal_code: String(formData.get("postal_code") ?? ""),
    address_detail: String(formData.get("address_detail") ?? ""),
    landmark: String(formData.get("landmark") ?? ""),
    agreed_to_terms: formData.get("agreed_to_terms") === "true",
  };

  const parsed = checkoutSchema.safeParse(rawFields);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const shippingEstimateLabel = String(formData.get("shipping_estimate_label") ?? "");
  const itemsRaw = formData.get("items");
  if (!itemsRaw || typeof itemsRaw !== "string") {
    return NextResponse.json({ error: "Keranjang belanja kosong" }, { status: 400 });
  }

  let items: Array<{
    product_id: string;
    product_name: string;
    product_image_url: string | null;
    size: string | null;
    color: string | null;
    quantity: number;
    price_at_purchase: number;
  }>;
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return NextResponse.json({ error: "Format item pesanan tidak valid" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Keranjang belanja kosong" }, { status: 400 });
  }

  const proofFile = formData.get("payment_proof") as File | null;
  if (!proofFile || proofFile.size === 0) {
    return NextResponse.json(
      { error: "Bukti pembayaran wajib diunggah" },
      { status: 400 }
    );
  }
  if (!ALLOWED_TYPES.includes(proofFile.type)) {
    return NextResponse.json(
      { error: "Format bukti pembayaran harus JPG, PNG, atau WEBP" },
      { status: 400 }
    );
  }
  if (proofFile.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Ukuran bukti pembayaran maksimal 5MB" },
      { status: 400 }
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price_at_purchase * item.quantity,
    0
  );

  const sessionId = await getOrCreateSessionId();
  const adminSupabase = createAdminClient();

  // Re-validate the voucher server-side against fresh data — never
  // trust the discount amount the client claims, since the client
  // only ever saw a preview computed from possibly-stale data.
  const voucherCode = String(formData.get("voucher_code") ?? "").trim().toUpperCase();
  let voucherId: string | null = null;
  let discountAmount = 0;
  let freeShipping = false;

  if (voucherCode) {
    const { data: voucherRow } = await adminSupabase
      .from("vouchers")
      .select("*")
      .eq("code", voucherCode)
      .maybeSingle();

    const result = validateVoucher(voucherRow, subtotal);
    if (!result.valid) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }
    voucherId = result.voucher.id;
    discountAmount = result.discountAmount;
    freeShipping = result.freeShipping;
  }

  const total = Math.max(0, subtotal - discountAmount);

  // 1. Upload payment proof to Storage (service role required —
  //    storage write policies are admin-only; checkout submission
  //    is the one deliberate exception, gated by this server-only
  //    route rather than by RLS).
  const ext = proofFile.name.split(".").pop() || "jpg";
  const proofPath = `payment-proofs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await adminSupabase.storage
    .from("media")
    .upload(proofPath, proofFile, { contentType: proofFile.type });

  if (uploadError) {
    return NextResponse.json(
      { error: `Gagal mengunggah bukti pembayaran: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: publicUrlData } = adminSupabase.storage.from("media").getPublicUrl(proofPath);

  // 2. Insert the order (RLS allows anonymous insert directly,
  //    but we already have the admin client open, so reuse it to
  //    avoid a second client + an extra round trip for session
  //    cookie handling that isn't needed for an insert-only call).
  const { data: order, error: orderError } = await adminSupabase
    .from("orders")
    .insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email || null,
      whatsapp: parsed.data.whatsapp,
      notes: parsed.data.notes || null,
      province_id: parsed.data.province_id,
      province_name: parsed.data.province_name,
      regency_id: parsed.data.regency_id,
      regency_name: parsed.data.regency_name,
      district_id: parsed.data.district_id,
      district_name: parsed.data.district_name,
      village_id: parsed.data.village_id,
      village_name: parsed.data.village_name,
      postal_code: parsed.data.postal_code || null,
      address_detail: parsed.data.address_detail,
      landmark: parsed.data.landmark || null,
      payment_method: "bank_transfer",
      payment_proof_url: publicUrlData.publicUrl,
      shipping_estimate_label: shippingEstimateLabel || null,
      voucher_id: voucherId,
      voucher_code: voucherCode || null,
      discount_amount: discountAmount,
      free_shipping: freeShipping,
      subtotal,
      total, // shipping_cost is added on top once an admin sets it
      agreed_to_terms: parsed.data.agreed_to_terms,
      status: "menunggu_verifikasi",
    })
    .select()
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? "Gagal membuat pesanan" },
      { status: 500 }
    );
  }

  // 3. Insert order items
  const { error: itemsError } = await adminSupabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_image_url: item.product_image_url,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }))
  );

  if (itemsError) {
    return NextResponse.json(
      { error: `Pesanan dibuat tetapi gagal menyimpan rincian produk: ${itemsError.message}` },
      { status: 500 }
    );
  }

  // 4. Increment the voucher's usage counter now that the order is
  //    confirmed to exist (a failed upload/insert above never
  //    reaches here, so a voucher attempt that didn't result in a
  //    real order never burns a use).
  if (voucherId) {
    await adminSupabase.rpc("increment_voucher_usage", { voucher_id: voucherId });
  }

  // 5. Clear the guest's cart now that the order is placed
  const customerSupabase = await createClient();
  await customerSupabase.from("cart_items").delete().eq("session_id", sessionId);

  return NextResponse.json(
    { order_number: order.order_number, order_id: order.id },
    { status: 201 }
  );
}
