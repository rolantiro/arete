"use client";

import { useRef, useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageCropModal, type CropContext } from "@/components/admin/ImageCropModal";
import type { ProductImage } from "@/types/database";

export function ImagePicker({
  images,
  onChange,
  context = "product",
  label = "Foto Produk",
}: {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  context?: CropContext;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Files picked but not yet cropped, processed one at a time so
  // each gets its own crop step instead of cropping them all with
  // the same frame.
  const [cropQueue, setCropQueue] = useState<File[]>([]);

  const MAX_SOURCE_SIZE = 15 * 1024 * 1024; // 15MB, matches /api/admin/upload

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_SOURCE_SIZE) {
        toast.error(`"${file.name}" melebihi 15MB dan dilewati`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length > 0) {
      setCropQueue(accepted);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadCroppedFile(croppedFile: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", croppedFile);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal mengunggah gambar");
        return;
      }
      onChange([
        ...images,
        { url: data.url, alt: croppedFile.name, sort_order: images.length },
      ]);
    } finally {
      setUploading(false);
    }
  }

  function handleCropDone(croppedFile: File) {
    setCropQueue((prev) => prev.slice(1));
    uploadCroppedFile(croppedFile);
  }

  function handleCropCancel() {
    setCropQueue((prev) => prev.slice(1));
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  const currentCropFile = cropQueue[0];

  return (
    <div>
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">{label}</p>
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
          disabled={uploading || cropQueue.length > 0}
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
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {currentCropFile && (
        <ImageCropModal
          file={currentCropFile}
          context={context}
          onCancel={handleCropCancel}
          onCropped={handleCropDone}
        />
      )}
    </div>
  );
}
