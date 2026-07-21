import type { Metadata } from "next";
import { CategoriaManager } from "@/components/admin/CategoriaManager";
import { listCategoriasAdmin } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "Categorias",
};

export default async function CategoriasPage() {
  const categorias = await listCategoriasAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">Categorias</h1>
        <p className="text-sm text-brand-gray-600">Gerencie as categorias do catálogo.</p>
      </div>

      <CategoriaManager categorias={categorias} />
    </div>
  );
}
