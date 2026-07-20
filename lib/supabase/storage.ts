export const PRODUCT_PHOTOS_BUCKET = "produto-fotos";

export function buildProductPhotoUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  return `${base}/storage/v1/object/public/${PRODUCT_PHOTOS_BUCKET}/${path}`;
}
