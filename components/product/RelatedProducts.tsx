import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductWithCategory } from "@/types/product";

export function RelatedProducts({ products }: { products: ProductWithCategory[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-brand-gray-200 pt-10">
      <h2 className="mb-6 text-xl font-bold text-brand-black">Produtos relacionados</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
