import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";
import { voucherSchema } from "@/lib/validations";

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ vouchers: data ?? [] });
}

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = voucherSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  // discount_amount / discount_percent should only be set for the
  // matching discount_type, so the unused field stays null rather
  // than holding stale data from a prior edit.
  const payload = {
    ...parsed.data,
    discount_amount: parsed.data.discount_type === "amount" ? parsed.data.discount_amount : null,
    discount_percent:
      parsed.data.discount_type === "percent" ? parsed.data.discount_percent : null,
  };

  const supabase = await createClient();
  const { data, error } = await supabase.from("vouchers").insert(payload).select().single();

  if (error) {
    const message = error.code === "23505" ? "Kode voucher sudah digunakan" : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ voucher: data }, { status: 201 });
}
