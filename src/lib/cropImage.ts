export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

/**
 * Crops `imageSrc` to `cropArea` (in source-image pixels, as
 * returned by react-easy-crop's onCropComplete) and returns the
 * result as a File ready to upload, preserving the original
 * file's name and mime type.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  cropArea: CropArea,
  fileName: string,
  mimeType: string
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tidak dapat membuat canvas untuk crop gambar");

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal memproses hasil crop"));
          return;
        }
        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      0.92
    );
  });
}
