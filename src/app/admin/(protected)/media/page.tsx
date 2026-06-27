"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { ImageCropModal, type CropContext } from "@/components/admin/ImageCropModal";
import type { ProductImage } from "@/types/database";

type ImageSlotRow = { slot: string; url: string; alt: string; urls: ProductImage[] };

const SINGLE_SLOTS: Record<string, { title: string; description: string }> = {
  logo: {
    title: "Logo Website",
    description: "Logo akan tampil di navbar. Disarankan format PNG transparan.",
  },
};

const MULTI_SLOTS: Record<string, { title: string; description: string; cropContext: CropContext }> = {
  banner_home: {
    title: "Banner Beranda",
    description:
      "Bisa lebih dari satu gambar — akan tampil bergantian (slideshow) di hero section halaman depan.",
    cropContext: "banner",
  },
  about_image: {
    title: "Gambar Tentang Kami",
    description:
      "Bisa lebih dari satu gambar — akan tampil bergantian (slideshow) di bagian filosofi/tentang kami.",
    cropContext: "about",
  },
};

export default function AdminMediaPage() {
  const [images, setImages] = useState<Record<string, ImageSlotRow>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [savingSlot, setSavingSlot] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [cropFile, setCropFile] = useState<{ slot: string; file: File } | null>(null);

  useEffect(() => {
    fetch("/api/admin/images")
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, ImageSlotRow> = {};
        for (const img of data.images ?? []) {
          map[img.slot] = { ...img, urls: img.urls ?? [] };
        }
        setImages(map);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSingleUpload(slot: string, file: File) {
    setUploadingSlot(slot);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.error || "Gagal mengunggah gambar");
        return;
      }

      const saveRes = await fetch("/api/admin/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, url: uploadData.url, alt: slot }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        toast.error(saveData.error || "Gagal menyimpan gambar");
        return;
      }

      setImages((prev) => ({ ...prev, [slot]: { ...saveData.image, urls: [] } }));
      toast.success("Gambar berhasil diperbarui dan langsung tampil di website");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleMultiSave(slot: string, newImages: ProductImage[]) {
    setSavingSlot(slot);
    try {
      const res = await fetch("/api/admin/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, urls: newImages }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan gambar");
        return;
      }
      setImages((prev) => ({ ...prev, [slot]: { ...data.image, urls: data.image.urls ?? [] } }));
      toast.success("Gambar berhasil diperbarui dan langsung tampil di website");
    } finally {
      setSavingSlot(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-grey-500)]" />
      </div>
    );
  }

  return (
    <div>
      <p className="tracked mb-3 text-xs text-[var(--color-grey-500)]">Kelola</p>
      <h1 className="font-display mb-10 text-3xl md:text-4xl">Media</h1>

      <div className="flex flex-col gap-10">
        {/* Multi-image slots: banner & about */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Object.entries(MULTI_SLOTS).map(([slot, meta]) => {
            const image = images[slot];
            return (
              <div key={slot} className="border border-[var(--color-grey-300)] p-6">
                <h3 className="font-display mb-1 text-lg">{meta.title}</h3>
                <p className="mb-4 text-xs text-[var(--color-grey-500)]">{meta.description}</p>

                <ImagePicker
                  images={image?.urls ?? []}
                  onChange={(newImages) => handleMultiSave(slot, newImages)}
                  context={meta.cropContext}
                  label="Gambar"
                />

                {savingSlot === slot && (
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-grey-500)]">
                    <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan...
                  </p>
                )}
                {savingSlot !== slot && (image?.urls?.length ?? 0) > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-grey-500)]">
                    <Check className="h-3 w-3" /> Tersimpan & tampil di website (
                    {image.urls.length} gambar)
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Single-image slots: logo */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(SINGLE_SLOTS).map(([slot, meta]) => {
            const image = images[slot];
            const isUploading = uploadingSlot === slot;
            return (
              <div key={slot} className="border border-[var(--color-grey-300)] p-6">
                <h3 className="font-display mb-1 text-lg">{meta.title}</h3>
                <p className="mb-4 text-xs text-[var(--color-grey-500)]">{meta.description}</p>

                <div className="mb-4 aspect-[4/3] overflow-hidden bg-[var(--color-grey-100)]">
                  {image?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--color-grey-500)]">
                      Belum ada gambar
                    </div>
                  )}
                </div>

                <input
                  ref={(el) => {
                    fileInputs.current[slot] = el;
                  }}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 15 * 1024 * 1024) {
                        toast.error("Ukuran file melebihi 15MB");
                      } else {
                        setCropFile({ slot, file });
                      }
                    }
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  isLoading={isUploading}
                  onClick={() => fileInputs.current[slot]?.click()}
                >
                  {!isUploading && <Upload className="h-3.5 w-3.5" />}
                  Ganti Gambar
                </Button>
                {image?.url && !isUploading && (
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-grey-500)]">
                    <Check className="h-3 w-3" /> Tersimpan & tampil di website
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {cropFile && (
        <ImageCropModal
          file={cropFile.file}
          context="logo"
          onCancel={() => setCropFile(null)}
          onCropped={(croppedFile) => {
            const slot = cropFile.slot;
            setCropFile(null);
            handleSingleUpload(slot, croppedFile);
          }}
        />
      )}
    </div>
  );
}
