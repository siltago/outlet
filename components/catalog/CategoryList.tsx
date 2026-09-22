"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CategoryCard } from "@/components/catalog/CategoryCard";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/product";

// No celular a lista de categorias vira uma coluna só (cada card ocupa a
// largura inteira), o que empurra o resto da home para baixo. Aqui, mostra
// só as primeiras e deixa expandir sob demanda — só abaixo de "sm", que é
// onde o grid passa a ter mais de uma coluna e o problema deixa de existir.
const COLLAPSED_COUNT = 4;

export function CategoryList({ categories }: { categories: Category[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = categories.length > COLLAPSED_COUNT;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <div key={category.id} className={cn(index >= COLLAPSED_COUNT && !expanded && "hidden sm:block")}>
            <CategoryCard category={category} />
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="eyebrow inline-flex w-fit items-center gap-1.5 self-center text-brand-gray-400 transition-colors hover:text-brand-white sm:hidden"
        >
          {expanded ? "Ver menos" : `Ver todas as categorias (${categories.length})`}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
