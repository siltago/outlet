import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { getCategories, getCategoryBySlug, getProductsByCategory } from "@/lib/data";

interface CategoriaPageProps {
  params: Promise<{ categoria: string }>;
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria);
  if (!category) return {};

  return {
    title: category.nome,
    description: `Produtos da categoria ${category.nome} na Outlet Premium Sorocaba.`,
  };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { categoria } = await params;
  const category = await getCategoryBySlug(categoria);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    getProductsByCategory(categoria),
    getCategories(),
  ]);

  return (
    <section className="py-10">
      <Container>
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-brand-black sm:text-3xl">{category.nome}</h1>
          <p className="text-sm text-brand-gray-600">
            Produtos da categoria {category.nome.toLowerCase()}.
          </p>
        </div>
        <CatalogClient products={products} categories={categories} showCategoryFilter={false} />
      </Container>
    </section>
  );
}
