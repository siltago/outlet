"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import { createMarca, deleteMarca, updateMarca } from "@/lib/admin/products";

export interface MarcaFormState {
  error: string | null;
}

function revalidateMarcas() {
  revalidatePath("/admin/marcas");
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
  revalidatePath("/");
}

export async function createMarcaAction(
  _prevState: MarcaFormState,
  formData: FormData,
): Promise<MarcaFormState> {
  await requireStaff();

  const nome = String(formData.get("nome") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!nome || !slug) {
    return { error: "Informe nome e slug." };
  }

  try {
    await createMarca({ nome, slug });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível criar a marca." };
  }

  revalidateMarcas();
  return { error: null };
}

export async function updateMarcaAction(
  id: string,
  _prevState: MarcaFormState,
  formData: FormData,
): Promise<MarcaFormState> {
  await requireStaff();

  const nome = String(formData.get("nome") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!nome || !slug) {
    return { error: "Informe nome e slug." };
  }

  try {
    await updateMarca(id, { nome, slug });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível salvar a marca." };
  }

  revalidateMarcas();
  return { error: null };
}

export async function deleteMarcaAction(id: string): Promise<{ error: string | null }> {
  await requireStaff();

  try {
    await deleteMarca(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível remover a marca." };
  }

  revalidateMarcas();
  return { error: null };
}
