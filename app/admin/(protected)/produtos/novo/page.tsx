import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { listCategoriasAdmin, listMarcasAdmin } from "@/lib/admin/products";

export const metadata: Metadata = {
  title: "Novo produto",
};

export default async function NovoProdutoPage() {
  const [categorias, marcas] = await Promise.all([listCategoriasAdmin(), listMarcasAdmin()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">Novo produto</h1>
        <p className="text-sm text-brand-gray-600">Cadastre um produto no catálogo.</p>
      </div>

      <div className="rounded-brand border border-brand-gray-200 bg-brand-white p-4 sm:p-6">
        <ProductForm categorias={categorias} marcas={marcas} />
      </div>
    </div>
  );
}
