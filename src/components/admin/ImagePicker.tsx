"use client";

import { useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ProductImage } from "@/types/database";

export function ImagePicker({
  images,
  onChange,
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Gagal mengunggah gambar");
          continue;
        }
        uploaded.push({
          url: data.url,
          alt: file.name,
          sort_order: images.length + uploaded.length,
        });
      }
      onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Foto Produk</p>
      <div className="flex flex-wrap gap-3">
        {images.map((img, index) => (
          <div
            key={`${img.url}-${index}`}
            className="relative h-28 w-24 shrink-0 overflow-hidden bg-[var(--color-grey-100)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              aria-label="Hapus gambar"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-[var(--color-ink)] text-[var(--color-paper)]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-28 w-24 shrink-0 flex-col items-center justify-center gap-2 border border-dashed border-[var(--color-grey-300)] text-[var(--color-grey-500)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span className="text-[10px]">Tambah</span>
            </>
          )}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
