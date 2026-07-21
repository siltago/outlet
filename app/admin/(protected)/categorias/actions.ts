"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/session";
import { createCategoria, deleteCategoria } from "@/lib/admin/products";

export interface CategoriaFormState {
  error: string | null;
}

function revalidateCategorias() {
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/produtos");
  revalidatePath("/catalogo");
  revalidatePath("/");
}

export async function createCategoriaAction(
  _prevState: CategoriaFormState,
  formData: FormData,
): Promise<CategoriaFormState> {
  await requireStaff();

  const nome = String(formData.get("nome") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!nome || !slug) {
    return { error: "Informe nome e slug." };
  }

  try {
    await createCategoria({ nome, slug });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível criar a categoria." };
  }

  revalidateCategorias();
  return { error: null };
}

export async function deleteCategoriaAction(id: string): Promise<{ error: string | null }> {
  await requireStaff();

  try {
    await deleteCategoria(id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Não foi possível remover a categoria." };
  }

  revalidateCategorias();
  return { error: null };
}
