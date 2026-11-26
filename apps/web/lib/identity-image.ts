const maxUploadBytes = 1_000_000;
const maxSourceBytes = 25_000_000;
const maxSide = 1600;
const formats = ["image/jpeg", "image/png", "image/webp"];

function encodeJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo comprimir la imagen."));
    }, "image/jpeg", quality);
  });
}

export async function compressIdentityImage(file: File): Promise<File> {
  if (!formats.includes(file.type) || !file.size || file.size > maxSourceBytes) {
    throw new Error("Elegí una foto JPG, PNG o WebP de hasta 25 MB.");
  }

  const source = URL.createObjectURL(file);
  const canvas = document.createElement("canvas");
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
    if (!largestSide) throw new Error("La imagen no se pudo abrir.");

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("No se pudo preparar la imagen.");

    const initialScale = Math.min(1, maxSide / largestSide);
    for (const scale of [initialScale, initialScale * 0.8, initialScale * 0.65]) {
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.88, 0.78, 0.68]) {
        const blob = await encodeJpeg(canvas, quality);
        if (blob.size <= maxUploadBytes) return new File([blob], "documento.jpg", { type: "image/jpeg" });
      }
    }
    throw new Error("No se pudo reducir el tamaño de la foto. Elegí otra imagen.");
  } finally {
    URL.revokeObjectURL(source);
    canvas.width = 0;
    canvas.height = 0;
  }
}
