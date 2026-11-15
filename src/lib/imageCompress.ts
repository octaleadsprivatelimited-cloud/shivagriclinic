/** Firestore documents must stay under ~1 MiB; keep image payload conservative. */
export const MAX_IMAGE_DATA_URL_CHARS = 580_000;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("Could not read compressed image."));
    fr.readAsDataURL(blob);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

type CompressionOptions = { minEdge?: number; preserveTransparency?: boolean };

async function decodeImage(file: File): Promise<{ image: CanvasImageSource; width: number; height: number; close: () => void }> {
  try {
    const bitmap = await createImageBitmap(file);
    return { image: bitmap, width: bitmap.width, height: bitmap.height, close: () => bitmap.close() };
  } catch {
    // Some browsers decode SVG and newer formats in <img> but not createImageBitmap.
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      return { image, width: image.naturalWidth, height: image.naturalHeight, close: () => URL.revokeObjectURL(objectUrl) };
    } catch {
      URL.revokeObjectURL(objectUrl);
      throw new Error("Could not read this image. Try PNG, JPEG, WebP, or SVG.");
    }
  }
}

/**
 * Resize and re-encode as JPEG until the data URL is small enough for Firestore.
 * Accepts browser-decodable image formats, including SVG logos.
 */
export async function compressImageFileToDataUrl(file: File, maxChars = MAX_IMAGE_DATA_URL_CHARS, options: CompressionOptions = {}): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  const decoded = await decodeImage(file);

  try {
    if (!decoded.width || !decoded.height) throw new Error("This image has no usable dimensions.");
    // Do not enlarge small logos; that makes their encoded data unnecessarily large.
    let maxEdge = Math.min(1280, Math.max(decoded.width, decoded.height));
    const minEdge = Math.min(maxEdge, options.minEdge ?? 360);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");

    for (let outer = 0; outer < 24; outer++) {
      const scale = maxEdge / Math.max(decoded.width, decoded.height, 1);
      const w = Math.max(1, Math.round(decoded.width * scale));
      const h = Math.max(1, Math.round(decoded.height * scale));
      canvas.width = w;
      canvas.height = h;
      if (options.preserveTransparency) {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(decoded.image, 0, 0, w, h);
        const png = await canvasToBlob(canvas, "image/png");
        if (png) {
          const dataUrl = await blobToDataUrl(png);
          if (dataUrl.length <= maxChars) return dataUrl;
        }
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(decoded.image, 0, 0, w, h);

      let q = 0.82;
      for (let step = 0; step < 18; step++) {
        const blob = await canvasToBlob(canvas, "image/jpeg", q);
        if (!blob) {
          q -= 0.06;
          continue;
        }
        const dataUrl = await blobToDataUrl(blob);
        if (dataUrl.length <= maxChars) {
          return dataUrl;
        }
        q -= 0.06;
        if (q < 0.32) break;
      }

      if (maxEdge <= minEdge) {
        throw new Error(
          "Image is still too large after compression. Use a smaller photo or crop it before uploading.",
        );
      }
      maxEdge = Math.max(minEdge, Math.round(maxEdge * 0.85));
    }

    throw new Error("Could not compress image to a safe size.");
  } finally {
    decoded.close();
  }
}
