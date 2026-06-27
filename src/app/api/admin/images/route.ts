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
 * Body for single-image slots (e.g. "logo"):
 *   { slot: string; url: string; alt?: string }
 * Body for multi-image slots (e.g. "banner_home", "about_image"):
 *   { slot: string; urls: Array<{ url: string; alt: string; sort_order: number }> }
 * Upserts a single image slot.
 */
export async function PUT(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await req.json();
  const { slot, url, alt = "", urls } = body;

  if (!slot) {
    return NextResponse.json({ error: "slot wajib diisi" }, { status: 400 });
  }

  const payload: Record<string, unknown> = { slot };

  if (Array.isArray(urls)) {
    payload.urls = urls;
    payload.url = urls[0]?.url ?? "";
    payload.alt = urls[0]?.alt ?? "";
  } else if (typeof url === "string") {
    payload.url = url;
    payload.alt = alt;
    payload.urls = [];
  } else {
    return NextResponse.json({ error: "url atau urls wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_images")
    .upsert(payload, { onConflict: "slot" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ image: data });
}
