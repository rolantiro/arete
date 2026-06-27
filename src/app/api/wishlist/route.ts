import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSessionId } from "@/lib/session";

export async function GET() {
  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("*, product:products(*)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { product_id } = body;

  if (!product_id) {
    return NextResponse.json({ error: "product_id wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();

  const { data, error } = await supabase
    .from("wishlist_items")
    .insert({ session_id: sessionId, product_id })
    .select()
    .single();

  if (error) {
    // Unique violation = already wishlisted, treat as idempotent success
    if (error.code === "23505") {
      return NextResponse.json({ already: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { searchParams } = new URL(req.url);
  const product_id = body.product_id ?? searchParams.get("product_id");

  if (!product_id) {
    return NextResponse.json({ error: "product_id wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();

  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("session_id", sessionId)
    .eq("product_id", product_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
