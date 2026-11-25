const imageLoads = new Map<string, Promise<void>>();

export function preloadGameImage(src: string): Promise<void> {
  const existing = imageLoads.get(src);
  if (existing) return existing;

  const load = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    image.src = src;
  }).catch((error: unknown) => {
    imageLoads.delete(src);
    throw error;
  });
  imageLoads.set(src, load);
  return load;
}
