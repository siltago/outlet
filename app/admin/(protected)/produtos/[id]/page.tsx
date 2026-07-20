import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById, listCategoriasAdmin } from "@/lib/admin/products";

interface EditarProdutoPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Editar produto",
};

export default async function EditarProdutoPage({ params }: EditarProdutoPageProps) {
  const { id } = await params;

  const [produto, categorias] = await Promise.all([getProductById(id), listCategoriasAdmin()]);

  if (!produto) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-brand-black">{produto.nome}</h1>
        <p className="text-sm text-brand-gray-600">Editar produto do catálogo.</p>
      </div>

      <div className="rounded-brand border border-brand-gray-200 bg-brand-white p-4 sm:p-6">
        <ProductForm categorias={categorias} produto={produto} />
      </div>
    </div>
  );
}
