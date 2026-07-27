"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";
import { requireStaff } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { buildProductPhotoUrl, PRODUCT_PHOTOS_BUCKET } from "@/lib/supabase/storage";
import {
  addProductPhoto,
  createCor,
  createProduct,
  deleteCor,
  deleteProduct,
  getNextPhotoOrder,
  removeProductPhoto,
  reorderProductPhotos,
  updateCor,
  updateProduct,
} from "@/lib/admin/products";
import { parseCorFormData, parseProductFormData } from "@/lib/validation/product";
import type { AdminProductPhoto } from "@/types/admin";

export interface ProductFormState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

export interface CorFormState {
  error: string | null;
  fieldErrors?: Record<string, string>;
}

const ALLOWED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];
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
  // Revalida todas as páginas de produto (/produto/[slug]) de uma vez —
  // sem isso, editar um produto não atualizava a própria página pública dele.
  revalidatePath("/(site)/produto/[slug]", "page");
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

export async function deleteProductAction(productId: string): Promise<{ error: string | null }> {
  await requireStaff();

  let fotoCaminhos: string[];
  try {
    ({ fotoCaminhos } = await deleteProduct(productId));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível excluir o produto." };
  }

  if (fotoCaminhos.length > 0) {
    const supabase = await createClient();
    // Best-effort: o produto já foi excluído (fonte da verdade); se a limpeza
    // do Storage falhar, só sobra arquivo órfão no bucket, não é crítico.
    await supabase.storage.from(PRODUCT_PHOTOS_BUCKET).remove(fotoCaminhos);
  }

  revalidateCatalog();
  return { error: null };
}

export async function createCorAction(
  productId: string,
  controleEstoque: "quantidade" | "sem_controle",
  _prevState: CorFormState,
  formData: FormData,
): Promise<CorFormState> {
  await requireStaff();

  const parsed = parseCorFormData(formData, controleEstoque);
  if (!parsed.success) {
    return { error: "Corrija os campos destacados.", fieldErrors: flattenZodError(parsed.error) };
  }

  const values = {
    nome: parsed.data.nome,
    precoVenda: parsed.data.precoVenda,
    quantidadeAtual: parsed.data.quantidadeAtual,
    quantidadeMinima: parsed.data.quantidadeMinima,
  };

  try {
    await createCor(productId, values);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível criar a cor." };
  }

  revalidateCatalog();
  revalidatePath(`/admin/produtos/${productId}`);
  return { error: null };
}

export async function updateCorAction(
  corId: string,
  productId: string,
  controleEstoque: "quantidade" | "sem_controle",
  _prevState: CorFormState,
  formData: FormData,
): Promise<CorFormState> {
  await requireStaff();

  const parsed = parseCorFormData(formData, controleEstoque);
  if (!parsed.success) {
    return { error: "Corrija os campos destacados.", fieldErrors: flattenZodError(parsed.error) };
  }

  const values = {
    nome: parsed.data.nome,
    precoVenda: parsed.data.precoVenda,
    quantidadeAtual: parsed.data.quantidadeAtual,
    quantidadeMinima: parsed.data.quantidadeMinima,
  };

  try {
    await updateCor(corId, values);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível salvar a cor." };
  }

  revalidateCatalog();
  revalidatePath(`/admin/produtos/${productId}`);
  return { error: null };
}

export async function deleteCorAction(
  corId: string,
  productId: string,
): Promise<{ error: string | null }> {
  await requireStaff();

  let fotoCaminhos: string[];
  try {
    ({ fotoCaminhos } = await deleteCor(corId));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível excluir a cor." };
  }

  if (fotoCaminhos.length > 0) {
    const supabase = await createClient();
    await supabase.storage.from(PRODUCT_PHOTOS_BUCKET).remove(fotoCaminhos);
  }

  revalidateCatalog();
  revalidatePath(`/admin/produtos/${productId}`);
  return { error: null };
}

export async function uploadProductPhotoAction(
  productId: string,
  formData: FormData,
  corId: string | null = null,
): Promise<{ error: string | null; photo: AdminProductPhoto | null }> {
  await requireStaff();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione um arquivo.", photo: null };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return {
      error: "Formato não suportado. Use PNG, JPEG, WEBP ou AVIF (SVG não é aceito).",
      photo: null,
    };
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return { error: "Arquivo maior que 5MB.", photo: null };
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(PRODUCT_PHOTOS_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message, photo: null };
  }

  let photoId: string;
  let ordem: number;
  try {
    ordem = await getNextPhotoOrder(productId, corId);
    ({ id: photoId } = await addProductPhoto(productId, path, ordem, corId));
  } catch (err) {
    // O arquivo já foi enviado ao Storage; se o registro em produto_fotos
    // falhar, desfaz o upload para não deixar arquivo órfão no bucket.
    await supabase.storage.from(PRODUCT_PHOTOS_BUCKET).remove([path]);
    return {
      error: err instanceof Error ? err.message : "Não foi possível salvar a foto.",
      photo: null,
    };
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/catalogo");
  revalidatePath("/(site)/produto/[slug]", "page");
  return {
    error: null,
    photo: { id: photoId, caminho: path, url: buildProductPhotoUrl(path), ordem },
  };
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
  revalidatePath("/(site)/produto/[slug]", "page");
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
  revalidatePath("/(site)/produto/[slug]", "page");
  return { error: null };
}
