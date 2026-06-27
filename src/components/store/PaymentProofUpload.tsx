"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

export function PaymentProofUpload({
  file,
  onChange,
  error,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(selected: File | null) {
    onChange(selected);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {file && preview ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Pratinjau bukti pembayaran"
            className="h-40 w-32 object-cover border border-[var(--color-grey-300)]"
          />
          <button
            type="button"
            onClick={() => handleFile(null)}
            aria-label="Hapus file"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-[var(--color-ink)] text-[var(--color-paper)]"
          >
            <X className="h-3 w-3" />
          </button>
          <p className="mt-2 max-w-32 truncate text-xs text-[var(--color-grey-500)]">
            {file.name}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--color-grey-300)] text-[var(--color-grey-500)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
        >
          <Upload className="h-6 w-6" strokeWidth={1.5} />
          <span className="text-sm">Klik untuk unggah bukti pembayaran</span>
          <span className="flex items-center gap-1 text-xs">
            <ImageIcon className="h-3 w-3" /> JPG, PNG, atau WEBP — maks 5MB
          </span>
        </button>
      )}
      {error && <p className="mt-2 text-xs text-[var(--color-error)]">{error}</p>}
    </div>
  );
}
