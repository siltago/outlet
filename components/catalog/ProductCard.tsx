import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvailabilityBadge } from "@/components/ui/AvailabilityBadge";
import { getAvailability } from "@/lib/availability";
import { formatCurrencyBRL } from "@/lib/format";
import type { ProductWithCategory } from "@/types/product";

export function ProductCard({ product }: { product: ProductWithCategory }) {
  const availability = getAvailability(product);
  const image = product.imagens[0] ?? "/images/products/placeholder-produto.png";

  return (
    <article className="group flex flex-col overflow-hidden rounded-brand border border-brand-gray-200 bg-brand-white">
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-square w-full overflow-hidden bg-brand-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand-red"
      >
        <Image
          src={image}
          alt={product.nome}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2">
          <AvailabilityBadge availability={availability} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-brand-gray-600">
          {product.categoria.nome}
        </span>
        <h3 className="text-sm font-semibold text-brand-black">
          <Link href={`/produto/${product.slug}`} className="hover:text-brand-red">
            {product.nome}
          </Link>
        </h3>
        <p className="mt-1 text-lg font-bold text-brand-black">
          {formatCurrencyBRL(product.precoVenda)}
        </p>

        <Link
          href={`/produto/${product.slug}`}
          className="mt-3 inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-red hover:text-brand-red-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red rounded-brand"
        >
          Ver produto
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
