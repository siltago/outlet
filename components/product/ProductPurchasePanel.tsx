"use client";

import { useState } from "react";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { FormattedDescription } from "@/components/product/FormattedDescription";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInterestActions } from "@/components/product/ProductInterestActions";
import { getAvailability } from "@/lib/availability";
import { cn } from "@/lib/cn";
import { formatCurrencyBRL } from "@/lib/format";
import type { ProductWithCategory } from "@/types/product";

// Renderiza os dois lados do grid (galeria + informações) juntos porque
// escolher uma cor precisa atualizar fotos, preço e disponibilidade ao
// mesmo tempo. Retorna um Fragment de propósito: o grid de duas colunas
// continua definido na página, este componente só preenche os dois itens.
export function ProductPurchasePanel({ product }: { product: ProductWithCategory }) {
  const cores = product.cores ?? [];
  const [selectedIndex, setSelectedIndex] = useState(cores.length > 0 ? 0 : -1);
  const selectedCor = selectedIndex >= 0 ? cores[selectedIndex] : null;

  const imagens =
    selectedCor && selectedCor.imagens.length > 0 ? selectedCor.imagens : product.imagens;
  const precoVenda = selectedCor ? selectedCor.precoVenda : product.precoVenda;
  const quantidadeAtual = selectedCor ? selectedCor.quantidadeAtual : product.quantidadeAtual;
  const availability = getAvailability({ ...product, quantidadeAtual });
  const interestName = selectedCor ? `${product.nome} - ${selectedCor.nome}` : product.nome;

  return (
    <>
      <ProductGallery images={imagens} name={product.nome} />

      <div className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-gray-600">
          {product.categoria.nome}
          {product.marca && ` · ${product.marca.nome}`}
        </span>
        <h1 className="text-2xl font-bold text-brand-black sm:text-3xl">{product.nome}</h1>
        <AvailabilityBadge availability={availability} />
        <p className="text-3xl font-extrabold text-brand-black">{formatCurrencyBRL(precoVenda)}</p>
        <p className="w-fit rounded-brand bg-brand-gray-50 px-2 py-1 text-[11px] leading-snug text-brand-gray-600">
          Preço sujeito a alteração de valor e condição de pagamento.
        </p>

        {cores.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-brand-black">
              Cor: <span className="font-normal text-brand-gray-600">{selectedCor?.nome}</span>
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Escolha a cor">
              {cores.map((cor, index) => (
                <button
                  key={cor.id}
                  type="button"
                  role="radio"
                  aria-checked={index === selectedIndex}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "rounded-brand border px-3 py-2 text-sm font-semibold transition-colors",
                    index === selectedIndex
                      ? "border-brand-red bg-brand-red text-brand-white"
                      : "border-brand-gray-200 text-brand-black hover:border-brand-red",
                  )}
                >
                  {cor.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        <FormattedDescription
          text={product.descricao}
          className="text-sm leading-relaxed text-brand-gray-600"
        />

        <div className="mt-2">
          <ProductInterestActions
            productName={interestName}
            productSlug={product.slug}
            availability={availability}
          />
        </div>
      </div>
    </>
  );
}
