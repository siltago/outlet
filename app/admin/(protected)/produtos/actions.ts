"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_PHOTOS_BUCKET } from "@/lib/supabase/storage";
import {
  addProductPhoto,
  createProduct,
  getNextPhotoOrder,
  removeProductPhoto,
  reorderProductPhotos,
  updateProduct,
} from "@/lib/admin/products";
import { parseProductFormData } from "@/lib/validation/product";

export interface ProductFormState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

function flattenZodError(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function revalidateCatalog() {
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
  revalidatePath("/");
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  // Reautoriza dentro da action: o layout do /admin já barrou visitantes,
  // mas uma Server Action é um endpoint independente e alcançável direto.
  await requireStaff();

  const parsed = parseProductFormData(formData);
  if (!parsed.success) {
    return { error: "Corrija os campos destacados.", fieldErrors: flattenZodError(parsed.error) };
  }

  let productId: string;
  try {
    ({ id: productId } = await createProduct(parsed.data));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível salvar o produto." };
  }

  revalidateCatalog();
  redirect(`/admin/produtos/${productId}`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireStaff();

  const parsed = parseProductFormData(formData);
  if (!parsed.success) {
    return { error: "Corrija os campos destacados.", fieldErrors: flattenZodError(parsed.error) };
  }

  try {
    await updateProduct(productId, parsed.data);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível salvar o produto." };
  }

  revalidateCatalog();
  revalidatePath(`/admin/produtos/${productId}`);
  return { error: null };
}

export async function uploadProductPhotoAction(
  productId: string,
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireStaff();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo." };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { error: "Formato não suportado. Use PNG, JPEG ou WEBP (SVG não é aceito)." };
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return { error: "Arquivo maior que 5MB." };
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message };
  }

  try {
    const ordem = await getNextPhotoOrder(productId);
    await addProductPhoto(productId, path, ordem);
  } catch (err) {
    // O arquivo já foi enviado ao Storage; se o registro em produto_fotos
    // falhar, desfaz o upload para não deixar arquivo órfão no bucket.
    await supabase.storage.from(PRODUCT_PHOTOS_BUCKET).remove([path]);
    return { error: err instanceof Error ? err.message : "Não foi possível salvar a foto." };
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/catalogo");
  return { error: null };
}

export async function deleteProductPhotoAction(
  productId: string,
  photoId: string,
): Promise<{ error: string | null }> {
  await requireStaff();
  const supabase = await createClient();

  try {
    const { caminho } = await removeProductPhoto(photoId);
    await supabase.storage.from(PRODUCT_PHOTOS_BUCKET).remove([caminho]);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível remover a foto." };
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/catalogo");
  return { error: null };
}

export async function reorderProductPhotosAction(
  productId: string,
  orderedPhotoIds: string[],
): Promise<{ error: string | null }> {
  await requireStaff();

  try {
    await reorderProductPhotos(productId, orderedPhotoIds);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível reordenar as fotos." };
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/catalogo");
  return { error: null };
}
