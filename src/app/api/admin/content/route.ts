import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_content")
    .select("*")
    .order("section", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: data ?? [] });
}

/**
 * Body: { items: Array<{ section: string; key: string; value: string }> }
 * Upserts every row in one call so the "Halaman Website" editor can
 * save an entire section (hero, about, footer, etc.) at once.
 */
export async function PUT(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const body = await req.json();
  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items wajib diisi" }, { status: 400 });
  }

  for (const item of items) {
    if (!item.section || !item.key) {
      return NextResponse.json(
        { error: "Setiap item wajib memiliki section dan key" },
        { status: 400 }
      );
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("website_content")
    .upsert(
      items.map((i: { section: string; key: string; value: string }) => ({
        section: i.section,
        key: i.key,
        value: i.value ?? "",
      })),
      { onConflict: "section,key" }
    )
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content: data });
}
