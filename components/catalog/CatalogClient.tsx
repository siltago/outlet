"use client";

import { useMemo, useState } from "react";
import { PackageX, Search } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { getAvailability, type AvailabilityState } from "@/lib/availability";
import type { Category, ProductWithCategory } from "@/types/product";

type SortOption = "relevancia" | "menor-preco" | "maior-preco" | "nome";
type AvailabilityFilter = "todas" | AvailabilityState;

const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string }[] = [
  { value: "todas", label: "Todas as disponibilidades" },
  { value: "pronta_entrega", label: "Pronta entrega" },
  { value: "sob_encomenda", label: "Sob encomenda" },
  { value: "ambos", label: "Pronta entrega ou encomenda" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "nome", label: "Nome (A-Z)" },
];

interface CatalogClientProps {
  products: ProductWithCategory[];
  categories: Category[];
  showCategoryFilter?: boolean;
}

export function CatalogClient({
  products,
  categories,
  showCategoryFilter = true,
}: CatalogClientProps) {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState("todas");
  const [availability, setAvailability] = useState<AvailabilityFilter>("todas");
  const [sort, setSort] = useState<SortOption>("relevancia");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch = query.length === 0 || product.nome.toLowerCase().includes(query);
      const matchesCategory = categorySlug === "todas" || product.categoriaSlug === categorySlug;
      const matchesAvailability =
        availability === "todas" || getAvailability(product).state === availability;
      return matchesSearch && matchesCategory && matchesAvailability;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "menor-preco":
        sorted.sort((a, b) => a.precoVenda - b.precoVenda);
        break;
      case "maior-preco":
        sorted.sort((a, b) => b.precoVenda - a.precoVenda);
        break;
      case "nome":
        sorted.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, search, categorySlug, availability, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Buscar produto por nome</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar produto..."
            className="w-full rounded-brand border border-brand-gray-200 bg-brand-white py-2.5 pl-9 pr-3 text-sm text-brand-black placeholder:text-brand-gray-400 focus:border-brand-red focus:outline-none"
          />
        </label>

        {showCategoryFilter && (
          <label>
            <span className="sr-only">Filtrar por categoria</span>
            <select
              value={categorySlug}
              onChange={(event) => setCategorySlug(event.target.value)}
              className="w-full rounded-brand border border-brand-gray-200 bg-brand-white px-3 py-2.5 text-sm text-brand-black focus:border-brand-red focus:outline-none"
            >
              <option value="todas">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.nome}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span className="sr-only">Filtrar por disponibilidade</span>
          <select
            value={availability}
            onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
            className="w-full rounded-brand border border-brand-gray-200 bg-brand-white px-3 py-2.5 text-sm text-brand-black focus:border-brand-red focus:outline-none"
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Ordenar</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="w-full rounded-brand border border-brand-gray-200 bg-brand-white px-3 py-2.5 text-sm text-brand-black focus:border-brand-red focus:outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-brand-gray-600" aria-live="polite">
        {filteredProducts.length}{" "}
        {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
      </p>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-brand border border-dashed border-brand-gray-200 py-16 text-center">
          <PackageX className="h-10 w-10 text-brand-gray-400" aria-hidden="true" />
          <p className="font-semibold text-brand-black">Nenhum produto encontrado</p>
          <p className="max-w-sm text-sm text-brand-gray-600">
            Tente ajustar a busca ou os filtros. Se preferir, fale com a gente pelo
            WhatsApp que ajudamos a encontrar o que você procura.
          </p>
        </div>
      )}
    </div>
  );
}
