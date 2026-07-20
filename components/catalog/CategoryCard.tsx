import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/lib/category-icons";
import type { Category } from "@/types/product";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/catalogo/${category.slug}`}
      className="group flex items-center justify-between gap-3 rounded-brand border border-brand-gray-200 bg-brand-white px-5 py-4 transition-colors hover:border-brand-red"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-brand bg-brand-gray-50 text-brand-black group-hover:bg-brand-red group-hover:text-brand-white">
          <CategoryIcon slug={category.slug} className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="font-semibold text-brand-black">{category.nome}</span>
      </span>
      <ChevronRight className="h-5 w-5 text-brand-gray-400 group-hover:text-brand-red" aria-hidden="true" />
    </Link>
  );
}
