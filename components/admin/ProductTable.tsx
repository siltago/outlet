import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Package, Pencil } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { formatCurrencyBRL } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { AdminProduct } from "@/types/admin";

const MODALIDADE_LABELS: Record<AdminProduct["modalidadeVenda"], string> = {
  pronta_entrega: "Pronta entrega",
  sob_encomenda: "Sob encomenda",
  ambos: "Ambos",
};

function EstoqueCell({ produto }: { produto: AdminProduct }) {
  if (produto.controleEstoque === "sem_controle") {
    return <span className="text-brand-gray-600">—</span>;
  }
  const baixo =
    produto.quantidadeAtual !== null &&
    produto.quantidadeMinima !== null &&
    produto.quantidadeAtual <= produto.quantidadeMinima;

  return (
    <span className={cn("font-medium", baixo ? "text-brand-red" : "text-brand-black")}>
      {produto.quantidadeAtual ?? 0}
    </span>
  );
}

function StatusBadges({ produto }: { produto: AdminProduct }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className={cn(
          "rounded-brand px-2 py-0.5 text-xs font-semibold",
          produto.ativo ? "bg-brand-black text-brand-white" : "bg-brand-gray-100 text-brand-gray-600",
        )}
      >
        {produto.ativo ? "Ativo" : "Inativo"}
      </span>
      <span
        className={cn(
          "rounded-brand px-2 py-0.5 text-xs font-semibold",
          produto.publicado
            ? "bg-brand-red text-brand-white"
            : "border border-brand-gray-200 text-brand-gray-600",
        )}
      >
        {produto.publicado ? "Publicado" : "Rascunho"}
      </span>
    </div>
  );
}

function RowActions({ produto }: { produto: AdminProduct }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/admin/produtos/${produto.id}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-red hover:text-brand-red-dark"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Editar
      </Link>
      {produto.publicado && (
        <a
          href={`/produto/${produto.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-gray-600 hover:text-brand-black"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          Ver no site
        </a>
      )}
      <DeleteProductButton productId={produto.id} nome={produto.nome} />
    </div>
  );
}

function Thumb({ produto }: { produto: AdminProduct }) {
  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-brand bg-brand-gray-50">
      {produto.fotoPrincipal && (
        <Image src={produto.fotoPrincipal} alt="" fill sizes="48px" className="object-cover" />
      )}
    </div>
  );
}

export function ProductTable({ produtos }: { produtos: AdminProduct[] }) {
  if (produtos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-brand border border-dashed border-brand-gray-200 py-16 text-center">
        <Package className="h-8 w-8 text-brand-gray-400" aria-hidden="true" />
        <p className="text-sm font-semibold text-brand-black">Nenhum produto encontrado</p>
        <p className="text-sm text-brand-gray-600">Ajuste os filtros ou cadastre um novo produto.</p>
      </div>
    );
  }

  return (
    <>
      {/* Tabela desktop */}
      <div className="hidden overflow-x-auto rounded-brand border border-brand-gray-200 bg-brand-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-gray-200 bg-brand-gray-50 text-xs uppercase tracking-wide text-brand-gray-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Produto</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Preço</th>
              <th className="px-4 py-3 font-semibold">Estoque</th>
              <th className="px-4 py-3 font-semibold">Modalidade</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-200">
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Thumb produto={produto} />
                    <span className="font-semibold text-brand-black">{produto.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-gray-600">{produto.categoriaNome}</td>
                <td className="px-4 py-3 font-semibold text-brand-black">
                  {formatCurrencyBRL(produto.precoVenda)}
                </td>
                <td className="px-4 py-3">
                  <EstoqueCell produto={produto} />
                </td>
                <td className="px-4 py-3 text-brand-gray-600">
                  {MODALIDADE_LABELS[produto.modalidadeVenda]}
                </td>
                <td className="px-4 py-3">
                  <StatusBadges produto={produto} />
                </td>
                <td className="px-4 py-3">
                  <RowActions produto={produto} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <ul className="flex flex-col gap-3 md:hidden">
        {produtos.map((produto) => (
          <li key={produto.id} className="rounded-brand border border-brand-gray-200 bg-brand-white p-4">
            <div className="flex items-start gap-3">
              <Thumb produto={produto} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-brand-black">{produto.nome}</p>
                <p className="text-xs text-brand-gray-600">{produto.categoriaNome}</p>
                <p className="mt-1 font-semibold text-brand-black">
                  {formatCurrencyBRL(produto.precoVenda)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <StatusBadges produto={produto} />
              <RowActions produto={produto} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
