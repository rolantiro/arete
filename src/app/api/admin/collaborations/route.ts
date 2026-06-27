import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";
import { collaborationSchema } from "@/lib/validations";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .select("*, product:products(*)")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ collaborations: data ?? [] });
}

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = collaborationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 }
    );
  }

  const images = Array.isArray(body.images) ? body.images : [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collaborations")
    .insert({ ...parsed.data, images })
    .select()
    .single();

  if (error) {
    const message = error.code === "23505" ? "Slug sudah digunakan" : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json({ collaboration: data }, { status: 201 });
}
