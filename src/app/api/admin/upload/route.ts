import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB — generous since ImagePicker
// crops every image client-side before upload, so what actually
// reaches here is already sized to its display frame, not a raw
// multi-megapixel camera/phone photo.
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File wajib diisi" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 15MB" }, { status: 400 });
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop();
  const fileName = `${adminId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(fileName, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrlData.publicUrl, path: fileName }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 401 });
  }

  const { path } = await req.json();
  if (!path) {
    return NextResponse.json({ error: "path wajib diisi" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.storage.from("media").remove([path]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: true });
}
