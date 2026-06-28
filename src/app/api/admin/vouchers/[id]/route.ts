import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";
import { voucherSchema } from "@/lib/validations";

type Params = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("vouchers").select("*").eq("id", id).single();

  if (error || !data) {
    return NextResponse.json({ error: "Voucher tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ voucher: data });
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = voucherSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const payload: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.discount_type === "amount") {
    payload.discount_percent = null;
  } else if (parsed.data.discount_type === "percent") {
    payload.discount_amount = null;
  } else if (parsed.data.discount_type === "free_shipping") {
    payload.discount_amount = null;
    payload.discount_percent = null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vouchers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const message = error.code === "23505" ? "Kode voucher sudah digunakan" : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ voucher: data });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("vouchers").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
