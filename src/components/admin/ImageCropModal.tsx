"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getCroppedImageFile } from "@/lib/cropImage";

export type CropContext = "product" | "banner" | "about" | "logo" | "collaboration";

/**
 * Aspect ratio (width / height) per image context, so every part
 * of the site that accepts an upload crops to the ratio that
 * actually fits where the image will be displayed:
 * - product/collaboration cards & galleries render at 3:4
 * - the homepage banner is a wide 16:9 hero
 * - the "Tentang Kami" image matches its 4:5 display frame
 * - the navbar logo is treated as a square so it never gets
 *   awkwardly stretched in the header
 */
export const CROP_ASPECT: Record<CropContext, number> = {
  product: 3 / 4,
  collaboration: 3 / 4,
  banner: 16 / 9,
  about: 4 / 5,
  logo: 1,
};

const CROP_LABELS: Record<CropContext, string> = {
  product: "Sesuaikan Foto Produk (3:4)",
  collaboration: "Sesuaikan Foto Kolaborasi (3:4)",
  banner: "Sesuaikan Banner Beranda (16:9)",
  about: "Sesuaikan Gambar Tentang Kami (4:5)",
  logo: "Sesuaikan Logo (1:1)",
};

export function ImageCropModal({
  file,
  context,
  onCancel,
  onCropped,
}: {
  file: File;
  context: CropContext;
  onCancel: () => void;
  onCropped: (croppedFile: File) => void;
}) {
  const [imageSrc] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  async function handleConfirm() {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const croppedFile = await getCroppedImageFile(imageSrc, croppedArea, file.name, file.type);
      URL.revokeObjectURL(imageSrc);
      onCropped(croppedFile);
    } finally {
      setProcessing(false);
    }
  }

  function handleCancel() {
    URL.revokeObjectURL(imageSrc);
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
      <div className="relative flex w-full max-w-lg flex-col bg-[var(--color-paper)]">
        <div className="hairline flex items-center justify-between px-6 py-4">
          <h3 className="font-display text-lg">{CROP_LABELS[context]}</h3>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Tutup"
            className="text-[var(--color-grey-500)] hover:text-[var(--color-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-[360px] w-full bg-[var(--color-ink)]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={CROP_ASPECT[context]}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 px-6 py-4">
          <ZoomIn className="h-4 w-4 text-[var(--color-grey-500)]" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-[var(--color-ink)]"
            aria-label="Perbesar gambar"
          />
        </div>

        <div className="hairline flex gap-3 px-6 py-4">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleCancel}>
            Batal
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleConfirm}
            isLoading={processing}
            disabled={!croppedArea}
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Gunakan Gambar Ini"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
