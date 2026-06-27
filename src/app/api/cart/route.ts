import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateSessionId } from "@/lib/session";

export async function GET() {
  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();

  const { data, error } = await supabase
    .from("cart_items")
    .select("*, product:products(*)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { product_id, quantity = 1, size = null, color = null } = body;

  if (!product_id) {
    return NextResponse.json({ error: "product_id wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();

  // Check existing row to increment quantity instead of duplicating
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("session_id", sessionId)
    .eq("product_id", product_id)
    .eq("size", size)
    .eq("color", color)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ item: data });
  }

  const { data, error } = await supabase
    .from("cart_items")
    .insert({ session_id: sessionId, product_id, quantity, size, color })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ item: data }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, quantity } = body;

  if (!id || typeof quantity !== "number") {
    return NextResponse.json({ error: "id dan quantity wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();

  if (quantity <= 0) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", id)
      .eq("session_id", sessionId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: true });
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", id)
    .eq("session_id", sessionId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const sessionId = await getOrCreateSessionId();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", id)
    .eq("session_id", sessionId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
