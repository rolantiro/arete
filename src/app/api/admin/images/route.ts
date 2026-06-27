import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("website_images").select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ images: data ?? [] });
}

/**
 * Body: { slot: string; url: string; alt?: string }
 * Upserts a single image slot (e.g. "logo", "banner_home").
 */
export async function PUT(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await req.json();
  const { slot, url, alt = "" } = body;

  if (!slot || typeof url !== "string") {
    return NextResponse.json({ error: "slot dan url wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_images")
    .upsert({ slot, url, alt }, { onConflict: "slot" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data });
}
