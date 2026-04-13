const DEFAULT_MAX_EDGE = 512;
const DEFAULT_JPEG_QUALITY = 0.88;

function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  quality: number,
  filename: string,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Не удалось сжать изображение."));
          return;
        }
        resolve(new File([blob], filename, { type: "image/jpeg" }));
      },
      "image/jpeg",
      quality,
    );
  });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          "Не удалось открыть фото. Попробуйте JPEG или PNG (на части устройств HEIC не поддерживается в браузере).",
        ),
      );
    };
    img.src = url;
  });
}

/**
 * Уменьшает изображение до maxEdge по большей стороне и сохраняет как JPEG (для аватаров в storage).
 */
export async function resizeImageFileToJpeg(
  file: File,
  opts?: { maxEdge?: number; quality?: number; filename?: string },
): Promise<File> {
  const maxEdge = opts?.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = opts?.quality ?? DEFAULT_JPEG_QUALITY;
  const filename = opts?.filename ?? "avatar.jpg";

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    bitmap = null;
  }

  let srcW: number;
  let srcH: number;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap?.close();
    throw new Error("Не удалось обработать изображение.");
  }

  if (bitmap) {
    srcW = bitmap.width;
    srcH = bitmap.height;
    if (srcW < 1 || srcH < 1) {
      bitmap.close();
      throw new Error("Пустое или повреждённое изображение.");
    }
    const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
    const dw = Math.max(1, Math.round(srcW * scale));
    const dh = Math.max(1, Math.round(srcH * scale));
    canvas.width = dw;
    canvas.height = dh;
    ctx.drawImage(bitmap, 0, 0, dw, dh);
    bitmap.close();
  } else {
    const img = await loadImageFromFile(file);
    srcW = img.naturalWidth || img.width;
    srcH = img.naturalHeight || img.height;
    if (srcW < 1 || srcH < 1) {
      throw new Error("Пустое или повреждённое изображение.");
    }
    const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
    const dw = Math.max(1, Math.round(srcW * scale));
    const dh = Math.max(1, Math.round(srcH * scale));
    canvas.width = dw;
    canvas.height = dh;
    ctx.drawImage(img, 0, 0, dw, dh);
  }

  return canvasToJpegFile(canvas, quality, filename);
}

export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const n = file.name.toLowerCase();
  return /\.(heic|heif|jpg|jpeg|png|webp|gif)$/i.test(n);
}
