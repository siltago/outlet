import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductFilters } from "@/components/admin/ProductFilters";
import { ProductTable } from "@/components/admin/ProductTable";
import { listCategoriasAdmin, listProducts } from "@/lib/admin/products";
import type { ModalidadeVenda } from "@/types/database";

export const metadata: Metadata = {
  title: "Produtos",
};

interface ProdutosPageProps {
  searchParams: Promise<{
    busca?: string;
    categoria?: string;
    modalidade?: string;
    ativo?: string;
    publicado?: string;
  }>;
}

export default async function ProdutosPage({ searchParams }: ProdutosPageProps) {
  const params = await searchParams;

  const [produtos, categorias] = await Promise.all([
    listProducts({
      busca: params.busca,
      categoriaId: params.categoria,
      modalidade: (params.modalidade as ModalidadeVenda | "todas" | undefined) ?? "todas",
      ativo: (params.ativo as "todos" | "ativo" | "inativo" | undefined) ?? "todos",
      publicado: (params.publicado as "todos" | "publicado" | "rascunho" | undefined) ?? "todos",
    }),
    listCategoriasAdmin(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-black">Produtos</h1>
          <p className="text-sm text-brand-gray-600">
            {produtos.length} {produtos.length === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        </div>
        <Button href="/admin/produtos/novo" variant="primary" size="md">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo produto
        </Button>
      </div>

      <ProductFilters categorias={categorias} />

      <ProductTable produtos={produtos} />
    </div>
  );
}
