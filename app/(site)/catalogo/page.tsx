import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CatalogClient } from "@/components/catalog/CatalogClient";
import { getCategories, getProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Confira todos os produtos disponíveis na Outlet Premium Sorocaba: smartphones, relógios, fones, perfumes, tênis e acessórios.",
};

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <section className="py-10">
      <Container>
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-brand-black sm:text-3xl">Catálogo</h1>
          <p className="text-sm text-brand-gray-600">
            Produtos selecionados com pronta entrega e sob encomenda.
          </p>
        </div>
        <CatalogClient products={products} categories={categories} />
      </Container>
    </section>
  );
}
